import { SandpackPreview } from "@codesandbox/sandpack-react";
import axios from "axios";
import React, { useState } from "react";
import {Rotate3DIcon} from 'lucide-react'
const DeployAndDownload = ({ files}) => {
  
 const [isDownload,setIsDownload] = useState(false)


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
        </div>
      </div>
     <div>
      <SandpackPreview 
      showNavigator={true}
      showRefreshButton={true}
      className="w-full h-[100vh] border-none"
      />
     </div>
    </div>
  );
};

export default DeployAndDownload;
