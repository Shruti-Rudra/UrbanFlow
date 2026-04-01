import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] p-6 text-center relative z-10 w-full">
      <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800 mb-6 animate-slide-up">
        Welcome to <span className="text-primary-600 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-blue-500">UrbanFlow</span>
      </h1>
      <p className="text-xl text-slate-600 max-w-2xl mb-10 animate-fade-in animation-delay-100">
        Smart Bus Tracking System powered by advanced Machine Learning. 
        Get accurate ETAs, view real-time locations, and optimize your commute in seconds.
      </p>
      <div className="flex gap-4 animate-slide-up animation-delay-200">
        <Link to="/dashboard" className="btn-primary px-8 py-3 text-lg font-semibold flex items-center justify-center">
          Open Map Dashboard
        </Link>
        <Link to="/about" className="btn-secondary px-8 py-3 text-lg font-semibold flex items-center justify-center">
          Learn More
        </Link>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-transparent">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-100 blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100 blur-3xl opacity-60"></div>
      </div>
    </div>
  );
};

export default Home;
