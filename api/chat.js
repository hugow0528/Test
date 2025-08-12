// File: /api/chat.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API Key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Vercel Edge functions are best for streaming
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' }});
  }
  
  try {
    const { message } = await req.json();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest",
      tools: [{ "googleSearch": {} }] // Enable Google Search
    });

    const result = await model.generateContentStream(message);

    // Create a new ReadableStream to send the response back
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of result.stream) {
          controller.enqueue(encoder.encode(chunk.text()));
        }
        controller.close();
      }
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" }});

  } catch (error) {
    console.error("Backend Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to get response from AI model.' }), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }
}