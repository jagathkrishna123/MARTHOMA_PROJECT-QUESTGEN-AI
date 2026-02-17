import React, { useEffect, useState } from 'react';
import { Users, FileText, MessageSquare, TrendingUp, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Fetch data from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const questionPapers = JSON.parse(localStorage.getItem('questionPapers') || '[]');
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');

    // Calculate Stats
    const totalUsers = users.length;
    const totalNotes = notes.length + questionPapers.length;
    const totalFeedback = feedbacks.length;

    setStats([
      {
        title: 'Total Users',
        value: totalUsers.toLocaleString(),
        icon: Users,
        color: 'bg-blue-500',
        change: '+0%' // Placeholder for now
      },
      {
        title: 'Total Content',
        value: totalNotes.toLocaleString(),
        icon: FileText,
        color: 'bg-green-500',
        change: '+0%'
      },
      {
        title: 'Feedback Messages',
        value: totalFeedback.toLocaleString(),
        icon: MessageSquare,
        color: 'bg-yellow-500',
        change: '+0%'
      },
      {
        title: 'Question Papers',
        value: questionPapers.length.toLocaleString(),
        icon: FileText,
        color: 'bg-purple-500',
        change: '+0%'
      }
    ]);

    // Consolidate Activity
    const activities = [
      ...users.map(u => ({
        type: 'user',
        title: 'New user registered',
        description: `${u.name} joined the platform`,
        timestamp: u.id, // Assuming id is Date.now()
        icon: Users,
        color: 'bg-blue-500'
      })),
      ...notes.map(n => ({
        type: 'note',
        title: 'New note created',
        description: n.title,
        timestamp: new Date(n.createdAt || n.updatedAt).getTime(),
        icon: FileText,
        color: 'bg-green-500'
      })),
      ...questionPapers.map(qp => ({
        type: 'paper',
        title: 'New question paper',
        description: qp.title,
        timestamp: new Date(qp.createdAt).getTime(),
        icon: FileText,
        color: 'bg-purple-500'
      }))
    ];

    // Sort by most recent
    const sortedActivity = activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5); // Show last 5

    setRecentActivity(sortedActivity);
  }, []);

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className={`w-10 h-10 ${activity.color} rounded-full flex items-center justify-center`}>
                  <activity.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;