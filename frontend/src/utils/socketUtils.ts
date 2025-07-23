import { useEffect, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { User } from './authUtils';

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

export interface Message {
  id: string;
  from: string;
  to: string;
  message: string;
  timestamp: string;
  pending?: boolean;
  delivered?: boolean;
  failed?: boolean;
  timeout?: boolean;
}

/**
 * Initialize a socket connection to the server
 * @returns The socket instance
 */
export const initializeSocket = (): Socket => {
  return io('http://localhost:5000', {
    // Align with server settings
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    // Try websocket first, fallback to polling
    transports: ['websocket', 'polling'],
    // Automatically try to reconnect if connection is lost
    autoConnect: true,
    // Add randomization to prevent all clients reconnecting simultaneously
    randomizationFactor: 0.5
  });
};

/**
 * Setup socket event listeners for connection status
 * @param socket The socket instance
 * @param setConnectionStatus Function to update connection status
 */
export const setupConnectionListeners = (
  socket: Socket,
  setConnectionStatus: (status: ConnectionStatus) => void
): void => {
  socket.on('connect', () => {
    console.log(`Connected to server (socket ID: ${socket.id})`);
    setConnectionStatus('connected');
  });

  socket.on('disconnect', (reason) => {
    console.log(`Disconnected: ${reason} (socket ID: ${socket.id})`);
    setConnectionStatus('disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    setConnectionStatus('disconnected');
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`Reconnection attempt #${attemptNumber}`);
    setConnectionStatus('connecting');
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`Reconnected after ${attemptNumber} attempts`);
    setConnectionStatus('connected');
  });

  socket.on('reconnect_error', (error) => {
    console.error('Reconnection error:', error);
  });

  socket.on('reconnect_failed', () => {
    console.error('Failed to reconnect after all attempts');
    // Show a user-friendly message or trigger manual reconnection option
    alert('Connection to chat server lost. Please refresh the page to reconnect.');
  });

  socket.on('error', (error: any) => {
    console.error('Server error:', error);
    // Display error message to user if appropriate
    if (error.message) {
      console.warn(`Server message: ${error.message}`);
    }
  });
};

/**
 * Setup a ping interval to keep the connection alive
 * @param socket The socket instance
 * @returns A cleanup function to clear the interval
 */
export const setupPingInterval = (socket: Socket): () => void => {
  const pingInterval = setInterval(() => {
    if (socket.connected) {
      socket.emit('ping', (response: any) => {
        if (response && response.status === 'success') {
          console.log('Ping successful:', response.timestamp);
        }
      });
    }
  }, 30000); // Send ping every 30 seconds

  return () => clearInterval(pingInterval);
};

/**
 * Send a message to another user
 * @param socket The socket instance
 * @param message The message to send
 * @param from The sender's ID
 * @param to The recipient's ID
 * @param setMessages Function to update messages state
 * @returns A cleanup function to clear the timeout
 */
export const sendMessage = (
  socket: Socket,
  message: string,
  from: string,
  to: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
): (() => void) => {
  if (!socket || !message || !from || !to || !socket.connected) {
    return () => {};
  }

  const msg: Message = {
    from,
    to,
    message,
    timestamp: new Date().toISOString(),
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Generate unique message ID
  };

  // Add message to UI immediately with pending status
  const pendingMsg = { ...msg, pending: true };
  //setMessages(prevMessages => [...prevMessages, pendingMsg]);

  // Send with acknowledgment
  socket.emit('chat message', msg, (response: any) => {
    if (response && response.status === 'success') {
      // Update message status to delivered
      setMessages(prevMessages =>
        prevMessages.map(m =>
          m.id === msg.id ? { ...m, pending: false, delivered: true } : m
        )
      );
      console.log('Message delivered successfully:', response.timestamp);
    } else {
      // Handle failed delivery
      console.error('Message delivery failed:', response?.message || 'Unknown error');

      // Update message status to failed
      setMessages(prevMessages =>
        prevMessages.map(m =>
          m.id === msg.id ? { ...m, pending: false, failed: true } : m
        )
      );

      // Optionally show error to user
      alert('Failed to deliver message. Please try again.');
    }
  });

  // Set timeout for acknowledgment
  const ackTimeout = setTimeout(() => {
    // Check if message is still pending after timeout
    setMessages(prevMessages => {
      const msgStillPending = prevMessages.find(m => m.id === msg.id && m.pending);

      if (msgStillPending) {
        // Update UI to show timeout
        return prevMessages.map(m =>
          m.id === msg.id ? { ...m, pending: false, timeout: true } : m
        );
      }
      return prevMessages;
    });
  }, 5000); // 5 second timeout

  // Clean up timeout on component unmount
  return () => clearTimeout(ackTimeout);
};

/**
 * Set user online status
 * @param socket The socket instance
 * @param userId The user's ID
 * @param online Whether the user is online or offline
 */
export const setUserOnlineStatus = (
  socket: Socket | null,
  userId: string,
  online: boolean
): void => {
  if (!socket || !userId || !socket.connected) return;

  socket.emit(online ? 'user online' : 'user offline', userId);
};