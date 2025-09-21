import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { 
  Home, 
  Briefcase, 
  Users, 
  BarChart3, 
  X, 
  LogOut,
  User
} from 'lucide-react';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/jobs', label: 'All Jobs', icon: Briefcase },
    { path: '/candidates', label: 'All Candidates', icon: Users },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-card border-r z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-primary">Resume Screener</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="md:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* User Info */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {user?.name || user?.email || 'User'}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.role || 'User'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  onClick={onClose}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;