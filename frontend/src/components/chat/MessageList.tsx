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
    <div className="flex-1 p-4 overflow-y-auto bg-white overflow-x-hidden">
      <h2 className="text-xl font-bold mb-4 capitalize">{selectedUser.email}</h2>
      <div className="flex flex-col space-y-2 p-5 m-[-18px] mt-5 h-full bg-gray-100">
        {messages.map((msg, index) => (
          <div 
            key={msg.id || index} 
            className={`p-4 rounded-2xl relative ${
              msg.from === currentUser._id ? 'bg-blue-700 text-gray-100 self-end' : 'bg-white text-gray-150 self-start'
            }`}
          >
            <div className="pb-2">{msg.message}</div>
            
            <div className={`text-xs mt-1 ${
              msg.from === currentUser._id ? 'text-gray-100' : 'text-gray-150'
            }`}>
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