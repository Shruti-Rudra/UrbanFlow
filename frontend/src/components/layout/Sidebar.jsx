import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Map, Settings, MapPin, Bus, LogOut, Home, Search, X } from 'lucide-react';
import { useBuses } from '../../contexts/BusContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { stops, setSelectedStation } = useBuses();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  if (!user) return null;

  return (
    <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200 h-screen fixed left-0 top-0 pt-20 flex flex-col z-40 transition-all duration-300">
      
      {/* Localized Brand Header */}
      <div className="px-8 mb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary-200">
            <Bus size={18} />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tighter">SURAT HUB</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Network Active</span>
        </div>
      </div>

      {/* SEARCH INFRASTRUCTURE */}
      <div className="px-6 mb-8 mt-6 relative">
        <div className="relative group">
           <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
              <Search size={14} className={`transition-colors ${isSearchFocused ? 'text-primary-600' : 'text-slate-400'}`} />
           </div>
           <input 
              type="text" 
              placeholder="SEARCH STATIONS..." 
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val) {
                  const filtered = stops.filter(s => 
                    s.name.toLowerCase().includes(val.toLowerCase()) || 
                    s.code.toLowerCase().includes(val.toLowerCase())
                  ).slice(0, 6);
                  setSuggestions(filtered);
                } else {
                  setSuggestions([]);
                }
              }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-[10px] font-black tracking-widest text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
           />
           {searchQuery && (
             <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors">
               <X size={12}/>
             </button>
           )}
        </div>

        {/* Autocomplete Suggestions */}
        {isSearchFocused && suggestions.length > 0 && (
          <div className="absolute left-6 right-6 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-slide-up">
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Suggestions</span>
              <span className="text-[9px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{suggestions.length} MATCHES</span>
            </div>
            {suggestions.map(stop => (
              <button
                key={stop._id}
                onClick={() => {
                  setSelectedStation(stop);
                  setSearchQuery(stop.name);
                  setSuggestions([]);
                }}
                className="w-full px-5 py-4 text-left hover:bg-slate-50 transition-all flex items-center gap-4 group"
              >
                <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-black text-[10px] group-hover:scale-110 transition-transform">
                  {stop.code}
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{stop.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Infra Node Available</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-grow overflow-y-auto px-6">
        <div className="mb-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">NAVIGATION</p>
          <div className="space-y-2">
            <NavLink 
              to="/" 
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Home size={20} /> <span className="text-sm font-extrabold uppercase tracking-tight">Overview</span>
            </NavLink>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-slate-900 text-white shadow-xl shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Map size={20} /> <span className="text-sm font-extrabold uppercase tracking-tight">Dashboard</span>
            </NavLink>
          </div>
        </div>

        {user.role === 'admin' && (
          <div className="mb-10">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">ADMINISTRATION</p>
            <div className="space-y-2">
              <NavLink 
                to="/admin" 
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <Settings size={20} /> <span className="text-sm font-extrabold uppercase tracking-tight">System Control</span>
              </NavLink>
            </div>
          </div>
        )}
      </div>

      {/* User Session Footer */}
      <div className="p-6 border-t border-slate-100 mb-4 mx-4 bg-slate-50/50 rounded-3xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-100">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="overflow-hidden">
            <p className="text-[13px] font-black text-slate-800 truncate">{user.name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{user.role} ACCESS</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full h-12 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 border border-transparent hover:border-red-100"
        >
          <LogOut size={16} /> SIGN OUT
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
