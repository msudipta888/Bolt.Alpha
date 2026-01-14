import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { convertToModelMessages, streamText } from 'ai';
import { CHAT_PROMPT } from "@/app/AiPage/prompt";
import { groq } from '@ai-sdk/groq'
import { inngest } from "@/app/src/inngest/client";



export async function POST(req: NextRequest) {
  try {
    console.log("req come")
    const body = await req.json();
    const { messages, sessionId } = body;

    const lastMessage = messages[messages.length - 1];
    const messageId = lastMessage.id;
    const userMessageText = lastMessage.parts?.find((p: any) => p.type === "text")?.text || lastMessage.content || "";
    if (!sessionId) throw new Error("SessionId is missing");
    if (!messages) throw new Error("messages is missing");
    if (!messageId) throw new Error("messageId is missing");
    const { userId } = await auth();
    if (!userId) {
      console.error("Authentication failed: No user ID");
      throw new Error("User ID is null or undefined");
    }


    const { aj } = await import("@/lib/arcjet");
    const decision = await aj.protect(req,
      {
        userId,
        requested: 2
      }
    )
    console.log(decision.conclusion)
    if (decision.isDenied()) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment before trying again." },
        { status: 429 },
      );
    }
    console.log(decision.isAllowed)


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

    if (error.message?.includes("SessionId is missing")) {
      return NextResponse.json(
        { error: "Session ID is missing. Please refresh the page." },
        { status: 400 }
      );
    }

    if (error.message?.includes("messageId is missing")) {
      return NextResponse.json(
        { error: "Message ID is missing. Please try again." },
        { status: 400 }
      );
    }

    if (error.message?.includes("User ID is null or undefined")) {
      return NextResponse.json(
        { error: "Authentication failed. Please sign in again." },
        { status: 401 }
      );
    }


    return NextResponse.json(
      { error: error.message || "An unknown error occurred. Please try again." },
      { status: 500 }
    );
  }
}



