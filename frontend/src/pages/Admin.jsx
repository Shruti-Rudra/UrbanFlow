import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Bus, MapPin, Route as RouteIcon, Save, Edit2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Admin = () => {
  const { api } = useAuth();
  const [activeTab, setActiveTab] = useState('buses');
  
  // State from Database
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Edit states
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [busData, setBusData] = useState({ busNumber: '', routeId: '', lastLocation: { lat: 21.1702, lng: 72.8311 }, status: 'Active' });
  const [routeData, setRouteData] = useState({ name: '', stations: [], color: '#6366f1' });
  const [stopData, setStopData] = useState({ name: '', code: '', lat: 21.1702, lng: 72.8311 });

  // Autocomplete/Helper state
  const [stopSearch, setStopSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stopsRes, routesRes, busesRes] = await Promise.all([
        api.get('/transit/stations'),
        api.get('/transit/routes'),
        api.get('/transit/buses')
      ]);

      setStops(stopsRes.data.data);
      setRoutes(routesRes.data.data);
      setBuses(busesRes.data.data);
    } catch (error) {
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- CRUD Handlers ---

  const handleSaveStation = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingId) {
        await api.put(`/transit/stations/${editingId}`, stopData);
        showNotification('Station updated successfully');
      } else {
        await api.post('/transit/stations', stopData);
        showNotification('Station created successfully');
      }
      resetForms();
      fetchData();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Error saving station', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveRoute = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingId) {
        await api.put(`/transit/routes/${editingId}`, routeData);
        showNotification('Route updated successfully');
      } else {
        await api.post('/transit/routes', routeData);
        showNotification('Route created successfully');
      }
      resetForms();
      fetchData();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Error saving route', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveBus = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingId) {
        await api.put(`/transit/buses/${editingId}`, busData);
        showNotification('Bus updated successfully');
      } else {
        await api.post('/transit/buses', busData);
        showNotification('Bus registered successfully');
      }
      resetForms();
      fetchData();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Error saving bus', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/transit/${type}s/${id}`);
      showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      fetchData();
    } catch (err) {
      showNotification('Delete failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const resetForms = () => {
    setEditingId(null);
    setStopData({ name: '', code: '', lat: 21.1702, lng: 72.8311 });
    setRouteData({ name: '', stations: [], color: '#6366f1' });
    setBusData({ busNumber: '', routeId: '', lastLocation: { lat: 21.1702, lng: 72.8311 }, status: 'Active' });
    setStopSearch('');
  };

  const startEdit = (type, item) => {
    setEditingId(item._id);
    if (type === 'stop') setStopData({ name: item.name, code: item.code, lat: item.lat, lng: item.lng });
    if (type === 'route') setRouteData({ name: item.name, color: item.color, stations: item.stations.map(s => s._id || s) });
    if (type === 'bus') {
      setBusData({
        busNumber: item.busNumber,
        routeId: item.routeId?._id || item.routeId,
        lastLocation: item.lastLocation,
        status: item.status
      });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen pb-20">
      
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-24 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-slide-in ${notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>
          {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} className="text-emerald-400" />}
          <p className="text-sm font-bold uppercase tracking-widest">{notification.message}</p>
          <button onClick={() => setNotification(null)}><X size={16} /></button>
        </div>
      )}

      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
             Admin Control Center
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">SURAT TRANSIT<br/><span className="text-primary-600">INFRASTRUCTURE</span></h1>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl animate-fade-in">
          {['buses', 'routes', 'stops'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); resetForms(); }}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Column */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="glass-panel p-8 shadow-2xl border-white/50 animate-slide-up max-h-[calc(100vh-150px)] overflow-y-auto custom-scrollbar">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center justify-between">
              <span className="flex items-center gap-3 italic underline decoration-primary-500 decoration-4 underline-offset-4">
                {editingId ? 'Modify' : 'Initialize'} {activeTab.slice(0, -1)}
              </span>
              {editingId && <button onClick={resetForms} className="text-slate-400 hover:text-red-500"><X size={20}/></button>}
            </h3>

            {activeTab === 'stops' && (
              <form onSubmit={handleSaveStation} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Station Identity</label>
                  <input required className="input-field py-4" placeholder="Full Station Name" value={stopData.name} onChange={e => setStopData({...stopData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Code</label>
                  <input required className="input-field py-4 uppercase" placeholder="e.g. SUR001" value={stopData.code} onChange={e => setStopData({...stopData, code: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">LATITUDE</label>
                    <input type="number" step="any" required className="input-field" value={stopData.lat} onChange={e => setStopData({...stopData, lat: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">LONGITUDE</label>
                    <input type="number" step="any" required className="input-field" value={stopData.lng} onChange={e => setStopData({...stopData, lng: Number(e.target.value)})} />
                  </div>
                </div>
                <button type="submit" disabled={actionLoading} className="btn-primary w-full py-5 flex items-center justify-center gap-3">
                  {actionLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={20}/> <span className="font-black uppercase tracking-widest text-xs">{editingId ? 'Apply Update' : 'Establish Station'}</span></>}
                </button>
              </form>
            )}

            {activeTab === 'routes' && (
               <form onSubmit={handleSaveRoute} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Line Color</label>
                    <input type="color" className="w-full h-12 rounded-xl cursor-pointer bg-white p-1 border-2 border-slate-100" value={routeData.color} onChange={e => setRouteData({...routeData, color: e.target.value})} />
                 </div>
                 <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Network Name</label>
                  <input required className="input-field py-4" placeholder="e.g. Diamond Circle Line" value={routeData.name} onChange={e => setRouteData({...routeData, name: e.target.value})} />
                </div>
                
                {/* Station Selection Hub */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Infrastructure Nodes</label>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                     {routeData.stations.map(stopId => {
                        const stop = stops.find(s => s._id === stopId);
                        return stop ? (
                          <div key={stopId} className="flex items-center gap-2 bg-primary-50 text-primary-600 px-3 py-1.5 rounded-xl text-[10px] font-black">
                             {stop.code}
                             <button type="button" onClick={() => setRouteData({...routeData, stations: routeData.stations.filter(id => id !== stopId)})} className="hover:text-red-500"><X size={12} /></button>
                          </div>
                        ) : null;
                     })}
                  </div>

                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search Stations..." 
                      className="input-field py-3 text-xs"
                      value={stopSearch}
                      onFocus={() => setShowSuggestions(true)}
                      onChange={(e) => setStopSearch(e.target.value)}
                    />
                    {showSuggestions && (
                      <div ref={suggestionsRef} className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-48 overflow-y-auto">
                        {stops
                          .filter(s => s.name.toLowerCase().includes(stopSearch.toLowerCase()) || s.code.toLowerCase().includes(stopSearch.toLowerCase()))
                          .filter(s => !routeData.stations.includes(s._id))
                          .map(stop => (
                            <button
                              key={stop._id}
                              type="button"
                              onClick={() => {
                                setRouteData({...routeData, stations: [...routeData.stations, stop._id]});
                                setShowSuggestions(false);
                                setStopSearch('');
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between"
                            >
                              <span className="text-[11px] font-black text-slate-800 uppercase">{stop.code} — {stop.name}</span>
                              <Plus size={14} className="text-primary-600" />
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" disabled={actionLoading} className="btn-primary w-full py-5 flex items-center justify-center gap-3">
                  {actionLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><RouteIcon size={20}/> <span className="font-black uppercase tracking-widest text-xs">{editingId ? 'Update Network' : 'Deploy Route'}</span></>}
                </button>
               </form>
            )}

            {activeTab === 'buses' && (
               <form onSubmit={handleSaveBus} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fleet Registration No.</label>
                    <input required className="input-field py-4 uppercase" placeholder="GJ-05-XX-0000" value={busData.busNumber} onChange={e => setBusData({...busData, busNumber: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assigned Route</label>
                   <select required className="input-field h-14" value={busData.routeId} onChange={e => setBusData({...busData, routeId: e.target.value})}>
                      <option value="">Link to Service Line...</option>
                      {routes.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                   </select>
                 </div>
                 <button type="submit" disabled={actionLoading} className="btn-primary w-full py-5 flex items-center justify-center gap-3">
                  {actionLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Bus size={20}/> <span className="font-black uppercase tracking-widest text-xs">{editingId ? 'Modify Fleet' : 'Onboard Vehicle'}</span></>}
                </button>
               </form>
            )}
          </div>
        </div>

        {/* Data Column */}
        <div className="lg:col-span-8">
           <div className="glass-panel p-0 overflow-hidden shadow-2xl animate-slide-up delay-100">
              <div className="bg-slate-900 p-8 flex items-center justify-between">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Live Database</h3>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Manifest</span>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[650px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Manifest ID</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Properties</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                       <tr><td colSpan="3" className="py-20 text-center"><div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mx-auto" /></td></tr>
                    ) : (
                      activeTab === 'stops' && stops.map(stop => (
                        <tr key={stop._id} className="hover:bg-slate-50 transition-colors group">
                           <td className="px-8 py-6">
                              <p className="text-sm font-black text-slate-900">{stop.code}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stop.name}</p>
                           </td>
                           <td className="px-8 py-6">
                              <span className="inline-flex items-center gap-2 text-[11px] font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-600">
                                <MapPin size={12} /> {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-right space-x-2">
                              <button onClick={() => startEdit('stop', stop)} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all"><Edit2 size={16}/></button>
                              <button onClick={() => handleDelete('station', stop._id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                           </td>
                        </tr>
                      ))
                    )}
                    {activeTab === 'routes' && routes.map(route => (
                       <tr key={route._id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: route.color}}></div>
                                <p className="text-sm font-black text-slate-900 tracking-tight">{route.name}</p>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{route.stations?.length || 0} STATIONS LINKED</span>
                          </td>
                          <td className="px-8 py-6 text-right space-x-2">
                             <button onClick={() => startEdit('route', route)} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all"><Edit2 size={16}/></button>
                             <button onClick={() => handleDelete('route', route._id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                          </td>
                       </tr>
                    ))}
                    {activeTab === 'buses' && buses.map(bus => (
                       <tr key={bus._id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-8 py-6 text-sm font-black text-slate-900">#{bus.busNumber}</td>
                          <td className="px-8 py-6">
                             <div className="space-y-1">
                                <p className="text-[11px] font-black uppercase text-primary-600 tracking-widest">{bus.routeId?.name || 'Unassigned'}</p>
                                <div className="flex items-center gap-2">
                                   <div className={`w-1.5 h-1.5 rounded-full ${bus.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bus.status}</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right space-x-2">
                             <button onClick={() => startEdit('bus', bus)} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all"><Edit2 size={16}/></button>
                             <button onClick={() => handleDelete('bus', bus._id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
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
