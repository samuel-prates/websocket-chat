import React, { useRef, useEffect } from 'react';
import { Message } from '../../utils/socketUtils';
import { User } from '../../utils/authUtils';
import { formatMessageTime } from '../../utils/messageUtils';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
  selectedUser: User | null;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUser, selectedUser }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Chat with {selectedUser.username}</h2>
      <div className="flex flex-col space-y-2">
        {messages.map((msg, index) => (
          <div 
            key={msg.id || index} 
            className={`p-2 rounded relative ${
              msg.from === currentUser._id ? 'bg-blue-200 self-end' : 'bg-gray-300 self-start'
            }`}
          >
            <div>{msg.message}</div>
            
            {/* Time display */}
            <div className="text-xs text-gray-500 mt-1">
              {formatMessageTime(msg.timestamp)}
            </div>

            {/* Message status indicators (only for sent messages) */}
            {msg.from === currentUser._id && (
              <span className="text-xs text-right block mt-1">
                {msg.pending && (
                  <span className="text-gray-500">
                    Sending... <span className="animate-pulse">⏳</span>
                  </span>
                )}
                {msg.delivered && (
                  <span className="text-green-600">
                    Delivered ✓
                  </span>
                )}
                {msg.failed && (
                  <span className="text-red-600">
                    Failed to send! ⚠️
                  </span>
                )}
                {msg.timeout && (
                  <span className="text-orange-600">
                    Delivery status unknown ⚠️
                  </span>
                )}
              </span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;