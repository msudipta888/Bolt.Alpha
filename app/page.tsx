"use client";
import { useState } from "react";
import Gemini from "./AiPage/Gemini";
import { Message, MessageContext } from "./context/MessageContext";
import { actionContext } from "./context/Action";
import { ActiveContext } from "./context/ActiveContext";

export default function Home() {
  const [mes, setMes] = useState<Message[]>([]);
  const [action, setAction] = useState("null");
  const [active, setActive] = useState("code");
  
  return (
    <div className="h-[100vh] w-[100vw] text-white">
      <div className="containe h-[100vh] mx-auto px-5 -pt-3 ">
        {/* Header with logo */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-blue-500 p-2 ml-5 mt-2 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl ml-4  font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mt-5">
              Bolt
            </h1>
          </div>
         
        </header>

       
        <main className="h-screen w-[100vw]  rounded-xl shadow-xl overflow-hidden relative">
        

          <MessageContext.Provider value={{ mes, setMes }}>
            <actionContext.Provider value={{ action, setAction }}>
              <ActiveContext.Provider value={{ active, setActive }}>
               <Gemini/>
              </ActiveContext.Provider>
            </actionContext.Provider>
          </MessageContext.Provider>
        </main>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-400 text-sm">
          <p>© 2025 Bolt. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
