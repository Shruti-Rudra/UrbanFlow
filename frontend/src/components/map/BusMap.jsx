import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Clock, MapPin, Navigation, Activity, Info, User as UserIcon } from 'lucide-react';
import { getPrediction } from '../../services/api';
import { useBuses } from '../../contexts/BusContext';

// Fix for default Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom Icons
const StopMarkerIcon = new L.DivIcon({
  html: `<div class="w-6 h-6 bg-white border-2 border-primary-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
         </div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const BusMarkerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

const UserMarkerIcon = new L.DivIcon({
  html: `<div class="relative flex items-center justify-center w-12 h-12">
           <div class="absolute w-full h-full bg-blue-500 rounded-full opacity-40 animate-ping"></div>
           <div class="relative w-9 h-9 bg-gradient-to-tr from-blue-700 to-blue-400 border-2 border-white rounded-xl flex items-center justify-center shadow-2xl rotate-45 transform">
             <div class="-rotate-45">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
             </div>
           </div>
         </div>`,
  className: '',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

// Map View Controller
const ChangeView = ({ center }) => {
  const map = useMap();
  const lastCenter = useRef(null);

  useEffect(() => {
    if (center && (!lastCenter.current || lastCenter.current[0] !== center[0] || lastCenter.current[1] !== center[1])) {
      map.setView(center, map.getZoom(), {
        animate: true,
        duration: 1.0
      });
      lastCenter.current = center;
    }
  }, [center, map]);
  return null;
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const BusMap = () => {
  const { buses, stops, userLocation, userAddress, loading } = useBuses();
  const [isLoadingEta, setIsLoadingEta] = useState(false);
  const [etaResult, setEtaResult] = useState(null);
  const [etaError, setEtaError] = useState(null);
  const initialCenterSet = useRef(false);

  useEffect(() => {
    if (userLocation && !initialCenterSet.current) {
      initialCenterSet.current = true;
    }
  }, [userLocation]);

  const handleBusClick = async (bus) => {
    setIsLoadingEta(true);
    setEtaResult(null);
    setEtaError(null);

    const targetStopId = bus.routeStops[bus.nextStopIndex];
    const targetStop = stops.find(s => s._id === targetStopId || s.id === targetStopId);
    
    if (!targetStop) {
      setEtaError("Stop data missing");
      setIsLoadingEta(false);
      return;
    }

    const dist = calculateDistance(bus.lat, bus.lng, targetStop.lat, targetStop.lng);

    try {
      const payload = {
        Route_Name: bus.route,
        Distance_km: dist,
        Traffic_Density: 4.5, // Mock value
        Weather: 'Clear',
        Is_Peak_Hour: 0
      };

      const res = await getPrediction(payload);
      if (res.success) {
        setEtaResult({
          time: res.data.predicted_travel_time.toFixed(1),
          distance: dist.toFixed(2),
          stopName: targetStop.name
        });
      }
    } catch (err) {
      setEtaError("AI Service unavailable");
    } finally {
      setIsLoadingEta(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Initializing Smart Transit...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-50">
      <MapContainer 
        center={[21.1702, 72.8311]} 
        zoom={13} 
        className="w-full h-full z-0"
        zoomControl={false}
        dragging={true}
        scrollWheelZoom={true}
        smoothWheelZoom={true}
        easeLinearity={0.35}
      >
        <ChangeView center={userLocation && !initialCenterSet.current ? [userLocation.lat, userLocation.lng] : null} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* USER LOCATION */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={UserMarkerIcon}>
            <Popup>
              <div className="font-bold text-blue-700">Your Current Position</div>
              <div className="text-[10px] text-slate-500 font-medium">{userAddress}</div>
            </Popup>
          </Marker>
        )}

        {/* STATIONS (+) */}
        {stops.map(stop => (
          <Marker key={stop._id || stop.id} position={[stop.lat, stop.lng]} icon={StopMarkerIcon}>
            <Popup>
              <div className="font-bold text-slate-800 text-sm">{stop.name}</div>
              <div className="text-[10px] text-primary-500 font-bold tracking-widest mt-1 uppercase">UrbanFlow Station</div>
            </Popup>
          </Marker>
        ))}

        {/* BUSES */}
        {buses.map(bus => (
          <Marker 
            key={bus.id} 
            position={[bus.lat + bus.offset.lat, bus.lng + bus.offset.lng]} 
            icon={BusMarkerIcon}
            eventHandlers={{ click: () => handleBusClick(bus) }}
          >
            <Popup className="bus-popup">
              <div className="p-2 w-52">
                <div className="flex items-center justify-between mb-3 border-b pb-2">
                  <h3 className="font-extrabold text-primary-600 flex items-center gap-1.5">
                    <Navigation size={14} /> {bus.id}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${bus.isWaiting ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'}`}>
                    {bus.isWaiting ? 'At Station' : 'Moving'}
                  </span>
                </div>
                
                <p className="text-xs text-slate-600 mb-3 flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg">
                  <Activity size={12} className="text-slate-400" />
                  Route: <span className="font-bold text-slate-800 text-[10px] truncate max-w-[120px]">{bus.route}</span>
                </p>

                {isLoadingEta ? (
                   <div className="flex flex-col items-center py-2 gap-2">
                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">AI Calculating...</span>
                   </div>
                ) : etaResult ? (
                  <div className="bg-primary-50 p-2.5 rounded-xl border border-primary-100 animate-fade-in">
                    <div className="text-center mb-2 border-b border-primary-100 pb-1.5">
                       <span className="text-[9px] text-primary-400 font-bold uppercase tracking-widest block mb-0.5">NEXT STOP</span>
                       <span className="text-xs font-extrabold text-primary-900 leading-tight">{etaResult.stopName}</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <div className="text-left">
                        <span className="text-[8px] text-slate-500 font-bold block">DIST</span>
                        <span className="text-[10px] font-bold text-slate-800">{etaResult.distance}km</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-slate-500 font-bold block">ETA</span>
                        <span className="text-lg font-black text-primary-600 leading-none">{etaResult.time}<span className="text-[10px] font-normal ml-0.5">min</span></span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => handleBusClick(bus)} className="w-full btn-primary text-[10px] py-1.5 flex items-center justify-center gap-2">
                    <Clock size={12} /> GET LIVE PREDICTION
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* FLOATING ACTIONS */}
      <div className="absolute bottom-24 right-6 z-[400] flex flex-col gap-3">
          <button 
            onClick={() => {
              initialCenterSet.current = false;
              // Small force re-render trigger if needed, though state update often enough
              window.dispatchEvent(new Event('recenter-map'));
            }}
            className="w-12 h-12 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-all border border-slate-100 group"
            title="Recenter Map"
          >
            <Navigation size={22} className="group-hover:scale-110 transition-transform rotate-45" />
          </button>
      </div>

      {/* OVERLAYS */}
      <div className="absolute top-6 right-6 z-[400] flex flex-col gap-3">
          <div className="glass-panel p-4 shadow-2xl border border-white/50 w-52 animate-slide-in">
              <h4 className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 border-b pb-2">
                  <Activity size={14} className="text-primary-500" /> SYSTEM STATUS
              </h4>
              <div className="space-y-3">
                  <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500">FLEET SIZE</span>
                      <span className="text-xs font-black text-slate-900 px-2 py-0.5 bg-slate-100 rounded-md">{buses.length} BUSES</span>
                  </div>
                  <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500">COVERAGE</span>
                      <span className="text-xs font-black text-slate-900 px-2 py-0.5 bg-slate-100 rounded-md">{stops.length} STATIONS</span>
                  </div>
                  <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500">USER GPS</span>
                      <span className={`flex items-center gap-1.5 text-xs font-black ${userLocation ? 'text-blue-600' : 'text-slate-400'}`}>
                          <span className={`w-2 h-2 rounded-full ${userLocation ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`}></span> {userLocation ? 'ACTIVE' : 'INITIALIZING'}
                      </span>
                  </div>
              </div>
          </div>
      </div>

      {/* BOTTOM ACTION */}
      <div className="absolute bottom-6 left-6 z-[400] animate-fade-in delay-500">
          <div className="glass-panel px-5 py-3 shadow-2xl flex items-center gap-4 border-l-4 border-blue-500 max-w-sm">
              <UserIcon size={18} className="text-blue-500 flex-shrink-0" />
              <div className="overflow-hidden">
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none">USER TRACKING</p>
                  <p className="text-[12px] font-bold text-slate-800 tracking-tight truncate">
                    {userLocation ? userAddress : 'Detecting your location for better transit estimates...'}
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default BusMap;
