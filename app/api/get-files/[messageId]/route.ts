import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prismaClient } from "../../prismaClient/Prisma";
import { getFiles } from "@/app/redis/redis-type";

export async function GET(req: Request, { params }: { params: { messageId: string } }) {
    try {
        const { userId } = await auth();
        const { messageId } = await params;
        const cleanMessageId = messageId.replace(/-(ai|user)$/, "");

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const file = await getFiles(messageId);
        if (file) {
            console.log('get file from redis')
            return NextResponse.json({ files: file })
        }
        console.log('can not get file from redis')
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

        if (message.chat.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        const reconstructedFiles: Record<string, string> = {};
        message.fileReader.forEach((f) => {
            if (f.content !== null) {
                reconstructedFiles[f.fullPath] = f.content as string;
            }
        });

        return NextResponse.json({ files: reconstructedFiles });
    } catch (error) {
        console.error("Error fetching files:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
