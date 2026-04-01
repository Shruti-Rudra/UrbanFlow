import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Bus, MapPin, Route, Save, Edit2 } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('buses');
  
  // State for mock database
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);

  // Edit states
  const [editingBusId, setEditingBusId] = useState(null);
  const [editingRouteId, setEditingRouteId] = useState(null);
  const [editingStopId, setEditingStopId] = useState(null);

  // Form states
  const [newBus, setNewBus] = useState({ id: '', route: '', nextStopId: '', speed: 0.0005, lat: '', lng: '' });
  const [newRoute, setNewRoute] = useState({ id: '', name: '', description: '' });
  const [newStop, setNewStop] = useState({ id: '', name: '', lat: '', lng: '' });

  // Autocomplete state
  const [stopSearch, setStopSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  // Load from local storage on mount
  useEffect(() => {
    const savedBuses = JSON.parse(localStorage.getItem('urbanflow_buses')) || [];
    const savedRoutes = JSON.parse(localStorage.getItem('urbanflow_routes')) || [];
    const savedStops = JSON.parse(localStorage.getItem('urbanflow_stops')) || [];

    setBuses(savedBuses);
    setRoutes(savedRoutes);
    setStops(savedStops);

    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveToStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Bus Handlers
  const handleSaveBus = (e) => {
    e.preventDefault();
    if (!newBus.id || !newBus.route) return;
    
    let updated;
    if (editingBusId) {
      updated = buses.map(b => b.id === editingBusId ? { ...newBus, id: Number(newBus.id) } : b);
      setEditingBusId(null);
    } else {
      updated = [...buses, { ...newBus, id: Number(newBus.id) }];
    }
    setBuses(updated);
    saveToStorage('urbanflow_buses', updated);
    setNewBus({ id: '', route: '', nextStopId: '', speed: 0.0005, lat: '', lng: '' });
    setStopSearch('');
  };

  const editBus = (bus) => {
    setEditingBusId(bus.id);
    setNewBus(bus);
    const busStop = stops.find(s => s.id === bus.nextStopId);
    if (busStop) setStopSearch(busStop.name);
  };

  // Route Handlers
  const handleSaveRoute = (e) => {
    e.preventDefault();
    if (!newRoute.id || !newRoute.name) return;
    
    let updated;
    if (editingRouteId) {
      updated = routes.map(r => r.id === editingRouteId ? newRoute : r);
      setEditingRouteId(null);
    } else {
      updated = [...routes, newRoute];
    }
    setRoutes(updated);
    saveToStorage('urbanflow_routes', updated);
    setNewRoute({ id: '', name: '', description: '' });
  };

  const editRoute = (route) => {
    setEditingRouteId(route.id);
    setNewRoute(route);
  };

  // Stop Handlers
  const handleSaveStop = (e) => {
    e.preventDefault();
    if (!newStop.id || !newStop.name) return;
    
    let updated;
    if (editingStopId) {
      updated = stops.map(s => s.id === editingStopId ? { ...newStop, id: Number(newStop.id), lat: Number(newStop.lat), lng: Number(newStop.lng) } : s);
      setEditingStopId(null);
    } else {
      updated = [...stops, { ...newStop, id: Number(newStop.id), lat: Number(newStop.lat), lng: Number(newStop.lng) }];
    }
    
    setStops(updated);
    saveToStorage('urbanflow_stops', updated);
    setNewStop({ id: '', name: '', lat: '', lng: '' });
  };

  const editStop = (stop) => {
    setEditingStopId(stop.id);
    setNewStop(stop);
  };

  // Deletion logic
  const handleDelete = (type, targetId) => {
    if (type === 'bus') {
      const updated = buses.filter(b => b.id !== targetId);
      setBuses(updated);
      saveToStorage('urbanflow_buses', updated);
    } else if (type === 'route') {
      const updated = routes.filter(r => r.id !== targetId);
      setRoutes(updated);
      saveToStorage('urbanflow_routes', updated);
    } else if (type === 'stop') {
      const updated = stops.filter(s => s.id !== targetId);
      setStops(updated);
      saveToStorage('urbanflow_stops', updated);
    }
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditingBusId(null);
    setEditingRouteId(null);
    setEditingStopId(null);
    setNewBus({ id: '', route: '', nextStopId: '', speed: 0.0005, lat: '', lng: '' });
    setNewRoute({ id: '', name: '', description: '' });
    setNewStop({ id: '', name: '', lat: '', lng: '' });
    setStopSearch('');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto h-[calc(100vh-64px)] overflow-y-auto">
      
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-slate-800">Admin Control Panel</h1>
        <p className="text-slate-600 mt-2">Manage transit infrastructure, active routes, and fleet securely.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-slate-200 pb-2">
        <button 
          onClick={() => { setActiveTab('buses'); cancelEdit(); }}
          className={`flex items-center gap-2 px-4 py-2 font-medium rounded-t-lg transition ${activeTab === 'buses' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Bus size={18} /> Manage Fleet
        </button>
        <button 
          onClick={() => { setActiveTab('routes'); cancelEdit(); }}
          className={`flex items-center gap-2 px-4 py-2 font-medium rounded-t-lg transition ${activeTab === 'routes' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Route size={18} /> Manage Routes
        </button>
        <button 
          onClick={() => { setActiveTab('stops'); cancelEdit(); }}
          className={`flex items-center gap-2 px-4 py-2 font-medium rounded-t-lg transition ${activeTab === 'stops' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <MapPin size={18} /> Manage Stations
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in relative z-10">
        
        {/* Form Section */}
        <div className="col-span-1">
          <div className="glass-panel p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-primary-500" />
              {editingBusId || editingRouteId || editingStopId ? 'Edit' : 'Add New'} {activeTab === 'buses' ? 'Bus' : activeTab === 'routes' ? 'Route' : 'Station'}
            </h3>
            
            {activeTab === 'buses' && (
              <form onSubmit={handleSaveBus} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bus ID</label>
                  <input type="number" required className="input-field" placeholder="e.g. 104" value={newBus.id} onChange={e => setNewBus({...newBus, id: e.target.value})} disabled={editingBusId !== null} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Route</label>
                  <select required className="input-field" value={newBus.route} onChange={e => setNewBus({...newBus, route: e.target.value})}>
                    <option value="">Select Route...</option>
                    {routes.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                  </select>
                </div>
                
                {/* Autocomplete Input for Stop */}
                <div className="relative" ref={suggestionsRef}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Station Tracker (Autocomplete)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Type station name (e.g. 'P')..." 
                    value={stopSearch} 
                    onChange={e => {
                      setStopSearch(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                  />
                  {showSuggestions && stopSearch && (
                    <ul className="absolute z-20 w-full bg-white border border-slate-200 mt-1 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {stops.filter(s => s.name.toLowerCase().includes(stopSearch.toLowerCase())).length === 0 ? (
                         <li className="px-4 py-2 text-sm text-slate-500">No matching stops found</li>
                      ) : (
                         stops.filter(s => s.name.toLowerCase().includes(stopSearch.toLowerCase())).map(stop => (
                          <li 
                            key={stop.id} 
                            className="px-4 py-2 hover:bg-primary-50 text-sm cursor-pointer transition flex items-center gap-2 text-slate-700"
                            onClick={() => {
                              setStopSearch(stop.name);
                              setNewBus({...newBus, nextStopId: stop.id, lat: stop.lat, lng: stop.lng});
                              setShowSuggestions(false);
                            }}
                          >
                            <MapPin size={14} className="text-primary-400" />
                            {stop.name}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                  <p className="text-xs text-slate-500 mt-1">Select a stop to auto-fill Bus Lat/Lng position.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Lat</label>
                    <input type="number" step="any" required className="input-field bg-slate-50" readOnly value={newBus.lat} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Lng</label>
                    <input type="number" step="any" required className="input-field bg-slate-50" readOnly value={newBus.lng} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Save size={18} /> {editingBusId ? 'Update Bus' : 'Add Bus'}
                  </button>
                  {editingBusId && (
                    <button type="button" onClick={cancelEdit} className="btn-secondary px-3">Cancel</button>
                  )}
                </div>
              </form>
            )}

            {activeTab === 'routes' && (
              <form onSubmit={handleSaveRoute} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Route ID</label>
                  <input type="text" required className="input-field" placeholder="e.g. R4" value={newRoute.id} onChange={e => setNewRoute({...newRoute, id: e.target.value})} disabled={editingRouteId !== null} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Route Name</label>
                  <input type="text" required className="input-field" placeholder="e.g. Blue Line" value={newRoute.name} onChange={e => setNewRoute({...newRoute, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea required className="input-field" rows="3" placeholder="Route description..." value={newRoute.description} onChange={e => setNewRoute({...newRoute, description: e.target.value})}></textarea>
                </div>
                
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Save size={18} /> {editingRouteId ? 'Update Route' : 'Add Route'}
                  </button>
                  {editingRouteId && (
                    <button type="button" onClick={cancelEdit} className="btn-secondary px-3">Cancel</button>
                  )}
                </div>
              </form>
            )}

            {activeTab === 'stops' && (
              <form onSubmit={handleSaveStop} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stop ID</label>
                  <input type="number" required className="input-field" placeholder="e.g. 5" value={newStop.id} onChange={e => setNewStop({...newStop, id: e.target.value})} disabled={editingStopId !== null} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stop Name</label>
                  <input type="text" required className="input-field" placeholder="e.g. North Terminal" value={newStop.name} onChange={e => setNewStop({...newStop, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                    <input type="number" step="any" required className="input-field" placeholder="28.7" value={newStop.lat} onChange={e => setNewStop({...newStop, lat: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                    <input type="number" step="any" required className="input-field" placeholder="77.3" value={newStop.lng} onChange={e => setNewStop({...newStop, lng: e.target.value})} />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Save size={18} /> {editingStopId ? 'Update Station' : 'Add Station'}
                  </button>
                  {editingStopId && (
                    <button type="button" onClick={cancelEdit} className="btn-secondary px-3">Cancel</button>
                  )}
                </div>
              </form>
            )}

          </div>
        </div>

        {/* List Section */}
        <div className="col-span-1 lg:col-span-2">
          <div className="glass-panel p-6 h-full min-h-[500px]">
            <h3 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              Existing {activeTab === 'buses' ? 'Fleet' : activeTab === 'routes' ? 'Routes' : 'Stations'}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-semibold text-slate-500 uppercase bg-slate-50 rounded-lg">
                    <th className="px-4 py-3 rounded-l-lg">ID</th>
                    <th className="px-4 py-3">Name/Route</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3 text-right rounded-r-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  
                  {activeTab === 'buses' && buses.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-6 text-slate-500">No buses added yet.</td></tr>
                  )}
                  {activeTab === 'buses' && buses.map(bus => (
                    <tr key={bus.id} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="px-4 py-3 font-medium text-slate-800">#{bus.id}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <span className="bg-primary-100/50 text-primary-700 px-2 py-1 rounded text-xs font-semibold">{bus.route}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">Pos: [{Number(bus.lat).toFixed(4)}, {Number(bus.lng).toFixed(4)}]</td>
                      <td className="px-4 py-3 text-right flex justify-end gap-1">
                        <button onClick={() => editBus(bus)} className="text-blue-500 hover:text-blue-700 transition p-2 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete('bus', bus.id)} className="text-red-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}

                  {activeTab === 'routes' && routes.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-6 text-slate-500">No routes added yet.</td></tr>
                  )}
                  {activeTab === 'routes' && routes.map(route => (
                    <tr key={route.id} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="px-4 py-3 font-medium text-slate-800">{route.id}</td>
                      <td className="px-4 py-3 font-semibold text-primary-700">{route.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{route.description}</td>
                      <td className="px-4 py-3 text-right flex justify-end gap-1">
                        <button onClick={() => editRoute(route)} className="text-blue-500 hover:text-blue-700 transition p-2 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete('route', route.id)} className="text-red-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}

                  {activeTab === 'stops' && stops.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-6 text-slate-500">No stations added yet.</td></tr>
                  )}
                  {activeTab === 'stops' && stops.map(stop => (
                    <tr key={stop.id} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="px-4 py-3 font-medium text-slate-800">#{stop.id}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700 flex items-center gap-2">
                        <MapPin size={14} className="text-primary-500" /> {stop.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">[{Number(stop.lat).toFixed(4)}, {Number(stop.lng).toFixed(4)}]</td>
                      <td className="px-4 py-3 text-right flex justify-end gap-1">
                        <button onClick={() => editStop(stop)} className="text-blue-500 hover:text-blue-700 transition p-2 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete('stop', stop.id)} className="text-red-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                  
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;
