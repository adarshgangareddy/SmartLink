import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

const SplashPage = () => {
    const [searchParams] = useSearchParams();
    const target = searchParams.get('target');
    const logo = searchParams.get('logo');
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.location.href = target;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [target]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/5 rounded-full blur-[120px]" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full glass-morphism p-12 rounded-[3.5rem] border border-white/10 text-center space-y-10 relative z-10"
            >
                <div className="space-y-6">
                    {logo ? (
                        <motion.div 
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            className="w-32 h-32 mx-auto bg-white p-4 rounded-3xl shadow-2xl border border-white/10"
                        >
                            <img src={logo} alt="Brand Logo" className="w-full h-full object-contain" />
                        </motion.div>
                    ) : (
                        <div className="w-20 h-20 mx-auto premium-gradient rounded-3xl flex items-center justify-center shadow-2xl">
                            <Zap className="text-white" size={40} />
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-white uppercase tracking-widest">Redirecting via SmartLink</h1>
                        <p className="text-slate-500 text-sm font-medium">Please wait while we establish a secure connection...</p>
                    </div>
                </div>

                <div className="relative">
                    <div className="w-24 h-24 mx-auto rounded-full border-4 border-white/5 flex items-center justify-center">
                        <span className="text-3xl font-black text-white">{countdown}</span>
                        <svg className="absolute top-0 left-0 w-full h-full -rotate-90">
                            <circle 
                                cx="48" cy="48" r="44" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="4" 
                                className="text-primary-500"
                                strokeDasharray="276"
                                strokeDashoffset={276 - (276 * countdown / 5)}
                                style={{ transition: 'stroke-dashoffset 1s linear' }}
                            />
                        </svg>
                    </div>
                </div>

                <div className="space-y-6">
                    <a 
                        href={target}
                        className="inline-flex items-center gap-2 text-primary-400 font-bold hover:text-primary-300 transition-colors"
                    >
                        Skip and proceed <ExternalLink size={16} />
                    </a>
                    
                    <div className="flex justify-center gap-8 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <ShieldCheck size={14} className="text-emerald-500" /> Secure Redirect
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Loader2 size={14} className="animate-spin text-primary-400" /> Validating Link
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SplashPage;
