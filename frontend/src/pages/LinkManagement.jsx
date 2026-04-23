import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Link2, 
  ExternalLink, 
  Copy, 
  Check, 
  Trash2, 
  Calendar, 
  MousePointer2, 
  Search, 
  Filter, 
  QrCode, 
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../services/api';
import QRModal from '../components/QRModal';
import ProFeature from '../components/ProFeature';
import AdvancedSettingsModal from '../components/AdvancedSettingsModal';
import { Settings2 } from 'lucide-react';

const LinkManagement = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
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

  const updateLinkInState = (updatedLink) => {
    setLinks(links.map(l => l._id === updatedLink._id ? updatedLink : l));
  };

  const deleteLink = async (id) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;
    try {
      await axios.delete(`/api/links/link/${id}`);
      setLinks(links.filter(l => l._id !== id));
      toast.success('Link deleted');
    } catch (err) {
      toast.error('Failed to delete link');
    }
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Link copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenQR = (link) => {
    setSelectedLink(link);
    setQrModalOpen(true);
  };

  const handleOpenSettings = (link) => {
      setSelectedLink(link);
      setSettingsModalOpen(true);
  };

  const filteredLinks = links.filter(link => 
    link.original_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.short_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Management</h1>
          <p className="text-slate-400 text-sm">Organize and monitor all your shortened URLs.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
                    <Search size={18} />
                </div>
                <input 
                    type="text"
                    placeholder="Search links..."
                    className="pl-12 pr-6 py-3 bg-slate-900/50 rounded-2xl border border-white/5 focus:border-primary-500/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10 text-white transition-all w-full md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="p-3 rounded-2xl bg-white/5 text-slate-400 hover:text-white border border-transparent hover:border-white/5 transition-all">
                <Filter size={20} />
            </button>
        </div>
      </header>

      <div className="glass-morphism rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-slate-950/50">
                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Asset Detail</th>
                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Performance</th>
                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Age</th>
                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode='popLayout'>
              {loading ? (
                [1,2,3,4].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-8"><div className="h-12 w-full bg-white/5 rounded-2xl" /></td>
                  </tr>
                ))
              ) : filteredLinks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-slate-700">
                            <Link2 size={32} />
                        </div>
                        <p className="text-slate-500 font-medium">No links found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLinks.map((link) => (
                  <motion.tr 
                    key={link._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
                          <Link2 size={24} />
                        </div>
                        <div className="space-y-1 max-w-[240px]">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-lg tracking-tight">/{link.short_code}</span>
                            <button 
                                onClick={() => copyToClipboard(link._id, `${API_BASE_URL}/${link.short_code}`)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 transition-colors"
                            >
                                {copiedId === link._id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 truncate font-medium">{link.original_url}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-400/5 text-emerald-400">
                            <MousePointer2 size={18} />
                        </div>
                        <div>
                            <p className="text-lg font-black text-white">{link.clicks}</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Hits</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-200">{new Date(link.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Incepted</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2 text-slate-500">
                        <ProFeature>
                            <button 
                                onClick={() => handleOpenSettings(link)}
                                className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                                title="Intelligence Settings"
                            >
                            <Settings2 size={18} />
                            </button>
                        </ProFeature>
                        <ProFeature>
                            <button 
                                onClick={() => handleOpenQR(link)}
                                className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                                title="QR Code"
                            >
                            <QrCode size={18} />
                            </button>
                        </ProFeature>
                        <Link 
                            to={`/analytics/${link._id}`}
                            className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                            title="Analytics"
                        >
                          <ArrowUpRight size={18} />
                        </Link>
                        <button 
                            onClick={() => deleteLink(link._id)}
                            className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {selectedLink && (
        <>
            <QRModal 
                isOpen={qrModalOpen}
                onClose={() => setQrModalOpen(false)}
                url={`${API_BASE_URL}/${selectedLink.short_code}`}
                shortCode={selectedLink.short_code}
            />
            <AdvancedSettingsModal 
                isOpen={settingsModalOpen}
                onClose={() => setSettingsModalOpen(false)}
                link={selectedLink}
                onUpdate={updateLinkInState}
            />
        </>
      )}
    </div>
  );
};

export default LinkManagement;
