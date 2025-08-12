// File: /api/chat.js
// This is a Vercel Serverless Function that acts as a secure proxy to the Gemini API.

export default async function handler(request, response) {
    // 1. Validate the request method
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed. Please use POST.' });
    }

    // 2. Securely get the API Key from environment variables
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        console.error("GEMINI_API_KEY not found in environment variables.");
        return response.status(500).json({ error: 'API key is not configured on the server.' });
    }

    // 3. Get the user's message from the request body
    const { message } = request.body;
    if (!message) {
        return response.status(400).json({ error: 'No message provided in the request body.' });
    }

    // 4. Prepare the request to the official Gemini API
    const MODEL_NAME = 'gemini-1.5-flash-latest';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    const requestBody = {
        contents: [{
            parts: [{ text: message }]
        }],
        // Optional: Add safety settings if needed
        // safetySettings: [
        //   { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
        // ]
    };

    // 5. Call the Gemini API and handle the response
    try {
        const geminiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        const data = await geminiResponse.json();

        // Forward the original status code and response from Gemini back to our frontend
        // This allows the frontend to handle specific API errors like safety blocks
        response.status(geminiResponse.status).json(data);

    } catch (error) {
        console.error('Error proxying to Gemini API:', error);
        response.status(500).json({ error: 'An internal error occurred while trying to connect to the Gemini API.' });
    }
}