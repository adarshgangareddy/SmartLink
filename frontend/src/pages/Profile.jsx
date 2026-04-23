import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, AlignLeft, Camera, ShieldCheck, CreditCard, Sparkles, Check, Loader2 } from 'lucide-react';

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Cleo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Simba',
];

const Profile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    profile_photo: user?.profile_photo || AVATARS[0]
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put('/api/auth/profile', editData);
      setUser(res.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Account Settings</h1>
            <p className="text-slate-400">Manage your profile information and preferences.</p>
        </div>
        {user?.is_pro && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-400 font-bold text-sm shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                <ShieldCheck size={18} />
                SmartLink Pro Member
            </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <section className="lg:col-span-1 space-y-6">
          <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/5 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 premium-gradient opacity-10" />
            
            <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-full border-4 border-slate-900 shadow-2xl overflow-hidden bg-slate-800 mx-auto">
                    <img 
                        src={editData.profile_photo || AVATARS[0]} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <button 
                    type="button"
                    onClick={() => document.getElementsByName('profile_photo_url')[0]?.focus()}
                    className="absolute bottom-1 right-1 p-2 bg-primary-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                    <Camera size={16} />
                </button>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">{user?.full_name}</h2>
            <p className="text-slate-500 text-sm mb-6">{user?.email}</p>
            
            <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Member Since</span>
                    <span className="text-slate-200 font-medium">{new Date(user?.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Plan</span>
                    <span className={`font-bold ${user?.is_pro ? 'text-primary-400' : 'text-slate-400'}`}>
                        {user?.is_pro ? 'Pro' : 'Free'}
                    </span>
                </div>
            </div>
          </div>

          <div className="glass-morphism p-6 rounded-[2rem] border border-white/5">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Select Avatar</h3>
                <div className="grid grid-cols-3 gap-3">
                    {AVATARS.map((avatar, i) => (
                        <button 
                            key={i}
                            onClick={() => setEditData({...editData, profile_photo: avatar})}
                            className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${editData.profile_photo === avatar ? 'border-primary-500 scale-95' : 'border-transparent hover:border-white/20'}`}
                        >
                            <img src={avatar} alt="Avatar option" className="w-full h-full object-cover" />
                            {editData.profile_photo === avatar && (
                                <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                                    <Check size={16} className="text-primary-400" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
          </div>
        </section>

        {/* Edit Form */}
        <section className="lg:col-span-2">
          <form onSubmit={handleUpdate} className="glass-morphism p-8 md:p-10 rounded-[2.5rem] border border-white/5 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400 ml-1 flex items-center gap-2">
                        <User size={14} /> Full Name
                    </label>
                    <input 
                        type="text"
                        required
                        className="w-full px-5 py-4 bg-slate-900/50 rounded-2xl border border-white/5 focus:border-primary-500/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10 text-white transition-all"
                        placeholder="John Doe"
                        value={editData.full_name}
                        onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400 ml-1 flex items-center gap-2">
                        <Mail size={14} /> Email Address
                    </label>
                    <input 
                        type="email"
                        disabled
                        className="w-full px-5 py-4 bg-slate-900/20 rounded-2xl border border-white/5 text-slate-500 cursor-not-allowed"
                        value={user?.email}
                    />
                </div>
                <div className="col-span-full space-y-2">
                    <label className="text-sm font-semibold text-slate-400 ml-1 flex items-center gap-2">
                        <Camera size={14} /> Profile Photo URL
                    </label>
                    <div className="flex gap-4">
                        <input 
                            name="profile_photo_url"
                            type="text"
                            className="flex-1 px-5 py-4 bg-slate-900/50 rounded-2xl border border-white/5 focus:border-primary-500/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10 text-white transition-all"
                            placeholder="https://images.unsplash.com/photo..."
                            value={editData.profile_photo}
                            onChange={(e) => setEditData({...editData, profile_photo: e.target.value})}
                        />
                        <button 
                            type="button"
                            onClick={() => setEditData({...editData, profile_photo: AVATARS[Math.floor(Math.random() * AVATARS.length)]})}
                            className="px-6 py-4 bg-white/5 rounded-2xl border border-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all font-bold text-xs whitespace-nowrap"
                        >
                            Randomize
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-500 ml-1 italic">Paste an image URL or select from the avatars on the left.</p>
                </div>
                <div className="col-span-full space-y-2">
                    <label className="text-sm font-semibold text-slate-400 ml-1 flex items-center gap-2">
                        <MapPin size={14} /> Location
                    </label>
                    <input 
                        type="text"
                        className="w-full px-5 py-4 bg-slate-900/50 rounded-2xl border border-white/5 focus:border-primary-500/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10 text-white transition-all"
                        placeholder="New York, USA"
                        value={editData.location}
                        onChange={(e) => setEditData({...editData, location: e.target.value})}
                    />
                </div>
                <div className="col-span-full space-y-2">
                    <label className="text-sm font-semibold text-slate-400 ml-1 flex items-center gap-2">
                        <AlignLeft size={14} /> Bio
                    </label>
                    <textarea 
                        rows={4}
                        className="w-full px-5 py-4 bg-slate-900/50 rounded-2xl border border-white/5 focus:border-primary-500/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10 text-white transition-all resize-none"
                        placeholder="Tell us about yourself..."
                        value={editData.bio}
                        onChange={(e) => setEditData({...editData, bio: e.target.value})}
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
                <button 
                    type="button" 
                    className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    disabled={loading}
                    className="px-10 py-4 premium-gradient rounded-2xl font-bold text-white shadow-xl shadow-primary-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    Save Changes
                </button>
            </div>
          </form>

          {!user?.is_pro && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-1 premium-gradient rounded-[2.5rem]"
            >
                <div className="bg-slate-950 p-8 rounded-[2.4rem] flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="text-yellow-400" size={24} />
                            Upgrade to SmartLink Pro
                        </h3>
                        <p className="text-slate-400">Unlock styleable QR codes, advanced analytics, and custom domains.</p>
                    </div>
                    <Link 
                        to="/go-pro"
                        className="whitespace-nowrap px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-2"
                    >
                        <CreditCard size={20} />
                        Get Pro - ₹18/mo
                    </Link>
                </div>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;
