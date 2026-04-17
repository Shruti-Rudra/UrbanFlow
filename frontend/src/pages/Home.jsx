import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] p-6 text-center relative z-10 w-full overflow-hidden">
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full max-w-4xl text-[180px] font-black text-slate-100/40 select-none -z-10 tracking-tighter uppercase whitespace-nowrap">
        UrbanFlow
      </div>

      <div className="animate-slide-up bg-white/40 backdrop-blur-sm border border-white/50 p-12 rounded-[40px] shadow-2xl space-y-8">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary-100 text-primary-600 rounded-full text-xs font-black uppercase tracking-widest border border-primary-200">
           🚏 Localized for Surat, Gujarat
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter">
          SURAT'S SMART <br />
          <span className="text-primary-600 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-500">TRANSIT HUB</span>
        </h1>

        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
          The official intelligent transit network for Surat. 
          Real-time bus tracking, AI-powered ETAs, and localized station search 
          designed for the modern Diamond City.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link to="/dashboard" className="btn-primary px-10 py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary-200 hover:scale-105 transition-all">
            Enter Dashboard <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="px-10 py-4 text-sm font-black uppercase tracking-widest text-slate-700 hover:text-primary-600 transition-colors flex items-center justify-center">
            Sign In with OTP
          </Link>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-20 bg-slate-50">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-100 blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100 blur-[120px] opacity-60"></div>
      </div>
    </div>
  );
};

export default Home;
