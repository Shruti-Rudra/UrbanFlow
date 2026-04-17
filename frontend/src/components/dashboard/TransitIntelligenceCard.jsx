import React, { useState, useEffect } from 'react';
import { Activity, Cloud, Thermometer, Wind, AlertCircle } from 'lucide-react';
import { useBuses } from '../../contexts/BusContext';

const TransitIntelligenceCard = () => {
  const { buses, loading } = useBuses();
  const [weather, setWeather] = useState({ temp: 32, condition: 'Sunny', humidity: 45 });
  const [trafficDensity, setTrafficDensity] = useState('Medium');

  // Simulate dynamic intelligence updates
  useEffect(() => {
    const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy'];
    const traffic = ['Low', 'Medium', 'High'];
    
    const interval = setInterval(() => {
      setWeather(prev => ({
        ...prev,
        temp: 30 + Math.floor(Math.random() * 5),
        condition: conditions[Math.floor(Math.random() * conditions.length)]
      }));
      setTrafficDensity(traffic[Math.floor(Math.random() * traffic.length)]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const activeBuses = buses.filter(b => !b.isWaiting).length;
  const healthPercentage = buses.length > 0 ? Math.round((activeBuses / buses.length) * 100) : 0;

  if (loading) return (
     <div className="glass-panel p-6 h-48 animate-pulse bg-slate-100"></div>
  );

  return (
    <div className="glass-panel p-8 shadow-2xl border-white/50 relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-100 rounded-full blur-[80px] opacity-50 group-hover:opacity-80 transition-opacity"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-primary-50 text-primary-600 rounded-md text-[10px] font-black uppercase tracking-widest mb-2">
               Surat Intelligence Core
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Network Pulse</h3>
          </div>
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
             <Activity size={20} className="animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <div className="flex items-center gap-2 mb-2">
                <Cloud size={14} className="text-primary-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weather</span>
             </div>
             <p className="text-sm font-black text-slate-800">{weather.temp}°C • {weather.condition}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <div className="flex items-center gap-2 mb-2">
                <Wind size={14} className="text-primary-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Traffic</span>
             </div>
             <p className="text-sm font-black text-slate-800">{trafficDensity} Load</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
           <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">System Health</span>
              <span className="text-[11px] font-black text-primary-600">{healthPercentage}%</span>
           </div>
           <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-600 rounded-full transition-all duration-1000" 
                style={{ width: `${healthPercentage}%` }}
              ></div>
           </div>
           <p className="mt-4 text-[10px] font-bold text-slate-400 leading-relaxed italic">
             *AI predictions are currently adjusted for {trafficDensity.toLowerCase()} traffic variables.
           </p>
        </div>
      </div>
    </div>
  );
};

export default TransitIntelligenceCard;
