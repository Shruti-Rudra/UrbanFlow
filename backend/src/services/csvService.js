const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '../../../data/smart_bus_dataset_3000.csv');

// Coordinate mapping for Surat areas
const COORDINATES = {
  'Pandesara': { lat: 21.1565, lng: 72.8256 },
  'Piplod': { lat: 21.1610, lng: 72.7758 },
  'Varachha': { lat: 21.2062, lng: 72.8590 },
  'Chikuwadi': { lat: 21.1891, lng: 72.8953 },
  'Katargam': { lat: 21.2268, lng: 72.8335 },
  'Udhna': { lat: 21.1666, lng: 72.8427 },
  'Adajan': { lat: 21.1963, lng: 72.7937 },
  'Vesu': { lat: 21.1358, lng: 72.7733 },
  'Rander': { lat: 21.2185, lng: 72.7967 },
  'Godadara': { lat: 21.1665, lng: 72.8790 }
};

const parseCSV = () => {
  try {
    if (!fs.existsSync(CSV_PATH)) return [];
    const content = fs.readFileSync(CSV_PATH, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = values[i] || '';
      });
      return obj;
    });
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
};

const getBuses = () => {
  const data = parseCSV();
  return data.map(row => ({
    _id: `csv-${row.Bus_ID}`,
    busNumber: row.Bus_ID,
    routeId: { 
      _id: `csv-route-${row.From}-${row.To}`,
      name: `${row.From} - ${row.To}` 
    },
    status: 'Active',
    lastLocation: COORDINATES[row.From] || { lat: 21.1702, lng: 72.8311 },
    isCsv: true,
    ...row
  }));
};

const getStations = () => {
  const data = parseCSV();
  const stationNames = new Set();
  data.forEach(row => {
    if (row.From) stationNames.add(row.From);
    if (row.To) stationNames.add(row.To);
  });
  
  return Array.from(stationNames).map(name => ({
    _id: `csv-station-${name}`,
    name: name,
    code: name.substring(0, 3).toUpperCase(),
    lat: COORDINATES[name]?.lat || 21.1702,
    lng: COORDINATES[name]?.lng || 72.8311,
    isCsv: true
  }));
};

const getRoutes = () => {
  const data = parseCSV();
  const routesMap = new Map();
  
  data.forEach(row => {
    const routeName = `${row.From} - ${row.To}`;
    if (!routesMap.has(routeName)) {
      routesMap.set(routeName, {
        _id: `csv-route-${row.From}-${row.To}`,
        name: routeName,
        stations: [
          { _id: `csv-station-${row.From}`, name: row.From, ...(COORDINATES[row.From] || { lat: 21.1702, lng: 72.8311 }) },
          { _id: `csv-station-${row.To}`, name: row.To, ...(COORDINATES[row.To] || { lat: 21.1702, lng: 72.8311 }) }
        ],
        color: '#6366f1',
        isCsv: true,
        distance: row.Distance_km,
        weather: row.Weather,
        trafficDensity: row.Traffic_Density
      });
    }
  });
  
  return Array.from(routesMap.values());
};

const appendToCSV = (rowObj) => {
  try {
    // Bus_ID,From,To,Distance_km,Traffic_Density,Is_Peak_Hour,Weather,Stops,Speed,Actual_Travel_Time,Is_Late,Is_Fastest_Route
    const headers = [
      'Bus_ID', 'From', 'To', 'Distance_km', 'Traffic_Density', 
      'Is_Peak_Hour', 'Weather', 'Stops', 'Speed', 
      'Actual_Travel_Time', 'Is_Late', 'Is_Fastest_Route'
    ];
    
    const row = headers.map(h => rowObj[h] || '').join(',');
    fs.appendFileSync(CSV_PATH, `\n${row}`, 'utf-8');
    return true;
  } catch (error) {
    console.error('Error appending to CSV:', error);
    return false;
  }
};

module.exports = {
  getBuses,
  getStations,
  getRoutes,
  appendToCSV,
  COORDINATES
};
