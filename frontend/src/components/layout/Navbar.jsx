import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bus, User, LogIn, Menu, X, Bell, Clock, Map, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'Bus Delayed', message: 'Bus #SRT-B-0001 is running 15 mins late.', time: '2 mins ago', icon: <Clock size={16} className="text-amber-500" /> },
    { id: 2, title: 'New Route Added', message: 'Godadara to Vesu line is now active.', time: '1 hour ago', icon: <Map size={16} className="text-primary-600" /> },
    { id: 3, title: 'Traffic Alert', message: 'Heavy traffic detected near Varachha.', time: '3 hours ago', icon: <AlertTriangle size={16} className="text-red-500" /> }
  ]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ];

  if (user) navLinks.push({ name: 'Dashboard', path: '/dashboard' });

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${isScrolled ? 'bg-white/70 backdrop-blur-xl shadow-lg border-b border-white/20 py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex justify-between items-center h-14">
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white transition-transform group-hover:rotate-12 group-hover:scale-110 shadow-xl shadow-slate-200">
              <Bus size={22} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-800 tracking-tighter leading-none">URBANFLOW</span>
              <span className="text-[9px] font-black text-primary-600 uppercase tracking-[0.2em] leading-none mt-1">Surat Smart Transit</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[11px] font-black uppercase tracking-widest transition-all relative group ${location.pathname === link.path ? 'text-primary-600' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary-600 transition-all duration-300 ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </Link>
              ))}
            </div>

            <div className="h-6 w-[1px] bg-slate-200"></div>

            {user ? (
              <div className="flex items-center gap-6">
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`transition-colors relative p-2 rounded-xl ${showNotifications ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:text-primary-600 hover:bg-slate-50'}`}
                  >
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-slide-up z-[70]">
                      <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                        <h4 className="text-xs font-black uppercase tracking-widest">Alerts Center</h4>
                        <span className="text-[10px] font-bold text-slate-400 bg-white/10 px-2 py-0.5 rounded-full">{notifications.length} NEW</span>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map(n => (
                          <div key={n.id} className="p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                            <div className="flex gap-4">
                              <div className="mt-1 w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center transition-transform group-hover:scale-110">
                                {n.icon}
                              </div>
                              <div>
                                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{n.title}</p>
                                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 tracking-widest">{n.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full py-4 text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] bg-primary-50 hover:bg-primary-100 transition-colors">
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 pl-2">
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none">{user.name}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{user.role}</p>
                   </div>
                   <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs">
                      {user.name.charAt(0).toUpperCase()}
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-primary-600 transition-all">
                  Log in
                </Link>
                <Link to="/register" className="bg-primary-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 hover:scale-105 active:scale-95">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-8 shadow-2xl animate-slide-down">
          <div className="space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-lg font-black text-slate-800 uppercase tracking-tighter"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-6 border-t border-slate-100">
               {user ? (
                 <button onClick={logout} className="text-red-500 font-bold uppercase tracking-widest text-xs">Sign Out</button>
               ) : (
                 <Link to="/login" className="text-primary-600 font-bold uppercase tracking-widest text-xs">Sign In</Link>
               )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
