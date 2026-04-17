import React, { useState, useMemo } from 'react';
import { MapPin, Navigation, Clock, ArrowRight, ArrowLeft, Target, Settings, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useBuses } from '../../contexts/BusContext';

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return 0;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const UserTrackingCard = () => {
  const { buses, stops, userLocation, nearbyStations, loading } = useBuses();
  const [manualStopId, setManualStopId] = useState(null);
  const [isBusesExpanded, setIsBusesExpanded] = useState(false);
  const [isStationsExpanded, setIsStationsExpanded] = useState(false);

  // 1. Determine the reference point (User location or manual override)
  const nearestStop = useMemo(() => {
    if (manualStopId) {
      return stops.find(s => (s._id || s.id) === manualStopId);
    }
    // Fallback to closest from distance calculation if no manual selection
    return nearbyStations && nearbyStations.length > 0 ? nearbyStations[0] : null;
  }, [stops, manualStopId, nearbyStations]);

  // 2. Determine Stop Context (Previous/Next in the loop)
  const stopContext = useMemo(() => {
    if (!nearestStop || stops.length === 0) return null;
    const currentId = nearestStop._id || nearestStop.id;
    const idx = stops.findIndex(s => (s._id || s.id) === currentId);
    if (idx === -1) return null;

    const prev = stops[(idx - 1 + stops.length) % stops.length];
    const next = stops[(idx + 1) % stops.length];
    return { prev, next };
  }, [nearestStop, stops]);

  // 3. Calculate ETAs for all buses to the nearest stop
  const busETAs = useMemo(() => {
    if (!nearestStop) return [];

    return buses.map(bus => {
      let distanceToUserStop;
      const targetId = nearestStop._id || nearestStop.id;

      // If the bus is moving towards this stop specifically
      if (bus.nextStopId === targetId) {
        distanceToUserStop = calculateDistance(bus.lat, bus.lng, nearestStop.lat, nearestStop.lng);
      } else {
        // Simple approximation
        const busNextStop = stops.find(s => (s._id || s.id) === bus.nextStopId);
        if (!busNextStop) {
          distanceToUserStop = calculateDistance(bus.lat, bus.lng, nearestStop.lat, nearestStop.lng);
        } else {
          const distToNext = calculateDistance(bus.lat, bus.lng, busNextStop.lat, busNextStop.lng);
          const distFromNextToUser = calculateDistance(busNextStop.lat, busNextStop.lng, nearestStop.lat, nearestStop.lng);
          distanceToUserStop = distToNext + distFromNextToUser;
        }
      }

      const estimatedMinutes = distanceToUserStop / 0.15;

      return {
        id: bus.id,
        route: bus.route,
        isWaiting: bus.isWaiting,
        eta: estimatedMinutes,
        distance: distanceToUserStop
      };
    }).sort((a, b) => a.eta - b.eta);
  }, [buses, nearestStop, stops]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Identifying Geolocation Cluster...</p>
      </div>
    );
  }

  if (!nearestStop) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center space-y-4 min-h-[400px] border border-red-100">
        <Info size={48} className="text-red-300" />
        <p className="text-slate-800 font-black text-center uppercase tracking-tight">Infrastructure Offline</p>
        <p className="text-slate-500 text-xs text-center">No transit nodes detected in your geographic proximity.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="bg-primary-600 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Target size={16} /> Personalized Transit
          </h3>
          <button
            onClick={() => setManualStopId(null)}
            className={`p-2 rounded-lg transition-all ${!manualStopId ? 'bg-white/30' : 'hover:bg-white/20'}`}
            title="Auto-detect location"
          >
            <Settings size={16} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <MapPin size={24} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold text-primary-200 uppercase leading-none">Your Nearest Stop</p>
            <p className="text-lg font-black leading-tight truncate w-48 uppercase">{nearestStop.name}</p>
          </div>
        </div>
      </div>

      {/* Stop Context */}
      {stopContext && (
        <div className="p-4 grid grid-cols-2 gap-4 border-b border-slate-50 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-slate-200 rounded-lg text-slate-500">
              <ArrowLeft size={16} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">Previous</span>
              <span className="text-xs font-bold text-slate-700 truncate block w-24 uppercase">{stopContext.prev.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-end text-right">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">Next</span>
              <span className="text-xs font-bold text-slate-700 truncate block w-24 uppercase">{stopContext.next.name}</span>
            </div>
            <div className="p-1.5 bg-slate-200 rounded-lg text-slate-500">
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      )}

      {/* Bus ETA List */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {busETAs.length === 0 ? (
          <div className="text-center py-10">
            <Info className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-slate-500 text-sm font-medium">No buses active on this route.</p>
          </div>
        ) : (
          busETAs.slice(0, isBusesExpanded ? 10 : 3).map(bus => (
            <div key={bus.id} className="group relative bg-white border border-slate-100 rounded-xl p-3 hover:border-primary-200 hover:shadow-md transition-all duration-300 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                    <Navigation size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Bus {bus.id}</p>
                    <p className="text-xs font-black text-slate-800 tracking-tight">{bus.route}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 mb-1">
                    <Clock size={12} className="text-primary-500" />
                    <span className={`text-[10px] font-black uppercase ${bus.eta < 2 ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`}>
                      {bus.eta < 0.5 ? 'Arriving Now' : bus.eta < 2 ? 'Incoming' : 'On Route'}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 leading-none">
                    {Math.max(1, Math.round(bus.eta))}
                    <span className="text-[10px] font-normal ml-0.5 text-slate-500">min</span>
                  </p>
                </div>
              </div>
            </div>
          ))
        )}

        {busETAs.length > 3 && (
          <button
            onClick={() => setIsBusesExpanded(!isBusesExpanded)}
            className="w-full py-2 text-[10px] font-black text-primary-600 uppercase tracking-widest hover:bg-primary-50 rounded-lg transition-colors border border-primary-100 flex items-center justify-center gap-2"
          >
            {isBusesExpanded ? <><ChevronUp size={14} /> Show Less</> : <><ChevronDown size={14} /> View More Buses</>}
          </button>
        )}
      </div>

      {/* Manual Selection */}
      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">Change Station Manually</label>

        <div className="space-y-2 mb-4">
          {/* Auto-detect Option */}
          <button
            onClick={() => setManualStopId(null)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${!manualStopId ? 'bg-primary-600 border-primary-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:border-primary-300'}`}
          >
            <Target size={14} />
            <div className="text-left">
              <span className="text-[11px] font-black uppercase block">Auto-detect (GPS)</span>
              {!manualStopId && <span className="text-[9px] font-bold opacity-80 uppercase">Active: {nearestStop.name}</span>}
            </div>
          </button>

          {/* Quick Select Stations from Nearby List */}
          {nearbyStations.filter(s => (s._id || s.id) !== (nearestStop._id || nearestStop.id)).slice(0, isStationsExpanded ? 10 : 3).map(s => (
            <button
              key={s._id || s.id}
              onClick={() => setManualStopId(s._id || s.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${manualStopId === (s._id || s.id) ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
            >
              <div className="flex items-center gap-3">
                <MapPin size={14} className={manualStopId === (s._id || s.id) ? 'text-primary-400' : 'text-slate-400'} />
                <span className="text-[11px] font-bold truncate w-40 text-left uppercase">{s.name}</span>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black opacity-50 uppercase">{s.distance?.toFixed(1)} km</p>
              </div>
            </button>
          ))}

          {nearbyStations.length <= 1 && !loading && (
            <p className="text-[10px] font-bold text-slate-400 uppercase py-4 text-center italic">No other stations in your vicinity</p>
          )}
        </div>

        {nearbyStations.length > 4 && (
          <button
            onClick={() => setIsStationsExpanded(!isStationsExpanded)}
            className="w-full py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center justify-center gap-2"
          >
            {isStationsExpanded ? <><ChevronUp size={14} /> Show Less Stations</> : <><ChevronDown size={14} /> Other Nearby Stations</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserTrackingCard;
