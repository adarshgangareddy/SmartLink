import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Globe, Smartphone, Zap, Shield, Image as ImageIcon, Plus, Trash2, Sliders, AlertCircle, BarChart3 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdvancedSettingsModal = ({ isOpen, onClose, link, onUpdate }) => {
  const [formData, setFormData] = useState({
    smart_redirect_geo: link.smart_redirect_geo || {},
    smart_redirect_os: link.smart_redirect_os || {},
    ab_targets: link.ab_targets || [],
    webhook_url: link.webhook_url || '',
    max_clicks: link.max_clicks || '',
    expiry_date: link.expiry_date ? new Date(link.expiry_date).toISOString().split('T')[0] : '',
    show_splash_screen: link.show_splash_screen || false,
    splash_logo_url: link.splash_logo_url || '',
    retargeting_pixels: link.retargeting_pixels || []
  });

  const [activeTab, setActiveTab] = useState('routing'); // routing, limits, engagement
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await axios.put(`/api/links/link/${link._id}`, {
          ...formData,
          max_clicks: formData.max_clicks ? parseInt(formData.max_clicks) : null,
          expiry_date: formData.expiry_date || null
      });
      toast.success('Settings updated successfully!');
      onUpdate(res.data);
      onClose();
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const addABTarget = () => {
    setFormData({
        ...formData,
        ab_targets: [...formData.ab_targets, { url: '', weight: 10 }]
    });
  };

  const removeABTarget = (index) => {
    const newTargets = [...formData.ab_targets];
    newTargets.splice(index, 1);
    setFormData({ ...formData, ab_targets: newTargets });
  };

  const updateABTarget = (index, field, value) => {
    const newTargets = [...formData.ab_targets];
    newTargets[index][field] = value;
    setFormData({ ...formData, ab_targets: newTargets });
  };

  const addGeoRoute = (country, url) => {
      setFormData({
          ...formData,
          smart_redirect_geo: { ...formData.smart_redirect_geo, [country]: url }
      });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative w-full max-w-4xl glass-morphism border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <header className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-400">
                    <Sliders size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">SmartLink Intelligence</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Advanced Configuration Page</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-slate-400 transition-colors">
                <X size={24} />
            </button>
        </header>

        {/* Tabs */}
        <div className="flex px-8 py-4 gap-8 border-b border-white/5 bg-slate-950/50">
            {[
                { id: 'routing', label: 'Traffic Routing', icon: <Globe size={16} /> },
                { id: 'limits', label: 'Lifecycle & Security', icon: <Shield size={16} /> },
                { id: 'engagement', label: 'Brand & engagement', icon: <Zap size={16} /> },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-2 font-bold text-sm transition-all relative ${activeTab === tab.id ? 'text-primary-400' : 'text-slate-500 hover:text-white'}`}
                >
                    {tab.icon}
                    {tab.label}
                    {activeTab === tab.id && <motion.div layoutId="tab-active" className="absolute -bottom-4 left-0 right-0 h-1 bg-primary-500 rounded-full" />}
                </button>
            ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
            {activeTab === 'routing' && (
                <div className="space-y-10">
                    {/* A/B Testing Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <BarChart3 className="text-primary-400" size={18} /> A/B Rotator
                                </h3>
                                <p className="text-xs text-slate-500">Distribute traffic across multiple destinations based on weight.</p>
                            </div>
                            <button onClick={addABTarget} className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 text-primary-400 rounded-xl font-bold text-xs hover:bg-primary-500/20 transition-all">
                                <Plus size={14} /> Add Variant
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {formData.ab_targets.map((target, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <input 
                                        type="url"
                                        placeholder="Variant URL"
                                        className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white"
                                        value={target.url}
                                        onChange={(e) => updateABTarget(idx, 'url', e.target.value)}
                                    />
                                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase">Weight</label>
                                        <input 
                                            type="number"
                                            className="w-12 bg-transparent text-center text-primary-400 font-bold focus:outline-none text-sm"
                                            value={target.weight}
                                            onChange={(e) => updateABTarget(idx, 'weight', e.target.value)}
                                        />
                                        <span className="text-[10px] text-slate-500">%</span>
                                    </div>
                                    <button onClick={() => removeABTarget(idx)} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {formData.ab_targets.length === 0 && (
                                <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-3xl">
                                    <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">No active A/B experiments</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Geo & OS Routing Section */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Globe className="text-blue-400" size={18} /> Geo Intelligence
                            </h3>
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">US Redirect</label>
                                    <input 
                                        type="url"
                                        className="w-full bg-slate-950 p-3 rounded-xl border border-white/5 text-xs text-white placeholder:text-slate-700"
                                        placeholder="https://us.yourshop.com"
                                        value={formData.smart_redirect_geo.US || ''}
                                        onChange={(e) => setFormData({...formData, smart_redirect_geo: {...formData.smart_redirect_geo, US: e.target.value}})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">IN Redirect</label>
                                    <input 
                                        type="url"
                                        className="w-full bg-slate-950 p-3 rounded-xl border border-white/5 text-xs text-white placeholder:text-slate-700"
                                        placeholder="https://in.yourshop.com"
                                        value={formData.smart_redirect_geo.IN || ''}
                                        onChange={(e) => setFormData({...formData, smart_redirect_geo: {...formData.smart_redirect_geo, IN: e.target.value}})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Smartphone className="text-emerald-400" size={18} /> OS Intelligence
                            </h3>
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">iOS Redirect</label>
                                    <input 
                                        type="url"
                                        className="w-full bg-slate-950 p-3 rounded-xl border border-white/5 text-xs text-white placeholder:text-slate-700"
                                        placeholder="App Store URL"
                                        value={formData.smart_redirect_os.iOS || ''}
                                        onChange={(e) => setFormData({...formData, smart_redirect_os: {...formData.smart_redirect_os, iOS: e.target.value}})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Android Redirect</label>
                                    <input 
                                        type="url"
                                        className="w-full bg-slate-950 p-3 rounded-xl border border-white/5 text-xs text-white placeholder:text-slate-700"
                                        placeholder="Play Store URL"
                                        value={formData.smart_redirect_os.Android || ''}
                                        onChange={(e) => setFormData({...formData, smart_redirect_os: {...formData.smart_redirect_os, Android: e.target.value}})}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'limits' && (
                <div className="space-y-10">
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white flex items-center gap-2">
                                <Zap className="text-yellow-400" size={16} /> Maximum Click Limit
                            </label>
                            <input 
                                type="number"
                                placeholder="Infinite"
                                className="w-full bg-slate-950 p-4 rounded-2xl border border-white/10 text-white"
                                value={formData.max_clicks}
                                onChange={(e) => setFormData({...formData, max_clicks: e.target.value})}
                            />
                            <p className="text-[10px] text-slate-500 font-medium">Link will deactivate automatically once reached.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white flex items-center gap-2">
                                <Calendar className="text-blue-400" size={16} /> Auto-Expiry Date
                            </label>
                            <input 
                                type="date"
                                className="w-full bg-slate-950 p-4 rounded-2xl border border-white/10 text-white"
                                value={formData.expiry_date}
                                onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                            />
                            <p className="text-[10px] text-slate-500 font-medium">Link will expire at 00:00 UTC on this day.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Send className="text-purple-400" size={18} /> Industrial Webhooks
                            </h3>
                            <div className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase border border-emerald-500/20 tracking-widest">Active</div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                            <input 
                                type="url"
                                className="w-full bg-slate-950 p-4 rounded-2xl border border-white/10 text-xs text-white font-mono"
                                placeholder="https://api.yoursystem.com/webhooks/clicks"
                                value={formData.webhook_url}
                                onChange={(e) => setFormData({...formData, webhook_url: e.target.value})}
                            />
                            <div className="mt-4 flex items-center gap-3 text-slate-500">
                                <AlertCircle size={14} />
                                <p className="text-[10px] font-medium leading-relaxed">System will send a POST request with detailed interaction analytics on every successful scan/redirect.</p>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'engagement' && (
                <div className="space-y-10">
                    <section className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2.5rem] border border-white/5">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-white">Branded Splash Screen</h3>
                                <p className="text-xs text-slate-500">Show an intermediate page with your logo or ads.</p>
                            </div>
                            <button 
                                onClick={() => setFormData({...formData, show_splash_screen: !formData.show_splash_screen})}
                                className={`w-14 h-8 rounded-full relative transition-all ${formData.show_splash_screen ? 'bg-primary-500' : 'bg-slate-800'}`}
                            >
                                <motion.div 
                                    animate={{ x: formData.show_splash_screen ? 26 : 4 }}
                                    className="absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-lg"
                                />
                            </button>
                        </div>

                        {formData.show_splash_screen && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-8 bg-slate-900 rounded-[2.5rem] border border-primary-500/20 space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Splash Logo URL</label>
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                            {formData.splash_logo_url ? <img src={formData.splash_logo_url} className="w-full h-full object-contain" /> : <ImageIcon className="text-slate-700" />}
                                        </div>
                                        <input 
                                            type="url"
                                            className="flex-1 bg-slate-950 p-4 rounded-xl border border-white/10 text-white text-xs"
                                            placeholder="https://brand.com/logo.png"
                                            value={formData.splash_logo_url}
                                            onChange={(e) => setFormData({...formData, splash_logo_url: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </section>

                    <section className="space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-white">Pixel Retargeting Suite</h3>
                            <p className="text-xs text-slate-500">Inject tracking scripts into your redirection flow.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['Facebook', 'Google', 'LinkedIn'].map(p => (
                                <div key={p} className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{p} Pixel</p>
                                    <input 
                                        type="text"
                                        placeholder="ID: 123456789"
                                        className="w-full bg-slate-950 p-3 rounded-xl border border-white/5 text-[10px] text-white"
                                        // This would ideally manage a list, for now mockup
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>

        {/* Footer */}
        <footer className="p-8 border-t border-white/5 bg-slate-950/80 backdrop-blur-md flex justify-end gap-4">
            <button 
                onClick={onClose}
                className="px-8 py-3 text-slate-400 font-bold text-sm hover:text-white transition-colors"
            >
                Discard
            </button>
            <button 
                onClick={handleSave}
                disabled={loading}
                className="px-10 py-3 premium-gradient text-white font-bold rounded-2xl flex items-center gap-2 hover:scale-[1.05] transition-transform shadow-xl shadow-primary-500/20"
            >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Update link settings</>}
            </button>
        </footer>
      </motion.div>
    </div>
  );
};

export default AdvancedSettingsModal;
