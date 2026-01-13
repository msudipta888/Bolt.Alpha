"use client"
import { useState, useEffect, useRef } from 'react'
import { Menu, X, Plus, MessageSquare, Loader2, Sparkles } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { file } from './defaultFiles'
import axios from 'axios'
import { useRouter } from "next/navigation";
import { SignedIn, UserButton } from '@clerk/nextjs'

interface Chat {
  id: string;
  title: string;
  createdAt: string;
}

interface SidebarProps {
  setMes: (messages: any[]) => void;
  refreshTrigger?: string | number;
  setFiles: (files: any) => void;
  setInput: (input: string) => void;
  input: string;
  sessionId: string;
  setRefreshTrigger: (refreshTrigger: string | number) => void;
  setIsTitleClick: (bool: boolean) => void
}

export default function Sidebar({
  refreshTrigger = 0,
  setMes,
  setFiles,
  setInput,
  input,
  sessionId,
  setRefreshTrigger,
  setIsTitleClick
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [items, setItems] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter();
  const hasFetched = useRef(false);

  const titleGeneratedRef = useRef<Record<string, boolean>>({})
  const isGeneratingRef = useRef(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('/api/get-chat');
      setItems(response.data);
    } catch (err) {
      console.error("fetchChats error", err);
      setError("Failed to load chats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchChats();

  }, [hasFetched.current]);
  useEffect(() => {
    if (!refreshTrigger) return
    if (!sessionId) return
    if (titleGeneratedRef.current[sessionId]) return
    if (isGeneratingRef.current) return
    const generateTitle = async () => {
      try {
        isGeneratingRef.current = true
        const promptToUse = typeof refreshTrigger === 'string' ? refreshTrigger : input;
        console.log('Generating title with prompt:', promptToUse)

        if (!promptToUse) {
          console.warn("No prompt available for title generation")
          return
        }

        const response = await axios.post('/api/generate-title', { input: promptToUse, sessionId })
        const generatedTitle = response?.data?.title ?? response?.data?.rawTitle ?? null

        if (generatedTitle) {
          titleGeneratedRef.current[sessionId] = true
          setItems((prev) => {
            const exists = prev.some(chat => chat.id === sessionId)
            if (exists) {
              return prev.map(chat =>
                chat.id === sessionId ? { ...chat, title: generatedTitle } : chat
              )
            }
            const newChat: Chat = {
              id: sessionId,
              title: generatedTitle,
              createdAt: new Date().toISOString()
            }
            return [newChat, ...prev]
          })
        } else {
          console.warn("generate-title returned no title", response?.data)
        }
      } catch (err: any) {
        console.error("Error generating title:", err?.response?.data || err?.message || err)
      } finally {
        isGeneratingRef.current = false
      }
    }

    generateTitle().catch(e => console.error("Unhandled error in generateTitle:", e))
  }, [refreshTrigger, sessionId])

  const toggleSidebar = () => setIsOpen((o) => !o)

  const handleNewProject = async () => {
    setIsTitleClick(false);
    setMes([])
    setFiles(file)
    setInput('')
    const newSessionId = uuidv4();
    const tempChat: Chat = {
      id: newSessionId,
      title: "Untitled Project",
      createdAt: new Date().toISOString()
    }
    setItems((prev) => [tempChat, ...prev])

    router.push(`/chat/${newSessionId}?new=true`)
    setRefreshTrigger(0);
  }

  const handleSelect = (sessionId: string) => {
    setIsTitleClick(true);
    setMes([]);
    setFiles(file);
    console.log("chatId:", sessionId)
    router.push(`/chat/${sessionId}`)
    if (isMobile) {
      setIsOpen(false);
    }
  }

  return (
    <div className="flex h-screen z-50 relative">
      <div
        className={`bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 backdrop-blur-xl shadow-2xl transition-all duration-500 ease-in-out ${isOpen ? 'w-72' : 'w-16'
          } ${isMobile && isOpen ? 'absolute left-0 top-0' : ''
          } h-full flex flex-col border-r border-slate-700/50 relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between p-5 border-b border-slate-700/50 backdrop-blur-sm bg-slate-800/30">
          <div className={`flex items-center gap-3 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <h2 className="font-bold text-lg bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Projects
            </h2>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200 text-slate-300 hover:text-white hover:scale-105 active:scale-95 relative z-10"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isOpen && (
          <div className="relative p-4 animate-fadeIn">
            <button
              onClick={handleNewProject}
              className="group relative w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-xl px-4 py-3 flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Plus size={18} className="mr-2 relative z-10" />
              <span className="relative z-10">New Project</span>
            </button>
          </div>
        )}

        {isOpen && (
          <div className="relative flex-1 overflow-y-auto custom-scrollbar px-3 py-2 animate-fadeIn">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
              Recent
            </h3>
            <div className="space-y-1.5">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-8 gap-3">
                  <div className="relative">
                    <Loader2 size={24} className="animate-spin text-blue-400" />
                    <div className="absolute inset-0 animate-ping">
                      <Loader2 size={24} className="text-blue-400 opacity-20" />
                    </div>
                  </div>
                  <span className="text-sm text-slate-400">Loading projects...</span>
                </div>
              ) : error ? (
                <div className="px-3 py-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-sm text-red-400 mb-2">{error}</p>
                  <button
                    onClick={fetchChats}
                    className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : items.length > 0 ? (
                items.map((chat, index) => (
                  <div
                    key={chat.id}
                    className="group relative flex items-center p-3 text-slate-300 rounded-xl text-sm cursor-pointer hover:bg-slate-700/40 active:bg-slate-700/60 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5 animate-fadeIn border border-transparent hover:border-slate-600/50"
                    onClick={() => handleSelect(chat.id)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="mr-3 p-1.5 rounded-lg bg-slate-700/50 group-hover:bg-blue-500/20 transition-all duration-200">
                      <MessageSquare size={16} className="text-slate-400 group-hover:text-blue-400 transition-colors duration-200" />
                    </div>
                    <span className="truncate flex-1 group-hover:text-white transition-colors duration-200">
                      {chat.title || "Untitled Project"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-700/30 flex items-center justify-center mb-3">
                    <MessageSquare size={20} className="text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-500 italic">No projects yet.</p>
                  <p className="text-xs text-slate-600 mt-1">Create one to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {isOpen && (
          <div className="relative p-4 mb-6 border-t border-slate-700/50 backdrop-blur-sm bg-slate-800/30 animate-fadeIn">
            <div className="flex items-center justify-between">
              <SignedIn>
                <div className="flex items-center gap-3 w-full">
                  <UserButton
                    showName={true}
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "w-9 h-9 ring-2 ring-blue-500/20",
                        userButtonOuterIdentifier: "text-slate-200"
                      }
                    }}
                  />
                </div>
              </SignedIn>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 animate-fadeIn"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile Toggle Button */}
      {isMobile && !isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-20 text-white p-3 rounded-xl shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 transition-all duration-300 border border-slate-700/50 hover:scale-105 active:scale-95 backdrop-blur-xl"
        >
          <Menu size={20} />
        </button>
      )}

      <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #475569, #334155);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #64748b, #475569);
          }
          
          @keyframes fadeIn {
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
            animation: fadeIn 0.4s ease-out forwards;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
    </div>
  )
}
