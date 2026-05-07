import React from 'react';
import { motion } from 'framer-motion';

const Background = () => {
  // Generate random particles
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * -20,
  }));

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#020617] pointer-events-none">
      {/* Dark gradient base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#020617] to-[#020617]"></div>

      {/* Glowing Orbs */}
      <motion.div 
        animate={{ 
          x: ['0%', '10%', '-10%', '0%'],
          y: ['0%', '5%', '-5%', '0%'],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 -left-20 w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[120px]" 
      />
      
      <motion.div 
        animate={{ 
          x: ['0%', '-10%', '10%', '0%'],
          y: ['0%', '-5%', '5%', '0%'],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
        className="absolute bottom-1/4 -right-20 w-[40rem] h-[40rem] bg-fuchsia-600/10 rounded-full blur-[120px]" 
      />

      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-emerald-600/5 rounded-full blur-[150px]" 
      />

      {/* Floating Particles (Game-like effect) */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            boxShadow: `0 0 ${p.size * 2}px rgba(255,255,255,0.4)`
          }}
          animate={{
            y: ['0%', '-2000%'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}

      {/* Grid overlay for a high-tech feel */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik00MCAwaC00MHY0MGg0MFYweiIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMCAwaDQwdjQwSDBWMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTM5LjUgMzkuNSB2LTQwIGgtNDAgdiA0MCBaIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMikiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-50" />
    </div>
  );
};

export default Background;
