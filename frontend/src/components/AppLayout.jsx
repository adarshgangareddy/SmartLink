import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Link2, BarChart3, User, LogOut, ChevronLeft, Sparkles, Info, Heart, ExternalLink, ShieldCheck, Globe, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AppLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'My Links', icon: <Link2 size={20} />, path: '/links' },
    { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
    { name: 'Industrial', icon: <Globe size={20} />, path: '/industrial', proOnly: true },
    { name: 'Profile', icon: <User size={20} />, path: '/profile' },
    ...(!user?.is_pro ? [{ name: 'Go Pro', icon: <Sparkles size={20} />, path: '/go-pro', highlight: true }] : []),
    { name: 'About', icon: <Info size={20} />, path: '/about' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-68 glass-morphism border-r border-white/5 flex flex-col relative z-20">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8 group cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
              <Link2 className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">SmartLink</span>
          </div>
          
          <nav className="space-y-2">
            {navItems.filter(item => !item.proOnly || user?.is_pro).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group ${
                    isActive
                      ? 'bg-primary-500/10 text-primary-400 border border-primary-500/10 shadow-[0_0_20px_rgba(59,130,246,0.05)]'
                      : item.highlight 
                        ? 'text-yellow-400/70 hover:text-yellow-400 hover:bg-yellow-400/5 border border-transparent hover:border-yellow-400/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="font-bold text-sm tracking-wide">{item.name}</span>
                {item.highlight && <span className="ml-auto w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
            {!user?.is_pro && (
                <div className="p-4 rounded-2xl bg-primary-500/5 border border-white/5 space-y-3">
                    <p className="text-xs font-bold text-primary-400">Upgrade to Pro</p>
                    <p className="text-[10px] text-slate-500">Get advanced analytics and custom QR styles.</p>
                    <button onClick={() => navigate('/go-pro')} className="w-full py-2 bg-white text-black text-[10px] font-extrabold rounded-lg hover:bg-slate-200 transition-colors">
                        LEARN MORE
                    </button>
                </div>
            )}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-4 w-full rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group font-bold text-sm"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navbar */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 glass-morphism relative z-10">
          <div className="flex items-center gap-6">
            <button 
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
                <ChevronLeft size={20} />
            </button>
            <h1 className="text-lg font-bold text-slate-200">
                Welcome back, <span className="text-transparent bg-clip-text premium-gradient">{user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={12} className={user?.is_pro ? 'text-primary-400' : 'text-slate-500'} />
                {user?.is_pro ? 'PRO MEMBER' : 'FREE PLAN'}
            </div>
            <div 
                className="w-10 h-10 rounded-2xl bg-slate-800 border-2 border-primary-500/30 overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate('/profile')}
            >
              <img src={user?.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar flex flex-col">
          <div className="flex-1">
            {children}
          </div>

          {/* Advanced Footer */}
          <footer className="mt-20 pt-12 pb-8 border-t border-white/5 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg premium-gradient flex items-center justify-center">
                            <Link2 className="text-white" size={18} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">SmartLink</span>
                    </div>
                    <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                        The ultimate tool for modern link management. Shorten, customize, and track your digital presence with ease.
                    </p>
                    <div className="flex gap-4">
                        <a 
                            href="https://www.instagram.com/zyntri_official?igsh=bTB3ejg0M3NwOWc4" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                        </a>
                        <a 
                            href="https://chat.whatsapp.com/CKqtVSVs5k22DucoMptaeX?mode=gi_t" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14 8.38 8.38 0 0 1 3.8.9L21 3z"/></svg>
                        </a>
                        <a href="#" className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"><Globe size={18} /></a>
                    </div>
                </div>

                <div className="space-y-6">
                    <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Product</h4>
                    <ul className="space-y-4">
                        <li><NavLink to="/dashboard" className="text-sm text-slate-500 hover:text-primary-400 transition-colors">Dashboard</NavLink></li>
                        <li><NavLink to="/links" className="text-sm text-slate-500 hover:text-primary-400 transition-colors">My Links</NavLink></li>
                        <li><NavLink to="/go-pro" className="text-sm text-slate-500 hover:text-primary-400 transition-colors">Pricing</NavLink></li>
                    </ul>
                </div>

                <div className="space-y-6">
                    <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Company</h4>
                    <ul className="space-y-4">
                        <li><NavLink to="/about" className="text-sm text-slate-500 hover:text-primary-400 transition-colors">About Us</NavLink></li>
                        <li><a href="#" className="text-sm text-slate-500 hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="text-sm text-slate-500 hover:text-primary-400 transition-colors">Terms of Service</a></li>
                    </ul>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                <p>© 2026 SMARTLINK INC. ALL RIGHTS RESERVED.</p>
                <div className="flex items-center gap-1">
                    MADE WITH <Heart size={10} className="text-red-500 fill-red-500" /> BY <span className="text-slate-400">ADVG TEAM</span>
                </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
