import BusMap from '../components/map/BusMap';
import UserTrackingCard from '../components/dashboard/UserTrackingCard';
import NearbyStationsCard from '../components/dashboard/NearbyStationsCard';
import TransitIntelligenceCard from '../components/dashboard/TransitIntelligenceCard';
import SelectedStationCard from '../components/dashboard/SelectedStationCard';
import { BusProvider, useBuses } from '../contexts/BusContext';
import { AlertCircle, MapPin } from 'lucide-react';

const DashboardContent = () => {
  const { isOutOfSurat, nearbyStations, userLocation, routes, buses, selectedStation } = useBuses();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      
      {/* Surat Restriction Guard */}
      {/* ... [Rest of the Guard Logic remains the same] ... */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="animate-slide-up">
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">SURAT LIVE DASHBOARD</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time smart transit monitoring for Gujarat's textile hub.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[750px] animate-slide-up delay-100">
          <BusMap />
        </div>
        <div className="flex flex-col gap-8 animate-slide-up delay-200">
          {selectedStation && (
            <SelectedStationCard 
              station={selectedStation} 
              userLocation={userLocation} 
              routes={routes} 
              buses={buses} 
            />
          )}
          <TransitIntelligenceCard />
          <NearbyStationsCard stations={nearbyStations} userLocation={userLocation} />
          <UserTrackingCard />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return <DashboardContent />;
};

export default Dashboard;
