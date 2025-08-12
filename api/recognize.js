// File: /api/recognize.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API Key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function base64ToGenerativePart(imageBase64, mimeType) {
  // Remove the data URI prefix (e.g., "data:image/jpeg;base64,")
  const pureBase64 = imageBase64.split(',')[1];
  return {
    inlineData: {
      data: pureBase64,
      mimeType,
    },
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided.' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    // Extract MIME type from the base64 string
    const mimeType = imageBase64.match(/data:(image\/[a-zA-Z]+);base64,/)[1];
    
    const imagePart = base64ToGenerativePart(imageBase64, mimeType);
    const prompt = "這是一張含有手寫文字的圖片。請精確地辨識並提取圖片中的所有繁體中文字。請只回傳辨識出的文字內容，不要添加任何解釋、標題或額外的格式。";

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    return res.status(200).json({ text: text });

  } catch (error) {
    console.error("Image Recognition Backend Error:", error);
    return res.status(500).json({ error: 'Failed to process the image.' });
  }
}