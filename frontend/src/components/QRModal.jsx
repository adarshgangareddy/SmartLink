import React, { useState, useRef, useEffect } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { X, Download, Share2, MessageCircle, Copy, Check, Palette, Smartphone, Send, Grid, Settings2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const QRModal = ({ isOpen, onClose, url, shortCode }) => {
  const { user } = useAuth();
  const [fgColor, setFgColor] = useState('#000000');
  const [qrType, setQrType] = useState('dots'); // dots, rounded, square
  const [cornerType, setCornerType] = useState('extra-rounded');
  const [qrName, setQrName] = useState('');
  const [copied, setCopied] = useState(false);
  const [logoBase64, setLogoBase64] = useState(null);
  
  const qrRef = useRef(null);
  const qrCode = useRef(null);

  useEffect(() => {
    if (isOpen && !qrCode.current) {
      qrCode.current = new QRCodeStyling({
        width: 250,
        height: 250,
        type: 'canvas',
        data: url,
        margin: 5,
        qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'H' },
        imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 0 },
        dotsOptions: { color: fgColor, type: qrType },
        cornersSquareOptions: { color: fgColor, type: cornerType },
        cornersDotOptions: { color: fgColor, type: 'dot' },
        backgroundOptions: { color: '#ffffff' },
      });
    }

    if (qrCode.current) {
        qrCode.current.update({
            data: url,
            dotsOptions: { color: fgColor, type: qrType },
            cornersSquareOptions: { color: fgColor, type: cornerType },
            image: logoBase64 || undefined
        });
    }
  }, [isOpen, url, fgColor, qrType, cornerType, logoBase64]);

  useEffect(() => {
    if (isOpen && qrRef.current && qrCode.current) {
        qrRef.current.innerHTML = '';
        qrCode.current.append(qrRef.current);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const downloadQR = (ext = 'png') => {
    qrCode.current.download({ name: `smartlink-${shortCode}`, extension: ext });
    toast.success('QR Code downloaded!');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoBase64(reader.result);
        };
        reader.readAsDataURL(file);
    }
  };

  const COLORS = [
    { name: 'Black', hex: '#000000' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Purple', hex: '#6366f1' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Amber', hex: '#f59e0b' },
  ];

  const STYLES = [
    { id: 'dots', label: 'Dots', icon: <Grid size={14} /> },
    { id: 'rounded', label: 'Smooth', icon: <Settings2 size={14} /> },
    { id: 'extra-rounded', label: 'Liquid', icon: <Smartphone size={14} /> },
    { id: 'square', label: 'Classic', icon: <Grid size={14} /> },
  ];

  const handleProAction = (callback, value) => {
    if (!user?.is_pro) {
        toast.error('Upgrade to SmartLink Pro to unlock advanced styles!', {
            icon: '⭐',
            style: { border: '1px solid #fbbf24', color: '#fbbf24' }
        });
        return;
    }
    callback(value);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl glass-morphism border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left: Preview */}
        <div className="w-full md:w-1/2 p-10 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center space-y-8 border-b md:border-b-0 md:border-r border-white/5">
            <div className="relative group">
                <div className="absolute -inset-4 premium-gradient opacity-20 blur-2xl group-hover:opacity-40 transition-opacity" />
                <div className="relative p-4 bg-white rounded-[2rem] shadow-2xl">
                    <div ref={qrRef} className="overflow-hidden rounded-2xl" />
                    {qrName && (
                        <p className="mt-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 truncate max-w-[200px]">
                            {qrName}
                        </p>
                    )}
                </div>
            </div>
            
            <div className="w-full max-w-xs space-y-4">
                <div className="flex items-center justify-between gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-xs text-slate-400 font-medium truncate ml-2">{url}</span>
                    <button onClick={() => { navigator.clipboard.writeText(url); toast.success('Link copied!'); }} className="p-2 rounded-xl hover:bg-white/10 text-slate-400">
                        <Copy size={14} />
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => downloadQR('png')} className="py-3 bg-white text-black font-bold rounded-2xl text-sm hover:bg-slate-200 transition-colors">
                        Save PNG
                    </button>
                    <button onClick={() => downloadQR('svg')} className="py-3 bg-slate-800 text-white font-bold rounded-2xl text-sm hover:bg-slate-700 transition-colors">
                        Save SVG
                    </button>
                </div>
            </div>
        </div>

        {/* Right: Customization */}
        <div className="w-full md:w-1/2 p-8 md:p-10 space-y-8 overflow-y-auto max-h-[90vh]">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Designer <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">STUDIO</span>
                    </h2>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">QR Visual Identity</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-slate-400 transition-colors">
                    <X size={20} />
                </button>
            </header>

            <div className="space-y-8">
                {/* 1. Theme Color */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-slate-300 uppercase tracking-tighter flex items-center gap-2">
                            <Palette size={16} className="text-primary-400" /> Brand Color
                        </label>
                        {!user?.is_pro && <Sparkles size={14} className="text-yellow-400 animate-pulse" />}
                    </div>
                    <div className="grid grid-cols-6 gap-3">
                        {COLORS.map((c) => (
                            <button 
                                key={c.hex}
                                onClick={() => handleProAction(setFgColor, c.hex)}
                                className={`w-full aspect-square rounded-xl border-2 transition-all ${fgColor === c.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105 hover:border-white/20'} ${!user?.is_pro && c.hex !== '#000000' ? 'grayscale opacity-50' : ''}`}
                                style={{ backgroundColor: c.hex }}
                            />
                        ))}
                    </div>
                </div>

                {/* 2. Shape Style */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-300 uppercase tracking-tighter flex items-center gap-2">
                        <Grid size={16} className="text-primary-400" /> Pattern Style
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {STYLES.map((s) => (
                            <button 
                                key={s.id}
                                onClick={() => handleProAction(setQrType, s.id)}
                                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${qrType === s.id ? 'bg-primary-500/10 border-primary-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'} ${!user?.is_pro && s.id !== 'square' ? 'opacity-50 grayscale' : ''}`}
                            >
                                {s.icon}
                                <span className="text-xs font-bold">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Logo Upload */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-slate-300 uppercase tracking-tighter flex items-center gap-2">
                            <ImageIcon size={16} className="text-primary-400" /> Add Logo
                        </label>
                        {!user?.is_pro && <span className="text-[10px] font-black text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">PRO</span>}
                    </div>
                    <div className="relative">
                        <input 
                            type="file" 
                            accept="image/*"
                            disabled={!user?.is_pro}
                            onChange={handleLogoUpload}
                            className="hidden" 
                            id="logo-upload" 
                        />
                        <label 
                            htmlFor="logo-upload"
                            className={`flex items-center justify-center gap-3 w-full p-4 bg-slate-900 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-primary-500 transition-colors group ${!user?.is_pro ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {logoBase64 ? (
                                <img src={logoBase64} alt="Preview" className="w-8 h-8 rounded-lg object-contain" />
                            ) : (
                                <ImageIcon className="text-slate-500 group-hover:text-primary-400" />
                            )}
                            <span className="text-xs font-bold text-slate-400 group-hover:text-white uppercase tracking-widest">
                                {logoBase64 ? 'Change Branding' : 'Upload Center Logo'}
                            </span>
                        </label>
                    </div>
                </div>

                {/* 4. Action Summary */}
                <div className="pt-4 flex items-center justify-center gap-6 opacity-30">
                    <Share2 size={18} />
                    <MessageCircle size={18} />
                    <Send size={18} />
                    <Smartphone size={18} />
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QRModal;
