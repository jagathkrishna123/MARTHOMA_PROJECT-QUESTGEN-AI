import React, { useState, useEffect } from 'react';
import { Users, Search, Edit, Trash2, UserCheck, UserX } from 'lucide-react';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Load data from localStorage
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
    const savedPapers = JSON.parse(localStorage.getItem('questionPapers') || '[]');

    // Enrich users with counts
    const enrichedUsers = savedUsers.map(user => {
      const userNotes = savedNotes.filter(n => n.userId === user.id).length;
      const userPapers = savedPapers.filter(p => p.userId === user.id).length;
      return {
        ...user,
        notesCount: userNotes + userPapers,
        joinDate: new Date(user.id).toLocaleDateString(), // Assuming id is timestamp
        status: user.isBlocked ? 'Blocked' : 'Active'
      };
    });

    setUsers(enrichedUsers);
  }, []);

  const toggleBlockUser = (userId) => {
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = allUsers.map(user => {
      if (user.id === userId) {
        return { ...user, isBlocked: !user.isBlocked };
      }
      return user;
    });

    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Refresh local state
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newIsBlocked = !u.isBlocked;
        return { ...u, isBlocked: newIsBlocked, status: newIsBlocked ? 'Blocked' : 'Active' };
      }
      return u;
    }));
  };

  const deleteUser = (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = allUsers.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">User Management</h1>
        <p className="text-gray-600">Manage and monitor all users on the platform.</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Export Users
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {user.notesCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.joinDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => toggleBlockUser(user.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${user.status === 'Active'
                              ? 'text-red-600 bg-red-50 hover:bg-red-100 border border-red-200'
                              : 'text-green-600 bg-green-50 hover:bg-green-100 border border-green-200'
                            }`}
                        >
                          {user.status === 'Active' ? (
                            <><UserX className="w-4 h-4" /> Block</>
                          ) : (
                            <><UserCheck className="w-4 h-4" /> Unblock</>
                          )}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 text-sm">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

