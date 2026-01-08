"use client"
import { useState, useEffect, useRef } from 'react'
import { Menu, X, Plus, MessageSquare, Loader2 } from 'lucide-react'
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
        className={`text-white shadow-lg transition-all duration-300 ease-in-out bg-gray-900 ${isOpen ? 'w-64' : 'w-16'
          } ${isMobile && isOpen ? 'absolute transform -translate-x-full' : ''} h-full flex flex-col border-r border-gray-800`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2
            className={`font-bold text-xl transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'
              }`}
          >
            Dashboard
          </h2>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-800 transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isOpen && (
          <div className="p-4 flex flex-col space-y-4">
            <button
              onClick={handleNewProject}
              className="bg-blue-600 text-white text-sm font-medium rounded-lg px-4 py-2 flex items-center justify-center shadow-md hover:bg-blue-700 transition-all duration-300 w-full"
            >
              <Plus size={16} className="mr-2" /> New Project
            </button>
          </div>
        )}

        {isOpen && (
          <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Projects</h3>
            <div className="space-y-1">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 size={20} className="animate-spin text-blue-400" />
                  <span className="ml-2 text-sm text-gray-400">Loading chats...</span>
                </div>
              ) : error ? (
                <div className="px-2 py-2">
                  <p className="text-sm text-red-400">{error}</p>
                  <button
                    onClick={fetchChats}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    Retry
                  </button>
                </div>
              ) : items.length > 0 ? (
                items.map((chat) => (
                  <div
                    key={chat.id}
                    className="group flex items-center p-2 text-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-800 hover:text-white transition-colors"
                    onClick={() => handleSelect(chat.id)}
                  >
                    <MessageSquare size={16} className="mr-3 text-gray-500 group-hover:text-blue-400" />
                    <span className="truncate">{chat.title || "Untitled Project"}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 px-2 italic">No projects yet.</p>
              )}
            </div>
          </div>
        )}

        {isOpen && (
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <SignedIn>
                <UserButton showName={true} />
              </SignedIn>
            </div>
          </div>
        )}
      </div>

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={toggleSidebar}
        />
      )}
      {isMobile && !isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-20 text-white p-2 rounded-md shadow-lg bg-gray-900 hover:bg-gray-800 transition-colors"
        >
          <Menu size={24} />
        </button>
      )}

      <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4b5563;
            border-radius: 2px;
          }
           .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
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
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
    </div>
  )
}
