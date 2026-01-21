import { inngest } from "./client";
import { prismaClient } from "@/app/api/prismaClient/Prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CODE_GEN_PROMPT } from "@/app/AiPage/prompt";
import { file as defaultFiles } from "@/app/AiPage/defaultFiles";
import { setAllTitle, storeChatHistory, storeCodeFiles, storeFiles } from "@/app/redis/redis-type";

const apiKeys = [
    process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY2!,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY3!,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY4!,

].filter(Boolean);

let currentKeyIndex = 0;
const getCurrentKey = () => apiKeys[currentKeyIndex]!;
const rotateKey = () => {
    if (apiKeys.length > 1) {
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    }
};

let genAI = new GoogleGenerativeAI(getCurrentKey());

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
    try {
        return await fn();
    } catch (err: unknown) {
        if (err instanceof Error && /429|5\d{2}/.test(err.message)) {
            rotateKey();
            genAI = new GoogleGenerativeAI(getCurrentKey());
            return await fn();
        }
        throw err;
    }
}

const chunk = <T,>(arr: T[], size = 50): T[][] => {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
};

const sanitizeJsonText = (text: string): string => {
    // 1. Remove obvious markdown wrappers
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    }

    // 2. Remove control characters that might break JSON.parse
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

    try {
        JSON.parse(cleaned);
        return cleaned;
    } catch {
        // 3. Attempt to fix common issues like trailing commas before closing braces/brackets
        try {
            const fixedTrailingCommas = cleaned
                .replace(/,\s*([\]}])/g, '$1') // Remove trailing commas
                .replace(/(\w+)\s*:/g, '"$1":'); // Ensure keys are quoted if they aren't
            JSON.parse(fixedTrailingCommas);
            return fixedTrailingCommas;
        } catch {
            console.warn('[sanitizeJsonText] Advanced sanitization failed');
            return cleaned;
        }
    }
};

const storeChatTitle = inngest.createFunction(
    { id: "chat-title-store", retries: 2 },
    { event: "chat/title.store" },
    async ({ event }) => {
        const { sessionId, userId, title } = event.data;
        if (!sessionId || !userId || !title) {
            throw new Error("Missing chat title data");
        }
        await setAllTitle(userId, sessionId, title);
        await prismaClient.chat.upsert({
            where: { id: sessionId },
            update: { title: { set: title } },
            create: { id: sessionId, userId, title }
        });
        return { status: "stored" };
    }
);

const chatStoreInDb = inngest.createFunction(
    { id: "chat-store-db", retries: 2 },
    { event: "chat/db" },
    async ({ event, step }) => {
        const { sessionId, messageId, userContent, aiContent, userId } = event.data;
        console.log(`[chat/db] Received storage request: sessionId=${sessionId}, messageId=${messageId}, userId=${userId}`);

        await step.run("save-to-db", async () => {
            if (!sessionId || !messageId) {
                throw new Error("SessionId or MessageId is missing");
            }
            const userMessageContent =
                userContent !== undefined && userContent !== null
                    ? typeof userContent === "string"
                        ? userContent
                        : JSON.stringify(userContent)
                    : "";
            const aiMessageContent =
                aiContent !== undefined && aiContent !== null
                    ? typeof aiContent === "string"
                        ? aiContent
                        : JSON.stringify(aiContent)
                    : "";
            await storeChatHistory(sessionId, messageId, userMessageContent, aiMessageContent);
            await prismaClient.message.upsert({
                where: { id: messageId },
                update: {},
                create: {
                    id: messageId,
                    chat: {
                        connectOrCreate: {
                            where: { id: sessionId },
                            create: { id: sessionId, userId, title: "New Chat" }
                        }
                    }
                }
            });

            await prismaClient.userChat.create({ data: { userChatId: messageId, content: userMessageContent } });
            await prismaClient.aiChat.create({ data: { AiChatId: messageId, content: aiMessageContent } });
            console.log(`[chat/db] Successfully stored message ${messageId}`);
            return { status: "success" };
        });
        return { status: "completed" };
    }
);


