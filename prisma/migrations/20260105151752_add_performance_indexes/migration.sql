-- CreateIndex
CREATE INDEX "AiChat_AiChatId_idx" ON "AiChat"("AiChatId");

-- CreateIndex
CREATE INDEX "Chat_id_idx" ON "Chat"("id");

-- CreateIndex
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");

-- CreateIndex
CREATE INDEX "UserChat_userChatId_idx" ON "UserChat"("userChatId");
