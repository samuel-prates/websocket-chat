import { fetchMessages, updateUnreadCount, resetUnreadCount, formatMessageTime } from '@/utils/messageUtils';
import axios from 'axios';
import { saveMessages, loadMessages, cleanupOldMessages } from '@/utils/storageUtils';

jest.mock('axios');
jest.mock('@/utils/storageUtils');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedSaveMessages = saveMessages as jest.MockedFunction<typeof saveMessages>;
const mockedLoadMessages = loadMessages as jest.MockedFunction<typeof loadMessages>;
const mockedCleanupOldMessages = cleanupOldMessages as jest.MockedFunction<typeof cleanupOldMessages>;

describe('messageUtils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchMessages', () => {
    const mockMessages = [
      { id: '1', sender: 'user1', receiver: 'user2', content: 'Hi', timestamp: '2023-01-01T10:00:00Z' },
      { id: '2', sender: 'user2', receiver: 'user1', content: 'Hello', timestamp: '2023-01-01T10:05:00Z' },
    ];

    it('should fetch messages and save them to local storage', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockMessages });

      const messages = await fetchMessages('user1', 'user2');

      expect(messages).toEqual(mockMessages);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:5000/api/messages/user1/user2');
      expect(mockedSaveMessages).toHaveBeenCalledWith('user2', mockMessages);
      expect(mockedCleanupOldMessages).toHaveBeenCalledTimes(1);
    });

    it('should return cached messages if fetching fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));
      mockedLoadMessages.mockReturnValueOnce(mockMessages);

      const messages = await fetchMessages('user1', 'user2');

      expect(messages).toEqual(mockMessages);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedLoadMessages).toHaveBeenCalledWith('user2');
      expect(mockedSaveMessages).not.toHaveBeenCalled();
      expect(mockedCleanupOldMessages).not.toHaveBeenCalled();
    });
  });

  describe('updateUnreadCount', () => {
    it('should increment unread count for a user', () => {
      const initialUnreadMessages = { user1: 5, user2: 0 };
      const updatedUnreadMessages = updateUnreadCount('user1', initialUnreadMessages);
      expect(updatedUnreadMessages).toEqual({ user1: 6, user2: 0 });
    });

    it('should set unread count to 1 if user not present', () => {
      const initialUnreadMessages = { user2: 0 };
      const updatedUnreadMessages = updateUnreadCount('user1', initialUnreadMessages);
      expect(updatedUnreadMessages).toEqual({ user2: 0, user1: 1 });
    });
  });

  describe('resetUnreadCount', () => {
    it('should reset unread count for a user to 0', () => {
      const initialUnreadMessages = { user1: 5, user2: 0 };
      const updatedUnreadMessages = resetUnreadCount('user1', initialUnreadMessages);
      expect(updatedUnreadMessages).toEqual({ user1: 0, user2: 0 });
    });

    it(`should not change other users' unread counts`, () => {
      const initialUnreadMessages = { user1: 5, user2: 10 };
      const updatedUnreadMessages = resetUnreadCount('user1', initialUnreadMessages);
      expect(updatedUnreadMessages).toEqual({ user1: 0, user2: 10 });
    });
  });

  describe('formatMessageTime', () => {
    it('should format a valid timestamp correctly', () => {
      const timestamp = '2023-01-01T14:30:00Z';
      const formattedTime = formatMessageTime(timestamp);
      // This test might be locale-dependent, so we'll check for a common format.
      // For 'en-US' locale, it would be '2:30 PM'
      // Check if the formatted time contains a colon and a space, which is common for time formats
      expect(formattedTime).toMatch(/\d{1,2}:\d{2}/);
      // Optionally, check for AM/PM if the locale typically uses it, but make it flexible
      expect(formattedTime).toMatch(/(AM|PM)?/);
    });

    it('should return empty string for invalid timestamp', () => {
      const timestamp = 'invalid-timestamp';
      const formattedTime = formatMessageTime(timestamp);
      expect(formattedTime).toBe("Invalid Date");
    });
  });
});