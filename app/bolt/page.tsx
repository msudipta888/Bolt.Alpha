"use client";

import ChatInterface from "../AiPage/Gemini";

export default function BoltPage() {
    return <div className='h-full w-full bg-transparent text-white relative'>
        <main className="mt-2 w-full h-full mr-[30px]">
            <ChatInterface />
        </main>
    </div>;
}
