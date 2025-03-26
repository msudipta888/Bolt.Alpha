"use client";
import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CODE_GEN_PROMPT, CHAT_PROMPT } from "./prompt";
import axios from "axios";
import Lookup from "./Lookup";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
} from "@codesandbox/sandpack-react";
import { SandpackFileExplorer } from "sandpack-file-explorer";
import { MessageContext, MessageContextType } from "../context/MessageContext";
import ReactMarkdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";
import DeployAndDownload from "./DeployAndDownload";
import { Active, ActiveContext } from "../context/ActiveContext";
import { Typewriter } from "react-simple-typewriter";
import { useWebcontainer } from "./Webcontainer";
import { Files } from "./File";

const Gemini = () => {
  const [files, setFiles] = useState(Lookup.DEFAULT_FILE);
  const { mes, setMes } = useContext(MessageContext) as MessageContextType;
  const [input, setInput] = useState("");
  const [loader, setLoader] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [sessionId, setSessionId] = useState("");
  const { active, setActive } = useContext(ActiveContext) as Active;
  const [isExpanded, setIsExpanded] = useState(false);
  const [deployStatus, setDeployStatus] = useState("");
  const [deployStage, setDeployStage] = useState("");
  const [deployMessage, setDeployMessage] = useState("");
  const [deployLink, setDeployLink] = useState("");

  const webContainer = useWebcontainer();
  
  // Generate a session ID when the component mounts
  useEffect(() => {
    setSessionId(uuidv4());
  }, []);

  // Toggle between dark and light mode with a smooth transition
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleChatWithGemini = async () => {
    if (mes.length === 0) return;

    setLoader(true);
    try {
      //Convert our messages to a format Gemini can understand
      const formattedMessages = mes.map((message) => ({
        role: message.role === "user" ? "user" : "model",
        content: message.content.join("\n"),
      }));

      // Add the CHAT_PROMPT to guide Gemini
      const systemPrompt = { role: "system", content: CHAT_PROMPT };
      const prompt =
        JSON.stringify(systemPrompt) + ":" + JSON.stringify(formattedMessages);

      const result = await axios.post("/api/ai-chat", {
        prompt: prompt,
        sessionId,
      });

      const responseText = result.data.result;
      console.log(responseText);
     // const cleanText = responseText.replace(/[\r\n]+/gm, " ");
     const cleanText = responseText.replace(/\n+\d+\.?\s*/g, "\n- ");
     const replacedText = cleanText.replace(/"/g, "");
     // Only replace escape sequences and keep essential punctuation
     const cleanedText = replacedText.replace(/\\n/g, "\n").replace(/[^\w\s.,!?:;()-]/g, '');
     setMes((prev) => [...prev, { role: "ai", content: [cleanedText] }]);

      
    } catch (error) {
      console.error("Error communicating with Gemini:", error);
      setMes((prev) => [
        ...prev,
        {
          role: "ai",
          content: ["Sorry, I encountered an error. Please try again."],
        },
      ]);
    } finally {
      setLoader(false);
    }
  };

  const generateCode = async () => {
    setLoader(true);
    try {
      const formattedMessages = mes.map((message) => ({
        role: message.role === "user" ? "user" : "model",
        content: message.content.join("\n"),
      }));

      const systemPrompt = { role: "system", content: CODE_GEN_PROMPT };

      const response = await axios.post("/api/ai-code", {
        prompt: [...formattedMessages, systemPrompt],
        sessionId,
      });

      const code = response.data.result;
      const mergedFiles = { ...Lookup.DEFAULT_FILE, ...code?.files };
      setFiles(mergedFiles);
    } catch (error) {
      console.error("Error generating code with Gemini:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (mes.length > 0) {
      const lastMessage = mes[mes.length - 1];
      if (lastMessage.role === "user") {
        handleChatWithGemini();
      }
    }
  }, [mes]);

  const onGenerate = (input: string) => {
    if (!input.trim()) return;

    setMes((prev) => [...prev, { role: "user", content: [input] }]);
    setInput("");
  };

  useEffect(() => {
    if (mes.length > 0) {
      const lastMessage = mes[mes.length - 1];
      if (lastMessage.role === "user") {
        generateCode();
      }
    }
  }, [mes]);
  const main = async()=>{
    await webContainer?.mount(Files);
    console.log(files)
await webContainer?.spawn('npm', ['run', 'dev']);
webContainer?.on('server-ready', (port, url) => {
  // Assuming you have an iframe element with the id "preview"
  let previewIframe = document.getElementById('preview');
  if (previewIframe instanceof HTMLIFrameElement) {
    previewIframe.src = url;
  }
  console.log(`Server is running on port ${port}`);
});

  }
 useEffect(()=>{
  main();
 },[Files])

  const handleNewProject = () => {
    // Generate a new session ID
    const newSessionId = uuidv4();
    setSessionId(newSessionId);

    // Clear the messages
    setMes([]);

    // Reset to default files
    setFiles(Lookup.DEFAULT_FILE);

    // Clear the input
    setInput("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="h-[100vh] w-[100vw] pl-3 pr-3 text-gray-200 overflow-hidden">
      {/* Header/Nav bar */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 p-3 flex justify-between items-center">
        <div className="flex space-x-3">
          <button
            onClick={handleNewProject}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-3 py-1.5 rounded-md flex items-center transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1.5"
            >
              <path d="M3 3h18v18H3zM12 9v6M9 12h6" />
            </svg>
            New Project
          </button>
          <button
            onClick={toggleTheme}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-3 py-1.5 rounded-md transition-all"
          >
            {theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-49px)] overflow-hidden">
        {/* Chat area and input - Left side panel */}
        <div
          className={`${
            isExpanded ? "hidden" : "w-1/3"
          } h-full flex flex-col border-r border-gray-800 bg-gray-900/30 transition-all duration-300`}
        >
          <div className="flex-grow overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
  {Array.isArray(mes) && mes.length > 0 ? (
    mes.map((message, index) => (
      <div
        key={index}
        className={`p-4 rounded-lg mb-3 shadow-sm transition-all ${
          message.role === "user"
            ? "bg-gray-800/70 border-l-2 border-blue-500"
            : "bg-gray-900/70 border-l-2 border-purple-500"
        }`}
      >
        <div className="flex items-center mb-2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              message.role === "user"
                ? "bg-blue-500"
                : "bg-purple-500"
            }`}
          >
            {message.role === "user" ? "Y" : "B"}
          </div>
          <h3 className="font-medium ml-2 text-sm">
            {message.role === "user" ? "You" : "Bolt.alpha"}
          </h3>
        </div>
        {message.role === "ai" &&
          message.content.map((line, idx) => (
            <div key={idx} className="ml-8 text-gray-300">
              <Typewriter
                words={[line]}
                typeSpeed={30}
                delaySpeed={30}
              />
            </div>
          ))}
          
        {message.role === "user" &&
          message.content.map((line, idx) => (
            <div key={idx} className="ml-8 text-gray-300">
              <ReactMarkdown>{line}</ReactMarkdown>
            </div>
          ))}
      </div>
    ))
    
  ) : (
    <div className="text-center text-gray-500 mt-8 p-6 bg-gray-900/40 rounded-lg border border-gray-800">
      <div className="inline-block p-3 bg-blue-500/20 rounded-full mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-400"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
      <p className="text-xl font-semibold mb-2 text-gray-300">
        Welcome to Bolt
      </p>
      <p className="mb-6 text-gray-400">
        Start by describing the application you want to build
      </p>
      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-sm text-left text-gray-400">
        <p>Examples:</p>
        <ul className="mt-2 space-y-2">
          <li className="hover:text-blue-400 cursor-pointer">
            • Create a simple todo application with React
          </li>
          <li className="hover:text-blue-400 cursor-pointer">
            • Build a weather dashboard that uses an API
          </li>
          <li className="hover:text-blue-400 cursor-pointer">
            • Design a portfolio website with animations
          </li>
        </ul>
      </div>
    </div>
  )}
</div>


{deployStatus && (
  <div className="relative bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96">
    <div
      className={`p-4 rounded-lg shadow-lg transition-all ${
        deployStatus === "active" ? "bg-yellow-900/90 border-l-2 border-yellow-500"
          : deployStatus === "error" ? "bg-red-900/90 border-l-2 border-red-500"
          : deployStatus === "success" ? "bg-green-900/90 border-l-2 border-green-500"
          : "bg-gray-800/90 border-l-2 border-blue-500"
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium mb-2 text-sm text-amber-400">Deployment Status: {deployStatus}</h3>
        <button 
          onClick={() => setDeployStatus("")} 
          className="text-gray-400 hover:text-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      {deployStage && (
        <p className="text-sm">
          <strong>Stage:</strong> {deployStage}
        </p>
      )}
      {deployMessage && (
        <p className="text-sm">
          <strong>Message:</strong> {deployMessage}
        </p>
        
      ) }
      {deployLink && (
        <p className="text-sm">
          <strong>Deployed to:</strong>{" "}
          <a
            href={deployLink}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 underline"
          >
            {deployLink}
          </a>
        </p>
      )}
    </div>
  </div>
)}

          <div className="p-4 border-t border-gray-800 bg-gray-900/60">
            <textarea
              value={input}
              onChange={handleChange}
              placeholder="How can Bolt help you today?"
              className="bg-gray-800/70 border border-gray-700 rounded-lg p-3 mb-3 text-gray-200 min-h-24 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <button className="text-gray-400 hover:text-gray-300 p-1.5 rounded-md hover:bg-gray-800 transition-all">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-gray-300 p-1.5 rounded-md hover:bg-gray-800 transition-all">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 6 12 2 8 6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                  </svg>
                </button>
              </div>
              <Button
                onClick={() => onGenerate(input)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  !input.trim()
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                disabled={loader || !input.trim()}
              >
                {loader ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Processing</span>
                  </div>
                ) : (
                  <>
                    <span>Send</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Code editor - Right side panel */}
        <div
          className={`${
            isExpanded ? "w-full" : "w-2/3"
          } h-full flex flex-col bg-gray-950 transition-all duration-300`}
        >
          {/* Tab selector */}
          <div className="bg-gray-900/70 px-4 py-2 flex items-center justify-between border-b border-gray-800">
            <div className="flex bg-gray-800/70 rounded-md p-1">
              <button
                onClick={() => setActive("code")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  active === "code"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1.5"
                  >
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                  Code
                </div>
              </button>
              <button
                onClick={() => setActive("preview")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  active === "preview"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1.5"
                  >
                    <rect
                      x="2"
                      y="3"
                      width="20"
                      height="14"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  Preview
                </div>
              </button>
            </div>

            {/* Expand/Collapse Editor Button */}
            <button
              onClick={toggleExpand}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-3 py-1.5 rounded-md flex items-center transition-all"
            >
              {isExpanded ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1.5"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="9" y1="4" x2="9" y2="20"></line>
                  </svg>
                  Show Chat
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1.5"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="15" y1="4" x2="15" y2="20"></line>
                  </svg>
                  Expand Editor
                </>
              )}
            </button>
          </div>

          {/* Sandpack editor */}
          <div className="flex-grow relative h-full overflow-hidden w-full">
            <SandpackProvider
              template="react"
              theme="dark"
              customSetup={{
                dependencies: { ...Lookup.DEPENDANCY },
              }}
              files={files}
              options={{
                externalResources: ["https://cdn.tailwindcss.com"],
              }}
            >
              <SandpackLayout className="!h-full">
                {active === "code" ? (
                  <div className="flex h-full w-full">
                    <div className="w-56 min-h-[100vh] overflow-y-auto border-r border-gray-800  custom-scrollbar">
                      <div className="p-2 border-b border-gray-800 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-300">
                          Files
                        </h3>
                      </div>
                      <div>
                        <SandpackFileExplorer />
                      </div>
                    </div>
                    <div className="flex-grow  overflow-hidden">
                      <SandpackCodeEditor
                        showLineNumbers={true}
                        wrapContent
                        className="h-full"
                        style={{
                          height: "100%",
                          minHeight: "100%", // Add this
                          maxHeight: "calc(100vh - 120px)", // Adjust this value based on your header/footer height
                          overflow: "auto", // Make sure overflow is set to auto
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-[100vh]">
                    <DeployAndDownload
                      files={files}
                      setDeployLink={setDeployLink}
                      setDeployStatus={setDeployStatus}
                      deployStatus={deployStatus}
                      setBuildStage={setDeployStage}
                      setProgressMessage={setDeployMessage}
                      
                    />
                  </div>
                )}
              </SandpackLayout>
            </SandpackProvider>
          </div>
        </div>
      </div>

      {/* Custom CSS to enhance scrolling */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e1e2e;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3a3a4a;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4a4a5a;
        }
      `}</style>
    </div>
  );
};

export default Gemini;
