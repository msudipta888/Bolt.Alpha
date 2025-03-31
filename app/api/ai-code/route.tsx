import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import { NextRequest, NextResponse } from "next/server";
config();

const apiKey = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);
const codeHistory = new Map();

export async function POST(req: NextRequest) {
  const { prompt, sessionId } = await req.json();
  console.log('session:',sessionId);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const generationConfig = {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 6102,
      responseMimeType: "application/json",
    };
let newSession;
 
   
      if (codeHistory.has(sessionId)) {
        console.log('already have in history')
         newSession = codeHistory.get(sessionId)  
      console.log("History reset for session:", sessionId);
    } else if (!codeHistory.has(sessionId)) {
      console.log('creating new code')
       newSession = model.startChat({
        generationConfig: generationConfig,
        history: []
      });
      
      codeHistory.set(sessionId, newSession);
    }
    
    // Get the current session
    const codeSession = codeHistory.get(sessionId);
    
    // Build the prompt
    let fullPrompt = "";
    for (const mes of prompt) {
      fullPrompt += `${mes.role}: ${mes.content}\n\n`;
    }
    
    // Send message and get response
    const aiResponse = await codeSession.sendMessage(fullPrompt);
    const responseCode = aiResponse.response.text();
    
    return NextResponse.json({ result: JSON.parse(responseCode) });
  } catch (error) {
    return NextResponse.json({ error: error || "An error occurred" }, { status: 500 });
  }
}
