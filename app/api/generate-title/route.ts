import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { inngest } from "@/app/src/inngest/client";
import { groq } from '@ai-sdk/groq'
import { generateText } from 'ai'

export async function POST(request: NextRequest) {
    const { input, sessionId } = await request.json();
    console.log(input)
    let title = "New Project";
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const prompt = `
Generate a short project title according to given input.

Rules:
- Max 5 words
- No quotes
- No explanation
- Plain text only

Input:
${input}
`;

        const { text: responseText } = await generateText({

            model: groq("llama-3.1-8b-instant"),
            system: prompt,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: input
                        }
                    ]
                }
            ]
        })

        console.log("Gemini raw title:", responseText);

        title =
            responseText.split("\n")[0].replace(/[^\w\s]/g, "").trim() ||
            input?.split(/\s+/).slice(0, 5).join(" ") ||
            "New Project";

    } catch (error) {
        console.error("Gemini title generation error:", error);

        title =
            input?.split(/\s+/).slice(0, 5).join(" ").replace(/[^\w\s]/g, "").trim() ||
            "New Project";
    }

    try {
        await inngest.send({
            name: "chat/title.store",
            data: {
                sessionId,
                userId,
                title
            }
        });
    } catch (inngestError) {
        console.error("Failed to send inngest event:", inngestError);
    }

    return NextResponse.json({ title });
}
