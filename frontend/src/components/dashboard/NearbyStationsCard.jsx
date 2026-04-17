import React, { useState } from 'react';
import { MapPin, Navigation, ChevronDown, ChevronUp } from 'lucide-react';

const NearbyStationsCard = ({ stations, userLocation }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!stations || stations.length === 0) return null;

  const displayStations = isExpanded ? stations.slice(0, 10) : stations.slice(0, 3);

  return (
    <div className="glass-panel p-6 animate-fade-in h-fit shadow-xl border-white/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">NEARBY STATIONS</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Surat Transit Network</p>
        </div>
        <div className="bg-primary-100 p-2 rounded-lg text-primary-600">
          <MapPin size={20} />
        </div>
      </div>

      <div className={`space-y-4 ${isExpanded ? 'max-h-[480px] overflow-y-auto pr-2 custom-scrollbar' : ''} transition-all duration-300`}>
        {displayStations.map((station, index) => (
          <div key={station._id || index} className="group relative flex items-center gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center font-black text-primary-500 text-sm group-hover:scale-110 transition-transform">
              {index + 1}
            </div>
            
            <div className="flex-1">
              <h3 className="text-sm font-extrabold text-slate-700 group-hover:text-primary-700 transition-colors">{station.name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Navigation size={10} /> {station.distance.toFixed(2)} km
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className="text-[10px] font-bold text-slate-500">{station.code}</span>
              </div>
            </div>

            <button className="bg-white p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-primary-500 hover:border-primary-500 transition-all shadow-sm">
              <Navigation size={14} />
            </button>
          </div>
        ))}
      </div>

      {stations.length > 3 && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2"
        >
          {isExpanded ? (
            <><ChevronUp size={16} /> Show Less</>
          ) : (
            <><ChevronDown size={16} /> View All Surat Stations</>
          )}
        </button>
      )}
    </div>
  );
};

export default NearbyStationsCard;
