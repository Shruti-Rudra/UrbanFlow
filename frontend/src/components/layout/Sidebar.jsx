import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Map, Settings, MapPin, Bus, LogOut, Home } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 pt-16 flex flex-col z-40">
      <div className="flex-grow overflow-y-auto py-6 px-4">
        <div className="mb-8 px-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main</p>
          <div className="space-y-1">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Map size={18} /> Map Dashboard
            </NavLink>
            <NavLink 
              to="/" 
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Home size={18} /> Home Page
            </NavLink>
          </div>
        </div>

        {user.role === 'admin' && (
          <div className="mb-8 px-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Admin</p>
            <div className="space-y-1">
              <NavLink 
                to="/admin" 
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <Settings size={18} /> Manage System
              </NavLink>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
