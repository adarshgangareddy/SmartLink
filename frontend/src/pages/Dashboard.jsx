import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, Link2, MousePointer2, Calendar, Copy, Check, QrCode, Trash2, Loader2, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../services/api';
import QRModal from '../components/QRModal';
import ProFeature from '../components/ProFeature';

const Dashboard = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [isShortening, setIsShortening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  // QR Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await axios.get('/api/links/user/links');
      setLinks(res.data);
    } catch (err) {
      toast.error('Failed to fetch links');
    } finally {
      setLoading(false);
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!url) return;
    setIsShortening(true);
    try {
      const res = await axios.post('/api/links/shorten', {
        original_url: url,
        custom_alias: customAlias || null
      });
      setLinks([res.data, ...links]);
      setUrl('');
      setCustomAlias('');
      toast.success('Link shortened successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to shorten URL');
    } finally {
      setIsShortening(false);
    }
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteLink = async (id) => {
    try {
      await axios.delete(`/api/links/link/${id}`);
      setLinks(links.filter(l => l._id !== id));
      toast.success('Link deleted');
    } catch (err) {
      toast.error('Failed to delete link');
    }
  };

  const handleOpenQR = (link) => {
    setSelectedLink(link);
    setQrModalOpen(true);
  };

  const totalClicks = links.reduce((acc, curr) => acc + curr.clicks, 0);

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-10">
      {/* Hero Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-morphism p-6 rounded-3xl border border-white/5 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Link2 size={80} />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Total Links</p>
          <p className="text-4xl font-bold text-white">{links.length}</p>
          <div className="mt-4 flex items-center gap-1 text-emerald-400 text-xs font-semibold">
            <span className="flex items-center justify-center p-1 rounded-full bg-emerald-400/10">
              <ArrowUpRight size={12} />
            </span>
            +12% from last month
          </div>
        </div>

        <div className="glass-morphism p-6 rounded-3xl border border-white/5 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <MousePointer2 size={80} />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Total Clicks</p>
          <p className="text-4xl font-bold text-white">{totalClicks}</p>
          <div className="mt-4 flex items-center gap-1 text-emerald-400 text-xs font-semibold">
            <span className="flex items-center justify-center p-1 rounded-full bg-emerald-400/10">
              <ArrowUpRight size={12} />
            </span>
            +24% from last month
          </div>
        </div>

        <Link to="/go-pro" className="glass-morphism p-6 rounded-3xl border border-white/5 md:col-span-1 bg-primary-500/5 overflow-hidden group hover:border-primary-500/30 transition-all">
            <div className="flex flex-col h-full justify-center">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    Upgrade to Pro <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </h3>
                <p className="text-xs text-slate-400 mb-4">Get custom domains and detailed geo-analytics for just ₹18/mo.</p>
                <div className="w-full py-2 bg-white text-black text-xs font-extrabold rounded-xl group-hover:bg-slate-200 transition-colors text-center">
                    LEARN MORE
                </div>
            </div>
        </Link>
      </section>

      {/* Shorten Input */}
      <section className="p-1 glass-morphism rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10">
        <form onSubmit={handleShorten} className="flex flex-col md:flex-row gap-2 p-2 bg-slate-900/50 rounded-[2.3rem]">
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
              <Link2 size={24} />
            </div>
            <input
              type="url"
              required
              className="w-full pl-16 pr-4 py-6 bg-transparent text-white placeholder:text-slate-600 focus:outline-none text-xl font-medium"
              placeholder="Paste your long URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="hidden md:block w-px h-12 my-auto bg-white/10" />
          <ProFeature className="md:w-56">
            <input
              type="text"
              className="w-full h-full pl-6 pr-4 py-6 bg-transparent text-white placeholder:text-slate-600 focus:outline-none font-medium"
              placeholder="Custom alias"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
            />
          </ProFeature>
          <button
            type="submit"
            disabled={isShortening}
            className="md:px-12 py-4 md:py-0 premium-gradient rounded-3xl text-white font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 shadow-xl shadow-primary-500/20"
          >
            {isShortening ? <Loader2 className="animate-spin" /> : <Plus size={24} strokeWidth={3} />}
            <span>Shorten</span>
          </button>
        </form>
      </section>

      {/* Recent Links */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="w-2 h-8 rounded-full premium-gradient" />
            Recent Links
          </h2>
          <Link to="/links" className="text-primary-400 text-sm font-bold hover:underline">View all links</Link>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
          {loading ? (
             [1,2,3].map(i => <div key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-3xl" />)
          ) : links.length === 0 ? (
            <div className="glass-morphism p-12 rounded-[2.5rem] border border-white/5 text-center">
                <p className="text-slate-500">No links created yet. Start by shortening your first URL!</p>
            </div>
          ) : (
            links.slice(0, 5).map((link) => (
              <motion.div
                key={link._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-morphism p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-5 overflow-hidden">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform shadow-inner">
                        <Link2 size={28} />
                    </div>
                    <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black text-white tracking-tight truncate">smartlink.com/{link.short_code}</span>
                            <button 
                                onClick={() => copyToClipboard(link._id, `${API_BASE_URL}/${link.short_code}`)}
                                className="p-2 rounded-xl hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                            >
                                {copiedId === link._id ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 truncate font-medium">{link.original_url}</p>
                    </div>
                </div>

                <div className="flex items-center gap-8 justify-between md:justify-end">
                    <div className="flex items-center gap-2">
                        {link.password && <span className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-500 text-[8px] font-bold border border-red-500/20">SECURE</span>}
                        {link.expiry_date && <span className="px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-500 text-[8px] font-bold border border-orange-500/20">EXPIRING</span>}
                        {link.webhook_url && <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-500 text-[8px] font-bold border border-purple-500/20">WEBHOOK</span>}
                    </div>

                    <div className="text-center px-4 hidden sm:block">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold mb-1">Clicks</p>
                        <p className="text-2xl font-black text-white">{link.clicks}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => handleOpenQR(link)}
                            className="p-4 rounded-2xl bg-white/5 text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all tooltip"
                            title="QR Code"
                        >
                            <QrCode size={22} />
                        </button>
                        <button 
                            onClick={() => deleteLink(link._id)}
                            className="p-4 rounded-2xl bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            <Trash2 size={22} />
                        </button>
                    </div>
                </div>
              </motion.div>
            ))
          )}
          </AnimatePresence>
        </div>
      </section>

      {/* QR Modal */}
      {selectedLink && (
        <QRModal 
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          url={`${API_BASE_URL}/${selectedLink.short_code}`}
          shortCode={selectedLink.short_code}
        />
      )}
    </div>
  );
};

export default Dashboard;
