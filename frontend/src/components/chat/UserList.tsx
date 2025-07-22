import React from 'react';
import {User, UserWithinList} from '../../utils/authUtils';

interface UserListProps {
  users: UserWithinList[];
  selectedUser: User | null;
  currentUser: User;
  unreadMessages: { [key: string]: number };
  onSelectUser: (user: UserWithinList) => void;
  onLogout: () => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  selectedUser,
  currentUser,
  unreadMessages,
  onSelectUser,
  onLogout
}) => {
  const filteredUsers = users.filter(user => user.id !== currentUser._id);

  return (
    <div className="w-full bg-gray-200 p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Users</h2>
        <button 
          onClick={onLogout}
          className="bg-red-500 text-white py-1 px-3 rounded text-sm"
        >
          Logout
        </button>
      </div>
      <ul>
        {filteredUsers.map(user => (
          <li 
            key={user.id}
            onClick={() => onSelectUser(user)}
            className={`cursor-pointer p-2 rounded flex justify-between items-center ${
              selectedUser?._id === user._id ? 'bg-blue-500 text-white' : ''
            }`}
          >
            <span>
              {user.username} {user.online ? 
                <span className="text-green-500">(Online)</span> : 
                <span className="text-red-500">(Offline)</span>
              }
            </span>
            {unreadMessages[user._id] > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadMessages[user._id]}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;