import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Link2, Zap, BarChart3, Shield, ArrowRight, X, Globe, Lock, Share2, Mail, Sparkles, ZapIcon, BarChart, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const LandingPage = () => {
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [wordIndex, setWordIndex] = useState(0);

    const dynamicWords = ["work harder.", "convert better.", "track smarter.", "scale faster."];
    const dynamicColors = [
        "from-primary-400 via-blue-400 to-purple-500",
        "from-emerald-400 via-teal-400 to-cyan-500",
        "from-orange-400 via-rose-400 to-pink-500",
        "from-pink-400 via-purple-400 to-indigo-500"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % dynamicWords.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        { 
            id: 'fast',
            icon: <Zap className="text-yellow-400" />, 
            title: 'Lightning Fast Redirects', 
            desc: 'Your links redirect instantly. Don\'t keep your audience waiting.',
            details: 'Our globally distributed infrastructure ensures that when a user clicks your link, they are redirected to their destination in milliseconds.'
        },
        { 
            id: 'analytics',
            icon: <BarChart3 className="text-blue-400" />, 
            title: 'Deep Analytics Engine', 
            desc: 'Understand your audience with powerful, real-time metrics.',
            details: 'Track clicks, geographic locations, device types, and referring platforms. Our dashboard gives you the insights you need to optimize your campaigns live.'
        },
        { 
            id: 'secure',
            icon: <Shield className="text-emerald-400" />, 
            title: 'Enterprise Security', 
            desc: 'Bank-level security for your links and data.',
            details: 'With end-to-end encryption, automated spam detection, and granular access controls, your data is always protected.'
        },
        { 
            id: 'geo',
            icon: <Globe className="text-pink-400" />, 
            title: 'Smart Geo-Redirects', 
            desc: 'Dynamically route users to local servers or sites.',
            details: 'Deliver localized experiences, optimized regional load distribution, and region-targeted promotional links.'
        },
        { 
            id: 'industrial',
            icon: <ZapIcon className="text-orange-400" />, 
            title: 'Industrial IoT Integration', 
            desc: 'Control hardware fleets, track weather station telemetry.',
            details: 'Our enterprise modules offer powerful programmatic access for connected IoT devices, ESP32 platforms, and industrial automation.'
        },
        { 
            id: 'brand',
            icon: <Share2 className="text-purple-400" />, 
            title: 'Branded Custom Domains', 
            desc: 'Empower your links with fully custom domains.',
            details: 'Create recognizable short codes on your own company brand and keep the focus entirely on your identity.'
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden selection:bg-primary-500/30 font-sans" style={{ fontFamily: "Poppins, sans-serif" }}>
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50" />
            </div>

            {/* Header */}
            <header className="fixed top-0 w-full z-[100] backdrop-blur-xl border-b border-white/5 py-5 px-10 bg-slate-950/40">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl premium-gradient flex items-center justify-center shadow-2xl shadow-primary-500/40 border border-white/20">
                            <Link2 className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white">SmartLink</span>
                    </motion.div>
                    
                    <nav className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-400 uppercase tracking-widest">
                        <a href="#features" className="hover:text-white transition-all hover:scale-110">Features</a>
                        <Link to="/about" className="hover:text-white transition-all hover:scale-110">About</Link>
                        <Link to="/login" className="hover:text-white transition-all hover:scale-110">Log In</Link>
                    </nav>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <Link to="/signup" className="px-8 py-3 rounded-full bg-white text-black text-sm font-black hover:scale-105 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)] flex items-center gap-2">
                            Get Started
                        </Link>
                    </motion.div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-64 pb-40 px-8 min-h-screen flex items-center justify-center">
                <div className="max-w-6xl mx-auto text-center relative z-10 w-full">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="flex flex-col items-center"
                    >
                        <motion.div 
                            variants={itemVariants}
                            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-sm font-bold text-primary-400 mb-12 shadow-2xl backdrop-blur-md hover:bg-white/10 transition-all cursor-pointer group"
                        >
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                            </span>
                            <span className="group-hover:text-white transition-colors tracking-wide uppercase text-xs">SmartLink goes global — Try it now</span>
                        </motion.div>
                        
                        <motion.h1 variants={itemVariants} className="text-6xl md:text-[7.5rem] font-black tracking-tighter mb-6 leading-[1.1] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center">
                            <span>Make every link</span>
                            <div className="h-[1.2em] relative overflow-hidden flex justify-center w-full mt-2">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={wordIndex}
                                        initial={{ y: 50, opacity: 0, rotateX: -90 }}
                                        animate={{ y: 0, opacity: 1, rotateX: 0 }}
                                        exit={{ y: -50, opacity: 0, rotateX: 90 }}
                                        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                                        className={`absolute text-transparent bg-clip-text bg-gradient-to-r ${dynamicColors[wordIndex]} animate-gradient-x pb-4`}
                                    >
                                        {dynamicWords[wordIndex]}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                        </motion.h1>
                        
                        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 leading-relaxed font-medium">
                            The intelligent link management platform for modern teams. Transform any URL into a powerful, trackable, and secure asset in seconds.
                        </motion.p>
                        
                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full sm:w-auto">
                            <Link to="/signup" className="w-full sm:w-auto px-12 py-6 rounded-3xl premium-gradient text-white font-black text-xl shadow-[0_20px_40px_rgba(59,130,246,0.3)] hover:shadow-[0_30px_60px_rgba(59,130,246,0.5)] hover:-translate-y-2 transition-all flex items-center justify-center group border border-white/10">
                                Start for free
                                <ArrowRight className="inline-block ml-4 group-hover:translate-x-2 transition-transform" size={24} />
                            </Link>
                            <a href="#features" className="w-full sm:w-auto px-12 py-6 rounded-3xl bg-white/5 border border-white/10 text-white font-black text-xl hover:bg-white/10 transition-all text-center backdrop-blur-md">
                                See how it works
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-40 px-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-slate-900/30 -skew-y-3 origin-top-left border-y border-white/5" />
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white">Why Choose SmartLink?</h2>
                            <p className="text-slate-400 text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
                                Everything you need to manage your links, packed into one beautiful platform. Click below to explore.
                            </p>
                        </motion.div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {features.map((f, i) => (
                            <motion.div 
                                key={f.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => setSelectedFeature(f)}
                                className="group p-12 rounded-[3.5rem] bg-white/[0.03] border border-white/5 hover:border-primary-500/50 hover:bg-white/[0.07] transition-all duration-500 cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/10 group-hover:to-transparent transition-all duration-700" />
                                
                                <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mb-10 border border-white/10 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                    {React.cloneElement(f.icon, { size: 36 })}
                                </div>
                                <h3 className="text-3xl font-black mb-6 text-white group-hover:text-primary-400 transition-colors">{f.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-lg font-medium">{f.desc}</p>
                                
                                <div className="mt-10 flex items-center text-sm font-black text-primary-400 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                                    Explore feature <ArrowRight size={20} className="ml-3" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Modal */}
            <AnimatePresence>
                {selectedFeature && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl"
                        onClick={() => setSelectedFeature(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            className="bg-slate-900 border border-white/10 rounded-[4rem] p-16 max-w-2xl w-full relative shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/20 blur-[100px] rounded-full pointer-events-none" />
                            
                            <button 
                                onClick={() => setSelectedFeature(null)}
                                className="absolute top-10 right-10 p-3 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all z-10"
                            >
                                <X size={32} />
                            </button>
                            
                            <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center mb-10 border border-white/10 shadow-2xl relative z-10">
                                {React.cloneElement(selectedFeature.icon, { size: 48 })}
                            </div>
                            
                            <h3 className="text-5xl font-black mb-8 relative z-10">{selectedFeature.title}</h3>
                            <p className="text-slate-300 text-2xl leading-relaxed font-medium relative z-10">{selectedFeature.details}</p>
                            
                            <button 
                                onClick={() => setSelectedFeature(null)}
                                className="mt-14 w-full py-6 rounded-3xl premium-gradient text-white font-black text-xl transition-all hover:scale-[1.02] shadow-2xl relative z-10"
                            >
                                Close Explorer
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CTA Section */}
            <section className="py-60 px-8 relative">
                 <div className="max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="p-20 rounded-[5rem] border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 premium-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-1000" />
                        <h2 className="text-6xl md:text-7xl font-black mb-10 tracking-tighter">Ready to shrink your links?</h2>
                        <p className="text-2xl text-slate-300 mb-16 font-medium leading-relaxed max-w-2xl mx-auto">Join thousands of users who trust SmartLink for their link management.</p>
                        <Link to="/signup" className="inline-flex px-14 py-7 rounded-full bg-white text-black font-black text-2xl hover:scale-105 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.2)]">
                            Create your free account
                        </Link>
                    </motion.div>
                 </div>
            </section>

            {/* Newsletter */}
            <section className="py-40 px-8 relative border-t border-white/5 bg-white/[0.01]">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <div className="inline-flex p-5 rounded-3xl bg-white/5 border border-white/10 text-primary-400 shadow-2xl">
                        <Mail size={40} />
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight">Stay in the loop</h2>
                    <p className="text-slate-400 text-2xl max-w-2xl mx-auto font-medium">
                        Get the latest updates, feature releases, and link management tips delivered straight to your inbox.
                    </p>
                    <form 
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const email = e.target.email.value;
                            try {
                                const res = await axios.post('/api/auth/subscribe', { email });
                                toast.success(res.data.msg || 'Subscribed!');
                                e.target.reset();
                            } catch (err) {
                                toast.error('Subscription failed. Try again.');
                            }
                        }}
                        className="flex flex-col sm:flex-row gap-6 max-w-2xl mx-auto mt-16"
                    >
                        <input 
                            name="email"
                            type="email" 
                            required
                            placeholder="Enter your email" 
                            className="flex-1 px-10 py-6 rounded-[2rem] bg-white/5 border border-white/10 text-white text-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all font-medium"
                        />
                        <button 
                            type="submit"
                            className="px-12 py-6 rounded-[2rem] premium-gradient text-white font-black text-xl hover:scale-105 transition-all shadow-2xl"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-40 px-10 border-t border-white/5 bg-slate-950/80">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
                        <div className="col-span-1 md:col-span-2 space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl premium-gradient flex items-center justify-center shadow-2xl border border-white/20">
                                    <Link2 className="text-white" size={32} />
                                </div>
                                <span className="text-4xl font-black text-white tracking-tighter">SmartLink</span>
                            </div>
                            <p className="text-slate-400 max-w-md text-xl leading-relaxed font-medium">
                                Empowering creators and businesses with the world's most advanced link management platform. Shorten, track, and optimize with ease.
                            </p>
                        </div>
                        
                        <div className="space-y-10">
                            <h4 className="text-sm font-black text-white uppercase tracking-[0.3em]">Product</h4>
                            <ul className="space-y-6 text-slate-400 text-lg font-bold">
                                <li><a href="#features" className="hover:text-primary-400 transition-colors">Features</a></li>
                                <li><Link to="/signup" className="hover:text-primary-400 transition-colors">Pricing</Link></li>
                                <li><Link to="/login" className="hover:text-primary-400 transition-colors">Analytics</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-10">
                            <h4 className="text-sm font-black text-white uppercase tracking-[0.3em]">Support</h4>
                            <ul className="space-y-6 text-slate-400 text-lg font-bold">
                                <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition-colors">API Docs</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition-colors">Status</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
                        <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">
                            © {new Date().getFullYear()} SmartLink. All rights reserved.
                        </p>
                        <div className="flex gap-10 text-xs font-black text-slate-500 uppercase tracking-widest">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
