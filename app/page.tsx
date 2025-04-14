"use client";
import { useContext, useEffect, useState } from "react";
import Gemini from "./AiPage/Gemini";
import { Message, MessageContext } from "./context/MessageContext";
import { actionContext } from "./context/Action";
import { ActiveContext } from "./context/ActiveContext";
import Signup from './sign-up/[[...sign-up]]/page'
import Signin from './sign-in/[[...sign-in]]/page'
import { useUser } from '@clerk/nextjs';
import { ImageContext, profileImage } from "./context/imageContext";
import Navbar from "./AiPage/Navbar";

export default function Home() {
  const [mes, setMes] = useState<Message[]>([]);
  const [action, setAction] = useState("null");
  const [active, setActive] = useState("code");
  const { isSignedIn, user } = useUser();
  const [image, setImage] = useState<profileImage | string>('');
 
  return (
    <div className="h-[100vh] w-[100vw] text-white">
      <div className="container h-[100vh] mx-auto px-5 -pt-3">
        {/* Header with logo */}
       
        <Navbar/>
        <main className="h-screen w-[100vw] rounded-xl shadow-xl overflow-hidden relative">
          {
            // !isSignedIn ?<Signin />  
            // : !user ? <Signup /> 
            // : (
              <ImageContext.Provider value={{ image, setImage }}>
                <MessageContext.Provider value={{ mes, setMes }}>
                  <actionContext.Provider value={{ action, setAction }}>
                    <ActiveContext.Provider value={{ active, setActive }}>
                     
                      <Gemini />
                    </ActiveContext.Provider>
                  </actionContext.Provider>
                </MessageContext.Provider>
              </ImageContext.Provider>
          //   )
           }
        </main>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-400 text-sm">
          <p>© 2025 Bolt. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
