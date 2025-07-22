import React from 'react';
import { User } from '../../utils/authUtils';
import { ConnectionStatus } from '../../utils/socketUtils';

interface ChatHeaderProps {
  currentUser: User;
  connectionStatus: ConnectionStatus;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ currentUser, connectionStatus }) => {
  return (
    <div className="bg-gray-100 p-3 border-b flex justify-between items-center">
      <div>
        <h1 className="text-lg font-semibold">Chat App</h1>
        <p className="text-sm text-gray-600">
          Logged in as <span className="font-medium">{currentUser.username}</span>
        </p>
      </div>
      <div className="flex items-center">
        <div className="mr-2 text-sm">
          Status:
        </div>
        <div className="flex items-center">
          <div 
            className={`w-3 h-3 rounded-full mr-1 ${
              connectionStatus === 'connected' 
                ? 'bg-green-500' 
                : connectionStatus === 'connecting' 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
            }`}
          />
          <span className="text-sm">
            {connectionStatus === 'connected' 
              ? 'Connected' 
              : connectionStatus === 'connecting' 
                ? 'Connecting...' 
                : 'Disconnected'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;