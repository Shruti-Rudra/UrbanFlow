import React from 'react';
import { 
  Bus, 
  Route as RouteIcon, 
  MapPin, 
  User, 
  ShoppingCart, 
  Zap, 
  ShieldCheck, 
  HelpCircle, 
  Navigation, 
  Clock, 
  AlertCircle,
  Database,
  Cpu,
  Layout,
  ArrowRight
} from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/50 selection:bg-primary-200 selection:text-primary-900 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-[10%] left-[20%] w-[40%] h-[60%] bg-primary-200/40 rounded-full blur-[120px] mix-blend-multiply opacity-60 animate-pulse"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[50%] bg-blue-200/40 rounded-full blur-[100px] mix-blend-multiply opacity-60"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 mb-8 animate-fade-in">
              Establishing Tomorrow's Transit
            </div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 animate-slide-up">
            Urban<span className="text-primary-600">Flow</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed animate-slide-up animation-delay-100">
            A specialized, AI-driven transit intelligence ecosystem tailored specifically for the diamond city of <span className="text-slate-900 font-bold underline decoration-primary-500 decoration-4 underline-offset-4">Surat, Gujarat.</span>
          </p>
        </div>
      </section>

      {/* THE CHALLENGE (User Difficulties) */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight">The Modern <br/><span className="text-primary-600">Commuter Difficulty</span></h2>
            <div className="space-y-6">
              {[
                { title: 'The "Ghost Bus" Syndrome', desc: 'Waiting at a stop for 30 minutes with zero visibility on whether the bus is around the corner or miles away.' },
                { title: 'The Network Maze', desc: 'Confusing, overlapping routes in a rapid city development like Surat, making navigation a heavy cognitive load.' },
                { title: 'Travel Uncertainty', desc: 'The inability to plan meetings or errands because transit "arrival times" are merely suggestions, not data.' },
                { title: 'Fragmented Systems', desc: 'No centralized platform to monitor the moving assets of the city, leading to inefficiency and overcrowding.' }
              ].map((bug, i) => (
                <div key={bug.title} className="flex gap-4 group">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                     <AlertCircle size={14} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg group-hover:text-primary-600 transition-colors">{bug.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{bug.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass-panel p-10 bg-gradient-to-br from-primary-600 to-indigo-700 text-white relative overflow-hidden animate-fade-in animation-delay-300">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <HelpCircle size={120} />
             </div>
             <h3 className="text-3xl font-black mb-6">Why start here?</h3>
             <p className="text-primary-100 leading-relaxed mb-6 font-medium">
               UrbanFlow was born from the observation of these daily struggles. In a city like Surat, where time is the greatest asset, waiting 15 minutes past a scheduled stop isn't just a delay—it's lost productivity.
             </p>
             <div className="flex items-center gap-4 pt-6 border-t border-white/20">
               <div className="w-12 h-12 rounded-full border-2 border-primary-400 flex items-center justify-center bg-white/10">
                 <Zap size={20} className="text-primary-200" />
               </div>
               <p className="text-xs font-black uppercase tracking-widest text-primary-200">Solving the "Unseen" deltas</p>
             </div>
          </div>
        </div>
      </section>

      {/* THE SOLUTION GRID */}
      <section className="bg-slate-900 py-32 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">ENGINEERING THE <span className="text-primary-400 italic font-medium">ANSWER</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">We've replaced guesswork with a unified mesh of data, predictive math, and real-time mapping.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Navigation className="text-blue-400" />, title: 'Live Tracking', desc: 'Real-time GPS synchronization across the entire Surat fleet.' },
              { icon: <Zap className="text-amber-400" />, title: 'ETA Engines', desc: 'Prediction vectors driven by localized ML models for precision.' },
              { icon: <MapPin className="text-emerald-400" />, title: 'Smart Proximity', desc: 'Automatic detection of the nearest 3 stations to your position.' },
              { icon: <Layout className="text-indigo-400" />, title: 'Smart UI', desc: 'Context-aware dashboards that adapt to your travel history.' }
            ].map((sol, i) => (
              <div key={sol.title} className="p-8 border border-white/10 rounded-3xl hover:bg-white/5 transition duration-500 group animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform">{sol.icon}</div>
                <h4 className="text-xl font-bold mb-3">{sol.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{sol.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORE FEATURES (Detailed Cards) */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 animate-slide-up">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-6 leading-none">
              THE CORE <br/><span className="text-primary-600 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-500">INFRASTRUCTURE</span>
            </h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              UrbanFlow is built upon eight specialized architectural pillars designed to handle high-concurrency transit data and real-time mapping for the city of Surat.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Masterpiece Environment</div>
            <div className="h-1 w-32 bg-gradient-to-r from-primary-600 to-transparent rounded-full"></div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[
            { icon: <Bus size={28} />, title: 'Live Asset Sync', color: 'from-indigo-500 to-blue-600', desc: 'Real-time telemetry tracking of 150+ hybrid-simulated city buses with sub-second interpolation.' },
            { icon: <RouteIcon size={28} />, title: 'Network Topology', color: 'from-emerald-500 to-teal-600', desc: 'Strategic mapping of 30+ optimized Surat routes to ensure maximum urban connectivity.' },
            { icon: <MapPin size={28} />, title: 'Intelligent Nodes', color: 'from-blue-500 to-indigo-600', desc: 'GPS-aware station discovery utilizing localized coordinate meshes and SUR-code identification.' },
            { icon: <User size={28} />, title: 'Transit Identity', color: 'from-rose-500 to-pink-600', desc: 'A deeply personalized user experience that learns and prioritizes your frequent travel patterns.' },
            { icon: <ShoppingCart size={28} />, title: 'Mobility Cart', color: 'from-amber-500 to-orange-600', desc: 'A sophisticated selection hub for staging multi-leg transit segments and ticketing sequences.' },
            { icon: <Cpu size={28} />, title: 'Predictive Core', color: 'from-primary-500 to-indigo-600', badge: 'AI-POWERED', desc: 'FastAPI microservice running tuned Scikit-Learn models for high-accuracy arrival estimations.' },
            { icon: <ShieldCheck size={28} />, title: 'Zero-Trust Access', color: 'from-slate-700 to-slate-900', badge: 'SECURE', desc: 'Passwordless, 2-factor OTP vault entry ensuring absolute user data integrity and authentication.' },
            { icon: <Navigation size={28} />, title: 'Regional Guard', color: 'from-slate-400 to-slate-600', desc: 'Geofence isolation strictly restricted to the Surat metropolitan perimeter for safe service delivery.' },
          ].map((feat, i) => (
            <div 
              key={feat.title} 
              className="group relative bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-primary-100 transition-all duration-500 animate-slide-up overflow-hidden" 
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Dynamic Glow Background */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${feat.color} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-500`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feat.color} rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                    {feat.icon}
                  </div>
                  {feat.badge && (
                    <span className="text-[10px] font-black tracking-widest px-3 py-1 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-primary-600 group-hover:text-white transition-colors">
                      {feat.badge}
                    </span>
                  )}
                </div>
                
                <h4 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-primary-600 transition-colors tracking-tighter">
                  {feat.title}
                </h4>
                
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  {feat.desc}
                </p>
                
                <div className="mt-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-600">Explore Module</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SYSTEM ARCHITECTURE */}
      <section className="bg-slate-50 border-y border-slate-200 py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
           <div className="text-center mb-20 animate-slide-up">
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">THE TECHNOLOGY <span className="text-primary-600">STITCH</span></h2>
              <p className="text-slate-500 font-medium">A distributed, four-layer architecture built for high concurrency.</p>
           </div>

           <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10 animate-fade-in animation-delay-300">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-primary-100 via-primary-500 to-primary-100 -translate-y-1/2 hidden lg:block -z-10"></div>
              
              {[
                { icon: <Layout />, label: 'FRONTEND', desc: 'React + Vite' },
                { icon: <Zap />, label: 'BACKEND', desc: 'Node + Express' },
                { icon: <Cpu />, label: 'PREDICT', desc: 'FastAPI + ML' },
                { icon: <Database />, label: 'STORE', desc: 'MongoDB Hub' }
              ].map((step, i) => (
                <div key={step.label} className="w-64 glass-panel p-8 text-center bg-white border-primary-100 shadow-xl lg:shadow-none hover:shadow-2xl transition-all">
                   <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                      {step.icon}
                   </div>
                   <h5 className="font-black text-xs uppercase tracking-[0.3em] text-primary-600 mb-2">{step.label}</h5>
                   <p className="text-slate-900 font-bold">{step.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* SECURITY & GEO-FENCE HIGHLIGHT */}
      <section className="max-w-6xl mx-auto px-6 py-32">
        <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden animate-slide-up">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px]"></div>
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary-500/20 border border-primary-500/30 rounded-full text-primary-400 text-xs font-black uppercase tracking-widest mb-8">
                 <ShieldCheck size={16} /> Regional Security
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tighter">SECURED FOR THE <br/>SURAT <span className="text-primary-400 italic">LIMITS</span></h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-1"><ArrowRight size={14}/></div>
                  <p className="text-slate-400 text-sm leading-relaxed"><span className="text-white font-bold tracking-widest uppercase text-[10px] block mb-1">OTP VERIFICATION</span> All entry points are verified via dynamic codes. No passwords, no leaks.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-1"><ArrowRight size={14}/></div>
                  <p className="text-slate-400 text-sm leading-relaxed"><span className="text-white font-bold tracking-widest uppercase text-[10px] block mb-1">GEOGRAPHIC BOUNDARY</span> Our geofence ensures the service remains specialized for Surat coordinates only.</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="aspect-square bg-white/5 border border-white/10 rounded-[2rem] flex flex-col items-center justify-center p-6 hover:bg-white/10 transition-all cursor-default group">
                  <Clock size={32} className="text-primary-400 mb-4 group-hover:scale-110 transition-all" />
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Real-time</p>
               </div>
               <div className="aspect-square bg-white/5 border border-white/10 rounded-[2rem] flex flex-col items-center justify-center p-6 hover:bg-white/10 transition-all cursor-default group">
                  <ShieldCheck size={32} className="text-emerald-400 mb-4 group-hover:scale-110 transition-all" />
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Encrypted</p>
               </div>
               <div className="aspect-square bg-white/5 border border-white/10 rounded-[2rem] flex flex-col items-center justify-center p-6 hover:bg-white/10 transition-all cursor-default group">
                  <Navigation size={32} className="text-blue-400 mb-4 group-hover:scale-110 transition-all" />
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Geo-Isolated</p>
               </div>
               <div className="aspect-square bg-primary-600 rounded-[2rem] flex flex-col items-center justify-center p-6 shadow-2xl shadow-primary-500/20 group">
                  <CheckCircle2 size={32} className="text-white mb-4 group-hover:scale-110 transition-all" />
                  <p className="text-[10px] font-black uppercase text-white tracking-widest">Verified</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA / SIGN-OFF */}
      <footer className="text-center py-20 px-6">
        <h3 className="text-slate-900 font-black text-2xl mb-4 tracking-tight">UrbanFlow Hub | Surat Metropolitan</h3>
        <p className="text-slate-400 text-sm font-medium">Transforming the diamond city into a smart city, one bus at a time.</p>
        <div className="mt-12 flex justify-center gap-6 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
           <Zap size={24} className="text-slate-400" />
           <ShieldCheck size={24} className="text-slate-400" />
           <Navigation size={24} className="text-slate-400" />
        </div>
      </footer>

    </div>
  );
};

// Helper for check icon
const CheckCircle2 = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default About;
