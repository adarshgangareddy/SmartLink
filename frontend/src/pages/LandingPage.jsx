import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Link2, Zap, BarChart3, Shield, ArrowRight, X, Globe, Lock, Share2, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const LandingPage = () => {
    const [selectedFeature, setSelectedFeature] = useState(null);

    // User-centric features
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
    ];

    // Animation variants
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

    const floatingVariants = {
        initial: { y: 0 },
        animate: {
            y: [-15, 15, -15],
            transition: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden selection:bg-primary-500/30 font-sans">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 backdrop-blur-2xl border-b border-white/5 py-4 px-8 bg-slate-950/50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <Link2 className="text-white" size={22} />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">SmartLink</span>
                    </motion.div>
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                        <a href="#features" className="hover:text-white transition-colors cursor-pointer">Features</a>
                        <a href="#about" className="hover:text-white transition-colors cursor-pointer">About</a>
                    </nav>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-6">
                        <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Log In</Link>
                        <Link to="/signup" className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center gap-2">
                            Get Started
                        </Link>
                    </motion.div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-8 min-h-screen flex items-center justify-center">
                {/* Background animations */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-primary-600/10 blur-[150px] rounded-full pointer-events-none" />
                <motion.div variants={floatingVariants} initial="initial" animate="animate" className="absolute top-40 left-[15%] w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
                <motion.div variants={floatingVariants} initial="initial" animate="animate" style={{animationDelay: '-2s'}} className="absolute bottom-40 right-[15%] w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

                <div className="max-w-6xl mx-auto text-center relative z-10 w-full">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="flex flex-col items-center"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-primary-400 mb-10 shadow-lg backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                            </span>
                            SmartLink goes global — Try it now
                        </motion.div>
                        
                        <motion.h1 variants={itemVariants} className="text-6xl md:text-[5.5rem] font-black tracking-tight mb-8 leading-[1.05] drop-shadow-2xl">
                            Make every link <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-blue-400 to-purple-400">
                                work harder for you.
                            </span>
                        </motion.h1>
                        
                        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-14 leading-relaxed font-light">
                            The ultimate URL shortener for modern creators and businesses. Transform long, ugly links into powerful tracking tools in seconds.
                        </motion.p>
                        
                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
                            <Link to="/signup" className="w-full sm:w-auto px-10 py-5 rounded-full premium-gradient text-white font-bold text-lg shadow-[0_0_40px_rgba(var(--color-primary-500),0.3)] hover:shadow-[0_0_60px_rgba(var(--color-primary-500),0.5)] hover:-translate-y-1 transition-all flex items-center justify-center group relative overflow-hidden">
                                <span className="relative z-10 flex items-center">
                                    Start for free
                                    <ArrowRight className="inline-block ml-3 group-hover:translate-x-2 transition-transform" />
                                </span>
                            </Link>
                            <a href="#features" className="w-full sm:w-auto px-10 py-5 rounded-full glass-morphism border border-white/10 text-white font-bold text-lg hover:bg-white/5 transition-all text-center">
                                See how it works
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features (Interactive Modals) */}
            <section id="features" className="py-32 px-8 relative bg-slate-900/50 border-t border-white/5">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            <h2 className="text-4xl md:text-5xl font-black mb-6">Why Choose SmartLink?</h2>
                            <p className="text-slate-400 text-xl max-w-2xl mx-auto font-light">
                                Everything you need to manage your links, packed into one beautiful platform. Click below to explore.
                            </p>
                        </motion.div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <motion.div 
                                key={f.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
                                onClick={() => setSelectedFeature(f)}
                                className="p-10 glass-morphism rounded-[2.5rem] border border-white/5 hover:border-primary-500/40 hover:bg-white/[0.05] transition-all duration-300 group cursor-pointer relative overflow-hidden"
                            >
                                {/* Hover background glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:to-transparent transition-all duration-500" />
                                
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 relative z-10"
                                >
                                    {f.icon}
                                </motion.div>
                                <h3 className="text-2xl font-bold mb-4 text-white relative z-10">{f.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-lg relative z-10">{f.desc}</p>
                                <div className="mt-8 flex items-center text-sm font-bold text-primary-400 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 relative z-10">
                                    Explore feature <ArrowRight size={18} className="ml-2" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Modal for Features */}
            <AnimatePresence>
                {selectedFeature && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
                        onClick={() => setSelectedFeature(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 max-w-lg w-full relative shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[80px] rounded-full pointer-events-none" />
                            
                            <button 
                                onClick={() => setSelectedFeature(null)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-10"
                            >
                                <X size={24} />
                            </button>
                            
                            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 shadow-lg inline-flex relative z-10">
                                {React.cloneElement(selectedFeature.icon, { size: 36 })}
                            </div>
                            
                            <h3 className="text-4xl font-black mb-6 relative z-10">{selectedFeature.title}</h3>
                            <div className="w-16 h-1.5 premium-gradient rounded-full mb-8 relative z-10" />
                            <p className="text-slate-300 text-xl leading-relaxed font-light relative z-10">{selectedFeature.details}</p>
                            
                            <button 
                                onClick={() => setSelectedFeature(null)}
                                className="mt-12 w-full py-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-lg transition-colors relative z-10"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CTA Section */}
            <section className="py-32 px-8 relative overflow-hidden">
                 <div className="absolute inset-0 premium-gradient opacity-10" />
                 <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="p-16 rounded-[3rem] border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl"
                    >
                        <h2 className="text-5xl font-black mb-6">Ready to shrink your links?</h2>
                        <p className="text-xl text-slate-300 mb-10 font-light">Join thousands of users who trust SmartLink for their link management.</p>
                        <Link to="/signup" className="inline-flex px-12 py-5 rounded-full bg-white text-black font-black text-xl hover:scale-105 transition-all shadow-xl">
                            Create your free account
                        </Link>
                    </motion.div>
                 </div>
            </section>

            {/* Newsletter Subscription */}
            <section className="py-20 px-8 relative border-t border-white/5 bg-slate-900/30">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 text-primary-400">
                            <Mail size={24} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Stay in the loop</h2>
                        <p className="text-slate-400 text-lg max-w-xl mx-auto">
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
                            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                        >
                            <input 
                                name="email"
                                type="email" 
                                required
                                placeholder="Enter your email" 
                                className="flex-1 px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                            />
                            <button 
                                type="submit"
                                className="px-8 py-4 rounded-xl premium-gradient text-white font-bold hover:scale-105 transition-all shadow-lg"
                            >
                                Subscribe
                            </button>
                        </form>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-8 border-t border-white/5 bg-black/40 relative overflow-hidden">
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-500/5 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-2 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center shadow-lg">
                                    <Link2 className="text-white" size={20} />
                                </div>
                                <span className="text-2xl font-black text-white">SmartLink</span>
                            </div>
                            <p className="text-slate-400 max-w-sm leading-relaxed">
                                Empowering creators and businesses with the world's most advanced link management platform. Shorten, track, and optimize with ease.
                            </p>
                            <div className="flex gap-4">
                                <a 
                                    href="https://www.instagram.com/zyntri_official?igsh=bTB3ejg0M3NwOWc4" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:scale-110 transition-all border border-white/5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                                </a>
                                <a 
                                    href="https://chat.whatsapp.com/CKqtVSVs5k22DucoMptaeX?mode=gi_t" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:scale-110 transition-all border border-white/5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14 8.38 8.38 0 0 1 3.8.9L21 3z"/></svg>
                                </a>
                                <a href="#" className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:scale-110 transition-all border border-white/5">
                                    <Globe size={20} />
                                </a>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Product</h4>
                            <ul className="space-y-4 text-slate-400">
                                <li><a href="#features" className="hover:text-primary-400 transition-colors">Features</a></li>
                                <li><Link to="/signup" className="hover:text-primary-400 transition-colors">Pricing</Link></li>
                                <li><Link to="/login" className="hover:text-primary-400 transition-colors">Analytics</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Support</h4>
                            <ul className="space-y-4 text-slate-400">
                                <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition-colors">API Docs</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition-colors">Status</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-slate-500 text-sm">
                            © {new Date().getFullYear()} SmartLink. All rights reserved.
                        </p>
                        <div className="flex gap-8 text-sm text-slate-500">
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
