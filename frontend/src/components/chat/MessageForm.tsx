import React, { useState } from 'react';
import {User, UserWithinList} from '../../utils/authUtils';
import { Socket } from 'socket.io-client';
import { Message, sendMessage } from '../../utils/socketUtils';

interface MessageFormProps {
  socket: Socket | null;
  currentUser: User;
  selectedUser: UserWithinList | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const MessageForm: React.FC<MessageFormProps> = ({
  socket,
  currentUser,
  selectedUser,
  connectionStatus,
  setMessages
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!socket || !message || !selectedUser || !currentUser || connectionStatus !== 'connected') {
      return;
    }

    // Use the sendMessage utility function
    sendMessage(
      socket,
      message,
      currentUser._id,
      selectedUser.id,
      setMessages
    );

    // Clear the input field
    setMessage('');
  };

  if (!selectedUser) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex">
        <input
          type="text"
          className="border rounded w-full py-2 px-3"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={connectionStatus !== 'connected'}
        />
        <button 
          type="submit" 
          className={`py-2 px-4 rounded ml-2 ${
            connectionStatus === 'connected' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-400 text-gray-700 cursor-not-allowed'
          }`}
          disabled={connectionStatus !== 'connected'}
        >
          Send
        </button>
      </div>
      {connectionStatus !== 'connected' && (
        <p className="text-xs text-red-500 mt-1">
          {connectionStatus === 'connecting' 
            ? 'Connecting to server...' 
            : 'Disconnected from server. Messages cannot be sent.'}
        </p>
      )}
    </form>
  );
};

export default MessageForm;