import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prismaClient } from "../../prismaClient/Prisma";

export async function GET(req: Request, { params }: { params: { messageId: string } }) {
    try {
        const { userId } = await auth();
        const { messageId } = await params;
        const cleanMessageId = messageId.replace(/-(ai|user)$/, "");

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const message = await prismaClient.message.findUnique({
            where: { id: cleanMessageId },
            include: {
                chat: {
                    select: { userId: true }
                },
                fileReader: {
                    select: {
                        fullPath: true,
                        content: true
                    }
                }
            }
        });

        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        // Security check: Ensure user owns this chat
        if (message.chat.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        const reconstructedFiles: any = {};
        message.fileReader.forEach((f) => {
            reconstructedFiles[f.fullPath] = f.content;
        });

        return NextResponse.json({ files: reconstructedFiles });
    } catch (error) {
        console.error("Error fetching files:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
