import { ChatSession } from '../types';

const ANALYTICS_STORAGE_KEY = 'atxContadoresAnalytics';

/**
 * Retrieves all saved chat sessions from localStorage.
 * @returns {ChatSession[]} An array of chat sessions, or an empty array if none are found.
 */
export const getChatSessions = (): ChatSession[] => {
    try {
        const storedData = localStorage.getItem(ANALYTICS_STORAGE_KEY);
        if (storedData) {
            return JSON.parse(storedData) as ChatSession[];
        }
    } catch (error) {
        console.error("Failed to parse analytics data from localStorage:", error);
    }
    return [];
};

/**
 * Saves a new chat session to localStorage.
 * It retrieves the existing sessions, adds the new one, and saves the updated array.
 * @param {ChatSession} newSession - The chat session object to save.
 */
export const saveChatSession = (newSession: ChatSession): void => {
    try {
        const existingSessions = getChatSessions();
        const updatedSessions = [...existingSessions, newSession];
        localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
        console.error("Failed to save analytics data to localStorage:", error);
    }
};