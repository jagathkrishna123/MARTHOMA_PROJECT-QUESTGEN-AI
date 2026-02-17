import { User, LayoutDashboard, Users, MessageSquare, LogOut, Shield, Send } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useNotes } from '../../context/NotesContext';

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUser } = useNotes();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: MessageSquare, label: 'Feedback', path: '/admin/feedback' },
    { icon: Send, label: 'Broadcast', path: '/admin/broadcast' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    refreshUser();
    navigate('/');
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-56 bg-slate-800 text-white flex flex-col z-10">
      {/* Admin Profile */}
      <div className="p-6 border-b-2 border-gray-600">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-red-400">Admin</h3>
            <p className="text-xs text-gray-400">admin@example.com</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => {
          const isActive =
            item.path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={index}
              to={item.path}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                ${isActive
                  ? 'bg-red-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t-2 border-gray-600">
        <button
          onClick={handleLogout}
          type="button"
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
