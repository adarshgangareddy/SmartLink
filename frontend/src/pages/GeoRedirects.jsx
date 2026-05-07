import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, RefreshCw, Save, ArrowLeft, Search, Link2, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GeoRedirects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [links, setLinks] = useState([]);
  const [selectedLink, setSelectedLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [geoConfig, setGeoConfig] = useState({
    US: '',
    IN: '',
    GB: '',
    CA: ''
  });

  if (!user?.is_pro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="glass-morphism p-12 rounded-[3rem] border border-white/10 max-w-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary-500/10 text-primary-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Globe size={40} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">SmartLink Pro Feature</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            The Smart Geo-Redirects Suite is an exclusive Pro feature. Please upgrade your account to get access to localized country-based traffic routing.
          </p>
          <button 
            onClick={() => navigate('/go-pro')}
            className="w-full py-4 premium-gradient text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-primary-500/20"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/links/user/links');
      setLinks(res.data);
    } catch (err) {
      toast.error('Could not fetch links');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLink = (link) => {
    setSelectedLink(link);
    setGeoConfig({
      US: link.smart_redirect_geo?.US || '',
      IN: link.smart_redirect_geo?.IN || '',
      GB: link.smart_redirect_geo?.GB || '',
      CA: link.smart_redirect_geo?.CA || ''
    });
  };

  const handleSaveGeo = async () => {
    if (!selectedLink) return;
    try {
      setLoading(true);
      const updatedGeo = {};
      Object.keys(geoConfig).forEach(k => {
        if (geoConfig[k]) updatedGeo[k] = geoConfig[k];
      });

      const res = await axios.put(`/api/links/link/${selectedLink._id}`, {
        smart_redirect_geo: updatedGeo
      });

      // Update in state
      setLinks(links.map(l => l._id === selectedLink._id ? res.data : l));
      setSelectedLink(res.data);
      toast.success('Geo routing rules updated successfully!');
    } catch (err) {
      toast.error('Failed to update geo routing rules.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLinks = links.filter(l => 
    l.short_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.original_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Globe className="text-primary-400" size={32} /> Smart Geo-Redirects
          </h1>
          <p className="text-slate-400 text-sm">Target traffic dynamically based on scanner location.</p>
        </div>
        <button 
          onClick={fetchLinks} 
          disabled={loading}
          className="px-5 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 border border-white/5 transition-all self-start md:self-auto"
        >
          {loading ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />} Refresh List
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Select Link */}
        <div className="lg:col-span-1 glass-morphism p-6 rounded-[2.5rem] border border-white/5 space-y-6 h-fit max-h-[700px] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Search size={14} /> Search shortened URLs
            </label>
            <input 
              type="text"
              placeholder="e.g. flash-sale"
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-2xl focus:border-primary-500 transition-all text-white text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Available Links</label>
            {filteredLinks.length === 0 ? (
              <p className="text-sm text-slate-600 italic">No links available</p>
            ) : (
              <div className="space-y-2">
                {filteredLinks.map(link => (
                  <button 
                    key={link._id}
                    onClick={() => handleSelectLink(link)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-1 ${selectedLink?._id === link._id ? 'bg-primary-500/10 border-primary-500/30 text-primary-400' : 'bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-white/5 text-slate-300'}`}
                  >
                    <span className="font-extrabold text-white">/{link.short_code}</span>
                    <span className="text-xs text-slate-500 truncate max-w-full">{link.original_url}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Configure Geo Rules */}
        <div className="lg:col-span-2">
          {selectedLink ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-morphism p-8 rounded-[3rem] border border-white/10 space-y-8"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-white flex items-center gap-2">
                    Geo-Targeting for <span className="text-primary-400">/{selectedLink.short_code}</span>
                  </h3>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20 uppercase tracking-wider">
                    Ready to route
                  </span>
                </div>
                <p className="text-xs text-slate-500">Configure redirect URLs for visitors from specific countries. Users from countries not listed below will fall back to the main URL.</p>
              </div>

              <div className="p-4 bg-primary-500/5 border border-primary-500/10 rounded-2xl space-y-2">
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <Link2 className="text-primary-400" size={14} /> Global Fallback Address
                </p>
                <p className="text-sm font-bold text-white truncate">{selectedLink.original_url}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    🇺🇸 United States
                  </label>
                  <input 
                    type="url"
                    className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white text-sm focus:border-primary-500 transition-all font-mono"
                    placeholder="https://us.yourshop.com"
                    value={geoConfig.US}
                    onChange={(e) => setGeoConfig({...geoConfig, US: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    🇮🇳 India
                  </label>
                  <input 
                    type="url"
                    className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white text-sm focus:border-primary-500 transition-all font-mono"
                    placeholder="https://in.yourshop.com"
                    value={geoConfig.IN}
                    onChange={(e) => setGeoConfig({...geoConfig, IN: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    🇬🇧 United Kingdom
                  </label>
                  <input 
                    type="url"
                    className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white text-sm focus:border-primary-500 transition-all font-mono"
                    placeholder="https://uk.yourshop.com"
                    value={geoConfig.GB}
                    onChange={(e) => setGeoConfig({...geoConfig, GB: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    🇨🇦 Canada
                  </label>
                  <input 
                    type="url"
                    className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white text-sm focus:border-primary-500 transition-all font-mono"
                    placeholder="https://ca.yourshop.com"
                    value={geoConfig.CA}
                    onChange={(e) => setGeoConfig({...geoConfig, CA: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button 
                  onClick={handleSaveGeo}
                  disabled={loading}
                  className="px-10 py-4 premium-gradient text-white font-bold rounded-2xl flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-xl shadow-primary-500/20"
                >
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : <><Save size={18} /> Save Geo Rules</>}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="h-[500px] flex flex-col items-center justify-center border border-white/5 border-dashed rounded-[3rem] text-slate-600 space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-slate-700 animate-pulse">
                <Globe size={40} />
              </div>
              <p className="font-bold text-sm text-slate-400">No URL Selected</p>
              <p className="text-xs text-slate-600 text-center max-w-xs leading-relaxed">Select a link from the sidebar on the left to configure or edit its active country-based routing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeoRedirects;
