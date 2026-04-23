import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MousePointer2, Smartphone, Monitor, Globe, Clock, LayoutDashboard, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const DEVICE_COLORS = {
    Mobile: '#3b82f6',
    Desktop: '#6366f1',
    Tablet: '#a855f7'
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [clickData, setClickData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);

  const fetchAnalytics = async () => {
    try {
        const res = await axios.get('/api/links/analytics/all');
        const formattedDeviceData = res.data.deviceData.map(d => ({
            ...d, 
            color: DEVICE_COLORS[d.name] || '#94a3b8'
        }));
        
        setClickData(res.data.clickData);
        setDeviceData(formattedDeviceData);
    } catch (err) {
        console.error("Failed to fetch live analytics", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(); // initial fetch
    const interval = setInterval(() => {
        fetchAnalytics(); // live polling every 10 seconds
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-4">
          <Loader2 className="animate-spin text-primary-500" size={40} />
          <p className="animate-pulse font-medium">Gathering real-time intelligence...</p>
      </div>
  );

  const totalClicks = clickData.reduce((acc, curr) => acc + curr.clicks, 0);
  const avgClicks = clickData.length > 0 ? (totalClicks / clickData.length).toFixed(1) : 0;
  const topDevice = deviceData.length > 0 ? deviceData.reduce((prev, curr) => (prev.value > curr.value) ? prev : curr).name : 'N/A';

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                Live Analytics <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping absolute -ml-4 -mt-4 opacity-75" /><span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            </h2>
            <p className="text-slate-400">Deep dive into your link performance and audience</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-morphism p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
                <Clock className="text-primary-400" size={20} />
                Clicks Over Time
            </h3>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-400 font-medium">Live updating...</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {clickData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500">No clicks recorded yet. Share your links!</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={clickData}>
                    <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip 
                        contentStyle={{backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px'}}
                        itemStyle={{color: '#3b82f6'}}
                    />
                    <Area type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                </AreaChart>
                </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Device Chart */}
        <div className="glass-morphism p-8 rounded-3xl border border-white/5 space-y-6">
          <h3 className="font-bold flex items-center gap-2">
              <Smartphone className="text-indigo-400" size={20} />
              Devices Used
          </h3>
          <div className="h-[200px] w-full flex items-center justify-center">
             {deviceData.length === 0 ? (
                 <div className="text-slate-500 text-sm">No device data yet</div>
             ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={deviceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {deviceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px'}}
                        />
                    </PieChart>
                </ResponsiveContainer>
             )}
          </div>
          <div className="space-y-3">
              {deviceData.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} />
                          <span className="text-slate-400">{item.name}</span>
                      </div>
                      <span className="text-white font-bold">{item.value}</span>
                  </div>
              ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-morphism p-6 rounded-3xl border border-white/5 flex items-center gap-4 hover:border-primary-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400">
                <Monitor size={24} />
            </div>
            <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Top Device</p>
                <p className="text-xl font-bold">{topDevice}</p>
            </div>
        </div>

        <div className="glass-morphism p-6 rounded-3xl border border-white/5 flex items-center gap-4 hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Globe size={24} />
            </div>
            <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Links Shared</p>
                <p className="text-xl font-bold">{totalClicks > 0 ? "Global Reach" : "Waiting for traffic"}</p>
            </div>
        </div>

        <div className="glass-morphism p-6 rounded-3xl border border-white/5 flex items-center gap-4 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <LayoutDashboard size={24} />
            </div>
            <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Avg. Clicks/Day</p>
                <p className="text-xl font-bold">{avgClicks}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
