import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prismaClient } from "../prismaClient/Prisma";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.log('req come')
        const chats = await prismaClient.chat.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: "desc"
            },
            select: {
                id: true,
                title: true,
                createdAt: true
            }
        });
        if (!chats) return NextResponse.json({ message: "No chat" })
        return NextResponse.json(chats);

    } catch (error) {
        console.error("Error fetching chats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
