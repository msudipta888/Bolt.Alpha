import { inngest } from "./client";
import "dotenv/config";
import { prismaClient } from "@/app/api/prismaClient/Prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CODE_GEN_PROMPT } from "@/app/AiPage/prompt";

const apiKeys = [
    process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY2!,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY3!
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
    } catch (err: any) {
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

const storeChatTitle = inngest.createFunction(
    { id: "chat-title-store", retries: 2 },
    { event: "chat/title.store" },
    async ({ event }) => {
        const { sessionId, userId, title } = event.data;
        if (!sessionId || !userId || !title) {
            throw new Error("Missing chat title data");
        }
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

// const saveCodeInDb = inngest.createFunction(
//     { id: "save-to-db", concurrency: 2 },
//     { event: "save/db" },
//     async ({ event, step }) => {
//         const { sessionId, messageId, userId, files, generatedFiles } = event.data;
//         await step.run("save-to-db", async () => {
//             if (!sessionId || !files || !generatedFiles) {
//                 throw new Error("SessionId, Files or GeneratedFiles is missing");
//             }
//             // Ensure Message exists
//             await prismaClient.message.upsert({
//                 where: { id: messageId },
//                 update: {},
//                 create: {
//                     id: messageId,
//                     chat: {
//                         connectOrCreate: {
//                             where: { id: sessionId },
//                             create: { id: sessionId, userId, title: "New Chat" }
//                         }
//                     }
//                 }
//             });

//             const alreadyHasFiles = await prismaClient.fileReader.findFirst({
//                 where: { fileId: messageId },
//                 select: { id: true }
//             });
//             if (alreadyHasFiles) {
//                 console.log("Files already saved for messageId:", messageId);
//                 return;
//             }

//             const fileEntries = Object.entries(files as Record<string, any>);
//             const fileDataArray = fileEntries.map(([filePath, fileData]) => {
//                 const pathParts = filePath.split("/").filter(Boolean);
//                 const fileName = pathParts[pathParts.length - 1] ?? "index";
//                 const pathArray = pathParts.slice(0, -1);
//                 const fileType = fileName.includes(".") ? fileName.split(".").pop() : null;
//                 return {
//                     fileId: messageId,
//                     path: pathArray.length > 0 ? pathArray : ["/"],
//                     fileName,
//                     fullPath: filePath,
//                     fileType,
//                     content: fileData
//                 };
//             });

//             const batches = chunk(fileDataArray, 50);
//             for (const b of batches) {
//                 await prismaClient.fileReader.createMany({ data: b, skipDuplicates: true });
//             }
//             console.log("=== Successfully saved to DB ===");
//             return { status: "success" };
//         });
//         return { status: "completed" };
//     }
// );

const generateCodeInQueue = inngest.createFunction(
    { id: "generate-code-queue", concurrency: 1, retries: 5 },
    { event: "ai-code/generate" },
    async ({ event, step }) => {
        const { prompt, sessionId, messageId, userId } = event.data;

        const resultText = await step.run("generate-ai-code", async () => {
            return await withRetry(async () => {
                const model = genAI.getGenerativeModel({
                    model: "gemini-2.5-flash",
                    generationConfig: { responseMimeType: "application/json" }
                });
                const result = await model.generateContent({
                    systemInstruction: CODE_GEN_PROMPT,
                    contents: [{ role: "user", parts: [{ text: JSON.stringify(prompt) }] }]
                });
                const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) throw new Error("Empty AI response");
                return text;
            });
        });

        const parsedData = await step.run("parse-json", async () => JSON.parse(resultText));
        // await step.run("save-files-to-db", async () => {
        //     await inngest.send({
        //         name: "save/db",
        //         data: { sessionId, messageId, userId, files: parsedData.files, generatedFiles: parsedData.generatedFiles }
        //     });
        // });
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
            const fileEntries = Object.entries(files as Record<string, any>);
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
            return { status: "success" };
        });

        return { status: "completed" };
    }

);

export { storeChatTitle, chatStoreInDb, generateCodeInQueue };