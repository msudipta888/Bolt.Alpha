import React from 'react'
import ChatInterface from '../AiPage/Gemini';

export const Editor = () => {

  return (
    <div className='h-full w-full bg-transparent text-white relative'>
      <main className="mt-2 w-full h-full mr-[30px] flex">
        <ChatInterface />
      </main>
    </div>
  )
}


