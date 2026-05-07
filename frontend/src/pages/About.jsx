import React from 'react';
import { motion } from 'framer-motion';
import { Link2, Shield, Zap, Globe, Share2, Mail, Heart, Code2, Users2, Sparkles, Send, ExternalLink, Clock, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const About = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleServiceClick = (path) => {
    if (user?.is_pro) {
      navigate(path);
    } else {
      navigate('/go-pro');
    }
  };

  const proServices = [
    {
      id: 'lifecycle',
      title: 'Auto-Expiry & Lifecycle',
      icon: <Clock className="text-blue-400" />,
      desc: 'Set custom auto-destruct dates and maximum click limits for your temporary campaigns.',
      path: '/link-lifecycle'
    },
    {
      id: 'geo',
      title: 'Smart Geo-Routing',
      icon: <Globe className="text-emerald-400" />,
      desc: 'Dynamically route visitors to localized experiences based on their geographic location or OS.',
      path: '/geo-redirects'
    },
    {
      id: 'lockdown',
      title: 'Asset Lockdown',
      icon: <Lock className="text-red-400" />,
      desc: 'Secure sensitive links behind a password barrier to ensure only authorized access.',
      path: '/links'
    },
    {
      id: 'webhooks',
      title: 'Industrial Webhooks',
      icon: <Send className="text-purple-400" />,
      desc: 'Send real-time interaction telemetry to your enterprise systems upon every click.',
      path: '/industrial'
    },
    {
      id: 'brand',
      title: 'Custom Branding & File Uploads',
      icon: <Share2 className="text-orange-400" />,
      desc: 'Deploy short links using your own company brand. Upload custom splash screen logos and avatar images directly from your device.',
      path: '/go-pro'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-24 pb-20">
      {/* Hero */}
      <section className="text-center space-y-6 pt-10">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-20 h-20 rounded-3xl premium-gradient mx-auto flex items-center justify-center shadow-2xl shadow-primary-500/20 mb-8"
        >
            <Link2 className="text-white" size={40} />
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            Meet <span className="text-primary-400">SmartLink</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            The modern link management platform designed for speed, security, and aesthetics. 
            We turn long, messy URLs into powerful, trackable, and personal digital assets.
        </p>
      </section>

      {/* Mission */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Sparkles className="text-yellow-400" />
                Our Mission
            </h2>
            <p className="text-slate-400 leading-relaxed">
                In a world of information overload, we believe links should be meaningful. 
                SmartLink was born out of the need for a tool that doesn't just shorten URLs, but enhances them. 
                Our mission is to provide creators, developers, and businesses with the most intuitive 
                and beautiful link management experience on the web.
            </p>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 glass-morphism rounded-2xl border border-white/5">
                    <p className="text-2xl font-bold text-white">5M+</p>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Links Created</p>
                </div>
                <div className="p-4 glass-morphism rounded-2xl border border-white/5">
                    <p className="text-2xl font-bold text-white">100k+</p>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Active Users</p>
                </div>
            </div>
        </div>
        <div className="relative">
            <div className="absolute inset-0 premium-gradient opacity-20 blur-3xl" />
            <div className="relative glass-morphism aspect-video rounded-[2.5rem] border border-white/10 flex items-center justify-center">
                <Code2 size={100} className="text-primary-500/20" />
            </div>
        </div>
      </section>

      {/* Values */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white text-center">Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { 
                    icon: <Zap className="text-yellow-400" />, 
                    title: 'Speed First', 
                    desc: 'Every millisecond counts. Our infrastructure is optimized for near-instant redirection globaly.' 
                },
                { 
                    icon: <Shield className="text-emerald-400" />, 
                    title: 'Privacy Conscious', 
                    desc: 'We respect your data. Our tracking is precise but privacy-focused and GDPR compliant.' 
                },
                { 
                    icon: <Globe className="text-blue-400" />, 
                    title: 'Global Scale', 
                    desc: 'Deploying links that work everywhere. Our edge network ensures reliability across all continents.' 
                },
            ].map((v, i) => (
                <div key={i} className="glass-morphism p-8 rounded-[2rem] border border-white/5 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                        {v.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white">{v.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
            ))}
        </div>
      </section>

      {/* Pro Services */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white">Pro Services & Features</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
                Unlock the full potential of SmartLink with our enterprise-grade toolkit. Click on any feature to manage it or learn more.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proServices.map((service) => (
                <div 
                    key={service.id}
                    onClick={() => handleServiceClick(service.path)}
                    className="glass-morphism p-8 rounded-[2rem] border border-white/5 space-y-4 hover:bg-gradient-to-br hover:from-white/5 hover:to-white/10 hover:border-transparent transition-all cursor-pointer group relative overflow-hidden shadow-xl shadow-transparent hover:shadow-primary-500/10 before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-r before:from-blue-500/50 before:via-purple-500/50 before:to-pink-500/50 before:rounded-[2rem] before:-z-10 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
                >
                    <div className="absolute inset-[1px] bg-[#0A0F1A] rounded-[2rem] -z-10" />
                    <div className="absolute top-0 right-0 p-3 bg-gradient-to-bl from-primary-500/20 to-transparent text-primary-400 text-[8px] font-black uppercase tracking-widest rounded-bl-xl border-b border-l border-white/5 group-hover:border-primary-500/30 transition-colors">PRO</div>
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        {service.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">{service.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{service.desc}</p>
                    <div className="pt-4 mt-auto">
                        <span className="text-xs font-bold text-primary-400 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {user?.is_pro ? 'Manage Feature' : 'Unlock Pro'} <ArrowRight size={14} />
                        </span>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Team/Contact */}
      <section className="glass-morphism p-12 rounded-[3.5rem] border border-white/5 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold text-white">Get in Touch</h2>
            <p className="text-slate-400">
                Have questions or feedback? We're always here to help you make your links smarter.
            </p>
            <div className="flex justify-center gap-6">
                {[
                    { icon: <Mail />, link: 'mailto:support@smartlink.com' },
                    { icon: <Globe />, link: '#' },
                    { icon: <Share2 />, link: '#' },
                    { icon: <ExternalLink />, link: '#' },
                ].map((s, i) => (
                    <a key={i} href={s.link} className="p-4 rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                        {s.icon}
                    </a>
                ))}
            </div>
            <div className="pt-8 flex items-center justify-center gap-2 text-slate-500 text-sm">
                Built with <Heart className="text-red-500 fill-red-500" size={14} /> by the SmartLink Team
            </div>
        </div>
      </section>
    </div>
  );
};

export default About;
