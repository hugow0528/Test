document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('userInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatMessages = document.querySelector('.chat-messages');

    // --- Event Listeners ---
    sendMessageBtn.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    });

    /**
     * Handles sending the user's message, displaying it, and fetching the AI response.
     */
    async function handleSendMessage() {
        const messageText = userInput.value.trim();
        if (messageText === '') return;

        displayMessage(messageText, 'user');
        userInput.value = '';
        userInput.focus();

        // Add a "typing" indicator for the AI
        displayTypingIndicator();

        try {
            const aiResponse = await callGeminiAPI(messageText);
            removeTypingIndicator(); // Remove indicator before showing response
            displayMessage(aiResponse, 'ai');
        } catch (error) {
            removeTypingIndicator(); // Remove indicator on error
            displayMessage('Sorry, something went wrong. Please try again.', 'ai');
        }
    }

    /**
     * Displays a message in the chat window.
     * @param {string} text - The message content.
     * @param {string} sender - 'user' or 'ai'.
     */
    function displayMessage(text, sender) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message-container');
        
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        messageElement.appendChild(paragraph);
        
        messageContainer.appendChild(messageElement);
        chatMessages.appendChild(messageContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    /**
     * Displays a temporary "typing..." message for the AI.
     */
    function displayTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message-container', 'typing-indicator');
        typingIndicator.innerHTML = `
            <div class="message ai-message">
                <p><i>AI is typing...</i></p>
            </div>
        `;
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Removes the "typing..." indicator.
     */
    function removeTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Calls the Google Gemini API to get a response.
     * @param {string} prompt - The user's input to send to the AI.
     * @returns {Promise<string>} - The AI's text response.
     */
    async function callGeminiAPI(prompt) {
        // !!! IMPORTANT: Replace with your actual API key !!!
        // For production, this key should be stored securely on a backend server.
        const apiKey = "AIzaSyDEKDzazfgVl3dcUJrhrtX7N9ce4OGhFq4";
        const model = "gemini-2.5-flash";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            // Extract the text from the API response. [2]
            const aiText = data.candidates[0].content.parts[0].text;
            return aiText;
            
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            // Re-throw the error to be handled by the caller
            throw error;
        }
    }
});