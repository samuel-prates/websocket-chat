import axios from 'axios';
import { Message } from './socketUtils';
import { saveMessages, loadMessages, cleanupOldMessages } from './storageUtils';

const API_URL = 'http://localhost:5000/api';

/**
 * Fetch messages between two users
 * @param currentUserId The current user's ID
 * @param otherUserId The other user's ID
 * @returns Promise that resolves to an array of messages
 */
export const fetchMessages = async (
  currentUserId: string,
  otherUserId: string
): Promise<Message[]> => {
  try {
    const response = await axios.get(`${API_URL}/messages/${currentUserId}/${otherUserId}`);
    const messages = response.data;
    
    // Save messages to localStorage
    saveMessages(otherUserId, messages);
    
    // Clean up old messages
    cleanupOldMessages();
    
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    
    // Return cached messages if available
    return loadMessages(otherUserId);
  }
};

/**
 * Update unread message count for a user
 * @param userId The user's ID
 * @param unreadMessages The current unread messages state
 * @returns Updated unread messages state
 */
export const updateUnreadCount = (
  userId: string,
  unreadMessages: { [key: string]: number }
): { [key: string]: number } => {
  return {
    ...unreadMessages,
    [userId]: (unreadMessages[userId] || 0) + 1
  };
};

/**
 * Reset unread message count for a user
 * @param userId The user's ID
 * @param unreadMessages The current unread messages state
 * @returns Updated unread messages state
 */
export const resetUnreadCount = (
  userId: string,
  unreadMessages: { [key: string]: number }
): { [key: string]: number } => {
  return {
    ...unreadMessages,
    [userId]: 0
  };
};

/**
 * Format message timestamp for display
 * @param timestamp ISO timestamp string
 * @returns Formatted timestamp string
 */
export const formatMessageTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    console.error('Error formatting timestamp:', e);
    return '';
  }
};