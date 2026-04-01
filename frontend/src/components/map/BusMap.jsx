import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Clock, MapPin, Navigation } from 'lucide-react';
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

// Dummy Data
// Utility to mock distance calculation
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const BusMap = () => {
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  
  const [selectedBus, setSelectedBus] = useState(null);
  const [etaResult, setEtaResult] = useState(null);
  const [isLoadingEta, setIsLoadingEta] = useState(false);
  const [etaError, setEtaError] = useState(null);
  const [userLoc, setUserLoc] = useState([28.6139, 77.2090]); // Default Delhi

  useEffect(() => {
    // Load from local storage to sync with Admin Panel
    const savedStops = JSON.parse(localStorage.getItem('urbanflow_stops')) || [
      { id: 1, name: 'Central Station', lat: 28.6139, lng: 77.2090 },
      { id: 2, name: 'Market Square', lat: 28.6239, lng: 77.2190 },
      { id: 3, name: 'University Campus', lat: 28.6339, lng: 77.2290 },
      { id: 4, name: 'Tech Park', lat: 28.6439, lng: 77.2390 },
    ];
    
    const savedBuses = JSON.parse(localStorage.getItem('urbanflow_buses')) || [
      { id: 101, route: 'Route A', lat: 28.6180, lng: 77.2140, nextStopId: 2, speed: 0.0005 },
      { id: 102, route: 'Route B', lat: 28.6380, lng: 77.2340, nextStopId: 4, speed: 0.0004 },
      { id: 103, route: 'Route A', lat: 28.6280, lng: 77.2240, nextStopId: 3, speed: 0.0006 },
    ];
    
    setStops(savedStops);
    setBuses(savedBuses);

    // Get user geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
      (position) => setUserLoc([position.coords.latitude, position.coords.longitude]),
      (error) => console.log("Geolocation error:", error),
      { enableHighAccuracy: true }
    );
  }

  // Simulate Bus Movement
  const interval = setInterval(() => {
    setBuses((prevBuses) => {
      return prevBuses.map((bus) => {
        // Use stops from state instead of STOPS constant
        // Pass stops in to closure or use functional update cautiously, here we capture current stops
        const targetStop = stops.find((s) => s.id === bus.nextStopId);
        if (!targetStop) return bus;

        const dx = targetStop.lat - bus.lat;
          const dy = targetStop.lng - bus.lng;
          const distanceToStop = Math.sqrt(dx * dx + dy * dy);

          // If bus reached the stop, loop it back to the start for simulation purposes
          if (distanceToStop < 0.001) {
            let nextId = bus.nextStopId + 1;
            // Ensure nextId exists in our stops array, otherwise wrap or fallback
            if (!stops.find(s => s.id === nextId)) {
               nextId = stops[0]?.id || bus.nextStopId;
            }
            return { ...bus, nextStopId: nextId };
          }

          // Move bus towards the target stop
          const moveX = (dx / distanceToStop) * bus.speed;
          const moveY = (dy / distanceToStop) * bus.speed;

          return {
            ...bus,
            lat: bus.lat + moveX,
            lng: bus.lng + moveY,
          };
      });
    });
  }, 1000); // Update every second

  return () => clearInterval(interval);
}, [stops]); // Re-run effect if stops change

const handleBusClick = async (bus) => {
    setSelectedBus(bus);
    setIsLoadingEta(true);
    setEtaResult(null);
    setEtaError(null);

    const targetStop = stops.find(s => s.id === bus.nextStopId);
    if (!targetStop) {
        setEtaError("Target stop data unavailable");
        setIsLoadingEta(false);
        return;
    }
    
    const distanceKm = calculateDistance(bus.lat, bus.lng, targetStop.lat, targetStop.lng);

    try {
      // Create payload matching what ml-service main.py expects
      const payload = {
        Route_Name: bus.route,
        Distance_km: distanceKm,
        Traffic_Density: 6.5, // Mock baseline
        Weather: 'Clear',     // Mock baseline
        Is_Peak_Hour: new Date().getHours() >= 17 && new Date().getHours() <= 20 ? 1 : 0
      };

      const res = await getPrediction(payload);
      
      if (res.success && res.data) {
         setEtaResult({
           time: res.data.predicted_travel_time.toFixed(1),
           distance: distanceKm.toFixed(2),
           stopName: targetStop.name
         });
      } else {
         throw new Error("Invalid response from server");
      }
      
    } catch (error) {
      console.error(error);
      setEtaError(error.message);
    } finally {
      setIsLoadingEta(false);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden rounded-xl shadow-inner border border-slate-200">
      <MapContainer 
        center={userLoc} 
        zoom={13} 
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render Stops */}
        {stops.map((stop) => (
          <Marker key={`stop-${stop.id}`} position={[stop.lat, stop.lng]} icon={StopIcon}>
            <Popup>
              <span className="font-semibold text-slate-800">{stop.name}</span>
            </Popup>
          </Marker>
        ))}

        {/* Render Buses */}
        {buses.map((bus) => (
          <Marker 
            key={`bus-${bus.id}`} 
            position={[bus.lat, bus.lng]} 
            icon={BusIcon}
            eventHandlers={{
              click: () => handleBusClick(bus),
            }}
          >
            <Popup className="bus-popup">
              <div className="p-1 w-48">
                <h3 className="font-bold text-lg text-primary-700 flex items-center gap-2 mb-2 border-b pb-1">
                  <Navigation size={16} /> Bus {bus.id}
                </h3>
                <p className="text-sm text-slate-600 mb-2">Route: {bus.route}</p>
                
                {isLoadingEta ? (
                  <div className="flex items-center justify-center p-2 text-primary-500">
                    <span className="animate-pulse flex items-center gap-2"><Clock size={16} /> Calculating ETA...</span>
                  </div>
                ) : etaError ? (
                  <p className="text-xs text-red-500 bg-red-50 p-2 rounded">{etaError}</p>
                ) : etaResult ? (
                  <div className="bg-primary-50 p-2 rounded-lg border border-primary-100">
                    <div className="flex items-center gap-2 text-slate-700 text-sm mb-1">
                      <MapPin size={14} className="text-primary-500" />
                      <span>Next: <span className="font-semibold">{etaResult.stopName}</span></span>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                       <div>
                         <span className="text-xs text-slate-500 block">Distance</span>
                         <span className="font-semibold text-slate-800">{etaResult.distance} km</span>
                       </div>
                       <div className="text-right">
                         <span className="text-xs text-slate-500 block">ETA</span>
                         <span className="font-bold tracking-tight text-xl text-primary-600">{etaResult.time} <span className="text-sm font-normal">min</span></span>
                       </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 info">Click to get prediction</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend Overlay */}
      <div className="absolute top-4 right-4 z-10 glass-panel p-4 text-sm w-48">
        <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">Legend</h4>
        <div className="flex items-center gap-3 mb-2">
          <img src="https://cdn-icons-png.flaticon.com/512/3448/3448339.png" className="w-6 h-6" alt="bus" />
          <span className="text-slate-600">Active Bus</span>
        </div>
        <div className="flex items-center gap-3">
          <img src="https://cdn-icons-png.flaticon.com/512/819/819814.png" className="w-5 h-5 ml-0.5" alt="stop" />
          <span className="text-slate-600">Bus Stop</span>
        </div>
      </div>
    </div>
  );
};

export default BusMap;
