"use client";
import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { MessageContext } from "../../context/MessageContext";
import ReactMarkdown from "react-markdown";
import { Sandpack } from "../../AiPage/Sandpack";
import { v4 as uuidv4 } from "uuid";

import { Active, ActiveContext } from "../../context/ActiveContext";
import { file } from "../../AiPage/defaultFiles";
import { useChat } from '@ai-sdk/react'
import {
    Send,
    Loader,
    Code,
    Monitor,
    PanelLeftClose,
    PanelRightClose,
    User,
    Bot,
    Zap,
    AlertCircle,
    Sparkles,
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import Sidebar from "@/app/AiPage/Sidebar";
import { DefaultChatTransport } from "ai";
import { VersionCard } from "@/app/AiPage/VersionCard";
import { toast } from "sonner";


const Gemini = () => {

    const messageContext = useContext(MessageContext);
    if (!messageContext) {
        throw new Error("MessageContext is not provided");
    }
    const { mes, setMes } = messageContext;

    const [files, setFiles] = useState(file);
    const [input, setInput] = useState("");
    const [loader, setLoader] = useState(false);

    const params = useParams();
    const sessionId = params?.sessionId as string;
    const { active, setActive } = useContext(ActiveContext) as Active;
    const [isExpanded, setIsExpanded] = useState(false);
    const [fileLoader, setFileLoader] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState<string | number>(0);
    const hasGeneratedInitialCode = useRef(false);
    const toggleExpand = () => setIsExpanded(!isExpanded);
    const messageIdRef = useRef<string>("");
    const [isTitleClick, setIsTitleClick] = useState(true);

    const lastFetchedId = useRef<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const hasErrorOccurred = useRef(false);
    const lastInputRef = useRef<string>("");

    const { messages, sendMessage, setMessages } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/ai-chat"
        }),
        onError: (error) => {
            setLoader(false);
            setError(error.message);
            hasErrorOccurred.current = true;
            if (lastInputRef.current) {
                setInput(lastInputRef.current);
            }

            setMessages(prev => {
                const updated = [...prev];
                if (updated.length > 0 && updated[updated.length - 1].role === 'user') {
                    updated.pop();
                }
                return updated;
            });

            setMes((prev: any) => {
                const updated = [...prev];
                if (updated.length > 0 && updated[updated.length - 1].role === 'user') {
                    updated.pop();
                }
                return updated;
            });

            if (error.message?.includes("429") || error.message?.toLowerCase().includes("rate limit")) {

                toast.error("Rate Limit Exceeded", {
                    description: "You've sent too many requests. Please wait a moment before trying again.",
                });
            } else if (error.message?.toLowerCase().includes("authentication") || error.message?.toLowerCase().includes("sign in")) {
                toast.error("Authentication Error", {
                    description: "Please sign in again to continue.",
                });
            } else if (error.message?.toLowerCase().includes("session")) {
                toast.error("Session Error", {
                    description: "Your session has expired. Please refresh the page.",
                });
            } else {
                toast.error("Error", {
                    description: error.message || "An unexpected error occurred. Please try again.",
                });
            }
        },
        onFinish: async (response) => {
            try {
                if (hasErrorOccurred.current) {
                    console.log("Skipping onFinish due to previous error");
                    hasErrorOccurred.current = false;
                    return;
                }

                setError(null);
                lastInputRef.current = "";

                const textContent = response.message.parts
                    .filter((part: any) => part.type === "text")
                    .map((part: any) => part.text);

                const responseText = textContent.join("\n");

                if (responseText) {
                    setMes((prev: any) => [
                        ...prev,
                        { role: "ai", content: [responseText] }
                    ]);
                }
                setLoader(false);
                setFileLoader(true);

                setMessages(prev => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last && last.role === 'assistant') {
                        last.id = `${messageIdRef.current}-ai`;
                    }
                    return updated;
                });

                await generateCode(responseText);
            } catch (error: any) {
                console.error("Error processing AI response:", error);
                setError(error.message);
                toast.error("Processing Error", {
                    description: "Failed to process the AI response. Please try again.",
                });
                setMes((prev: any) => [
                    ...prev,
                    { role: "ai", content: ["Sorry, I encountered an error."] }
                ]);
            }
        }
    });

    const parseContent = (content: string) => {
        try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const lastMsg = parsed[parsed.length - 1];
                if (lastMsg.parts && Array.isArray(lastMsg.parts)) {
                    return lastMsg.parts.find((p: any) => p.type === 'text')?.text || lastMsg.content || content;
                }
                return lastMsg.content || content;
            }
            return content;
        } catch (e) {
            return content;
        }
    };


    const fetchHistory = async () => {
        if (lastFetchedId.current === sessionId) return;
        lastFetchedId.current = sessionId;

        try {
            setLoader(true);
            const response = await axios.get(`/api/chat-history/${sessionId}`);
            const chatData = response.data;

            if (chatData && chatData.message) {
                const historicalMessages: any[] = [];
                let lastFiles = null;

                chatData.message.forEach((msg: any) => {
                    if (msg.userChat && msg.userChat.length > 0) {
                        const parsedContent = parseContent(msg.userChat[0].content);
                        historicalMessages.push({
                            id: `${msg.id}-user`,
                            role: 'user',
                            content: parsedContent,
                            parts: [{ type: 'text', text: parsedContent }]
                        });
                    }
                    if (msg.aiChat && msg.aiChat.length > 0) {
                        const parsedContent = parseContent(msg.aiChat[0].content);
                        historicalMessages.push({
                            id: `${msg.id}-ai`,
                            role: 'assistant',
                            content: parsedContent,
                            parts: [{ type: 'text', text: parsedContent }]
                        });
                    }
                    if (msg.fileReader && msg.fileReader.length > 0) {
                        lastFiles = msg.fileReader;
                    }
                });

                setMessages(historicalMessages);

                if (lastFiles) {
                    const reconstructedFiles: any = {};
                    (lastFiles as any[]).forEach((f: any) => {
                        reconstructedFiles[f.fullPath] = f.content;
                    });
                    setFiles({ ...file, ...reconstructedFiles });
                }
            }
        } catch (error: any) {
            if (error.name === 'CanceledError' || error.name === 'AbortError') {
                console.log('History fetch cancelled:', error);
            } else {
                console.error("Error fetching chat history:", error);
                toast.error("Failed to Load History", {
                    description: "Could not load chat history. Please try again.",
                });
            }
        } finally {
            setLoader(false);
            setIsTitleClick(false);
        }
    };

    const searchParams = useSearchParams();
    const isNewChat = searchParams?.get('new') === 'true';

    useEffect(() => {
        if (!sessionId) return;

        if (mes.length === 0 && isTitleClick && !isNewChat) {
            setMessages([]);
            setFiles(file);
            hasGeneratedInitialCode.current = false;
            setRefreshTrigger(0);

            const load = async () => {
                await fetchHistory();
            };
            load();
        }
    }, [sessionId, isTitleClick, isNewChat]);
    const generateCode = async (aiResponse?: string) => {
        try {
            setFileLoader(true);
            const response = await axios.post("/api/ai-code", {
                prompt: aiResponse,
                sessionId,
                messageId: messageIdRef.current
            });

            const status = response.data.status;

            if (status === "processing") {
                let pollAttempts = 0;
                const maxAttempts = 60;

                const pollInterval = setInterval(async () => {
                    pollAttempts++;
                    try {
                        const res = await axios.get(`/api/get-files/${messageIdRef.current}`);
                        if (res.data.files && Object.keys(res.data.files).length > 0) {
                            clearInterval(pollInterval);
                            setFiles((prev: any) => ({ ...prev, ...res.data.files }));
                            setFileLoader(false);
                        }
                    } catch (error) {
                    }

                    if (pollAttempts >= maxAttempts) {
                        clearInterval(pollInterval);
                        setFileLoader(false);
                        console.error("Max polling attempts reached");
                    }
                }, 2000);
            } else if (response.data.data) {
                const data = response.data.data;
                setFiles((prev: any) => ({ ...prev, ...data.files }));
                setFileLoader(false);
            }
        } catch (error: any) {
            console.error("Error generating code with Gemini:", error);
            setFileLoader(false);
            toast.error("Code Generation Failed", {
                description: error.message || "Failed to generate code. Please try again.",
            });
        }
    };

    useEffect(() => {
        if (mes.length > 0 && !hasGeneratedInitialCode.current && messages.length === 0 && !loader && isNewChat) {
            const lastMessage = mes[mes.length - 1];
            if (lastMessage?.role !== "user") return;

            hasGeneratedInitialCode.current = true;
            setRefreshTrigger(lastMessage.content.join("\n").trim());
            setLoader(true);
            hasErrorOccurred.current = false;
            const messageId = uuidv4();
            messageIdRef.current = messageId;
            lastInputRef.current = lastMessage.content.join("\n");

            sendMessage({
                id: messageId,
                role: "user",
                parts: [{
                    type: "text",
                    text: lastMessage.content.join("\n")
                }],
            },
                {
                    body: {
                        sessionId,
                    }
                }
            );

            setInput("");
        }
    }, [mes, sessionId, isNewChat]);

    const handleChange = (e: any) => setInput(e.target.value);
    const handleKeyDown = (e: any) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (input.trim()) {
                setLoader(true);
                setMes(prev => [...prev, { role: "user", content: [input] }]);
                setRefreshTrigger(input.trim());
                hasErrorOccurred.current = false;
                const messageId = uuidv4();
                messageIdRef.current = messageId;
                lastInputRef.current = input.trim();

                sendMessage({
                    id: messageId,
                    parts: [{
                        type: "text",
                        text: input.trim()
                    }],
                },
                    {
                        body: {
                            sessionId
                        }
                    }
                );
                setInput("");
            }
        }
    };


    return (
        <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="h-full w-full flex flex-col">
                <div className="flex h-[100vh] w-full overflow-hidden relative">
                    <div className="text-white">
                        <Sidebar
                            refreshTrigger={refreshTrigger}
                            setMes={setMes}
                            setFiles={setFiles}
                            setInput={setInput}
                            input={input}
                            sessionId={sessionId}
                            setRefreshTrigger={setRefreshTrigger}
                            setIsTitleClick={setIsTitleClick}
                        />
                    </div>

                    {!isExpanded && (
                        <div className="h-full flex flex-col border-r border-slate-700/50 backdrop-blur-sm bg-slate-900/50 w-[450px] shadow-2xl">
                            <div className="px-4 py-3 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                        <Sparkles size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-sm text-white">Bolt Assistant</h2>
                                        <p className="text-xs text-slate-400">AI-Powered Development</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto p-4 custom-scrollbar space-y-3">
                                {messages.length > 0 ? (
                                    messages.map((message) => (
                                        <div key={message.id} className="animate-fadeIn">
                                            {message.parts
                                                .filter((part: any) => part.type === "text")
                                                .map((part: any, partIndex: number) => (
                                                    <div
                                                        key={`${message.id}-${partIndex}`}
                                                        className={`group relative p-4 rounded-xl mb-3 transition-all duration-300 hover:shadow-lg ${message.role === "user"
                                                            ? "bg-gradient-to-br from-blue-600/20 to-blue-700/10 border border-blue-500/30 hover:border-blue-400/50"
                                                            : "bg-gradient-to-br from-purple-600/20 to-purple-700/10 border border-purple-500/30 hover:border-purple-400/50"
                                                            }`}
                                                    >
                                                        <div className="flex items-center mb-3">
                                                            <div
                                                                className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-md ${message.role === "user"
                                                                    ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                                                    : "bg-gradient-to-br from-purple-500 to-purple-600"
                                                                    }`}
                                                            >
                                                                {message.role === "user" ? (
                                                                    <User size={14} className="text-white" />
                                                                ) : (
                                                                    <Bot size={14} className="text-white" />
                                                                )}
                                                            </div>
                                                            <h3 className="font-semibold ml-2.5 text-sm text-white">
                                                                {message.role === "user" ? "You" : "Bolt.alpha"}
                                                            </h3>
                                                            <div className={`ml-auto text-xs px-2 py-0.5 rounded-full ${message.role === "user"
                                                                ? "bg-blue-500/20 text-blue-300"
                                                                : "bg-purple-500/20 text-purple-300"
                                                                }`}>
                                                                {message.role === "user" ? "User" : "AI"}
                                                            </div>
                                                        </div>

                                                        <div className="ml-9 text-slate-200 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                                                            <ReactMarkdown>{part.text}</ReactMarkdown>
                                                            {message.role === "assistant" && (
                                                                <VersionCard
                                                                    messageId={message.id}
                                                                    setFiles={setFiles}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center text-slate-300 p-8 max-w-md">
                                            <div className="inline-flex p-4 rounded-2xl mb-4 bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur shadow-xl border border-slate-700/50">
                                                <Zap size={32} className="text-blue-400" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                                Welcome to Bolt
                                            </h3>
                                            <p className="text-slate-400 text-sm leading-relaxed">
                                                Start by describing the application you want to build. I'll help you bring your ideas to life with code.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur">
                                {error && (
                                    <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3 animate-slideIn backdrop-blur">
                                        <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm text-red-200 leading-relaxed">{error}</p>
                                        </div>
                                        <button
                                            onClick={() => setError(null)}
                                            className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0 text-lg font-bold"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                                <div className="w-full">
                                    <div className="relative">
                                        <textarea
                                            value={input}
                                            onChange={handleChange}
                                            onKeyDown={handleKeyDown}
                                            placeholder="How can Bolt help you today?"
                                            className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl p-3 pr-12 text-slate-200 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none text-sm placeholder:text-slate-500 transition-all duration-200 backdrop-blur"
                                        />
                                        <div className="absolute bottom-2 right-2 flex items-center gap-2">
                                            <span
                                                className={`text-xs font-medium ${input.length > 500 ? "text-red-400" : "text-slate-500"
                                                    }`}
                                            >
                                                {input.length}/1000
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end items-center mt-3">
                                        <button
                                            onClick={() => {
                                                setLoader(true);
                                                setRefreshTrigger(input.trim());
                                                hasErrorOccurred.current = false;
                                                const messageId = uuidv4();
                                                messageIdRef.current = messageId;
                                                lastInputRef.current = input.trim();
                                                sendMessage({
                                                    id: messageId,
                                                    role: "user",
                                                    parts: [{
                                                        type: "text",
                                                        text: input.trim()
                                                    }]
                                                },
                                                    {
                                                        body: {
                                                            sessionId
                                                        }
                                                    }
                                                );
                                                setInput("")
                                            }}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${!input.trim() || loader
                                                ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                                                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-105"
                                                }`}
                                            disabled={loader || !input.trim()}
                                        >
                                            {loader ? (
                                                <>
                                                    <Loader className="animate-spin h-4 w-4" />
                                                    <span>Processing</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Send</span>
                                                    <Send size={14} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div
                        className="h-full flex flex-col relative"
                        style={{ width: isExpanded ? "100%" : "66.666%", padding: "2px", right: "2px", marginRight: "4.5px" }}
                    >
                        <div className="relative flex-grow flex flex-col h-full bg-slate-900/30 backdrop-blur rounded-l-xl overflow-hidden border border-slate-700/30">
                            {fileLoader && (
                                <>
                                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md z-10 transition-all duration-300" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-3">
                                        <Loader className="animate-spin h-10 w-10 text-blue-500" />
                                        <p className="text-slate-300 text-sm font-medium">Generating code...</p>
                                    </div>
                                </>
                            )}

                            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-700/50 bg-slate-800/50 backdrop-blur">
                                <div className="flex gap-1 bg-slate-800/80 rounded-lg p-1 shadow-inner">
                                    <button
                                        onClick={() => setActive("code")}
                                        className={`px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${active === "code"
                                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                                            }`}
                                    >
                                        <Code size={14} />
                                        <span>Code</span>
                                    </button>
                                    <button
                                        onClick={() => setActive("preview")}
                                        className={`px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${active === "preview"
                                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                                            }`}
                                    >
                                        <Monitor size={14} />
                                        <span>Preview</span>
                                    </button>
                                </div>

                                <button
                                    onClick={toggleExpand}
                                    className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 font-medium border border-slate-600/30 hover:border-slate-500/50 shadow-md hover:shadow-lg"
                                >
                                    {isExpanded ? (
                                        <>
                                            <PanelLeftClose size={14} />
                                            <span>Show Chat</span>
                                        </>
                                    ) : (
                                        <>
                                            <PanelRightClose size={14} />
                                            <span>Expand</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="flex-grow relative h-[100vh] overflow-hidden">
                                <Sandpack active={active} files={files} />
                            </div>
                        </div>
                    </div>
                </div>

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(30, 41, 59, 0.3);
                        border-radius: 3px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(71, 85, 105, 0.5);
                        border-radius: 3px;
                        transition: background 0.2s;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(71, 85, 105, 0.8);
                    }
                    
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    @keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    .animate-fadeIn {
                        animation: fadeIn 0.3s ease-out;
                    }
                    
                    .animate-slideIn {
                        animation: slideIn 0.3s ease-out;
                    }
                    
                    /* Markdown Styles */
                    .prose-invert {
                        color: rgb(226, 232, 240);
                    }
                    
                    .prose-invert code {
                        background: rgba(51, 65, 85, 0.5);
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-size: 0.875em;
                        color: rgb(147, 197, 253);
                    }
                    
                    .prose-invert pre {
                        background: rgba(30, 41, 59, 0.5);
                        border: 1px solid rgba(71, 85, 105, 0.3);
                        border-radius: 8px;
                        padding: 12px;
                        overflow-x: auto;
                    }
                    
                    .prose-invert a {
                        color: rgb(96, 165, 250);
                        text-decoration: none;
                    }
                    
                    .prose-invert a:hover {
                        color: rgb(147, 197, 253);
                        text-decoration: underline;
                    }
                `}</style>

                {loader && (
                    <div className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl shadow-2xl shadow-blue-500/50 flex items-center gap-3 z-50 border border-blue-400/30 backdrop-blur animate-slideIn">
                        <Loader className="animate-spin h-5 w-5" />
                        <span className="font-medium">Processing your request...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gemini;
