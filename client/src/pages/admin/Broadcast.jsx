import React, { useState } from 'react';
import { Send, Users, UserCheck, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';

const Broadcast = () => {
  const [broadcastType, setBroadcastType] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentBroadcasts, setSentBroadcasts] = useState(() => {
    const saved = localStorage.getItem('broadcasts');
    return saved ? JSON.parse(saved) : [];
  });

  const users = JSON.parse(localStorage.getItem('users') || '[]');

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSendBroadcast = async () => {
    if (!subject.trim() || !message.trim()) {
      alert('Please fill in both subject and message');
      return;
    }

    if (broadcastType === 'specific' && selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }

    setIsSending(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newBroadcast = {
      id: Date.now(),
      subject,
      message,
      type: broadcastType,
      targetUserIds: broadcastType === 'specific' ? selectedUsers : [],
      recipients: broadcastType === 'all' ? 'All Users' : `Selected Users (${selectedUsers.length})`,
      sentAt: new Date().toLocaleString(),
      status: 'sent'
    };

    const updatedBroadcasts = [newBroadcast, ...sentBroadcasts];
    setSentBroadcasts(updatedBroadcasts);
    localStorage.setItem('broadcasts', JSON.stringify(updatedBroadcasts));

    setSubject('');
    setMessage('');
    setSelectedUsers([]);
    setBroadcastType('all');
    setIsSending(false);

    alert('Broadcast sent successfully!');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Broadcast Messages</h1>
        <p className="text-gray-600">Send messages to all users or specific user groups.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Compose Broadcast */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Compose Broadcast</h2>

          {/* Broadcast Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Send to:</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="all"
                  checked={broadcastType === 'all'}
                  onChange={(e) => setBroadcastType(e.target.value)}
                  className="mr-3"
                />
                <Users className="w-4 h-4 mr-2 text-blue-500" />
                All Users
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="specific"
                  checked={broadcastType === 'specific'}
                  onChange={(e) => setBroadcastType(e.target.value)}
                  className="mr-3"
                />
                <UserCheck className="w-4 h-4 mr-2 text-green-500" />
                Specific Users
              </label>
            </div>
          </div>

          {/* User Selection (only show when specific is selected) */}
          {broadcastType === 'specific' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Users ({selectedUsers.length} selected):
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {users.map(user => (
                  <label key={user.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserSelect(user.id)}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-medium text-xs">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      <span className={`ml-auto px-2 py-1 text-xs rounded-full ${user.role === 'Premium' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {user.role}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Subject */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter broadcast subject..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your broadcast message..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendBroadcast}
            disabled={isSending}
            className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${isSending
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Broadcast
              </>
            )}
          </button>
        </div>

        {/* Broadcast History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Broadcast History</h2>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {sentBroadcasts.map((broadcast) => (
              <div key={broadcast.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{broadcast.subject}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Mail className="w-4 h-4 mr-1" />
                      {broadcast.recipients}
                      <Clock className="w-4 h-4 ml-3 mr-1" />
                      {broadcast.sentAt}
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm text-gray-700 mt-2">{broadcast.message}</p>
              </div>
            ))}
          </div>

          {sentBroadcasts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No broadcasts sent yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Broadcast;