import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import { NextRequest, NextResponse } from "next/server";
config();
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY2 as string
const genAI = new GoogleGenerativeAI(apiKey);

const chatHistory = new Map()

export async function POST(req:NextRequest) {
  const { prompt,sessionId } = await req.json();
  console.log('session:',sessionId); 
console.log(prompt)
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const generationConfig = {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 800,
      responseMimeType: "text/plain",
    };

  
    let chatsession;
    if(chatHistory.has(sessionId)){
      console.log('already have in history')
      chatsession = chatHistory.get(sessionId)
    }else{
      console.log('creating new code')

      chatsession =  model.startChat({
        generationConfig:generationConfig,
        history:[]
      })
     
      chatHistory.set(sessionId,chatsession)
    }
   
    const aiResponse = await chatsession.sendMessage(prompt);
    const responseText =  await aiResponse.response.text();
   // aiResponse.choices[0].message.content
    console.log('response:',responseText);
    return NextResponse.json({ result: JSON.stringify(responseText) });
  } catch (error) {
    return NextResponse.json(error);
  }
}

