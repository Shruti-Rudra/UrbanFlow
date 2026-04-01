import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative w-full overflow-x-hidden">
      <Navbar />
      <Sidebar />
      
      {/* Main Content Area automatically adjusts padding if logged in (Sidebar is visible) */}
      <main className={`flex-grow pt-16 transition-all duration-300 w-full ${user ? 'md:pl-64' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
