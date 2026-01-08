import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prismaClient } from "../../prismaClient/Prisma";

export async function GET(req: Request, { params }: { params: { sessionId: string } }) {
    try {

        const { userId } = await auth();
        const { sessionId } = await params;
        console.log('req come')
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const chat = await prismaClient.chat.findUnique({
            where: { id: sessionId },
            select: { userId: true }
        });

        if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

        if (chat.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const messages = await prismaClient.message.findMany({
            where: {
                chatId: sessionId
            },
            include: {
                userChat: {
                    select: {
                        content: true
                    }
                },
                aiChat: {
                    select: {
                        content: true
                    }
                },
            },
            orderBy: { createdTime: "asc" }
        });
        const lastMessageWithFiles = await prismaClient.message.findFirst({
            where: {
                chatId: sessionId,
                fileReader: { some: {} }
            },
            orderBy: { createdTime: "desc" },
            include: {
                fileReader: {
                    select: {
                        fullPath: true,
                        content: true
                    }
                }
            }
        });

        const history = messages.map(msg => {
            if (lastMessageWithFiles && msg.id === lastMessageWithFiles.id) {
                return {
                    ...msg,
                    fileReader: lastMessageWithFiles.fileReader
                };
            }
            return {
                ...msg,
                fileReader: []
            };
        });

        return NextResponse.json({ message: history });
    } catch (error) {
        console.error("[CHAT_HISTORY_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
