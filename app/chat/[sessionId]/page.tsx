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
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import Sidebar from "@/app/AiPage/Sidebar";
import { DefaultChatTransport } from "ai";
import { VersionCard } from "@/app/AiPage/VersionCard";


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
    console.log('sessionId:', sessionId)
    const [isTitleClick, setIsTitleClick] = useState(true);

    const lastFetchedId = useRef<string | null>(null);
    const { messages, sendMessage, setMessages } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/ai-chat"
        }),
        onFinish: async (response) => {
            try {
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
            } catch (error) {
                console.error("Error processing AI response:", error);
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

    const mergeFiles = (prevFiles: any, newFiles: any) => {
        const merged = { ...prevFiles, ...newFiles };

        if (newFiles['/package.json'] && prevFiles['/package.json']) {
            try {
                const prevPackage = JSON.parse(prevFiles['/package.json'].code);
                const newPackage = JSON.parse(newFiles['/package.json'].code);

                const mergedPackage = {
                    ...prevPackage,
                    ...newPackage,
                    dependencies: {
                        ...prevPackage.dependencies,
                        ...newPackage.dependencies
                    },
                    devDependencies: {
                        ...prevPackage.devDependencies,
                        ...newPackage.devDependencies
                    }
                };

                merged['/package.json'] = {
                    code: JSON.stringify(mergedPackage, null, 2)
                };
            } catch (e) {
                console.error("Error merging package.json", e);
            }
        }
        return merged;
    };

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
                            setFiles((prev: any) => mergeFiles(prev, res.data.files));
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
                setFiles((prev: any) => mergeFiles(prev, data.files));
                setFileLoader(false);
            }
        } catch (error) {
            console.error("Error generating code with Gemini:", error);
            setFileLoader(false);
        }
    };

    useEffect(() => {
        if (mes.length > 0 && !hasGeneratedInitialCode.current && messages.length === 0 && !loader && isNewChat) {
            const lastMessage = mes[mes.length - 1];
            if (lastMessage?.role !== "user") return;

            hasGeneratedInitialCode.current = true;
            setRefreshTrigger(lastMessage.content.join("\n").trim());
            setLoader(true);
            const messageId = uuidv4();
            messageIdRef.current = messageId;

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
                const messageId = uuidv4();
                messageIdRef.current = messageId;
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
        <div
            className={`h-screen  right-4 w-screen overflow-y-hidden`}
        >
            <div className="h-full w-full flex flex-col">


                <div className="flex h-[calc(100vh-40px)] w-full overflow-y-hidden relative">
                    <div className=" text-white top-0">
                        <Sidebar refreshTrigger={refreshTrigger} setMes={setMes} setFiles={setFiles} setInput={setInput} input={input} sessionId={sessionId} setRefreshTrigger={setRefreshTrigger} setIsTitleClick={setIsTitleClick} />
                    </div>
                    {!isExpanded && (
                        <div className="h-full flex flex-col border-r border-gray-700  w-[450px]">
                            <div className="flex-grow overflow-y-auto p-3 custom-scrollbar">
                                {messages.length > 0 ? (
                                    messages.map((message) => (
                                        <div key={message.id}>
                                            {message.parts
                                                .filter((part: any) => part.type === "text")
                                                .map((part: any, partIndex: number) => (
                                                    <div
                                                        key={`${message.id}-${partIndex}`}
                                                        className={`p-3 rounded mb-2 ${message.role === "user"
                                                            ? "bg-gray-700 border-l-2 border-blue-500"
                                                            : "bg-gray-800 border-l-2 border-purple-500"
                                                            }`}
                                                    >
                                                        <div className="flex items-center mb-1">
                                                            <div
                                                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${message.role === "user"
                                                                    ? "bg-blue-500"
                                                                    : "bg-purple-500"
                                                                    }`}
                                                            >
                                                                {message.role === "user" ? (
                                                                    <User size={12} />
                                                                ) : (
                                                                    <Bot size={12} />
                                                                )}
                                                            </div>
                                                            <h3 className="font-medium ml-2 text-xs">
                                                                {message.role === "user" ? "You" : "Bolt.alpha"}
                                                            </h3>
                                                        </div>

                                                        <div className="ml-6 text-gray-300 text-sm">
                                                            <ReactMarkdown>{part.text}</ReactMarkdown>
                                                            {message.role === "assistant" && (
                                                                <VersionCard
                                                                    messageId={
                                                                        message.id}
                                                                    setFiles={setFiles}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-300 mt-6 p-4">
                                        <div className="inline-block p-2 rounded-full mb-3 bg-gray-600">
                                            <Zap size={20} className="text-blue-400" />
                                        </div>
                                        <p className="text-lg font-semibold mb-2 text-gray-300">
                                            Welcome to Bolt
                                        </p>
                                        <p className="mb-4 text-gray-400 text-sm">
                                            Start by describing the application you want to build
                                        </p>
                                    </div>
                                )}
                            </div>


                            <div className="p-3  ">
                                <div className="w-full">
                                    <textarea
                                        value={input}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="How can Bolt help you today?"
                                        className=" border  rounded p-2 mb-2 text-gray-200 min-h-20 w-full focus:outline-none resize-none text-sm"
                                    />
                                    <div className="flex justify-between items-center">
                                        <span
                                            className={`text-xs ${input.length > 500 ? "text-red-400" : "text-gray-500"}`}
                                        >
                                            {input.length}/1000
                                        </span>
                                        <button
                                            onClick={() => {
                                                setLoader(true);
                                                setRefreshTrigger(input.trim());
                                                const messageId = uuidv4();
                                                messageIdRef.current = messageId;
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
                                            className={`flex items-center px-3 py-1 rounded ${!input.trim() || loader
                                                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                                : "bg-blue-600 hover:bg-blue-700 text-white"
                                                }`}
                                            disabled={loader || !input.trim()}
                                        >
                                            {loader ? (
                                                <div className="flex items-center">
                                                    <Loader className="animate-spin mr-1 h-3 w-3" />
                                                    <span className="text-xs">Processing</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="text-xs">Send</span>
                                                    <Send size={12} className="ml-1" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div
                        className="h-full flex flex-col "
                        style={{ width: isExpanded ? "100%" : "66.666%", padding: "2px", right: "2px", marginRight: "4.5px", }}
                    >
                        <div className="relative flex-grow">
                            {fileLoader && (
                                <div className="absolute inset-0  backdrop-blur-sm bg-opacity-50 z-10" />
                            )}

                            {fileLoader && (
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <Loader className="animate-spin h-8 w-8 text-blue-500" size={35} />
                                </div>
                            )}
                            <div className=" px-3 py-1 flex items-center justify-between ">
                                <div className="flex  rounded p-0.5">
                                    <button
                                        onClick={() => setActive("code")}
                                        className={`px-3 py-1 rounded text-xs font-medium ${active === "code"
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-400 hover:text-gray-300"
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <Code size={12} className="mr-1" />
                                            Code
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setActive("preview")}
                                        className={`px-3 py-1 rounded text-xs font-medium ${active === "preview"
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-400 hover:text-gray-300"
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <Monitor size={12} className="mr-1" />
                                            Preview
                                        </div>
                                    </button>
                                </div>

                                <button
                                    onClick={toggleExpand}
                                    className="bg-gray-700 hover:bg-blue-400 text-gray-300 text-xs px-2 py-1 rounded flex items-center h-8 cursor-pointer right-2.5 mr-5"
                                >
                                    {isExpanded ? (
                                        <>
                                            <PanelLeftClose size={12} className="mr-1" />
                                            Show Chat
                                        </>
                                    ) : (
                                        <>
                                            <PanelRightClose size={12} className="ml-1" />
                                            Expand
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="flex-grow relative h-full overflow-hidden mr-4">
                                <Sandpack active={active} files={files} />
                            </div>
                        </div>
                    </div>
                </div>


                <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #2d2d3a;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #3a3a4a;
            border-radius: 2px;
          }
        `}</style>

                {/* Loading notification - simplified */}
                {loader && (
                    <div className="fixed bottom-2 right-2 bg-blue-600 text-white px-3 py-2 rounded shadow-lg flex items-center z-50 text-sm">
                        <Loader className="animate-spin mr-2 h-4 w-4" />
                        <span>Processing...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gemini;