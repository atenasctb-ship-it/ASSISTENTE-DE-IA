/**
 * Sends a notification message to a specified Telegram chat using the Telegram Bot API.
 * This service requires the Bot Token and Chat ID to be configured as environment variables.
 *
 * @param {string} botToken - The authentication token for the Telegram bot.
 * @param {string} chatId - The unique identifier for the target chat.
 * @param {string} message - The text message to be sent. Supports Markdown formatting.
 * @returns {Promise<void>} A promise that resolves when the message is sent.
 */
export const sendTelegramNotification = async (
    botToken: string,
    chatId: string,
    message: string
): Promise<void> => {
    // The Telegram Bot API endpoint for sending messages.
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        // Make a POST request to the Telegram API.
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                // Using Markdown for rich text formatting (e.g., bold, italics).
                parse_mode: 'Markdown',
            }),
        });

        // Parse the JSON response from the API.
        const data = await response.json();

        // Check if the request was successful.
        if (!data.ok) {
            // Log the error description provided by the Telegram API for debugging.
            console.error('Telegram API error:', data.description);
        } else {
            console.log('Telegram notification sent successfully.');
        }
    } catch (error) {
        // Catch network errors or other issues with the fetch request.
        console.error('Error sending Telegram notification:', error);
    }
};
