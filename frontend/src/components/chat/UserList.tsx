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
    <div className="w-full bg-gray-50 p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Usuários</h2>
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
            className={`cursor-pointer p-2 rounded-2xl flex justify-left items-center gap-2 ${
              selectedUser?._id === user._id ? 'bg-blue-200 text-gray-800' : ''
            }`}
          >

            <span><img src="/hulkGPT2.png" alt="User Avatar" className="img-pattern-sm"/></span>
            <span>
              {user.name} {user.online ?
                <p className="text-green-500">(Online)</p> :
                <p className="text-red-500">(Offline)</p>
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