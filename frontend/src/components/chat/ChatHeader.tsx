import React from 'react';
import { User } from '../../utils/authUtils';
import { ConnectionStatus } from '../../utils/socketUtils';

interface ChatHeaderProps {
  currentUser: User;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ currentUser }) => {
  return (
    <div className="bg-gray-100 p-3 border-b flex justify-between items-center">
      <div>
        <h1 className="text-lg font-semibold">Mensagens</h1>
      </div>
      <div className="flex items-center text-right">
        <div className="mr-2 text-sm">
          <h2 className="text-lg font-semibold w-full capitalize">{currentUser.name}</h2>
          <span className="text-gray-500">{currentUser.email}</span>
        </div>
        <div className="flex items-center">
          <span><img src="/hulkGPT2.png" alt="User Avatar" className="img-pattern-sm"/></span>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;