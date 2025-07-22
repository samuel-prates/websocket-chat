import { login, register, logout, getCurrentUser } from '@/utils/authUtils';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Socket } from 'socket.io-client';

jest.mock('axios');
jest.mock('js-cookie');

Object.defineProperty(window, 'localStorage', {
  value: {
    removeItem: jest.fn(),
  },
  writable: true,
});

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedCookies = Cookies as jest.Mocked<typeof Cookies>;

describe('authUtils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully log in a user and set cookie', async () => {
      const mockUser = { _id: '123', name: 'Test User', username: 'testuser' };
      mockedAxios.post.mockResolvedValueOnce({ data: { user: mockUser } });

      const user = await login('testuser', 'password');

      expect(user).toEqual(mockUser);
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:5000/api/users/login', {
        username: 'testuser',
        password: 'password',
      });
      expect(mockedCookies.set).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    it('should throw an error for invalid credentials', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

      await expect(login('wronguser', 'wrongpass')).rejects.toThrow('Invalid credentials');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedCookies.set).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Registration successful' } });

      const message = await register('New User', 'newuser', 'newpassword');

      expect(message).toBe('Registration successful');
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:5000/api/users/register', {
        name: 'New User',
        username: 'newuser',
        password: 'newpassword',
      });
    });

    it('should throw an error if registration fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

      await expect(register('Fail User', 'failuser', 'failpass')).rejects.toThrow('Failed to register');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout', () => {
    it('should clear cookies and local storage, and emit user offline event', () => {
      const mockSocket = { connected: true, emit: jest.fn() } as unknown as Socket;
      const userId = '123';

      logout(mockSocket, userId);

      expect(mockedCookies.remove).toHaveBeenCalledWith('user');
      expect(localStorage.removeItem).toHaveBeenCalledWith('selectedUser');
      expect(mockSocket.emit).toHaveBeenCalledWith('user offline', userId);
    });

    it('should not emit user offline if socket is null or not connected', () => {
      const mockSocket = { connected: false, emit: jest.fn() } as unknown as Socket;
      const userId = '123';

      logout(null, userId);
      logout(mockSocket, userId);

      expect(mockedCookies.remove).toHaveBeenCalledWith('user');
      expect(localStorage.removeItem).toHaveBeenCalledWith('selectedUser');
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return the user object from cookie if found', () => {
      const mockUser = { _id: '123', name: 'Test User', username: 'testuser' };
      mockedCookies.get.mockReturnValueOnce(JSON.stringify(mockUser));

      const user = getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(mockedCookies.get).toHaveBeenCalledWith('user');
    });

    it('should return null if user cookie is not found', () => {
      mockedCookies.get.mockReturnValueOnce(undefined);

      const user = getCurrentUser();

      expect(user).toBeNull();
      expect(mockedCookies.get).toHaveBeenCalledWith('user');
    });

    it('should return null if user cookie is invalid JSON', () => {
      mockedCookies.get.mockReturnValueOnce('{invalid json');

      const user = getCurrentUser();

      expect(user).toBeNull();
      expect(mockedCookies.get).toHaveBeenCalledWith('user');
    });
  });
});