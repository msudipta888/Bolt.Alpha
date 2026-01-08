import { inngest } from "@/app/src/inngest/client";
import { storeChatTitle, generateCodeInQueue, chatStoreInDb } from "@/app/src/inngest/function";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        storeChatTitle,
        chatStoreInDb,
        generateCodeInQueue
    ],
});