import axios from 'axios';
import Cookies from 'js-cookie';
import { Socket } from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';

interface UserDefault {
  name: string;
  email: string;
  online?: boolean;
}

export interface User extends UserDefault{
  _id: string;
}
export interface UserWithinList extends User {
  id: string;
}

/**
 * Login a user with email and password
 * @param email User's email
 * @param password User's password
 * @returns The user object if login is successful
 * @throws Error if login fails
 */
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const res = await axios.post(`${API_URL}/users/login`, { email, password });
    const user = res.data.user;
    
    // Store user in cookie
    Cookies.set('user', JSON.stringify(user));
    
    return user;
  } catch (err) {
    console.error('Login error:', err);
    throw new Error('Invalid credentials');
  }
};

/**
 * Register a new user
 * @param name User's name
 * @param email User's email
 * @param password User's password
 * @returns Success message if registration is successful
 * @throws Error if registration fails
 */
export const register = async (name: string, email: string, password: string): Promise<string> => {
  try {
    const res = await axios.post(`${API_URL}/users/register`, { name, email, password });
    return res.data.message || 'Registration successful';
  } catch (err) {
    console.error('Registration error:', err);
    throw new Error('Failed to register');
  }
};

/**
 * Logout the current user
 * @param socket The socket connection to notify the server
 * @param userId The user's ID
 */
export const logout = (socket: Socket | null, userId: string | undefined): void => {
  // Clear user data from cookie
  Cookies.remove('user');
  
  // Clear selected user from localStorage
  localStorage.removeItem('selectedUser');
  
  // Notify server that user is offline
  if (socket && userId && socket.connected) {
    socket.emit('user offline', userId);
  }
};

/**
 * Get the current user from cookie
 * @returns The user object if found, null otherwise
 */
export const getCurrentUser = (): User | null => {
  const userCookie = Cookies.get('user');
  if (userCookie) {
    try {
      return JSON.parse(userCookie);
    } catch (e) {
      console.error('Error parsing user cookie:', e);
      return null;
    }
  }
  return null;
};