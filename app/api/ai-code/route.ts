import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { inngest } from "@/app/src/inngest/client";

export async function POST(req: NextRequest) {
    const { prompt, sessionId, messageId } = await req.json();

    try {
        const { userId } = await auth();

        if (!userId) {
            throw new Error("User ID is null or undefined");
        }

        await inngest.send({
            name: "ai-code/generate",
            data: {
                prompt,
                sessionId,
                messageId,
                userId
            }
        });

        return NextResponse.json({
            status: "processing",
            messageId
        });

    } catch (error: any) {
        console.error("AI Code queue error:", error);
        return NextResponse.json(
            { error: error.message || "An error occurred" },
            { status: 500 }
        );
    }
}
