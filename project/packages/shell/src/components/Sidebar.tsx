import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Ticket, Settings, X } from 'lucide-react';
import axios from 'axios';

interface Screen {
  id: string;
  name: string;
  url: string;
  module: string;
  path: string;
}

interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScreens = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/api/me/screens', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setScreens(response.data.screens);
      } catch (error) {
        console.error('Failed to fetch screens:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScreens();
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const dynamicNavigation = screens.map(screen => ({
    name: screen.name,
    href: `/dashboard${screen.path}`,
    icon: Ticket,
  }));

  const allNavigation = [...navigation, ...dynamicNavigation];

  return (
    <div className="flex flex-col h-full">
      {/* Logo and close button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Flowbit</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tenant info */}
      <div className="p-4 border-b border-gray-200">
        <div className="text-sm">
          <p className="font-medium text-gray-900">
            {user?.customerId === 'logisticsco' ? 'LogisticsCo' : 'RetailGmbH'}
          </p>
          <p className="text-gray-500">{user?.role}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {allNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || 
                          (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Loading state for dynamic screens */}
      {loading && (
        <div className="p-4 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;