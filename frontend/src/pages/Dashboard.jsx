import React from 'react';
import BusMap from '../components/map/BusMap';

const Dashboard = () => {
  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col w-full relative z-10">
      <div className="mb-4 animate-fade-in flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-800">Live Traffic Dashboard</h1>
        <p className="text-slate-600">Monitor real-time bus locations and predictive ETAs across the city.</p>
      </div>
      
      <div className="flex-grow animate-slide-up relative bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        <BusMap />
      </div>
    </div>
  );
};

export default Dashboard;
