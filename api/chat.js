// This is a Vercel Serverless Function
// It acts as a secure proxy to the Gemini API.

export default async function handler(request, response) {
    // Only allow POST requests
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Method Not Allowed' });
    }

    // Read the API Key from environment variables for security
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return response.status(500).json({ error: 'API key is not configured on the server.' });
    }

    const { message } = request.body;
    if (!message) {
        return response.status(400).json({ error: 'No message provided in the request.' });
    }

    const MODEL_NAME = 'gemini-2.5-flash';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    const requestBody = {
        contents: [{
            parts: [{
                text: message
            }]
        }]
    };

    try {
        const geminiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        // Forward the original response (success or error) from Gemini back to the frontend
        const data = await geminiResponse.json();
        response.status(geminiResponse.status).json(data);

    } catch (error) {
        console.error('Error proxying to Gemini API:', error);
        response.status(500).json({ error: 'Failed to connect to the Gemini API.' });
    }
}
