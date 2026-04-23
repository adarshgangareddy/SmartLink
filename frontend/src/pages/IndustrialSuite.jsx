import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Key, Plus, Trash2, Copy, Check, Globe, Smartphone, BarChart3, ShieldCheck, Mail, Send, Loader2, Save, FileJson, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const IndustrialSuite = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('api'); // api, bulk, webhooks, analytics, automation
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [bulkUrls, setBulkUrls] = useState('');
  const [bulkResults, setBulkResults] = useState([]);
  const [copiedKey, setCopiedKey] = useState(null);

  // New Industrial State
  const [webhooks, setWebhooks] = useState([]);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState(['link_click']);
  const [industrialStats, setIndustrialStats] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [isRotating, setIsRotating] = useState(null);

  // Automation State
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({
    name: '',
    event_type: 'link_click',
    condition: { field: 'location', operator: '==', value: '' },
    action: 'trigger_webhook',
    action_target: ''
  });

  useEffect(() => {
    switch(activeTab) {
      case 'api': fetchApiKeys(); break;
      case 'webhooks': fetchWebhooks(); fetchWebhookLogs(); break;
      case 'analytics': fetchIndustrialStats(); break;
      case 'automation': fetchRules(); fetchWebhooks(); break;
    }
  }, [activeTab]);

  const fetchRules = async () => {
    try {
      const res = await axios.get('/api/industrial/rules');
      setRules(res.data);
    } catch (err) {}
  };

  const createRule = async () => {
    if (!newRule.name || !newRule.action_target) return toast.error('Please fill in all rule fields');
    try {
      setLoading(true);
      const res = await axios.post('/api/industrial/rules', newRule);
      setRules([...rules, res.data]);
      setNewRule({
        name: '',
        event_type: 'link_click',
        condition: { field: 'location', operator: '==', value: '' },
        action: 'trigger_webhook',
        action_target: ''
      });
      toast.success('Automation rule active');
    } catch (err) {
      toast.error('Failed to create rule');
    } finally {
      setLoading(false);
    }
  };

  const deleteRule = async (id) => {
    try {
      await axios.delete(`/api/industrial/rules/${id}`);
      setRules(rules.filter(r => r._id !== id));
      toast.success('Rule removed');
    } catch (err) {}
  };

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/industrial/keys');
      setApiKeys(res.data);
    } catch (err) {
      toast.error('Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  const fetchWebhooks = async () => {
    try {
      const res = await axios.get('/api/industrial/webhooks');
      setWebhooks(res.data);
    } catch (err) {}
  };

  const fetchWebhookLogs = async () => {
    try {
      const res = await axios.get('/api/industrial/webhooks/logs');
      setWebhookLogs(res.data);
    } catch (err) {}
  };

  const fetchIndustrialStats = async () => {
    try {
      const res = await axios.get('/api/industrial/stats');
      setIndustrialStats(res.data);
    } catch (err) {}
  };

  const createApiKey = async () => {
    if (!newKeyName) return toast.error('Please enter a key name');
    try {
      setLoading(true);
      const res = await axios.post('/api/industrial/keys', { name: newKeyName });
      setGeneratedKey(res.data.key);
      setShowKeyModal(true);
      setApiKeys([...apiKeys, res.data]);
      setNewKeyName('');
      toast.success('API Key generated successfully');
    } catch (err) {
      toast.error('Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  const deleteApiKey = async (id) => {
    if (!confirm('Are you sure you want to revoke this key? Any system using it will stop working immediately.')) return;
    try {
      await axios.delete(`/api/industrial/keys/${id}`);
      setApiKeys(apiKeys.filter(k => k._id !== id));
      toast.success('API Key revoked');
    } catch (err) {
      toast.error('Failed to revoke API key');
    }
  };

  const createWebhook = async () => {
    if (!newWebhookUrl) return toast.error('Please enter a Webhook URL');
    try {
      setLoading(true);
      const res = await axios.post('/api/industrial/webhooks', {
        url: newWebhookUrl,
        events: selectedEvents
      });
      setWebhooks([...webhooks, res.data]);
      setNewWebhookUrl('');
      toast.success('Webhook registered');
    } catch (err) {
      toast.error('Failed to register webhook');
    } finally {
      setLoading(false);
    }
  };

  const deleteWebhook = async (id) => {
    try {
      await axios.delete(`/api/industrial/webhooks/${id}`);
      setWebhooks(webhooks.filter(w => w._id !== id));
      toast.success('Webhook removed');
    } catch (err) {}
  };

  const downloadBulkResults = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Original URL,Short URL\n"
      + bulkResults.map(r => `${r.original_url},${window.location.origin}/${r.short_code}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "smartlink_bulk_export.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      // Extract anything that looks like a URL
      const urls = text.split(/[\s,]+/).filter(u => u.trim().startsWith('http'));
      if (urls.length > 0) {
        setBulkUrls(urls.join('\n'));
        toast.success(`Extracted ${urls.length} URLs from file`);
      } else {
        toast.error('No valid URLs found in file');
      }
    };
    reader.readAsText(file);
  };

  const handleBulkShorten = async () => {
    const urls = bulkUrls.split('\n').filter(u => u.trim().startsWith('http'));
    if (urls.length === 0) return toast.error('No valid URLs found');
    
    try {
      setLoading(true);
      const payload = urls.map(u => ({ original_url: u.trim() }));
      const res = await axios.post('/api/industrial/bulk', payload);
      setBulkResults(res.data);
      toast.success(`Generated ${res.data.length} links!`);
    } catch (err) {
      toast.error('Bulk generation failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 font-bold text-[10px] tracking-widest uppercase"
            >
                <Zap size={12} /> Industrial Suite
            </motion.div>
            <h1 className="text-4xl font-extrabold text-white">Advanced Control Plane</h1>
            <p className="text-slate-500 max-w-xl">Issue secure tokens, manage bulk operations, and integrate SmartLink directly into your IoT devices or enterprise apps.</p>
        </div>
        
        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 self-start overflow-x-auto">
            {[
                { id: 'api', label: 'API Keys', icon: <Key size={16} /> },
                { id: 'bulk', label: 'Bulk Engine', icon: <FileJson size={16} /> },
                { id: 'webhooks', label: 'Webhooks', icon: <Send size={16} /> },
                { id: 'automation', label: 'Automations', icon: <Cpu size={16} /> },
                { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>
      </header>

      {/* Stats Quick Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Keys', value: apiKeys.length, icon: <Key size={16} />, color: 'primary' },
          { label: 'Webhooks', value: webhooks.length, icon: <Send size={16} />, color: 'emerald' },
          { label: 'API Requests (30d)', value: industrialStats?.total_requests || 0, icon: <Zap size={16} />, color: 'orange' },
          { label: 'Avg Latency', value: '42ms', icon: <Loader2 size={16} />, color: 'blue' },
        ].map(stat => (
          <div key={stat.label} className="glass-morphism p-4 rounded-2xl border border-white/5 flex items-center gap-4">
            <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-black text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'api' && (
          <motion.div 
            key="api"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Key Card */}
                <div className="lg:col-span-1 glass-morphism p-8 rounded-[2.5rem] border border-white/10 space-y-6 self-start">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Plus className="text-primary-400" /> New Token
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Key Name</label>
                            <input 
                                type="text"
                                placeholder="e.g. Production IoT Fleet"
                                className="w-full px-5 py-3.5 bg-slate-950 border border-white/10 rounded-2xl focus:border-primary-500 transition-colors text-white text-sm"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={createApiKey}
                            disabled={loading}
                            className="w-full py-4 premium-gradient text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> Generate Key</>}
                        </button>
                    </div>
                    <div className="p-4 rounded-xl bg-primary-400/5 border border-primary-400/10 space-y-2">
                        <div className="flex items-center gap-2 text-primary-400">
                             <ShieldCheck size={14} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Secret Vault Security</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                            SmartLink uses one-way SHA-256 hashing. We never store your raw keys. Once you close the reveal modal, the key cannot be recovered—only replaced.
                        </p>
                    </div>
                </div>

                {/* Keys List */}
                <div className="lg:col-span-2 space-y-6">
                    {loading && apiKeys.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                            <Loader2 className="animate-spin mb-4" size={32} />
                            <p>Loading your secure tokens...</p>
                        </div>
                    ) : apiKeys.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-500 glass-morphism rounded-[2.5rem] border border-white/5 border-dashed">
                            <Key size={48} className="mb-4 opacity-20" />
                            <p className="font-bold">No API keys generated yet.</p>
                        </div>
                    ) : (
                        apiKeys.map(key => (
                            <motion.div 
                                key={key._id}
                                layout
                                className="glass-morphism p-6 rounded-[2rem] border border-white/10 hover:border-white/20 transition-all group"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-white text-lg">{key.name}</h4>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                                            Created {new Date(key.created_at).toLocaleDateString()} • Last used {key.last_used ? new Date(key.last_used).toLocaleDateString() : 'Never'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <div className="flex-1 md:flex-none flex items-center gap-3 bg-slate-950 px-4 py-3 rounded-xl border border-white/5 font-mono text-xs text-primary-400 truncate max-w-[200px]">
                                            {key.key_prefix}••••••••••••
                                        </div>
                                        <button 
                                            onClick={() => copyToClipboard(key.key_prefix, key._id)}
                                            className="p-3 bg-white/5 rounded-xl hover:bg-primary-500/10 hover:text-primary-400 text-slate-400 transition-all"
                                        >
                                            <Copy size={18} />
                                        </button>
                                        <button 
                                            onClick={() => deleteApiKey(key._id)}
                                            className="p-3 bg-white/5 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Key Reveal Modal */}
            <AnimatePresence>
                {showKeyModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="glass-morphism max-w-lg w-full p-8 rounded-[2.5rem] border border-white/20 space-y-6 shadow-2xl"
                        >
                            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                                <ShieldCheck size={40} className="text-emerald-400" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold text-white">Your New API Key</h3>
                                <p className="text-slate-500 text-sm">Copy this key now. For your security, it will not be shown again.</p>
                            </div>
                            
                            <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 font-mono text-sm text-primary-400 break-all flex items-center justify-between gap-4">
                                {generatedKey}
                                <button 
                                    onClick={() => copyToClipboard(generatedKey, 'new-key')}
                                    className="p-3 bg-white/5 rounded-xl hover:bg-primary-500 text-white transition-all shrink-0"
                                >
                                    <Copy size={18} />
                                </button>
                            </div>

                            <button 
                                onClick={() => setShowKeyModal(false)}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-colors"
                            >
                                I've saved it securely
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
          </motion.div>
        )}

        {activeTab === 'bulk' && (
          <motion.div 
            key="bulk"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="glass-morphism p-10 rounded-[3rem] border border-white/10 space-y-8">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                    <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
                        <Smartphone size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">Bulk Link Processor</h3>
                        <p className="text-slate-500 text-sm">Convert thousands of URLs into SmartLinks instantly.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Input (One URL per line)</label>
                            <label className="cursor-pointer text-[10px] text-primary-400 uppercase font-black hover:text-white transition-colors flex items-center gap-1">
                                <Plus size={10} /> Upload CSV/TXT
                                <input type="file" className="hidden" accept=".csv,.txt" onChange={handleFileUpload} />
                            </label>
                        </div>
                        <textarea 
                            className="w-full h-80 bg-slate-950/50 border border-white/10 rounded-[2rem] p-6 focus:border-primary-500 transition-colors text-white text-sm font-mono custom-scrollbar resize-none"
                            placeholder="https://example.com/product-1&#10;https://example.com/product-2"
                            value={bulkUrls}
                            onChange={(e) => setBulkUrls(e.target.value)}
                        />
                        <button 
                            onClick={handleBulkShorten}
                            disabled={loading}
                            className="w-full py-5 premium-gradient text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.01] transition-all shadow-xl shadow-primary-500/20"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : <><Zap size={24} /> Process Link Fleet</>}
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Results Output</label>
                            {bulkResults.length > 0 && (
                                <button 
                                    onClick={downloadBulkResults}
                                    className="text-[10px] font-bold text-primary-400 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors"
                                >
                                    <FileJson size={14} /> Download CSV
                                </button>
                            )}
                        </div>
                        <div className="w-full h-[400px] bg-slate-950/20 border border-white/5 rounded-[2rem] overflow-hidden">
                            {bulkResults.length > 0 ? (
                                <div className="h-full overflow-y-auto p-6 space-y-3 custom-scrollbar">
                                    {bulkResults.map((res, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                            <span className="text-xs text-slate-400 truncate max-w-[200px]">{res.original_url}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-primary-400 font-bold font-mono">/{res.short_code}</span>
                                                <button onClick={() => copyToClipboard(`https://slnk.co/${res.short_code}`, i)} className="p-1.5 hover:text-white transition-colors">
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600/50">
                                    <FileJson size={64} className="mb-4 opacity-10" />
                                    <p className="text-sm font-bold uppercase tracking-widest">Queue Empty</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'webhooks' && (
          <motion.div 
            key="webhooks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Webhook Config */}
                <div className="lg:col-span-1 glass-morphism p-8 rounded-[2.5rem] border border-white/10 space-y-6 self-start">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Plus className="text-primary-400" /> New Webhook
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Endpoint URL</label>
                            <input 
                                type="url"
                                placeholder="https://your-app.com/webhooks"
                                className="w-full px-5 py-3.5 bg-slate-950 border border-white/10 rounded-2xl focus:border-primary-500 transition-colors text-white text-sm"
                                value={newWebhookUrl}
                                onChange={(e) => setNewWebhookUrl(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Events to track</label>
                            <div className="flex flex-wrap gap-2">
                                {['link_click', 'scan', 'api_call'].map(ev => (
                                    <button
                                        key={ev}
                                        onClick={() => {
                                            if (selectedEvents.includes(ev)) setSelectedEvents(selectedEvents.filter(x => x !== ev));
                                            else setSelectedEvents([...selectedEvents, ev]);
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedEvents.includes(ev) ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-400'}`}
                                    >
                                        {ev}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button 
                            onClick={createWebhook}
                            disabled={loading}
                            className="w-full py-4 premium-gradient text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Subscribe</>}
                        </button>
                    </div>
                </div>

                {/* Active Webhooks & Logs */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Webhooks</h4>
                        {webhooks.length === 0 ? (
                            <div className="p-10 glass-morphism rounded-[2rem] border border-white/5 border-dashed text-center text-slate-600">
                                No webhooks registered yet.
                            </div>
                        ) : (
                            webhooks.map(wh => (
                                <div key={wh._id} className="glass-morphism p-5 rounded-[1.5rem] border border-white/10 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-mono text-primary-400">{wh.url}</p>
                                        <div className="flex gap-2">
                                            {wh.events.map(ev => (
                                                <span key={ev} className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-slate-500 font-bold uppercase">{ev}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={() => deleteWebhook(wh._id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Live Delivery Logs</h4>
                            <button onClick={fetchWebhookLogs} className="text-[10px] text-primary-400 font-bold uppercase hover:text-white transition-colors">Refresh</button>
                        </div>
                        <div className="glass-morphism rounded-[2rem] border border-white/10 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Event</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Result</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {webhookLogs.map(log => (
                                        <tr key={log._id} className="hover:bg-white/2 transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-white">{log.event_type}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-slate-400">{log.response_code}</td>
                                            <td className="px-6 py-4 text-[10px] text-slate-500 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                        </tr>
                                    ))}
                                    {webhookLogs.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-slate-600 text-xs">No activity logged yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div 
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Usage Chart */}
            <div className="glass-morphism p-8 md:p-12 rounded-[3.5rem] border border-white/10 space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white">Usage monitoring</h3>
                  <p className="text-slate-500 text-sm">Industrial API request volume across all keys.</p>
                </div>
                <div className="flex gap-2">
                  {['24h', '7d', '30d'].map(p => (
                    <button key={p} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${p === '30d' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'text-slate-500 hover:text-white'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[400px] w-full mt-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={industrialStats?.requests_by_day?.length > 0 ? industrialStats.requests_by_day : [
                    { date: 'No Data', reqs: 0 }
                  ]}>
                    <defs>
                      <linearGradient id="colorReqs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                        dataKey="date" 
                        stroke="#475569" 
                        fontSize={10} 
                        fontWeight="bold" 
                        axisLine={false} 
                        tickLine={false} 
                        dy={10}
                    />
                    <YAxis 
                        stroke="#475569" 
                        fontSize={10} 
                        fontWeight="bold" 
                        axisLine={false} 
                        tickLine={false} 
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#020617', border: '1px solid #ffffff10', borderRadius: '12px' }}
                        itemStyle={{ color: '#6366f1' }}
                    />
                    <Area type="monotone" dataKey="reqs" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorReqs)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/10 space-y-6">
                 <h4 className="text-lg font-bold text-white flex items-center gap-2">
                   <Globe className="text-primary-400" /> Top Endpoints
                 </h4>
                 <div className="space-y-4">
                   {(industrialStats?.top_endpoints || [
                     { path: '/api/links/shorten', count: 1200 },
                     { path: '/api/industrial/keys', count: 800 },
                     { path: '/api/industrial/stats', count: 450 }
                   ]).map((ep, i) => (
                     <div key={i} className="flex items-center justify-between">
                       <span className="text-sm font-mono text-slate-400">{ep.path}</span>
                       <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-black text-white">{ep.count}</span>
                     </div>
                   ))}
                 </div>
              </div>
              
              <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/10 space-y-6">
                 <h4 className="text-lg font-bold text-white flex items-center gap-2">
                   <ShieldCheck className="text-emerald-400" /> Webhook Health
                 </h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Success Rate</p>
                        <p className="text-3xl font-black text-white">99.8%</p>
                    </div>
                    <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl text-center">
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Avg Failures</p>
                        <p className="text-3xl font-black text-white">2/day</p>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'automation' && (
          <motion.div 
            key="automation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rule Builder */}
                <div className="lg:col-span-1 glass-morphism p-8 rounded-[2.5rem] border border-white/10 space-y-6 self-start">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Cpu className="text-primary-400" /> New Rule
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Rule Name</label>
                            <input 
                                type="text"
                                placeholder="VIP Alert"
                                className="w-full px-5 py-3.5 bg-slate-950 border border-white/10 rounded-2xl focus:border-primary-500 transition-colors text-white text-sm"
                                value={newRule.name}
                                onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">When this happens...</label>
                            <select 
                                className="w-full px-5 py-3.5 bg-slate-950 border border-white/10 rounded-2xl focus:border-primary-500 transition-colors text-white text-sm"
                                value={newRule.event_type}
                                onChange={(e) => setNewRule({...newRule, event_type: e.target.value})}
                            >
                                <option value="link_click">Link Clicked</option>
                                <option value="scan">QR Scanned</option>
                                <option value="api_call">API Call made</option>
                            </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">If field...</label>
                                <select 
                                    className="w-full px-3 py-3 bg-slate-950 border border-white/10 rounded-xl text-white text-xs"
                                    value={newRule.condition.field}
                                    onChange={(e) => setNewRule({...newRule, condition: {...newRule.condition, field: e.target.value}})}
                                >
                                    <option value="location">Country</option>
                                    <option value="device">Device Type</option>
                                    <option value="os">OS Name</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Matches...</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. IN or iOS"
                                    className="w-full px-3 py-3 bg-slate-950 border border-white/10 rounded-xl text-white text-xs"
                                    value={newRule.condition.value}
                                    onChange={(e) => setNewRule({...newRule, condition: {...newRule.condition, value: e.target.value}})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Then do this...</label>
                            <select 
                                className="w-full px-5 py-3.5 bg-slate-950 border border-white/10 rounded-2xl focus:border-primary-500 transition-colors text-white text-sm"
                                value={newRule.action_target}
                                onChange={(e) => setNewRule({...newRule, action_target: e.target.value})}
                            >
                                <option value="">Select Webhook...</option>
                                {webhooks.map(wh => (
                                    <option key={wh._id} value={wh._id}>Trigger Webhook: {wh.url.substring(0, 30)}...</option>
                                ))}
                            </select>
                        </div>

                        <button 
                            onClick={createRule}
                            disabled={loading}
                            className="w-full py-4 premium-gradient text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-primary-500/20"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Zap size={20} /> Activate Logic</>}
                        </button>
                    </div>
                </div>

                {/* Active Rules List */}
                <div className="lg:col-span-2 space-y-6">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Automation Rules</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {rules.map(rule => (
                            <div key={rule._id} className="glass-morphism p-6 rounded-[2rem] border border-white/10 space-y-4 relative group">
                                <button 
                                    onClick={() => deleteRule(rule._id)}
                                    className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-slate-500 opacity-0 group-hover:opacity-100 transition-all hover:text-red-400"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-400">
                                        <Play size={20} />
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold">{rule.name}</h5>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{rule.event_type}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 text-xs text-slate-400">
                                    <p>IF <span className="text-primary-400 font-mono">{rule.condition.field}</span> {rule.condition.operator} <span className="text-primary-400 font-mono">'{rule.condition.value}'</span></p>
                                    <div className="my-2 h-px bg-white/5" />
                                    <p>THEN <span className="text-emerald-400 font-bold uppercase">Trigger Webhook</span></p>
                                </div>
                            </div>
                        ))}
                        {rules.length === 0 && (
                            <div className="md:col-span-2 p-20 glass-morphism rounded-[3rem] border border-white/5 border-dashed text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-600">
                                    <Cpu size={32} />
                                </div>
                                <p className="text-slate-500 text-sm">No automation rules configured. Build your first trigger above.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IndustrialSuite;
