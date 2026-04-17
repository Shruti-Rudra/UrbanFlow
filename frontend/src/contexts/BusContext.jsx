import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { getStations, getRoutes, getBuses, getNearbyStations } from '../services/api';

const BusContext = createContext(null);

export const BusProvider = ({ children }) => {
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState('Fetching address...');
  const [loading, setLoading] = useState(true);
  const [isOutOfSurat, setIsOutOfSurat] = useState(false);
  const [nearbyStations, setNearbyStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const simulationIntervalRef = useRef(null);

  // Fetch Transit Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stationsRes, routesRes, busesRes] = await Promise.all([
          getStations(),
          getRoutes(),
          getBuses()
        ]);

        if (stationsRes.success) setStops(stationsRes.data);
        if (routesRes.success) setRoutes(routesRes.data);
        
        if (busesRes.success) {
          // Flatten bus data for the simulation state
          const initialBuses = busesRes.data.map(bus => ({
            id: bus.busNumber,
            dbId: bus._id,
            route: bus.routeId?.name || 'Unknown',
            routeStops: bus.routeId?.stations || [],
            lat: bus.lastLocation.lat,
            lng: bus.lastLocation.lng,
            nextStopIndex: 0,
            speed: 0.00005 + Math.random() * 0.00005,
            isWaiting: false,
            waitTimer: 0,
            offset: { lat: (Math.random() - 0.5) * 0.0002, lng: (Math.random() - 0.5) * 0.0002 }
          }));
          setBuses(initialBuses);
        }
      } catch (error) {
        console.error("Transit data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Simulation Logic
  useEffect(() => {
    if (loading || buses.length === 0) return;

    simulationIntervalRef.current = setInterval(() => {
      setBuses((prevBuses) => {
        return prevBuses.map((bus) => {
          if (bus.routeStops.length === 0) return bus;

          if (bus.isWaiting) {
            const newTimer = bus.waitTimer - 100;
            if (newTimer <= 0) {
              const nextIdx = (bus.nextStopIndex + 1) % bus.routeStops.length;
              return { ...bus, isWaiting: false, waitTimer: 0, nextStopIndex: nextIdx };
            }
            return { ...bus, waitTimer: newTimer };
          }

          const targetStopId = bus.routeStops[bus.nextStopIndex];
          const targetStop = stops.find(s => s._id === targetStopId || s.id === targetStopId);
          if (!targetStop) return bus;

          const dx = targetStop.lat - bus.lat;
          const dy = targetStop.lng - bus.lng;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 0.0005) {
            return { 
              ...bus, 
              lat: targetStop.lat, 
              lng: targetStop.lng, 
              isWaiting: true, 
              waitTimer: 2000 + Math.random() * 2000 
            };
          }

          const currentSpeed = bus.speed * (0.8 + Math.random() * 0.4);
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
  }, [loading, stops, buses.length === 0]);

  // Geolocation Logic
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          setUserLocation({
            lat: latitude,
            lng: longitude
          });

          // Surat Boundary Check (21.0 - 21.4 N, 72.6 - 73.0 E)
          const inSurat = latitude >= 21.0 && latitude <= 21.4 && longitude >= 72.6 && longitude <= 73.0;
          setIsOutOfSurat(!inSurat);

          // Fetch nearby stations if in Surat or even if not (to show they are far)
          getNearbyStations(latitude, longitude)
            .then(res => {
              if (res.success) setNearbyStations(res.data);
            });

          // Reverse geocode to get address
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(res => res.json())
            .then(data => {
              setUserAddress(data.display_name || 'Address found');
            })
            .catch(() => setUserAddress('Address unavailable'));
        },
        (error) => {
          console.error("Geolocation error:", error);
          if (!userLocation) {
            // Default Fallback: 4VW2+H37, Surat - Navsari Rd, Udhana, Surat
            const fallbackLoc = { lat: 21.1666, lng: 72.8427 };
            setUserLocation(fallbackLoc);
            setUserAddress("Pramukh Park, Udhana, Surat, Gujarat (Default)");
            
            getNearbyStations(fallbackLoc.lat, fallbackLoc.lng).then(res => {
              if (res.success) setNearbyStations(res.data);
            });
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const value = {
    buses,
    stops,
    routes,
    userLocation,
    userAddress,
    isOutOfSurat,
    nearbyStations,
    loading,
    selectedStation,
    setSelectedStation,
    setUserLocation
  };

  return <BusContext.Provider value={value}>{children}</BusContext.Provider>;
};

export const useBuses = () => {
  const context = useContext(BusContext);
  if (!context) {
    throw new Error('useBuses must be used within a BusProvider');
  }
  return context;
};
