import { saveMessages, loadMessages, saveSelectedUser, loadSelectedUser, clearSensitiveData, cleanupOldMessages } from '../storageUtils';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    // Add toJSON for JSON.stringify(localStorage)
    toJSON: () => store,
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('storageUtils', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('saveMessages', () => {
    it('should save messages to localStorage', () => {
      const userId = 'user123';
      const messages = [{ id: '1', text: 'Hello', sender: 'user123', timestamp: Date.now() }];
      saveMessages(userId, messages as any);
      expect(localStorage.setItem).toHaveBeenCalledWith(`messages_${userId}`, JSON.stringify(messages));
      expect(localStorage.getItem(`messages_${userId}`)).toEqual(JSON.stringify(messages));
    });

    it('should handle errors when saving messages', () => {
      const userId = 'user123';
      const messages = [{ id: '1', text: 'Hello', sender: 'user123', timestamp: Date.now() }];
      // @ts-ignore
      localStorage.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      saveMessages(userId, messages as any);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving messages to localStorage:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadMessages', () => {
    it('should load messages from localStorage', () => {
      const userId = 'user123';
      const messages = [{ id: '1', text: 'Hello', sender: 'user123', timestamp: Date.now() }];
      localStorage.setItem(`messages_${userId}`, JSON.stringify(messages));
      const loadedMessages = loadMessages(userId);
      expect(localStorage.getItem).toHaveBeenCalledWith(`messages_${userId}`);
      expect(loadedMessages).toEqual(messages);
    });

    it('should return an empty array if no messages are found', () => {
      const userId = 'user123';
      const loadedMessages = loadMessages(userId);
      expect(loadedMessages).toEqual([]);
    });

    it('should handle errors when loading messages', () => {
      const userId = 'user123';
      // @ts-ignore
      localStorage.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const loadedMessages = loadMessages(userId);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading messages from localStorage:', expect.any(Error));
      expect(loadedMessages).toEqual([]);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('saveSelectedUser', () => {
    it('should save the selected user to localStorage', () => {
      const user = { id: 'user456', name: 'John Doe' };
      saveSelectedUser(user);
      expect(localStorage.setItem).toHaveBeenCalledWith('selectedUser', JSON.stringify(user));
      expect(localStorage.getItem('selectedUser')).toEqual(JSON.stringify(user));
    });

    it('should not save if user is null or undefined', () => {
      saveSelectedUser(null);
      expect(localStorage.setItem).not.toHaveBeenCalledWith('selectedUser', JSON.stringify(null));
      expect(localStorage.getItem('selectedUser')).toBeNull();

      saveSelectedUser(undefined);
      expect(localStorage.setItem).not.toHaveBeenCalledWith('selectedUser', JSON.stringify(undefined));
      expect(localStorage.getItem('selectedUser')).toBeNull();
    });

    it('should handle errors when saving selected user', () => {
      const user = { id: 'user456', name: 'John Doe' };
      // @ts-ignore
      localStorage.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      saveSelectedUser(user);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving selected user to localStorage:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadSelectedUser', () => {
    it('should load the selected user from localStorage', () => {
      const user = { id: 'user456', name: 'John Doe' };
      localStorage.setItem('selectedUser', JSON.stringify(user));
      const loadedUser = loadSelectedUser();
      expect(localStorage.getItem).toHaveBeenCalledWith('selectedUser');
      expect(loadedUser).toEqual(user);
    });

    it('should return null if no selected user is found', () => {
      const loadedUser = loadSelectedUser();
      expect(loadedUser).toBeNull();
    });

    it('should handle errors when loading selected user', () => {
      // @ts-ignore
      localStorage.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const loadedUser = loadSelectedUser();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading selected user from localStorage:', expect.any(Error));
      expect(loadedUser).toBeNull();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearSensitiveData', () => {
    it('should clear selected user from localStorage', () => {
      localStorage.setItem('selectedUser', JSON.stringify({ id: 'user456', name: 'John Doe' }));
      clearSensitiveData();
      expect(localStorage.removeItem).toHaveBeenCalledWith('selectedUser');
      expect(localStorage.getItem('selectedUser')).toBeNull();
    });
  });

  describe('cleanupOldMessages', () => {
    it('should keep only the last 100 messages for each conversation', () => {
      const userId = 'user123';
      const messages = Array.from({ length: 150 }, (_, i) => ({ id: `${i}`, text: `Message ${i}`, sender: 'user123', timestamp: Date.now() }));
      localStorage.setItem(`messages_${userId}`, JSON.stringify(messages));

      cleanupOldMessages();

      const storedMessages = JSON.parse(localStorage.getItem(`messages_${userId}`) || '[]');
      expect(storedMessages.length).toBe(100);
      expect(storedMessages[0].id).toBe('50');
      expect(storedMessages[99].id).toBe('149');
    });

    it('should not modify conversations with 100 or fewer messages', () => {
      const userId = 'user123';
      const messages = Array.from({ length: 50 }, (_, i) => ({ id: `${i}`, text: `Message ${i}`, sender: 'user123', timestamp: Date.now() }));
      localStorage.setItem(`messages_${userId}`, JSON.stringify(messages));

      cleanupOldMessages();

      const storedMessages = JSON.parse(localStorage.getItem(`messages_${userId}`) || '[]');
      expect(storedMessages.length).toBe(50);
    });

    it('should handle errors during message cleanup', () => {
      const userId = 'user123';
      const messages = Array.from({ length: 150 }, (_, i) => ({ id: `${i}`, text: `Message ${i}`, sender: 'user123', timestamp: Date.now() }));
      localStorage.setItem(`messages_${userId}`, JSON.stringify(messages));

      // @ts-ignore
      localStorage.getItem.mockImplementationOnce((key: string) => {
        if (key.startsWith('messages_')) {
          throw new Error('localStorage error during cleanup');
        }
        return null;
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      cleanupOldMessages();

      expect(consoleErrorSpy).toHaveBeenCalledWith(`Error cleaning up messages for messages_${userId}:`, expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('should log a message when localStorage size is excessive and attempt to clean up oldest conversations', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock localStorage to simulate large size
      const largeMessage = 'a'.repeat(1024 * 1024); // 1MB
      for (let i = 0; i < 10; i++) {
        localStorage.setItem(`messages_user${i}`, JSON.stringify([largeMessage]));
      }

      cleanupOldMessages();

      expect(consoleLogSpy).toHaveBeenCalledWith('Cleaning localStorage due to excessive size');
      // Expecting 5 oldest conversations to be removed (messages_user0 to messages_user4)
      for (let i = 0; i < 5; i++) {
        expect(localStorage.removeItem).toHaveBeenCalledWith(`messages_user${i}`);
        expect(localStorage.getItem(`messages_user${i}`)).toBeNull();
      }
      for (let i = 5; i < 10; i++) {
        expect(localStorage.getItem(`messages_user${i}`)).not.toBeNull();
      }

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle errors when checking localStorage size', () => {
      jest.spyOn(global, 'Blob').mockImplementation(() => {
        throw new Error('Blob error');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      cleanupOldMessages();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error checking localStorage size:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });
});
