import React from 'react';
import { CheckCircle, Zap, Shield, Navigation } from 'lucide-react';

const About = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto h-[calc(100vh-64px)] flex flex-col justify-start">
      <div className="text-center mb-12 animate-fade-in relative z-10">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-4">About UrbanFlow</h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          We are revolutionizing city transit with ML-driven estimated time of arrivals (ETAs) and real-time smart bus tracking interfaces.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 relative z-10">
        <div className="glass-panel p-8 animate-slide-up hover:-translate-y-1 transition duration-300">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 flex items-center justify-center rounded-xl mb-6">
            <Zap size={24} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">AI-Powered Predictions</h3>
          <p className="text-slate-600 leading-relaxed">
            By passing distance vectors, historical transit volume, and traffic density variables into our tuned Sci-Kit Learn models via our blazing fast Python microservice, we actively simulate traffic bottlenecks to grant commuters accurate, minute-by-minute ETAs.
          </p>
        </div>

        <div className="glass-panel p-8 animate-slide-up animation-delay-100 hover:-translate-y-1 transition duration-300">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center rounded-xl mb-6">
            <Navigation size={24} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">Seamless Map Analytics</h3>
          <p className="text-slate-600 leading-relaxed">
            We integrate raw routing databases directly into OpenStreetMap via Leaflet to map spatial datasets on the frontend. React state intelligently maps and loops vehicle clusters, projecting location deltas natively on your browser.
          </p>
        </div>
      </div>

      {/* Decorative Blob */}
      <div className="fixed top-[30%] left-[20%] w-[60%] h-[40%] bg-primary-200/50 rounded-full blur-[120px] mix-blend-multiply opacity-50 -z-10"></div>
    </div>
  );
};

export default About;
