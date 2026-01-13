//1.store all hostory[ai-chats,lastfilewithCode] sessionId=>contents
//2.store all fileswithcode messageId=>code content
//3.store the all title userId=>title

import { redis } from "@/lib/redis"

interface TitleItem {
    sessionId: string;
    title: string;
}

const REDIS_TTL_SECONDS = 60 * 60 * 48;

const storeChatHistory = async (sessionId: string, messageId: string, userContent: string, aiContent: string) => {
    try {
        const chatKey = `chat:${sessionId}`;
        const chatStore = await redis.zadd(chatKey, {
            score: Date.now(),
            member: {
                messageId: messageId,
                userChat: userContent,
                aiChat: aiContent
            }
        });

        await redis.expire(chatKey, REDIS_TTL_SECONDS);

        return chatStore;

    } catch (error) {
        console.error("[REDIS_STORE_CHAT_ERROR]", error);
        return null;
    }
}

const storeCodeFiles = async (sessionId: string, files: { path: string; content: string }[]) => {
    try {
        const codeKey = `code:session:${sessionId}`;
        const fileData = files.map((v) => {
            return {
                path: v.path,
                content: v.content
            }
        })
        const fileStore = await redis.zadd(codeKey, {
            score: Date.now(),
            member: fileData
        });
        await redis.expire(codeKey, REDIS_TTL_SECONDS);

        return fileStore;
    } catch (error) {
        console.error("[REDIS_STORE_CODE_ERROR]", error);
        return null;
    }
}

const getLatestCodeFiles = async (sessionId: string) => {
    try {
        const codeKey = `code:session:${sessionId}`;
        const latest = await redis.zrange(codeKey, 0, 0, { rev: true });
        if (latest && latest.length > 0) {
            return latest[0];
        }
        return null;
    } catch (error) {
        console.error("[REDIS_GET_CODE_ERROR]", error);
        return null;
    }
}

const getChatHistory = async (sessionId: string) => {
    try {
        const chatKey = `chat:${sessionId}`;
        const history = await redis.zrange(chatKey, 0, -1);
        if (history && history.length > 0) {
            return history;
        }
        return null;
    } catch (error) {
        console.error("[REDIS_GET_CHAT_ERROR]", error);
        return null;
    }
}
const setAllTitle = async (userId: string, sessionId: string, title: string) => {
    try {
        if (!userId) throw new Error('No userId');
        const key = `title:${userId}`;
        const result = await redis.zadd(key, {
            score: Date.now(),
            member: {
                sessionId: sessionId,
                title: title
            }
        });
        await redis.expire(key, REDIS_TTL_SECONDS);
        return result;
    } catch (error) {
        console.error("[REDIS_SET_TITLE_ERROR]", error);
        return null;
    }
}
const getAllTitle = async (userId: string): Promise<TitleItem[] | null> => {
    try {
        if (!userId) throw new Error('UserId not presented');
        const key = `title:${userId}`;
        const getTitles = await redis.zrange(key, 0, -1, { rev: true }) as TitleItem[];
        if (getTitles && getTitles.length > 0) {
            console.log("[REDIS_GET_TITLE_SUCCESS]", getTitles);
            return getTitles;
        }
        return null;
    } catch (error) {
        console.error("[REDIS_GET_TITLE_ERROR]", error);
        return null;
    }
}
const storeFiles = async (messageId: string, files: { path: string, content: string }[]) => {
    try {
        const codeKey = `code:msg:${messageId}`;
        const fileData = files.map((v) => {
            return {
                path: v.path,
                content: v.content
            }
        })
        const fileStore = await redis.set(codeKey, fileData);
        await redis.expire(codeKey, REDIS_TTL_SECONDS);
        return fileStore;
    } catch (error) {
        console.error("[REDIS_STORE_CODE_ERROR]", error);
        return null;
    }
}
const getFiles = async (messageId: string) => {
    try {
        const codeKey = `code:msg:${messageId}`;
        const file = await redis.get(codeKey)
        if (file) {
            console.log(file)
            return file;
        }
        return null;
    } catch (error) {
        console.error("[REDIS_GET_CODE_ERROR]", error);
        return null;
    }
}
export {
    storeChatHistory, storeCodeFiles,
    getLatestCodeFiles, getChatHistory,
    setAllTitle, getAllTitle, storeFiles, getFiles
}