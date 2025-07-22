import { Message } from './socketUtils';

/**
 * Save messages to localStorage for a specific conversation
 * @param userId The ID of the other user in the conversation
 * @param messages The messages to save
 */
export const saveMessages = (userId: string, messages: Message[]): void => {
  try {
    localStorage.setItem(`messages_${userId}`, JSON.stringify(messages));
  } catch (e) {
    console.error('Error saving messages to localStorage:', e);
  }
};

/**
 * Load messages from localStorage for a specific conversation
 * @param userId The ID of the other user in the conversation
 * @returns The messages if found, empty array otherwise
 */
export const loadMessages = (userId: string): Message[] => {
  try {
    const cachedMessages = localStorage.getItem(`messages_${userId}`);
    if (cachedMessages) {
      return JSON.parse(cachedMessages);
    }
  } catch (e) {
    console.error('Error loading messages from localStorage:', e);
  }
  return [];
};

/**
 * Save selected user to localStorage
 * @param user The selected user object
 */
export const saveSelectedUser = (user: any): void => {
  if (user) {
    try {
      localStorage.setItem('selectedUser', JSON.stringify(user));
    } catch (e) {
      console.error('Error saving selected user to localStorage:', e);
    }
  }
};

/**
 * Load selected user from localStorage
 * @returns The selected user if found, null otherwise
 */
export const loadSelectedUser = (): any => {
  try {
    const savedSelectedUser = localStorage.getItem('selectedUser');
    if (savedSelectedUser) {
      return JSON.parse(savedSelectedUser);
    }
  } catch (e) {
    console.error('Error loading selected user from localStorage:', e);
  }
  return null;
};

/**
 * Clear sensitive data from localStorage
 */
export const clearSensitiveData = (): void => {
  // NOTA DE SEGURANÇA: 
  // As mensagens armazenadas no localStorage são acessíveis por qualquer código JavaScript 
  // executado na mesma origem. Se houver informações sensíveis, considere:
  // 1. Não armazenar mensagens sensíveis localmente
  // 2. Implementar criptografia antes de armazenar
  // 3. Limpar dados quando o usuário faz logout
  
  // Clear a selected user
  localStorage.removeItem('selectedUser');
};

/**
 * Clean up old messages to prevent localStorage from getting too large
 */
export const cleanupOldMessages = (): void => {
  // Keep only the last 100 messages for each conversation
  const MAX_MESSAGES_PER_CONVERSATION = 100;
  
  // Get all message keys
  const messageKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('messages_')) {
      messageKeys.push(key);
    }
  }
  
  // Clean up each conversation
  messageKeys.forEach(key => {
    try {
      const messages = JSON.parse(localStorage.getItem(key) || '[]');
      if (messages.length > MAX_MESSAGES_PER_CONVERSATION) {
        const trimmedMessages = messages.slice(-MAX_MESSAGES_PER_CONVERSATION);
        localStorage.setItem(key, JSON.stringify(trimmedMessages));
      }
    } catch (e) {
      console.error(`Error cleaning up messages for ${key}:`, e);
    }
  });
  
  // Check total localStorage size
  try {
    const totalSize = new Blob([JSON.stringify(localStorage)]).size;
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    
    if (totalSize > MAX_SIZE) {
      console.log('Cleaning localStorage due to excessive size');
      // Find and remove the oldest conversations
      if (messageKeys.length > 5) { // Keep at least 5 conversations
        // Sort by date of last access (could be implemented with timestamps)
        messageKeys.slice(0, messageKeys.length - 5).forEach(key => {
          localStorage.removeItem(key);
        });
      }
    }
  } catch (e) {
    console.error('Error checking localStorage size:', e);
  }
};