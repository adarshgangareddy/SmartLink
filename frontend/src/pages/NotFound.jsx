import React from 'react';
import { Link } from 'react-router-dom';
import { Link2, Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mb-8 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
        <AlertCircle size={40} />
      </div>
      <h1 className="text-4xl font-black mb-4">404 - Link Not Found</h1>
      <p className="text-slate-400 max-w-md mb-10 leading-relaxed">
        The link you are looking for might have expired, been deleted, or the URL might be incorrect. Please check the URL and try again.
      </p>
      <Link 
        to="/" 
        className="flex items-center gap-2 px-8 py-4 premium-gradient rounded-2xl text-white font-bold hover:scale-105 transition-all shadow-lg shadow-primary-500/20"
      >
        <Home size={20} />
        Return Home
      </Link>
      
      <div className="mt-20 flex items-center gap-2 opacity-50">
        <div className="w-6 h-6 rounded-lg premium-gradient flex items-center justify-center">
          <Link2 className="text-white" size={12} />
        </div>
        <span className="text-xs font-bold tracking-tight">SmartLink</span>
      </div>
    </div>
  );
};

export default NotFound;
