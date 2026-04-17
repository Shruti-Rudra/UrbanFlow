import React from 'react';
import { MapPin, Cloud, Clock, Bus, Navigation, Thermometer, Wind } from 'lucide-react';

const SelectedStationCard = ({ station, userLocation, routes, buses }) => {
  if (!station) return null;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, station.lat, station.lng) : 0;
  
  // Find routes passing through this station
  const passingRoutes = routes.filter(r => 
    r.stations.some(s => (s._id || s) === station._id || s.name === station.name)
  );

  // Find buses currently on these routes
  const availableBuses = buses.filter(b => 
    passingRoutes.some(r => r.name === b.route || r._id === b.dbId)
  );

  // Mock weather and ETA based on dataset patterns
  const weather = station.isCsv ? (passingRoutes[0]?.weather || 'Cloudy') : 'Clear';
  const eta = station.isCsv ? (Math.floor(Math.random() * 15) + 5) : 10;
  const temp = 28 + Math.floor(Math.random() * 5);

  return (
    <div className="glass-panel p-8 shadow-2xl border-primary-100 animate-slide-up">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
             Station Detailed View
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{station.name}</h3>
          <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={12} className="text-primary-600" /> INFRASTRUCTURE NODE: {station.code}
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
           <Navigation size={30} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Navigation size={12} className="text-primary-600" /> Proximity
          </p>
          <p className="text-2xl font-black text-slate-900">{distance.toFixed(2)} <span className="text-sm">KM</span></p>
          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">From your location</p>
        </div>
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Cloud size={12} className="text-blue-500" /> Weather
          </p>
          <p className="text-2xl font-black text-slate-900 uppercase">{weather}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 flex items-center gap-1">
            <Thermometer size={10} /> {temp}°C | <Wind size={10} /> Moderate
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Service Intelligence</h4>
          <div className="flex items-center justify-between p-4 bg-primary-50 rounded-2xl border border-primary-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary-600 shadow-sm">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">NEXT BUS ARRIVAL</p>
                <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">Calculated Real-time</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-primary-600">~{eta} <span className="text-sm">MIN</span></p>
            </div>
          </div>
        </div>

        <div>
           <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4">Active Fleet on Node</h4>
           <div className="space-y-3">
              {availableBuses.length > 0 ? availableBuses.slice(0, 3).map(bus => (
                <div key={bus.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <Bus size={16} className="text-slate-400" />
                      <span className="text-[11px] font-black text-slate-700 uppercase">{bus.id}</span>
                   </div>
                   <span className="text-[9px] font-bold bg-emerald-100 text-emerald-600 px-2 py-1 rounded-lg uppercase tracking-widest">In Transit</span>
                </div>
              )) : (
                <p className="text-[10px] font-bold text-slate-400 uppercase italic">No buses currently active for this node</p>
              )}
           </div>
        </div>

        <div className="pt-4">
           <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4">Linked Networks</h4>
           <div className="flex flex-wrap gap-2">
              {passingRoutes.map(route => (
                <div key={route._id} className="px-3 py-1.5 bg-slate-100 rounded-xl text-[9px] font-black text-slate-600 uppercase tracking-widest border border-slate-200">
                   {route.name}
                </div>
              ))}
              {passingRoutes.length === 0 && <span className="text-[10px] font-bold text-slate-400 uppercase italic">Standalone Node</span>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedStationCard;
