import { SandpackPreview } from "@codesandbox/sandpack-react";
import axios from "axios";
import React, { useState } from "react";
import {Rotate3DIcon} from 'lucide-react'
const DeployAndDownload = ({ files,setDeployStatus, deployStatus}) => {
  
 const [isDownload,setIsDownload] = useState(false)

  const handleDeploy = async () => {
    try {
      setDeployStatus("active");
    //   setBuildStage("initialization");
    //   setProgressMessage("Starting deployment process...");
    //  setDeployLink(null);
      

      const response = await axios.post("/api/deploy", {
        files, 
      });

      const { url, stage, message, status } = response.data;
      // setDeployLink(url);
      // setDeployStatus(status || "success");
      // setProgressMessage(message || "Deployment completed successfully");
      // setBuildStage(stage || "success");
      console.log("link:", url);
      console.log("status:", status);
    } catch (error) {
      console.error("Deployment error:", error);
      setDeployStatus("error");
      setProgressMessage(error.response?.data?.error || "Deployment failed");
    }
  };

  const handleDownload = async () => {
    setIsDownload(true)
    try {
      const response = await axios.post("/api/download", { files }, {
       responseType:"blob" // This is important to handle binary data
      });
      
     const blob = new Blob([response.data],{type:"application/zip"});
     
      const url = window.URL.createObjectURL(blob);
      
     
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute("download","bolt_alpha.zip");
      
       document.body.appendChild(link);
       link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      setIsDownload(false)
    } catch (error) {
      console.error('Download failed:', error);
    }
  };
  
  return (
    <div className="h-full z-50 flex flex-col overflow-auto">
      {/* Preview header with actions */}
      <div className="bg-gray-900/60 border-b border-gray-800 p-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-blue-500/20 p-1.5 rounded-md mr-2">
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
              className="text-blue-400"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="10 8 16 12 10 16 10 8"></polygon>
            </svg>
          </div>
          <span className="text-gray-300 font-medium text-sm">
            Live Preview
          </span>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-md transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span className="flex gap-2">Download {isDownload && <Rotate3DIcon className="animate-spin bg-sky-500" size={18}/>}</span>
          </button>

          <button
            onClick={handleDeploy}
            disabled={deployStatus === "active"}
            className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-md transition-all ${
              deployStatus === "active"
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {deployStatus === "active" ? (
              <>
                <svg
                  className="animate-spin h-3 w-3 text-gray-400"
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
                <span>Deploying...</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                </svg>
                <span>Deploy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-grow relative">
        <SandpackPreview
          style={{ width: "100%", height: "100%", overflowY: "auto" }}
        />
      </div>
    </div>
  );
};

export default DeployAndDownload;
