"use client";
import React, { useState, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { Typewriter } from "react-simple-typewriter";
import { Send, Loader, Zap, Sparkles, Rocket } from "lucide-react";
import { MessageContext } from "../context/MessageContext";
import { useRouter } from "next/navigation";
const ChatInterface = () => {
  // State management
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const [error, setError] = useState<string | null>(null);
  const messageContext = useContext(MessageContext);

  if (!messageContext) {
    throw new Error("MessageContext is not provided");
  }
  const { setMes } = messageContext;

  let navigate;
  try {
    navigate = useRouter();
  } catch (err) {
    console.error("Navigation error:", err);
    return (
      <div className="text-red-500 p-4">
        Error: useNavigate hook failed. Make sure this component is wrapped in a
        Router.
      </div>
    );
  }


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
    } catch (error: any) {
      console.error(error)
      setError(error.message)
    }
  };


  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };




  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl"></div>
      </div>

      {error && (
        <div className="relative z-10 w-full max-w-3xl mb-6 bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-200 p-5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5">
              <span className="text-red-400">!</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Error Detected</h3>
              <p className="text-sm text-red-300/80">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-4xl">
        <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-violet-500/20 rounded-3xl blur-xl"></div>

          <div className="relative bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-violet-600/20 backdrop-blur-xl px-8 py-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative h-12 w-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-200 via-blue-200 to-violet-200 bg-clip-text text-transparent">
                  Bolt AI
                </h1>
                <p className="text-xs text-purple-300/70">Powered by Gemini</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-purple-200/80">Ready to assist</span>
            </div>
          </div>

          <div className="relative p-8 h-[500px] overflow-y-auto custom-scrollbar">
            <div className="text-center mt-4 mb-8">
              <div className="inline-flex p-4 rounded-3xl mb-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl border border-white/10 shadow-2xl">
                <Rocket size={48} className="text-purple-300" />
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-200 via-blue-200 to-violet-200 bg-clip-text text-transparent">
                Welcome to Bolt AI
              </h2>
              <p className="text-purple-200/70 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                Your intelligent coding companion. Describe your vision, and watch as I transform your ideas into production-ready code instantly.
              </p>

              <div className="mb-10 min-h-[60px] flex items-center justify-center">
                <div className="text-2xl font-medium bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                  <Typewriter
                    words={[
                      "Build web apps faster.",
                      "Get instant code solutions.",
                      "Learn as you build.",
                      "Bring your ideas to life.",
                    ]}
                    loop={0}
                    cursor
                    cursorStyle="|"
                    typeSpeed={70}
                    deleteSpeed={50}
                    delaySpeed={1500}
                  />
                </div>
              </div>
            </div>


          </div>

          <div className="relative border-t border-white/10 p-6 bg-gradient-to-b from-transparent to-black/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(input);
              }}
              className="relative"
            >
              <div className="relative group">

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe what you want to build..."
                  className="w-full bg-white/10 backdrop-blur-xl text-purple-100 placeholder-purple-300/40 rounded-2xl p-5 pr-20 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:bg-white/15 min-h-[120px] border border-white/10 transition-all duration-300 shadow-lg"
                  disabled={loading}
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                  <span
                    className={`text-xs font-medium ${input.length > 500 ? "text-red-400" : "text-purple-300/60"
                      }`}
                  >
                    {input.length}/1000
                  </span>
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className={`relative p-3 rounded-xl transition-all duration-300 ${!input.trim() || loading
                      ? "bg-white/5 text-purple-400/40 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-purple-500/50 hover:scale-110"
                      }`}
                  >
                    {loading ? (
                      <Loader className="animate-spin h-5 w-5" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom info */}
        <p className="text-center text-purple-300/40 text-sm mt-6 flex items-center justify-center gap-2">
          <Zap size={14} />
          Your session will begin once you submit your first message
        </p>
      </div>

      {loading && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-xl opacity-50"></div>
            <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 backdrop-blur-xl text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20">
              <div className="relative">
                <Loader className="animate-spin h-6 w-6" />
                <div className="absolute inset-0 bg-white/20 rounded-full blur-md"></div>
              </div>
              <div>
                <p className="font-semibold">Building your project</p>
                <p className="text-xs text-purple-100/80">Generating code and UI...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ChatInterface;
