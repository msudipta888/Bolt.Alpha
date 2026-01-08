import { config } from "dotenv";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { convertToModelMessages, streamText } from 'ai';
import { CHAT_PROMPT } from "@/app/AiPage/prompt";
import { groq } from '@ai-sdk/groq'
import { inngest } from "@/app/src/inngest/client";

config();


export async function POST(req: NextRequest) {
  try {
    console.log("req come")
    const body = await req.json();
    console.log("API received body:", JSON.stringify(body, null, 2));
    const { messages, sessionId } = body;

    const lastMessage = messages[messages.length - 1];
    const messageId = lastMessage.id;
    const userMessageText = lastMessage.parts?.find((p: any) => p.type === "text")?.text || lastMessage.content || "";
    if (!sessionId) throw new Error("SessionId is missing");
    if (!messages) throw new Error("messages is missing");
    if (!messageId) throw new Error("messageId is missing");
    const { userId } = await auth();
    console.log('Final messageId being used:', messageId)
    if (!userId) {
      console.error("Authentication failed: No user ID");
      throw new Error("User ID is null or undefined");
    }


    const chatsession = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: CHAT_PROMPT,
      messages: await convertToModelMessages(messages),
      onFinish: async ({ text: aiResponseText }) => {
        await inngest.send({
          name: 'chat/db',
          data: {
            sessionId,
            messageId,
            userContent: userMessageText,
            aiContent: aiResponseText,
            userId: userId
          }
        })

      }

    });

    return chatsession.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("AI Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "An unknown error occurred" }
    );
  }
}



