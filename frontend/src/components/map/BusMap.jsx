import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Clock, MapPin, Navigation, Info, Activity } from 'lucide-react';
import { getPrediction } from '../../services/api';

// Fix for default Leaflet markers missing in React
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom Icons
const BusIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

const StopIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/819/819814.png',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// STYLED CIRCULAR ROUTE (Delhi Central Loop)
const DEFAULT_STOPS = [
  { id: 1, name: 'Connaught Place (Central)', lat: 28.6328, lng: 77.2197 },
  { id: 2, name: 'India Gate (East)', lat: 28.6129, lng: 77.2295 },
  { id: 3, name: 'AIIMS (South)', lat: 28.5672, lng: 77.2100 },
  { id: 4, name: 'Karol Bagh (West)', lat: 28.6441, lng: 77.1873 },
];

const DEFAULT_BUSES = [
  { 
    id: 101, 
    route: 'Central Loop A', 
    lat: 28.6328, 
    lng: 77.2197, 
    nextStopId: 2, 
    speed: 0.00008, // Base speed per 100ms
    isWaiting: false,
    waitTimer: 0,
    offset: { lat: 0.0002, lng: 0.0002 } // Prevent overlap
  },
  { 
    id: 102, 
    route: 'Central Loop B', 
    lat: 28.5672, 
    lng: 77.2100, 
    nextStopId: 4, 
    speed: 0.000075, 
    isWaiting: false,
    waitTimer: 0,
    offset: { lat: -0.0002, lng: -0.0002 }
  },
];

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
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState(DEFAULT_STOPS);
  const [userLoc] = useState([28.6139, 77.2090]);
  
  const [isLoadingEta, setIsLoadingEta] = useState(false);
  const [etaResult, setEtaResult] = useState(null);
  const [etaError, setEtaError] = useState(null);

  const simulationIntervalRef = useRef(null);

  useEffect(() => {
    // Initial data setup
    setBuses(DEFAULT_BUSES);

    // Start high-frequency simulation (100ms)
    simulationIntervalRef.current = setInterval(() => {
      setBuses((prevBuses) => {
        return prevBuses.map((bus) => {
          // 1. Handle Waiting State
          if (bus.isWaiting) {
            const newTimer = bus.waitTimer - 100;
            if (newTimer <= 0) {
              // Time to move to next stop
              const currentIndex = DEFAULT_STOPS.findIndex(s => s.id === bus.nextStopId);
              const nextIndex = (currentIndex + 1) % DEFAULT_STOPS.length;
              const nextStop = DEFAULT_STOPS[nextIndex];
              
              return { 
                ...bus, 
                isWaiting: false, 
                waitTimer: 0, 
                nextStopId: nextStop.id 
              };
            }
            return { ...bus, waitTimer: newTimer };
          }

          // 2. Handle Movement State
          const targetStop = DEFAULT_STOPS.find(s => s.id === bus.nextStopId);
          if (!targetStop) return bus;

          const dx = targetStop.lat - bus.lat;
          const dy = targetStop.lng - bus.lng;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Arrived at destination?
          if (dist < 0.0005) {
            return { 
              ...bus, 
              lat: targetStop.lat, 
              lng: targetStop.lng, 
              isWaiting: true, 
              waitTimer: 2500 + Math.random() * 1000 // Randomized 2.5s-3.5s
            };
          }

          // Interpolation movement
          const currentSpeed = bus.speed * (0.9 + Math.random() * 0.2); // +/- 10% speed variation
          const moveX = (dx / dist) * currentSpeed;
          const moveY = (dy / dist) * currentSpeed;

          return {
            ...bus,
            lat: bus.lat + moveX,
            lng: bus.lng + moveY,
          };
        });
      });
    }, 100);

    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, []);

  const handleBusClick = async (bus) => {
    setIsLoadingEta(true);
    setEtaResult(null);
    setEtaError(null);

    const targetStop = DEFAULT_STOPS.find(s => s.id === bus.nextStopId);
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
        Traffic_Density: 5.8,
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

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-50">
      <MapContainer 
        center={userLoc} 
        zoom={12} 
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* STATIONS */}
        {stops.map(stop => (
          <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={StopIcon}>
            <Popup>
              <div className="font-bold text-slate-800">{stop.name}</div>
              <div className="text-xs text-slate-500 font-medium">UrbanFlow Station #{stop.id}</div>
            </Popup>
          </Marker>
        ))}

        {/* BUSES */}
        {buses.map(bus => (
          <Marker 
            key={bus.id} 
            position={[bus.lat + bus.offset.lat, bus.lng + bus.offset.lng]} 
            icon={BusIcon}
            eventHandlers={{ click: () => handleBusClick(bus) }}
          >
            <Popup className="bus-popup">
              <div className="p-2 w-52">
                <div className="flex items-center justify-between mb-3 border-b pb-2">
                  <h3 className="font-extrabold text-primary-600 flex items-center gap-1.5">
                    <Navigation size={14} /> BUS {bus.id}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${bus.isWaiting ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'}`}>
                    {bus.isWaiting ? 'At Station' : 'Moving'}
                  </span>
                </div>
                
                <p className="text-xs text-slate-600 mb-3 flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg">
                  <Activity size={12} className="text-slate-400" />
                  Route: <span className="font-bold text-slate-800">{bus.route}</span>
                </p>

                {isLoadingEta ? (
                   <div className="flex flex-col items-center py-2 gap-2">
                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Crunching Data...</span>
                   </div>
                ) : etaResult ? (
                  <div className="bg-primary-50 p-2.5 rounded-xl border border-primary-100 animate-fade-in">
                    <div className="text-center mb-2 border-b border-primary-100 pb-1.5">
                       <span className="text-[10px] text-primary-400 font-bold uppercase tracking-widest block mb-0.5">NEXT STOP</span>
                       <span className="text-sm font-extrabold text-primary-900 leading-tight">{etaResult.stopName}</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <div className="text-left">
                        <span className="text-[9px] text-slate-500 font-bold block">DIST</span>
                        <span className="text-xs font-bold text-slate-800">{etaResult.distance}km</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 font-bold block">PRED ETA</span>
                        <span className="text-lg font-black text-primary-600 leading-none">{etaResult.time}<span className="text-[10px] font-normal ml-0.5">min</span></span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => handleBusClick(bus)} className="w-full btn-primary text-[10px] py-2 flex items-center justify-center gap-2">
                    <Clock size={12} /> GET LIVE PREDICTION
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* OVERLAYS */}
      <div className="absolute top-6 right-6 z-[400] flex flex-col gap-3">
          <div className="glass-panel p-4 shadow-2xl border border-white/50 w-52 animate-slide-in">
              <h4 className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-widest mb-4 border-b pb-2">
                  <Activity size={14} className="text-primary-500" /> SYSTEM STATUS
              </h4>
              <div className="space-y-3">
                  <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500">FLEET SIZE</span>
                      <span className="text-xs font-black text-slate-900 px-2 py-0.5 bg-slate-100 rounded-md">2 BUSES</span>
                  </div>
                  <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500">COVERAGE</span>
                      <span className="text-xs font-black text-slate-900 px-2 py-0.5 bg-slate-100 rounded-md">4 STATIONS</span>
                  </div>
                  <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500">UPDATES</span>
                      <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> 100MS TICKS
                      </span>
                  </div>
              </div>
          </div>
          
          <div className="glass-panel p-4 shadow-2xl border border-white/50 w-52 animate-slide-in delay-200">
             <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-3">LEGEND</h4>
             <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shadow-sm">
                        <img src="https://cdn-icons-png.flaticon.com/512/3448/3448339.png" className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Active Bus</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shadow-sm">
                        <img src="https://cdn-icons-png.flaticon.com/512/819/819814.png" className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Station</span>
                </div>
             </div>
          </div>
      </div>

      {/* BOTTOM ACTION */}
      <div className="absolute bottom-6 left-6 z-[400] animate-fade-in delay-500">
          <div className="glass-panel px-5 py-3 shadow-2xl flex items-center gap-4 border-l-4 border-primary-500">
              <Info size={18} className="text-primary-500" />
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none">REAL-TIME TELEMETRY</p>
                  <p className="text-[13px] font-bold text-slate-800 tracking-tight">Buses are currently navigating the Central Delhi loop.</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default BusMap;
