"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Socket } from 'socket.io-client';

// Import utility functions
import {User, getCurrentUser, logout, UserWithinList} from '../utils/authUtils';
import { 
  Message, 
  ConnectionStatus, 
  initializeSocket, 
  setupConnectionListeners, 
  setupPingInterval,
  setUserOnlineStatus
} from '../utils/socketUtils';
import { 
  fetchMessages, 
  updateUnreadCount, 
  resetUnreadCount 
} from '../utils/messageUtils';
import { 
  saveMessages, 
  loadMessages, 
  saveSelectedUser, 
  loadSelectedUser, 
  clearSensitiveData, 
  cleanupOldMessages 
} from '../utils/storageUtils';

// Import components
import UserList from './chat/UserList';
import MessageList from './chat/MessageList';
import MessageForm from './chat/MessageForm';
import ChatHeader from './chat/ChatHeader';

const ChatPage = () => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<UserWithinList[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithinList | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<{ [key: string]: number }>({});
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  // Initialize socket connection
  useEffect(() => {
    setConnectionStatus('connecting');
    const newSocket = initializeSocket();
    
    // Setup connection listeners
    setupConnectionListeners(newSocket, setConnectionStatus);
    
    // Setup ping interval
    const cleanupPing = setupPingInterval(newSocket);
    
    setSocket(newSocket);
    
    // Cleanup on component unmount
    return () => {
      console.log('Cleaning up socket connection');
      cleanupPing();
      newSocket.disconnect();
    };
  }, []);

  // Load user data and setup event listeners
  useEffect(() => {
    if (!socket) return;

    // Load current user from cookie
    const currentUser = getCurrentUser();
    if (currentUser && !user) {
      setUser(currentUser);
      
      // Load selected user from localStorage
      const savedSelectedUser = loadSelectedUser();
      if (savedSelectedUser) {
        setSelectedUser(savedSelectedUser);
      }
      
      // Set user as online when connected
      if (socket && connectionStatus === 'connected') {
        setUserOnlineStatus(socket, currentUser._id, true);
      }
    }

    // Fetch users
    axios.get('http://localhost:5000/api/users').then(res => {
      setUsers(res.data);
    });

    // Setup event listeners for user status and messages
    socket.on('user status', (data) => {
      setUsers(prevUsers => prevUsers.map(u => 
        u._id === data.userId ? { ...u, online: data.online } : u
      ));
    });

    socket.on('chat message', (msg) => {
      setMessages(prevMessages => [...prevMessages, msg]);
      
      // Update unread messages count if the message is from someone else
      // and that user is not currently selected
      if (user && msg.to === user._id && (!selectedUser || selectedUser.id !== msg.from)) {
        setUnreadMessages(prev => updateUnreadCount(msg.from, prev));
      }
    });

    // Cleanup event listeners when dependencies change
    return () => {
      socket.off('user status');
      socket.off('chat message');
    };
  }, [socket, user, selectedUser, connectionStatus]);

  // Handle user online/offline status
  useEffect(() => {
    if (!socket || !user || connectionStatus !== 'connected') return;

    // Set user as online when connected
    setUserOnlineStatus(socket, user._id, true);

    // Set user as offline when component unmounts or user changes
    return () => {
      setUserOnlineStatus(socket, user._id, false);
    };
  }, [socket, user, connectionStatus]);
  
  // Save selected user to localStorage when it changes
  useEffect(() => {
    if (selectedUser) {
      saveSelectedUser(selectedUser);
    }
  }, [selectedUser]);

  // Load messages when selected user changes
  useEffect(() => {
    if (!user || !selectedUser) return;

    // First, try to load from localStorage for immediate display
    const cachedMessages = loadMessages(selectedUser.id);
    if (cachedMessages.length > 0) {
      setMessages(cachedMessages);
    }

    // Then, fetch updated messages from the server
    fetchMessages(user._id, selectedUser.id)
      .then(messages => {
        setMessages(messages);
        setUnreadMessages(prev => resetUnreadCount(selectedUser.id, prev));
      });
  }, [selectedUser, user]);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (selectedUser && messages.length > 0) {
      saveMessages(selectedUser.id, messages);
      cleanupOldMessages();
    }
  }, [messages, selectedUser]);

  // Handle user selection
  const handleSelectUser = (user: UserWithinList) => {
    setSelectedUser(user);
  };

  // Handle logout
  const handleLogout = () => {
    clearSensitiveData();
    logout(socket, user?._id);
    setUser(null);
    setSelectedUser(null);
    setMessages([]);
  };

  // If no user is logged in, show a message
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to access the chat.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader 
        currentUser={user} 
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4">
          <UserList 
            users={users}
            selectedUser={selectedUser}
            currentUser={user}
            unreadMessages={unreadMessages}
            onSelectUser={handleSelectUser}
            onLogout={handleLogout}
          />
        </div>
        <div className="w-3/4 flex flex-col">
          <MessageList 
            messages={messages}
            currentUser={user}
            selectedUser={selectedUser}
          />
          <MessageForm 
            socket={socket}
            currentUser={user}
            selectedUser={selectedUser}
            connectionStatus={connectionStatus}
            setMessages={setMessages}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;