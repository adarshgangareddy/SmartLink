import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Zap, AlertCircle, Clock, Trash2, ArrowRight, Shield, Hourglass, Timer, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AdvancedSettingsModal from '../components/AdvancedSettingsModal';

const LinkLifecycle = () => {
    const { user } = useAuth();
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [selectedLink, setSelectedLink] = useState(null);

    useEffect(() => {
        if (user?.is_pro) {
            fetchLifecycleData();
        }
    }, [user]);

    const fetchLifecycleData = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/links/user/links');
            setLinks(res.data);
        } catch (err) {
            toast.error('Failed to load lifecycle data');
        } finally {
            setLoading(false);
        }
    };

    if (!user?.is_pro) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
                <div className="glass-morphism p-12 rounded-[3rem] border border-white/10 max-w-xl text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-primary-500/10 text-primary-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Timer size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Auto-Expiry Suite</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        The Advanced Link Lifecycle management suite is an exclusive Pro feature. Set auto-destruct dates and click limits to manage your temporary campaigns automatically.
                    </p>
                    <Link 
                        to="/go-pro"
                        className="w-full py-4 premium-gradient text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-primary-500/20"
                    >
                        Upgrade to Pro
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-10">
            <header className="space-y-1">
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    <Hourglass className="text-blue-400" size={32} /> Link Lifecycle
                </h1>
                <p className="text-slate-400 text-sm">Monitor and manage self-destructing links and campaign lifespans.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {links.map((link, i) => {
                    const isExpired = link.expiry_date && new Date(link.expiry_date) < new Date();
                    const isMaxed = link.max_clicks && link.clicks >= link.max_clicks;

                    return (
                        <motion.div 
                            key={link._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`glass-morphism p-8 rounded-[3rem] border border-white/10 space-y-6 relative overflow-hidden group ${isExpired || isMaxed ? 'grayscale' : ''}`}
                        >
                            {(isExpired || isMaxed) && (
                                <div className="absolute top-0 right-0 p-3 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-2xl">
                                    Expired / Inactive
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isExpired || isMaxed ? 'bg-slate-800 text-slate-500' : 'bg-blue-500/10 text-blue-400'}`}>
                                    <Clock size={24} />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-black text-white truncate w-40">/{link.short_code}</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Asset ID: {link._id.substring(0,8)}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {link.expiry_date && (
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-blue-400" />
                                            <span className="text-xs font-bold text-slate-300">Expiry Date</span>
                                        </div>
                                        <span className={`text-xs font-black ${isExpired ? 'text-red-400' : 'text-white'}`}>
                                            {new Date(link.expiry_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}

                                {link.max_clicks && (
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Zap size={14} className="text-yellow-400" />
                                            <span className="text-xs font-bold text-slate-300">Click Limit</span>
                                        </div>
                                        <span className={`text-xs font-black ${isMaxed ? 'text-red-400' : 'text-white'}`}>
                                            {link.clicks} / {link.max_clicks}
                                        </span>
                                    </div>
                                )}
                                {(!link.expiry_date && !link.max_clicks) && (
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle size={14} className="text-slate-400" />
                                            <span className="text-xs font-bold text-slate-400">No lifecycle rules set</span>
                                        </div>
                                        <button 
                                            onClick={() => { setSelectedLink(link); setSettingsModalOpen(true); }}
                                            className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/20 transition-colors"
                                        >
                                            Configure
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <Link to={`/analytics/${link._id}`} className="text-[10px] font-black text-primary-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                                    Audit Data <ArrowRight size={12} />
                                </Link>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => { setSelectedLink(link); setSettingsModalOpen(true); }}
                                        className="p-1 rounded hover:bg-white/10 text-slate-400 transition-colors tooltip"
                                        title="Configure Settings"
                                    >
                                        <Settings2 size={14} />
                                    </button>
                                    {link.password && <Shield size={14} className="text-red-400" title="Password Protected" />}
                                    <AlertCircle size={14} className={isExpired || isMaxed ? 'text-red-400' : 'text-emerald-400'} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {links.length === 0 && !loading && (
                    <div className="col-span-full py-32 glass-morphism rounded-[3rem] border border-white/5 border-dashed text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-700">
                            <Hourglass size={32} />
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No links found</p>
                        <Link to="/dashboard" className="text-primary-400 text-xs font-black underline">Go create your first link!</Link>
                    </div>
                )}
            </div>

            {selectedLink && (
                <AdvancedSettingsModal 
                    isOpen={settingsModalOpen}
                    onClose={() => setSettingsModalOpen(false)}
                    link={selectedLink}
                    onUpdate={(updatedLink) => {
                        setLinks(links.map(l => l._id === updatedLink._id ? updatedLink : l));
                    }}
                />
            )}
        </div>
    );
};

export default LinkLifecycle;
