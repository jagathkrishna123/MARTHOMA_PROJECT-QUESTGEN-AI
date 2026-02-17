import React, { useState } from 'react';
import { MessageSquare, Star, Search, Reply, Archive, Trash2 } from 'lucide-react';

const Feedback = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const [feedbacks, setFeedbacks] = useState(() => {
    const saved = localStorage.getItem('feedbacks');
    return saved ? JSON.parse(saved) : [];
  });

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = feedback.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || feedback.status === filter;
    return matchesSearch && matchesFilter;
  });

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">User Feedback</h1>
        <p className="text-gray-600">Review and manage user feedback and suggestions.</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Feedback</option>
              <option value="unread">Unread</option>
              <option value="pending">Pending Response</option>
              <option value="responded">Responded</option>
              <option value="archived">Archived</option>
            </select>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Export Feedback
            </button>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedbacks.map((feedback) => (
          <div key={feedback.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {feedback.user.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{feedback.user}</h3>
                    <span className="text-sm text-gray-500">{feedback.email}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(feedback.status)}`}>
                      {feedback.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex">{renderStars(feedback.rating)}</div>
                    <span className="text-sm text-gray-500">• {feedback.category}</span>
                    <span className="text-sm text-gray-500">• {feedback.date}</span>
                  </div>
                  <p className="text-gray-700 mb-3">{feedback.message}</p>

                  {feedback.response && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Reply className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Your Response</span>
                      </div>
                      <p className="text-blue-700">{feedback.response}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                {!feedback.response && (
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Reply className="w-4 h-4" />
                  </button>
                )}
                <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg">
                  <Archive className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFeedbacks.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Feedback;