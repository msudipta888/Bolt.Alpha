"use client"
import axios from "axios";
import { Loader, Zap } from "lucide-react";
import { useState } from "react";

export const VersionCard = ({ messageId, setFiles }: { messageId: string, setFiles: (files: Record<string, { code: string }>) => void }) => {
    const [loading, setLoading] = useState(false);

    const handleLoadVersion = async () => {
        setLoading(true);
        try {
            console.log('messageId:', messageId)
            const res = await axios.get(`/api/get-files/${messageId}`);
            if (res.data.files) {
                setFiles(res.data.files);
            }
        } catch (error) {
            console.error("Failed to load version:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            onClick={handleLoadVersion}
            className="mt-4 group relative cursor-pointer"
        >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center justify-between p-4 bg-gray-900/80 backdrop-blur-xl rounded-xl border border-white/10 leading-none">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-white/5">
                        <Zap size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white tracking-tight">Modern UI Redesign</h4>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Version 1.0 • Snapshot</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    {loading ? (
                        <Loader size={16} className="animate-spin text-blue-400" />
                    ) : (
                        <div className="flex items-center space-x-2 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                            </span>
                            <span className="text-[9px] text-green-400 font-bold uppercase tracking-tighter">Ready</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
