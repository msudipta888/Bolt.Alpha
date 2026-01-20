"use client";
import React, { useState, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { Typewriter } from "react-simple-typewriter";
import { Send, Loader, Zap, Sparkles, Code2, Cpu, Layers } from "lucide-react";
import { MessageContext } from "../context/MessageContext";
import { useRouter } from "next/navigation";
import galaxyBg from "../../public/assests/earth.jpg";
import Image from "next/image";
const ChatInterface = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const [error, setError] = useState<string | null>(null);
  const messageContext = useContext(MessageContext);

  if (!messageContext) {
    throw new Error("MessageContext is not provided");
  }
  const { setMes } = messageContext;

  const navigate = useRouter();

  const handleSubmit = (userInput: string) => {
    try {
      if (!userInput.trim() || loading) return;
      setLoading(true);
      setMes((prev) => [
        ...prev,
        {
          role: "user",
          content: [userInput.trim()],
        },
      ]);

      setInput("");
      navigate.push(`/chat/${sessionId}?new=true`);
    } catch (error: unknown) {
      console.error(error);
      setError(error instanceof Error ? error.message : String(error));
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };

  const features = [
    { icon: Code2, title: "Smart Coding", desc: "AI-powered solutions" },
    { icon: Cpu, title: "Fast Processing", desc: "Instant responses" },
    { icon: Layers, title: "Modern UI Design", desc: "Beautiful and user-friendly" }
  ];

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={galaxyBg}
          alt="Galaxy Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {error && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <div className="bg-red-500/10 backdrop-blur-md border border-red-400/40 text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-top duration-500">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">!</div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-100 mb-1">Error</h3>
              <p className="text-sm text-red-200/90">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-6xl px-4 py-8">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-2xl">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            Bolt AI
          </h1>
          <p className="text-xl text-white/80 font-light mb-8">
            Powered by Gemini • Your Cosmic Code Companion
          </p>

          <div className="min-h-[40px] mb-8">
            <p className="text-2xl md:text-3xl font-medium text-white/90">
              <Typewriter
                words={[
                  "Transform ideas into reality...",
                  "Build stunning applications...",
                  "Code smarter, ship faster...",
                  "Your vision, our intelligence...",
                ]}
                loop={0}
                cursor
                cursorStyle="_"
                typeSpeed={80}
                deleteSpeed={60}
                delaySpeed={2000}
              />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 max-w-4xl mx-auto">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
              >
                <feature.icon className="w-8 h-8 text-white mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-semibold text-lg mb-1">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom duration-700">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] overflow-hidden">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(input);
              }}
            >
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your vision... What would you like to build today?"
                  className="w-full bg-transparent text-white placeholder-white/40 p-8 pr-32 resize-none focus:outline-none min-h-[180px] text-lg"
                  disabled={loading}
                />

                <div className="absolute bottom-6 right-6 flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                    <span className={`text-sm font-medium ${input.length > 900 ? "text-red-300" : "text-white/60"}`}>
                      {input.length}/1000
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className={`relative group p-4 rounded-full transition-all duration-300 ${!input.trim() || loading
                      ? "bg-white/10 text-white/30 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 hover:scale-110 shadow-lg hover:shadow-purple-500/50"
                      }`}
                  >
                    {loading ? (
                      <Loader className="w-6 h-6 animate-spin" />
                    ) : (
                      <Send className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="border-t border-white/10 bg-white/5 px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Press Enter to send • Shift+Enter for new line</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-white/50 text-sm">Online</span>
              </div>
            </div>
          </div>

          <p className="text-center text-white/40 text-sm mt-6 font-light">
            Your conversation will begin once you submit your first message
          </p>
        </div>
      </div>

      {loading && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 backdrop-blur-xl text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20">
            <div className="relative">
              <Loader className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <p className="font-semibold">Processing...</p>
              <p className="text-sm text-white/80">Generating your code</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ChatInterface;