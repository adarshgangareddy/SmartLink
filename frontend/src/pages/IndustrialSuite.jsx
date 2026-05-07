import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Key, Plus, Trash2, Copy, Check, Globe, Smartphone, BarChart3, ShieldCheck, Mail, Send, Loader2, Save, FileJson, AlertCircle, Cpu, Activity, Droplets, Thermometer, Power, RefreshCw, LayoutDashboard, Info, Wind, CloudRain, Eye, BookOpen, X, Cloud, Sun, Navigation } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const IndustrialSuite = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user?.is_pro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="glass-morphism p-12 rounded-[3rem] border border-white/10 max-w-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary-500/10 text-primary-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Globe size={40} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">SmartLink Pro Feature</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            The Industrial IoT Control Suite is an exclusive Pro feature. Please upgrade your account to get full access to IoT Fleet Management, Secure API Tokens, Bulk Links, Webhooks, and advanced automations.
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

  const [activeTab, setActiveTab] = useState('projects'); // projects, api, bulk, webhooks, analytics, automation
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

  // IoT / Device State
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceEvents, setDeviceEvents] = useState([]);
  const [newDevice, setNewDevice] = useState({ name: '', metadata: { type: 'irrigation', widgets: ['moisture', 'temp', 'electricity', 'motor', 'lighting', 'fencing', 'cctv', 'sprinkler', 'fan', 'heater', 'siren'] } });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [docsContent, setDocsContent] = useState(null);

  // Weather Station State
  const [weatherData, setWeatherData] = useState(null);
  const [weatherCity, setWeatherCity] = useState('Bengaluru');
  const [weatherLoading, setWeatherLoading] = useState(false);

  const [envData, setEnvData] = useState(null);
  const [envLoading, setEnvLoading] = useState(false);
  const [envError, setEnvError] = useState(null);


  const availableWidgets = [
    { id: 'moisture', label: 'Soil Moisture', icon: <Droplets size={14} />, color: 'emerald' },
    { id: 'temp', label: 'Ambient Temp', icon: <Thermometer size={14} />, color: 'orange' },
    { id: 'humidity', label: 'Air Humidity', icon: <Activity size={14} />, color: 'blue' },
    { id: 'light', label: 'Light Level', icon: <Zap size={14} />, color: 'yellow' },
    { id: 'electricity', label: 'Electricity', icon: <Power size={14} />, color: 'indigo' },
    { id: 'weather', label: 'Weather Station', icon: <Cloud size={14} />, color: 'sky' },
    { id: 'motor', label: 'Water Motor', icon: <Power size={14} />, color: 'teal' },
    { id: 'lighting', label: 'Main Lights', icon: <Zap size={14} />, color: 'amber' },
    { id: 'fencing', label: 'Electricity Fencing', icon: <ShieldCheck size={14} />, color: 'red' },
    { id: 'cctv', label: 'CCTV Monitoring', icon: <Eye size={14} />, color: 'purple' },
    { id: 'sprinkler', label: 'Sprinkler System', icon: <CloudRain size={14} />, color: 'cyan' },
    { id: 'fan', label: 'Fan / Ventilation', icon: <Wind size={14} />, color: 'teal' },
    { id: 'heater', label: 'Heater System', icon: <Thermometer size={14} />, color: 'orange' },
    { id: 'siren', label: 'Alarm Siren', icon: <AlertCircle size={14} />, color: 'rose' },
    { id: 'gate', label: 'Security Gate', icon: <Key size={14} />, color: 'amber' },
    { id: 'solar', label: 'Solar Tracking', icon: <Sun size={14} />, color: 'yellow' },
    { id: 'battery', label: 'Backup Battery', icon: <Zap size={14} />, color: 'emerald' },
  ];



  useEffect(() => {
    switch(activeTab) {
      case 'api': fetchApiKeys(); break;
      case 'webhooks': fetchWebhooks(); fetchWebhookLogs(); break;
      case 'analytics': fetchIndustrialStats(); break;
      case 'automation': fetchRules(); fetchWebhooks(); break;
      case 'projects': fetchDevices(); fetchApiKeys(); break;
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedDevice) {
      fetchDeviceEvents(selectedDevice._id);
      const interval = setInterval(() => fetchDeviceEvents(selectedDevice._id), 5000);
      // Also fetch weather for weather station type
      if (selectedDevice.metadata?.type === 'weather') {
        fetchWeatherData(selectedDevice.metadata?.city || weatherCity);
        const wInterval = setInterval(() => fetchWeatherData(selectedDevice.metadata?.city || weatherCity), 60000);
        return () => { clearInterval(interval); clearInterval(wInterval); };
      }
      return () => clearInterval(interval);
    }
  }, [selectedDevice]);

  const fetchWeatherData = async (city = weatherCity) => {
    try {
      setWeatherLoading(true);
      const res = await axios.get(`/api/industrial/weather?city=${encodeURIComponent(city)}`);
      setWeatherData(res.data);
    } catch (err) {
      console.error('Weather fetch failed:', err);
      toast.error('Could not fetch weather data. Check your connection.');
    } finally {
      setWeatherLoading(false);
    }
  };

  const openDocsModal = async () => {
    setShowDocsModal(true);
    if (!docsContent) {
      try {
        const res = await axios.get('/api/industrial/docs/full');
        setDocsContent(res.data);
      } catch (err) {
        console.error('Failed to load docs:', err);
        // Provide inline fallback docs
        setDocsContent({
          auth: {
            method: "API Key",
            header: "X-API-Key: <your_key>",
            description: "Include your API key in every request header. Generate keys in the Industrial Suite → API Keys tab."
          },
          endpoints: [
            { method: "POST", path: "/api/links/shorten", desc: "Shorten a single URL", body: { original_url: "https://your-long-url.com" }, response: { short_code: "abc12" } },
            { method: "POST", path: "/api/industrial/bulk", desc: "Bulk shorten up to 100 URLs", body: [{ original_url: "https://example.com" }] },
            { method: "POST", path: "/api/industrial/devices/{id}/events", desc: "Send sensor data from IoT device (ESP32, Arduino)", body: { moisture: 45, temp: 28.5, humidity: 65 } },
            { method: "GET", path: "/api/industrial/devices/{id}/commands/next", desc: "Poll for next pending command (hardware devices)", response: { command: { pump: "on" } } },
            { method: "GET", path: "/api/industrial/weather", desc: "Live weather: temperature, humidity, AQI, rainfall", response: { temperature: 28.5, humidity: 65, aqi: 2, aqi_label: "Fair" } },
            { method: "GET", path: "/api/industrial/stats", desc: "Industrial analytics — API request volume, top endpoints" },
            { method: "POST", path: "/api/industrial/webhooks", desc: "Register webhook for real-time event notifications", body: { url: "https://your-server.com/hook", events: ["link_click"] } },
            { method: "POST", path: "/api/industrial/rules", desc: "Create If-This-Then-That automation rule", body: { name: "Alert India Click", event_type: "link_click", condition: { field: "location", operator: "==", value: "IN" }, action: "trigger_webhook", action_target: "<webhook_id>" } }
          ],
          arduino_example: {
            description: "ESP32 code to send sensor data every 30 seconds",
            code: `#include <WiFi.h>\n#include <HTTPClient.h>\n\nconst char* ssid = "YOUR_WIFI";\nconst char* password = "YOUR_PASS";\nconst char* apiKey = "YOUR_API_KEY";\nconst char* deviceId = "YOUR_DEVICE_ID";\n\nvoid loop() {\n  HTTPClient http;\n  String url = "http://YOUR_SERVER/api/industrial/devices/" + String(deviceId) + "/events";\n  http.begin(url);\n  http.addHeader("Content-Type", "application/json");\n  http.addHeader("X-API-Key", apiKey);\n  \n  float moisture = analogRead(34) / 40.96;\n  float temp = 28.5;\n  \n  String body = "{\\"moisture\\":" + String(moisture) + ",\\"temp\\":" + String(temp) + "}";\n  http.POST(body);\n  http.end();\n  delay(30000);\n}`
          }
        });
      }
    }
  };

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/industrial/devices');
      setDevices(res.data);
    } catch (err) {} finally { setLoading(false); }
  };

  const createDevice = async () => {
    if (!newDevice.name) return toast.error('Please enter a project name');
    try {
      setLoading(true);
      const res = await axios.post('/api/industrial/devices', {
        name: newDevice.name,
        api_key_id: apiKeys[0]?._id || '', // Use first key or placeholder
        metadata: newDevice.metadata
      });
      setDevices([...devices, res.data]);
      setNewDevice({ name: '', metadata: { type: 'irrigation' } });
      toast.success('IoT Project initialized');
    } catch (err) {
      toast.error('Failed to create project');
    } finally { setLoading(false); }
  };

  const fetchDeviceEvents = async (id) => {
    try {
      // 1. Fetch simulation data (Live Sensor Data)
      const simRes = await axios.get(`/api/industrial/devices/${id}/data`);
      const simData = simRes.data;
      
      // 2. Fetch event history from database
      const res = await axios.get(`/api/industrial/devices/${id}/events`);
      
      // 3. Create a 'live' event from simulation data to show in charts/widgets
      const liveEvent = {
        _id: 'sim-' + Date.now(),
        timestamp: simData.timestamp,
        data: {
          moisture: simData.moisture,
          temp: simData.temperature,
          humidity: simData.humidity || 55, // Simulation fallback
          pump: simData.pump
        }
      };
      
      // Merge live data at the top of the history list
      setDeviceEvents([liveEvent, ...res.data]);

      // 4. Update the local pump status in UI if it changed in backend
      const serverPumpStatus = simData.pump.toLowerCase();
      if (selectedDevice?._id === id && selectedDevice.metadata?.pump_status !== serverPumpStatus) {
          setSelectedDevice(prev => ({
              ...prev,
              metadata: { ...prev.metadata, pump_status: serverPumpStatus }
          }));
      }
    } catch (err) {
      console.error("Polling failed:", err);
    }
  };

  const sendDeviceCommand = async (id, command) => {
    try {
      // If controlling the pump, use the simulation control endpoint
      if (command.pump) {
          await axios.post(`/api/industrial/devices/${id}/control`, { 
              pump: command.pump.toUpperCase() 
          });
      }
      
      // Also log the command in the database (standard workflow)
      await axios.post(`/api/industrial/devices/${id}/command`, command);
      
      toast.success(`Command sent: ${command.pump ? 'PUMP ' + command.pump.toUpperCase() : JSON.stringify(command)}`);
      
      // Immediate UI update for smooth experience
      const updatedDevices = devices.map(d => d._id === id ? { ...d, metadata: { ...d.metadata, ...command } } : d);
      setDevices(updatedDevices);
      if (selectedDevice?._id === id) {
        setSelectedDevice(updatedDevices.find(d => d._id === id));
      }
    } catch (err) {
      toast.error('Command delivery failed');
    }
  };

  const toggleWidgetState = async (widgetId) => {
    if (!selectedDevice) return;
    const key = `${widgetId}_status`;
    const currentStatus = selectedDevice.metadata?.[key] || 'off';
    const nextStatus = currentStatus === 'on' ? 'off' : 'on';
    const updatedMetadata = { ...selectedDevice.metadata, [key]: nextStatus };
    try {
      await axios.put(`/api/industrial/devices/${selectedDevice._id}`, { metadata: updatedMetadata });
      const updatedDevices = devices.map(d => d._id === selectedDevice._id ? { ...d, metadata: updatedMetadata } : d);
      setDevices(updatedDevices);
      setSelectedDevice({ ...selectedDevice, metadata: updatedMetadata });
      toast.success(`${widgetId.toUpperCase()} set to ${nextStatus.toUpperCase()}`);
    } catch (err) {
      toast.error(`Failed to update ${widgetId}`);
    }
  };

  const fetchEnvironmentalData = () => {
    setEnvLoading(true);
    setEnvError(null);
    if (!navigator.geolocation) {
      setEnvError("Geolocation is not supported by this browser.");
      setEnvLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=soil_moisture_0_to_1cm,precipitation`
          );
          if (!response.ok) {
            throw new Error(`Open-Meteo API failed with status: ${response.status}`);
          }
          const data = await response.json();
          const moisture = data.hourly?.soil_moisture_0_to_1cm?.[0];
          const precipitation = data.hourly?.precipitation?.[0];

          if (moisture === undefined || precipitation === undefined) {
            throw new Error("Missing data in API response.");
          }

          let suggestion = "";
          if (moisture < 0.2 && precipitation < 5) {
            suggestion = "Soil is dry. Irrigation recommended.";
          } else if (precipitation > 20) {
            suggestion = "Heavy rain expected. No irrigation needed.";
          } else {
            suggestion = "Soil condition is normal.";
          }

          setEnvData({
            latitude,
            longitude,
            moisture,
            precipitation,
            suggestion,
            time: new Date().toLocaleTimeString(),
          });
        } catch (err) {
          setEnvError(err.message || "Failed to fetch data from Open-Meteo.");
        } finally {
          setEnvLoading(false);
        }
      },
      (error) => {
        setEnvError(error.message || "User denied location access.");
        setEnvLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const updateDeviceWidgets = async (widgetIds) => {
    if (!selectedDevice) return;
    try {
      const updatedMetadata = { ...selectedDevice.metadata, widgets: widgetIds };
      await axios.put(`/api/industrial/devices/${selectedDevice._id}`, { metadata: updatedMetadata });
      
      const updatedDevices = devices.map(d => d._id === selectedDevice._id ? { ...d, metadata: updatedMetadata } : d);
      setDevices(updatedDevices);
      setSelectedDevice({ ...selectedDevice, metadata: updatedMetadata });
      toast.success('Dashboard configuration saved');
      setShowConfigModal(false);
    } catch (err) {
      toast.error('Failed to save configuration');
    }
  };


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
                <Zap size={12} /> Industrial Suite {user?.is_pro && '• Professional'}
            </motion.div>
            <h1 className="text-4xl font-extrabold text-white">Industrial Control Plane</h1>
            <p className="text-slate-500 max-w-xl">The mission control for your IoT devices, enterprise APIs, and automated workflows.</p>
        </div>
        
        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 self-start overflow-x-auto custom-scrollbar">
            {[
                { id: 'projects', label: 'IoT Fleet', icon: <Activity size={16} /> },
                { id: 'environmental', label: 'Weather Station', icon: <Cloud size={16} /> },
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
          { label: 'IoT Projects', value: devices.length, icon: <Activity size={16} />, color: 'emerald' },
          { label: 'Active Keys', value: apiKeys.length, icon: <Key size={16} />, color: 'primary' },
          { label: 'API Requests', value: industrialStats?.total_requests || 0, icon: <Zap size={16} />, color: 'orange' },
          { label: 'Latency', value: '42ms', icon: <Loader2 size={16} />, color: 'blue' },
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

      {/* Quick Start Guide */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism p-6 rounded-[2rem] border border-primary-500/10 bg-primary-500/5 flex flex-col md:flex-row items-center gap-6"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center text-primary-400 shrink-0">
            <Info size={24} />
        </div>
        <div className="flex-1 text-center md:text-left">
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Industrial Quick Start</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
                1. Generate an <span className="text-primary-400 font-bold">API Key</span> to authorize devices. 
                2. Create an <span className="text-primary-400 font-bold">IoT Project</span> to start monitoring sensors. 
                3. Configure <span className="text-primary-400 font-bold">Webhooks</span> to send data to your own server.
            </p>
        </div>
        <button 
            onClick={openDocsModal}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all flex items-center gap-2"
        >
            <BookOpen size={12} /> Read Full Docs
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'projects' && (
          <motion.div 
            key="projects"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Device List Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-morphism p-6 rounded-[2rem] border border-white/10 space-y-4">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Plus size={14} /> Initialize Project
                        </h3>
                        <div className="space-y-3">
                            <input 
                                type="text"
                                placeholder="Project Name..."
                                className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white text-xs"
                                value={newDevice.name}
                                onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                            />
                            <select 
                                className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white text-xs"
                                value={newDevice.metadata.type}
                                onChange={(e) => setNewDevice({...newDevice, metadata: {...newDevice.metadata, type: e.target.value}})}
                            >
                                <option value="irrigation">Plant Irrigation</option>
                                <option value="weather">☁️ Weather Station (OpenWeatherMap)</option>
                                <option value="energy">⚡ Energy Monitor</option>
                                <option value="security">🔒 Smart Security</option>
                            </select>
                            <button 
                                onClick={createDevice}
                                className="w-full py-3 premium-gradient text-white font-bold rounded-xl text-xs hover:scale-[1.02] transition-transform"
                            >
                                Create Device
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {devices.map(device => (
                            <button
                                key={device._id}
                                onClick={() => setSelectedDevice(device)}
                                className={`w-full p-4 rounded-2xl border transition-all text-left group ${selectedDevice?._id === device._id ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${selectedDevice?._id === device._id ? 'bg-white/20' : 'bg-white/5'}`}>
                                        <Activity size={16} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{device.name}</p>
                                        <p className={`text-[10px] ${selectedDevice?._id === device._id ? 'text-white/70' : 'text-slate-500'}`}>
                                            {device.status?.toUpperCase() || 'UNKNOWN'} • {device.metadata?.type || 'unknown'}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Project Dashboard Area */}
                <div className="lg:col-span-3">
                    {selectedDevice ? (
                        <div className="space-y-8">
                            <div className="glass-morphism p-8 rounded-[3rem] border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                        <Activity size={32} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-2xl font-black text-white">{selectedDevice.name}</h2>
                                            <button 
                                                onClick={() => copyToClipboard(selectedDevice._id, 'device-id')}
                                                className="p-1.5 bg-white/5 rounded-lg text-slate-500 hover:text-primary-400 transition-colors"
                                                title="Copy Device ID"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                        <p className="text-slate-500 text-sm flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            Active Fleet • {selectedDevice.metadata?.type?.toUpperCase() || 'GENERAL'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setShowConfigModal(true)}
                                        className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5 text-slate-400 hover:text-primary-400 transition-colors flex items-center gap-2 font-bold text-xs"
                                        title="Configure Widgets"
                                    >
                                        <Zap size={18} /> Manage 10+ Tools
                                    </button>
                                </div>
                            </div>

                            {/* Main widgets grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(selectedDevice.metadata?.widgets || ['moisture', 'temp', 'electricity', 'motor', 'lighting']).map(widgetId => {
                                    const latestEvent = deviceEvents[0];
                                    const hasData = !!latestEvent;
                                    const widget = availableWidgets.find(w => w.id === widgetId) || { label: widgetId, icon: <Activity />, color: 'primary' };
                                    const statusKey = `${widgetId}_status`;
                                    const currentStatus = selectedDevice.metadata?.[statusKey] || 'off';

                                    // Render toggle widgets directly!
                                    if (['motor', 'lighting', 'fencing', 'cctv', 'sprinkler', 'fan', 'heater', 'siren', 'gate', 'solar', 'battery'].includes(widgetId)) {
                                        return (
                                            <div key={widgetId} className="glass-morphism p-6 rounded-[2.5rem] border border-white/10 space-y-4 flex flex-col justify-between">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{widget.label}</p>
                                                        <p className={`text-xs font-bold ${currentStatus === 'on' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                            {currentStatus === 'on' ? 'Enabled' : 'Disabled'}
                                                        </p>
                                                    </div>
                                                    <div className={`p-3 rounded-2xl bg-${widget.color}-500/10 text-${widget.color}-400`}>
                                                        {widget.icon}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleWidgetState(widgetId)}
                                                    className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${currentStatus === 'on' ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                                                >
                                                    {widget.label} {currentStatus === 'on' ? 'OFF' : 'ON'}
                                                </button>
                                            </div>
                                        );
                                    }

                                    // Custom visual rendering for data tools / sensors
                                    if (widgetId === 'moisture') return (
                                        <div key="moisture" className="glass-morphism p-6 rounded-[2.5rem] border border-white/10 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Soil Moisture</p>
                                                    <div className="flex items-end gap-2 mt-2">
                                                        <p className="text-4xl font-black text-white">{hasData && latestEvent.data?.moisture !== undefined ? `${latestEvent.data.moisture}%` : '32%'}</p>
                                                        <p className="text-xs font-bold mb-1.5 flex items-center gap-1 text-emerald-400">
                                                            Normal
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                                                    <Droplets size={20} />
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: hasData && latestEvent.data?.moisture !== undefined ? `${latestEvent.data.moisture}%` : '32%' }}
                                                    className="h-full bg-emerald-500" 
                                                />
                                            </div>
                                        </div>
                                    );

                                    if (widgetId === 'temp') return (
                                        <div key="temp" className="glass-morphism p-6 rounded-[2.5rem] border border-white/10 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ambient Temp</p>
                                                    <div className="flex items-end gap-2 mt-2">
                                                        <p className="text-4xl font-black text-white">{hasData && latestEvent.data?.temp !== undefined ? `${latestEvent.data.temp}°C` : '26.8°C'}</p>
                                                        <p className="text-xs font-bold mb-1.5 flex items-center gap-1 text-orange-400">
                                                            Optimal
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-orange-500/10 text-orange-400 rounded-2xl">
                                                    <Thermometer size={20} />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold">
                                                <Thermometer size={12} /> Live Sensor Reading
                                            </div>
                                        </div>
                                    );

                                    if (widgetId === 'humidity') return (
                                        <div key="humidity" className="glass-morphism p-6 rounded-[2.5rem] border border-white/10 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Air Humidity</p>
                                                    <div className="flex items-end gap-2 mt-2">
                                                        <p className="text-4xl font-black text-white">{hasData && latestEvent.data?.humidity !== undefined ? `${latestEvent.data.humidity}%` : '54%'}</p>
                                                        <p className="text-xs font-bold mb-1.5 flex items-center gap-1 text-blue-400">
                                                            Balanced
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
                                                    <Activity size={20} />
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: hasData && latestEvent.data?.humidity !== undefined ? `${latestEvent.data.humidity}%` : '54%' }}
                                                    className="h-full bg-blue-500" 
                                                />
                                            </div>
                                        </div>
                                    );

                                    if (widgetId === 'light') return (
                                        <div key="light" className="glass-morphism p-6 rounded-[2.5rem] border border-white/10 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Light Level</p>
                                                    <div className="flex items-end gap-2 mt-2">
                                                        <p className="text-4xl font-black text-white">{hasData && latestEvent.data?.light !== undefined ? `${latestEvent.data.light}lx` : '850lx'}</p>
                                                        <p className="text-xs font-bold mb-1.5 flex items-center gap-1 text-yellow-400">
                                                            Active
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-2xl">
                                                    <Zap size={20} />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold">
                                                <Sun size={12} /> Sensor Reading
                                            </div>
                                        </div>
                                    );

                                    if (widgetId === 'electricity') return (
                                        <div key="electricity" className="glass-morphism p-6 rounded-[2.5rem] border border-white/10 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Electricity</p>
                                                    <div className="flex items-end gap-2 mt-2">
                                                        <p className="text-4xl font-black text-white">ACTIVE</p>
                                                        <p className="text-xs font-bold mb-1.5 flex items-center gap-1 text-indigo-400">
                                                            Main Grid
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                                                    <Power size={20} />
                                                </div>
                                            </div>
                                            <p className="text-slate-500 text-[10px] font-bold">Supply Voltage Stable</p>
                                        </div>
                                    );

                                    if (widgetId === 'weather') return (
                                        <div key="weather" className="glass-morphism p-6 rounded-[2.5rem] border border-white/10 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Weather Station</p>
                                                    <div className="flex items-end gap-2 mt-2">
                                                        <p className="text-4xl font-black text-white">{weatherData ? `${weatherData.temperature}°` : '28°'}</p>
                                                        <p className="text-xs font-bold mb-1.5 flex items-center gap-1 text-sky-400">
                                                            {weatherData ? weatherData.weather_condition : 'Clear'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl">
                                                    <Cloud size={20} />
                                                </div>
                                            </div>
                                            <p className="text-slate-500 text-[10px] font-bold">Location: {weatherData ? weatherData.city : 'Local'}</p>
                                        </div>
                                    );

                                    return null;
                                })}
                            </div>

                            {/* Analytics & Rules Banner */}
                            <div className="glass-morphism p-8 rounded-[3rem] border border-white/10 space-y-6">
                                <h4 className="font-bold text-white flex items-center gap-2">
                                    <Activity size={18} className="text-primary-400" /> Device Activity History
                                </h4>
                                <div className="h-[260px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={deviceEvents.slice(0, 20).reverse().map(e => ({
                                            time: new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                            val: e.data?.moisture || Math.floor(Math.random() * 20) + 25
                                        }))}>
                                            <defs>
                                                <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                            <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                            <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                                            <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} fill="url(#colorAct)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[600px] flex flex-col items-center justify-center text-slate-500 glass-morphism rounded-[3rem] border border-white/5 border-dashed space-y-4">
                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-slate-700">
                                <Activity size={48} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white">No Project Selected</h3>
                                <p className="max-w-xs mx-auto text-sm">Select an IoT device from the sidebar to view its specialized control panel.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'api' && (
          <motion.div 
            key="api"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col space-y-2 mb-4">
                <h3 className="text-xl font-bold text-white">Secure API Tokens</h3>
                <p className="text-slate-500 text-sm">Generate secret keys to authenticate your external apps, ESP32 devices, or scripts. These keys allow programmatic access to SmartLink services.</p>
            </div>
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

        {activeTab === 'environmental' && (
          <motion.div 
            key="environmental"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col space-y-2 mb-4">
                <h3 className="text-2xl font-black text-white">Weather Station & Environmental Intelligence</h3>
                <p className="text-slate-500 text-sm">Retrieve localized environmental metrics and receive smart irrigation suggestions instantly based on your current geographical position.</p>
            </div>
            <div className="glass-morphism p-10 rounded-[3rem] border border-white/10 space-y-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
                            <Navigation size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-extrabold text-white">Real-Time Environmental Intelligence</h3>
                            <p className="text-slate-500 text-xs">Empower your IoT deployments with real-time geolocation & Open-Meteo weather intelligence.</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchEnvironmentalData}
                        disabled={envLoading}
                        className="px-6 py-3.5 premium-gradient text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                        {envLoading ? (
                            <><Loader2 size={16} className="animate-spin" /> Fetching data...</>
                        ) : (
                            <><RefreshCw size={16} /> Get Local Weather</>
                        )}
                    </button>
                </div>

                {envError && (
                    <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400">
                        <AlertCircle size={20} />
                        <div className="text-xs">
                            <p className="font-bold">Information Error</p>
                            <p className="opacity-80 font-medium">{envError}</p>
                        </div>
                    </div>
                )}

                {!envData && !envLoading && !envError && (
                    <div className="h-48 flex flex-col items-center justify-center text-slate-500 border border-white/5 border-dashed rounded-[2rem] space-y-2">
                        <Navigation size={48} className="opacity-10 mb-2 animate-bounce" />
                        <p className="font-bold text-sm text-slate-400">No Location Access / Data Retrieved Yet</p>
                        <p className="text-xs text-slate-600 max-w-xs text-center">Click the button above to request local browser geolocation and query live data from Open-Meteo API.</p>
                    </div>
                )}

                {envData && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="glass-morphism p-6 rounded-[2rem] border border-white/5 space-y-2">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Geolocation</p>
                                <p className="text-lg font-black text-white">{envData.latitude.toFixed(4)}, {envData.longitude.toFixed(4)}</p>
                                <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                    <Navigation size={12} /> Local Coordinates
                                </p>
                            </div>
                            <div className="glass-morphism p-6 rounded-[2rem] border border-white/5 space-y-2">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Soil Moisture</p>
                                <p className="text-3xl font-black text-emerald-400">{envData.moisture} <span className="text-xs text-slate-400">m³/m³</span></p>
                                <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                    <Droplets size={12} /> 0-1cm Layer (Hourly)
                                </p>
                            </div>
                            <div className="glass-morphism p-6 rounded-[2rem] border border-white/5 space-y-2">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Precipitation</p>
                                <p className="text-3xl font-black text-blue-400">{envData.precipitation} <span className="text-xs text-slate-400">mm</span></p>
                                <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                    <CloudRain size={12} /> Current Rainfall
                                </p>
                            </div>
                            <div className="glass-morphism p-6 rounded-[2rem] border border-white/5 space-y-2">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Time of Data</p>
                                <p className="text-lg font-black text-white">{envData.time}</p>
                                <p className="text-[10px] text-slate-500 font-bold">Fetched Timestamp</p>
                            </div>
                        </div>

                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] space-y-2">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                                <Zap size={14} /> Smart Suggestion (Decision Engine)
                            </p>
                            <p className="text-base font-black text-white leading-relaxed">{envData.suggestion}</p>
                        </div>
                    </div>
                )}
            </div>
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
            <div className="flex flex-col space-y-2 mb-4">
                <h3 className="text-xl font-bold text-white">Bulk Engine</h3>
                <p className="text-slate-500 text-sm">Upload thousands of long URLs to shorten them all at once. Ideal for marketing campaigns, catalogs, or large-scale migrations.</p>
            </div>
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
            <div className="flex flex-col space-y-2 mb-4">
                <h3 className="text-xl font-bold text-white">Real-time Webhooks</h3>
                <p className="text-slate-500 text-sm">SmartLink will send an HTTP POST request to your server every time an event occurs (like a link click or device event). This allows your backend to react instantly.</p>
            </div>
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
            <div className="flex flex-col space-y-2 mb-4">
                <h3 className="text-xl font-bold text-white">Automation Logic</h3>
                <p className="text-slate-500 text-sm">Create "If-This-Then-That" rules. For example: "IF a user from India clicks a link, THEN trigger a specific webhook" or "IF moisture is low, THEN alert my system".</p>
            </div>
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
                                        <Activity size={20} />
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

      {/* Widget Configuration Modal */}
      <AnimatePresence>
        {showConfigModal && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="glass-morphism max-w-4xl w-full p-10 rounded-[3rem] border border-white/20 space-y-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h3 className="text-3xl font-black text-white tracking-tight">Configure Your Suite</h3>
                            <p className="text-slate-500 text-sm">Select the industrial tools and sensors you want to deploy on your dashboard.</p>
                        </div>
                        <button onClick={() => setShowConfigModal(false)} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all hover:bg-white/10">
                             <X size={24} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableWidgets.map(widget => (
                                <button
                                    key={widget.id}
                                    onClick={() => {
                                        const current = selectedDevice.metadata.widgets || [];
                                        const next = current.includes(widget.id) 
                                            ? current.filter(id => id !== widget.id)
                                            : [...current, widget.id];
                                        setSelectedDevice({ ...selectedDevice, metadata: { ...selectedDevice.metadata, widgets: next } });
                                    }}
                                    className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all duration-300 ${
                                        (selectedDevice.metadata.widgets || []).includes(widget.id)
                                        ? 'bg-primary-500/10 border-primary-500/40 text-white shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                                        : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:border-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl transition-all duration-500 ${(selectedDevice.metadata.widgets || []).includes(widget.id) ? 'bg-primary-500 text-white shadow-lg' : 'bg-white/5'}`}>
                                            {widget.icon}
                                        </div>
                                        <div className="text-left">
                                            <span className="font-black text-sm block uppercase tracking-wider">{widget.label}</span>
                                            <span className="text-[10px] text-slate-500 font-bold">Industrial Control Unit</span>
                                        </div>
                                    </div>
                                    {(selectedDevice.metadata.widgets || []).includes(widget.id) && (
                                        <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white">
                                            <Check size={14} strokeWidth={4} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-6 pt-6 border-t border-white/5">
                        <button 
                            onClick={() => setShowConfigModal(false)}
                            className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-3xl transition-all uppercase tracking-widest text-xs"
                        >
                            Discard
                        </button>
                        <button 
                            onClick={() => updateDeviceWidgets(selectedDevice.metadata.widgets)}
                            className="flex-1 py-5 premium-gradient text-white font-black rounded-3xl transition-all shadow-xl shadow-primary-500/20 uppercase tracking-widest text-xs hover:scale-[1.02]"
                        >
                            Apply Changes
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Full API Documentation Modal */}
      <AnimatePresence>
        {showDocsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
            onClick={(e) => e.target === e.currentTarget && setShowDocsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-morphism max-w-3xl w-full max-h-[90vh] rounded-[2.5rem] border border-white/20 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-8 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Industrial API Documentation</h3>
                    <p className="text-xs text-slate-500">Full reference for all SmartLink Industrial endpoints</p>
                  </div>
                </div>
                <button onClick={() => setShowDocsModal(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {!docsContent ? (
                  <div className="flex items-center justify-center h-32 text-slate-500">
                    <Loader2 className="animate-spin mr-3" size={20} /> Loading documentation...
                  </div>
                ) : (
                  <>
                    {/* Auth */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={14} /> Authentication</h4>
                      <div className="p-5 bg-slate-950 rounded-2xl border border-white/5 space-y-2">
                        <p className="text-xs text-slate-400">{docsContent.auth?.description}</p>
                        <code className="block text-xs text-primary-400 font-mono mt-2">{docsContent.auth?.header}</code>
                      </div>
                    </div>

                    {/* Endpoints */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Zap size={14} /> API Endpoints</h4>
                      {docsContent.endpoints?.map((ep, i) => (
                        <div key={i} className="p-5 bg-slate-950/50 rounded-2xl border border-white/5 space-y-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${ep.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                              {ep.method}
                            </span>
                            <code className="text-xs text-primary-400 font-mono">{ep.path}</code>
                          </div>
                          <p className="text-xs text-slate-400">{ep.desc}</p>
                          {ep.body && (
                            <div>
                              <p className="text-[10px] text-slate-600 font-bold uppercase mb-1">Request Body</p>
                              <pre className="text-[10px] text-emerald-400 font-mono bg-black/30 p-3 rounded-xl overflow-x-auto">{JSON.stringify(ep.body, null, 2)}</pre>
                            </div>
                          )}
                          {ep.response && (
                            <div>
                              <p className="text-[10px] text-slate-600 font-bold uppercase mb-1">Response</p>
                              <pre className="text-[10px] text-slate-300 font-mono bg-black/30 p-3 rounded-xl overflow-x-auto">{JSON.stringify(ep.response, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Arduino example */}
                    {docsContent.arduino_example && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Cpu size={14} /> {docsContent.arduino_example.description}</h4>
                        <pre className="text-[10px] text-emerald-400 font-mono bg-slate-950 p-6 rounded-2xl border border-white/5 overflow-x-auto leading-relaxed custom-scrollbar">
                          {docsContent.arduino_example.code}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default IndustrialSuite;



