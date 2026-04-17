const mongoose = require('mongoose');
const Station = require('../models/Station');
const Route = require('../models/Route');
const Bus = require('../models/Bus');
const config = require('./index');

const suratLocations = [
  { name: 'Adajan Patia', lat: 21.1959, lng: 72.7933 },
  { name: 'Varachha Road', lat: 21.2048, lng: 72.8533 },
  { name: 'Vesu Canal Road', lat: 21.1411, lng: 72.7758 },
  { name: 'Piplod', lat: 21.1557, lng: 72.7667 },
  { name: 'Dumas Road', lat: 21.1333, lng: 72.7417 },
  { name: 'Ring Road textile Market', lat: 21.1888, lng: 72.8422 },
  { name: 'Surat Railway Station', lat: 21.2044, lng: 72.8406 },
  { name: 'Majura Gate', lat: 21.1834, lng: 72.8164 },
  { name: 'Chowk Bazar', lat: 21.1989, lng: 72.8278 },
  { name: 'Rander Road', lat: 21.2185, lng: 72.7964 },
  { name: 'Kamrej NH-8', lat: 21.2678, lng: 72.9642 },
  { name: 'Udhna Junction', lat: 21.1667, lng: 72.8500 },
  { name: 'Katargam', lat: 21.2267, lng: 72.8267 },
  { name: 'Pandesara GIDC', lat: 21.1345, lng: 72.8342 },
  { name: 'Bhestan', lat: 21.1211, lng: 72.8642 },
  { name: 'Sachin GIDC', lat: 21.0822, lng: 72.8842 },
  { name: 'Variav', lat: 21.2542, lng: 72.8042 },
  { name: 'Amroli', lat: 21.2467, lng: 72.8367 },
  { name: 'Sarthana Nature Park', lat: 21.2312, lng: 72.9067 },
  { name: 'Athwa Gate', lat: 21.1912, lng: 72.8122 },
  { name: 'Ghod Dod Road', lat: 21.1764, lng: 72.8028 },
  { name: 'City Light', lat: 21.1642, lng: 72.7842 },
  { name: 'Bhatar Road', lat: 21.1682, lng: 72.8122 },
  { name: 'Althan', lat: 21.1512, lng: 72.8022 },
  { name: 'Palanpur Canal Road', lat: 21.2142, lng: 72.7642 },
  { name: 'Causeway Road', lat: 21.2112, lng: 72.8142 },
  { name: 'Singanpor', lat: 21.2412, lng: 72.8242 },
  { name: 'Mota Varachha', lat: 21.2412, lng: 72.8842 },
  { name: 'Punagam', lat: 21.2112, lng: 72.8842 },
  { name: 'Parvat Patiya', lat: 21.1912, lng: 72.8642 },
  { name: 'Anjana', lat: 21.1812, lng: 72.8542 },
  { name: 'Salabatpura', lat: 21.1867, lng: 72.8322 },
  { name: 'Nanpura', lat: 21.1912, lng: 72.8212 },
  { name: 'Rustampura', lat: 21.1812, lng: 72.8267 },
  { name: 'Gopipura', lat: 21.1942, lng: 72.8312 },
  { name: 'Khatodara GIDC', lat: 21.1712, lng: 72.8212 },
  { name: 'Sosyo Circle', lat: 21.1782, lng: 72.8422 },
  { name: 'Bamroli Road', lat: 21.1512, lng: 72.8342 },
  { name: 'Goyal Nagar', lat: 21.1812, lng: 72.7912 },
  { name: 'L.P. Savani Road', lat: 21.1912, lng: 72.7742 },
  { name: 'Honey Park Road', lat: 21.1942, lng: 72.7812 },
  { name: 'Bhagal', lat: 21.1967, lng: 72.8342 },
  { name: 'Station Road textile', lat: 21.2067, lng: 72.8442 },
  { name: 'Delhi Gate (Surat)', lat: 21.2012, lng: 72.8367 },
  { name: 'Unn', lat: 21.1012, lng: 72.8442 },
  { name: 'Gabheni', lat: 21.0812, lng: 72.8142 },
  { name: 'Hazira Port', lat: 21.1012, lng: 72.6542 },
  { name: 'Mora Gaon', lat: 21.1212, lng: 72.6842 },
  { name: 'Suvali Beach Road', lat: 21.1512, lng: 72.6342 },
  { name: 'Sayan Road', lat: 21.2812, lng: 72.8842 }
];

const seedTransitData = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB for Surat transit seeding...');

    // Clear existing data
    await Station.deleteMany({});
    await Route.deleteMany({});
    await Bus.deleteMany({});
    console.log('Existing Delhi data cleared.');

    // 1. Seed Stations
    const stationDocs = await Station.insertMany(suratLocations.map((loc, i) => ({
      name: loc.name,
      code: `SUR${String(i + 1).padStart(3, '0')}`,
      lat: loc.lat,
      lng: loc.lng
    })));
    console.log(`${stationDocs.length} stations in Surat created.`);

    // 2. Seed Routes
    const routes = [];
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
    
    for (let i = 1; i <= 30; i++) {
      const numStops = Math.floor(Math.random() * 5) + 6;
      const shuffled = [...stationDocs].sort(() => 0.5 - Math.random());
      const routeStops = shuffled.slice(0, numStops);
      
      routes.push({
        name: `Surat Route ${String(i).padStart(2, '0')} (${routeStops[0].name} - ${routeStops[numStops-1].name})`,
        stations: routeStops.map(s => s._id),
        color: colors[i % colors.length]
      });
    }
    const routeDocs = await Route.insertMany(routes);
    console.log(`${routeDocs.length} Surat routes created.`);

    // 3. Seed Buses
    const buses = [];
    for (let i = 1; i <= 150; i++) {
      const randomRoute = routeDocs[Math.floor(Math.random() * routeDocs.length)];
      const startStationId = randomRoute.stations[Math.floor(Math.random() * randomRoute.stations.length)];
      const startStation = stationDocs.find(s => s._id.toString() === startStationId.toString());

      buses.push({
        busNumber: `GJ05BZ${Math.floor(Math.random() * 9000) + 1000}`,
        routeId: randomRoute._id,
        status: 'Active',
        lastLocation: {
          lat: startStation.lat + (Math.random() - 0.5) * 0.005,
          lng: startStation.lng + (Math.random() - 0.5) * 0.005
        }
      });
    }
    const busDocs = await Bus.insertMany(buses);
    console.log(`${busDocs.length} Surat buses created.`);

    console.log('Surat Transit seeding complete! 💎🏜️');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedTransitData();