const generateCodeInQueue = inngest.createFunction(
    { id: "generate-code-queue", concurrency: 1, retries: 5 },
    { event: "ai-code/generate" },
    async ({ event, step }) => {
        const { prompt, sessionId, messageId, userId } = event.data;

        const resultText = await step.run("generate-ai-code", async () => {
            return await withRetry(async () => {
                const model = genAI.getGenerativeModel({
                    model: "gemini-2.5-flash",
                    generationConfig: {
                        responseMimeType: "application/json",
                        temperature: 0.1
                    }
                });

                const projectContext = JSON.stringify(defaultFiles, null, 2);

                const result = await model.generateContent({
                    systemInstruction: `${CODE_GEN_PROMPT}\n\nIMPORTANT: You must return ONLY valid JSON. Avoid large blocks of repetitive code if possible to stay within token limits.\n\nCURRENT PROJECT CONTEXT (DEFAULT FILES):\n${projectContext}`,
                    contents: [{ role: "user", parts: [{ text: `User Request: ${prompt}` }] }]
                });
                const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) throw new Error("Empty AI response");

                console.log(`[generate-ai-code] Response length: ${text.length} chars`);
                console.log(`[generate-ai-code] Response preview: ${text.substring(0, 200)}...`);

                return text;
            });
        });

        const parsedData = await step.run("parse-json", async () => {
            try {
                const sanitized = sanitizeJsonText(resultText);
                const parsed = JSON.parse(sanitized);

                if (!parsed.files || !parsed.generatedFiles) {
                    console.error('[parse-json] Missing required fields:', {
                        hasFiles: !!parsed.files,
                        hasGeneratedFiles: !!parsed.generatedFiles
                    });
                    throw new Error("Response missing 'files' or 'generatedFiles' fields");
                }

                return parsed;
            } catch (err) {
                console.error('[parse-json] Failed to parse AI response:');
                console.error('Error:', err instanceof Error ? err.message : String(err));
                console.error('Response preview (first 500 chars):', resultText.substring(0, 500));
                console.error('Response length:', resultText.length);
                throw new Error(`JSON parsing failed: ${err instanceof Error ? err.message : String(err)}`);
            }
        });
        const { files, generatedFiles } = parsedData;
        await step.run("save-to-db", async () => {
            if (!sessionId || !files || !generatedFiles) {
                throw new Error("SessionId, Files or GeneratedFiles is missing");
            }
            await prismaClient.message.upsert({
                where: { id: messageId },
                update: {},
                create: {
                    id: messageId,
                    chat: {
                        connectOrCreate: {
                            where: { id: sessionId },
                            create: { id: sessionId, userId, title: "New Chat" }
                        }
                    }
                }
            });

            Object.keys(defaultFiles).forEach(filePath => {
                if (!files[filePath]) {
                    files[filePath] = (defaultFiles as Record<string, { code: string }>)[filePath].code;
                }
            });

            const fileEntries = Object.entries(files as Record<string, string>);
            const fileDataArray = fileEntries.map(([filePath, fileData]) => {
                const pathParts = filePath.split("/").filter(Boolean);
                const fileName = pathParts[pathParts.length - 1] ?? "index";
                const pathArray = pathParts.slice(0, -1);
                const fileType = fileName.includes(".") ? fileName.split(".").pop() : null;
                return {
                    fileId: messageId,
                    path: pathArray.length > 0 ? pathArray : ["/"],
                    fileName,
                    fullPath: filePath,
                    fileType,
                    content: fileData
                };
            });

            const batches = chunk(fileDataArray, 50);
            for (const b of batches) {

                await prismaClient.fileReader.createMany({ data: b, skipDuplicates: true });
            }
            console.log("=== Successfully saved to DB ===");
            const fileContent = fileDataArray.map((v) => {
                return {
                    path: v.fullPath,
                    content: v.content
                }
            })
            if (fileContent.length > 0) {
                await storeCodeFiles(sessionId, fileContent);
                await storeFiles(messageId, fileContent)
            }
            console.log("=== Successfully cached files in Redis ===");

            return { status: "success" };
        });

        return { status: "completed" };
    }

);

export { storeChatTitle, chatStoreInDb, generateCodeInQueue };