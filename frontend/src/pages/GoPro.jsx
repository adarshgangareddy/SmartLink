import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, ShieldCheck, Globe, BarChart3, QrCode, Smartphone, ArrowRight, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const GoPro = () => {
  const { user, setUser } = useAuth();

  const handleUpgrade = async () => {
    try {
      // 1. Create Order on Backend
      const orderRes = await axios.post('/api/payments/create-order');
      const order = orderRes.data;

      // 2. Load Razorpay Script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
          amount: order.amount,
          currency: order.currency,
          name: 'SmartLink Industrial',
          description: 'Monthly Pro Subscription',
          order_id: order.id,
          handler: async (response) => {
            try {
              // 3. Verify Payment on Backend
              const verifyRes = await axios.post('/api/payments/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              
              if (verifyRes.data.status === 'success') {
                setUser({ ...user, is_pro: true });
                toast.success('Welcome to SmartLink Pro!', { icon: '🚀' });
              }
            } catch (err) {
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: user?.full_name,
            email: user?.email
          },
          theme: {
            color: '#3b82f6'
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to initiate payment. Please check your network or try again later.';
      toast.error(errorMsg, { duration: 5000 });
      console.error("Order creation failed:", err);
    }
  };

  const features = [
    { icon: <Zap className="text-yellow-400" />, title: 'Industrial API Access', desc: 'Dedicated high-rate API tokens for IoT device fleets.' },
    { icon: <Globe className="text-blue-400" />, title: 'Smart Geo-Redirects', desc: 'Route users to local servers based on their country.' },
    { icon: <ShieldCheck className="text-emerald-400" />, title: 'Link Auto-Expiry', desc: 'Links deactivate automatically after expiry or scan limit.' },
    { icon: <Sparkles className="text-purple-400" />, title: 'Branded Splash Pages', desc: 'Show your company logo before redirecting scanners.' },
    { icon: <Smartphone className="text-orange-400" />, title: 'Industrial Bulk Engine', desc: 'Manage thousands of links via CSV import/export.' },
    { icon: <Zap className="text-red-400" />, title: 'Real-Time Webhooks', desc: 'Instantly notify your backend when a product is scanned.' },
    { icon: <ShieldCheck className="text-blue-400" />, title: 'Secure Link Vault', desc: 'Password-protect sensitive product documentation.' },
    { icon: <Zap className="text-yellow-400" />, title: 'AB Performance Rotator', desc: 'Rotate traffic between URLs to test product versions.' },
    { icon: <Sparkles className="text-pink-400" />, title: 'Marketing Pixel Suite', desc: 'Embed FB/Google pixels in every shortened link.' },
    { icon: <BarChart3 className="text-purple-400" />, title: 'Hardware Analytics', desc: 'Track hardware models and OS versions of scanners.' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-20 pb-20">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-10">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 font-bold text-sm"
        >
            <Sparkles size={16} />
            Elevate Your Experience
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Supercharge your links with <span className="text-transparent bg-clip-text premium-gradient">SmartLink Pro</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Get access to advanced analytics, customizable QR codes, and custom domains to grow your brand.
        </p>
      </section>

      {/* Pricing and Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Features List */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-morphism p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-colors group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {f.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-sm text-slate-500">{f.desc}</p>
                </motion.div>
            ))}
        </section>

        {/* Upgrade Card */}
        <section className="relative">
            <div className="absolute -inset-4 premium-gradient opacity-20 blur-3xl rounded-[3rem]" />
            <div className="relative glass-morphism p-10 md:p-12 rounded-[3rem] border border-white/10 shadow-2xl space-y-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-1">Monthly Plan</h2>
                        <p className="text-slate-400">Everything you need to grow.</p>
                    </div>
                    <div className="p-3 bg-primary-500/10 rounded-2xl text-primary-400">
                        <Sparkles size={24} />
                    </div>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black text-white">₹18</span>
                    <span className="text-slate-500 text-xl font-medium">/ month</span>
                </div>

                <ul className="space-y-4 pt-4">
                    {[
                        'All Free Plan Features',
                        'Unlimited Links & Clicks',
                        'Styleable QR Codes',
                        'Custom Domain Options',
                        'Advanced Dashboard',
                        'Priority Support'
                    ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-300">
                            <div className="w-5 h-5 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                                <Check size={12} strokeWidth={3} />
                            </div>
                            {item}
                        </li>
                    ))}
                </ul>

                <button 
                    onClick={handleUpgrade}
                    disabled={user?.is_pro}
                    className={`w-full py-5 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-3 transition-all ${user?.is_pro ? 'bg-emerald-500/10 text-emerald-400 cursor-default' : 'premium-gradient text-white hover:scale-[1.02] shadow-xl shadow-primary-500/30'}`}
                >
                    {user?.is_pro ? (
                        <>
                            <ShieldCheck size={24} /> Already Pro
                        </>
                    ) : (
                        <>
                            <CreditCard size={24} /> Upgrade Now <ArrowRight size={24} />
                        </>
                    )}
                </button>
                
                <p className="text-center text-xs text-slate-500">
                    Secure payment. Cancel anytime. No hidden fees.
                </p>
            </div>
        </section>
      </div>

      {/* CTA Section */}
      <section className="glass-morphism p-12 rounded-[3.5rem] border border-white/5 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-5">
            <Globe size={300} />
        </div>
        <div className="relative z-10 space-y-6">
            <h2 className="text-4xl font-bold text-white">Trusted by 10,000+ creators</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
                Join our community of professionals and start managing your links with style and power.
            </p>
            <div className="flex flex-wrap justify-center gap-8 opacity-40 grayscale pt-6">
                <span className="text-2xl font-bold tracking-tighter">TECHCORP</span>
                <span className="text-2xl font-bold tracking-tighter">FLOWSTATE</span>
                <span className="text-2xl font-bold tracking-tighter">NEXUS</span>
                <span className="text-2xl font-bold tracking-tighter">LUMINA</span>
            </div>
        </div>
      </section>
    </div>
  );
};

export default GoPro;
