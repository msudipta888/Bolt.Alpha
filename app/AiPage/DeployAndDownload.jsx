import axios from "axios";
import React, { useState } from "react";
import { Rotate3DIcon } from "lucide-react";
import { GlowingButton } from "@/components/ui/GlowingButon";

const DeployAndDownload = ({ files } ) => {
  const [isDownload, setIsDownload] = useState(false);

  const handleDownload = async () => {
    setIsDownload(true);
    try {
      const response = await axios.post(
        "/api/download",
        { files },
        {
          responseType: "blob", // Handle binary data
        }
      );
      const blob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "bolt_alpha.zip");

      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownload(false);
    }
  };

  return (
    <div className="absolute top-4 right-5 z-10 ">
      <GlowingButton
        onClick={handleDownload}
        className="flex items-center space-x-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-md transition-all"
      >
        <div className="flex gap-x-2">
        <span className="flex gap-2">
          Download{" "}
          {isDownload && (
            <Rotate3DIcon className="animate-spin text-sky-500" size={18} />
          )}
        </span>
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
       
        </div>
      </GlowingButton>
    </div>
  );
};

export default DeployAndDownload;
