import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { ShieldAlert, Eye, EyeOff, ArrowRight, Loader2, ArrowLeft, User, Phone, Mail, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage({ redirectTab, setActiveTab, initialIsLogin = true }) {
  const { login } = useApp();
  const [isLoginTab, setIsLoginTab] = useState(initialIsLogin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [regRole, setRegRole] = useState('FARMER');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (isLoginTab) {
      // Login
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        if (setActiveTab) {
          setActiveTab(redirectTab && redirectTab !== 'login' ? redirectTab : 'my-farm');
        }
      } else {
        setErrorMsg(res.message || 'Invalid email or password.');
      }
    } else {
      // Register
      if (!name || !email || !password || !phone) {
        setErrorMsg('Please fill out all registration fields.');
        setLoading(false);
        return;
      }
      try {
        const regRes = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone, role: regRole })
        });
        const regData = await regRes.json();
        if (regData.success) {
          const res = await login(email, password);
          if (res.success && setActiveTab) {
            setActiveTab('my-farm');
          }
        } else {
          setErrorMsg(regData.message || 'Registration failed.');
        }
      } catch (err) {
        // Fallback mock register bypass for local development
        const res = await login(email, password);
        if (res.success && setActiveTab) {
          setActiveTab('my-farm');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBackToHome = () => {
    if (setActiveTab) {
      setActiveTab('home');
    }
  };

  const handleRoleChange = (roleType) => {
    setIsLoginTab(true);
    setErrorMsg('');
    if (roleType === 'FARMER') {
      setEmail('ramesh@farm.com');
      setPassword('password123');
    } else if (roleType === 'TECHNICIAN') {
      setEmail('ravi@smartcare.com');
      setPassword('password123');
    } else if (roleType === 'ADMIN') {
      setEmail('admin@smartirrigation.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/60 via-white to-sky-50/60 relative overflow-hidden flex flex-col justify-between font-body">
      
      {/* BACKGROUND DECORATIONS (Floating Leaves, Droplets, Clouds) */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        
        {/* Connection Animation Lines (Behind the Card) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
          <svg width="600" height="600" viewBox="0 0 600 600" className="w-full max-w-[600px] aspect-square">
            <line x1="100" y1="100" x2="300" y2="300" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-emerald-800" />
            <line x1="500" y1="100" x2="300" y2="300" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-sky-800" />
            <line x1="100" y1="500" x2="300" y2="300" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-emerald-800" />
            <line x1="500" y1="500" x2="300" y2="300" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-blue-800" />
            <circle cx="300" cy="300" r="40" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-800" />
          </svg>
        </div>

        {/* Ambient drift emojis */}
        <motion.span animate={{ y: [0, -15, 0], x: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[15%] left-[10%] text-3xl opacity-20">🌱</motion.span>
        <motion.span animate={{ y: [0, 20, 0], x: [0, -10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-[20%] left-[15%] text-3xl opacity-25">🌾</motion.span>
        <motion.span animate={{ y: [0, -12, 0], x: [0, 8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[25%] right-[12%] text-3xl opacity-20">☁️</motion.span>
        <motion.span animate={{ y: [0, 18, 0], x: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-[15%] right-[10%] text-3xl opacity-25">💧</motion.span>
      </div>

      {/* HEADER SECTION (Minimal top-left branding & escape button) */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-5 flex justify-between items-center z-10 relative">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <div className="flex flex-col">
            <span className="text-xs font-black text-emerald-800 tracking-wider">SMART IRRIGATION</span>
            <span className="text-[7px] font-bold text-gray-400 tracking-widest">SMART FARMING. SMARTER DECISIONS.</span>
          </div>
        </div>

        <button 
          onClick={handleBackToHome}
          className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-emerald-700 transition cursor-pointer select-none"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </button>
      </header>

      {/* CENTERED CARD & FLOATING LABELS SECTION */}
      <main className="flex-1 w-full flex items-center justify-center p-4 relative z-10">
        
        {/* DECORATIVE FLOATING IoT CARDS (Desktop Only) */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          
          {/* Top Left: SENSOR ONLINE */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[25%] left-[24%] bg-white/70 backdrop-blur-md border border-white/40 p-3 rounded-2xl shadow-md flex items-center gap-2 text-[10px] font-bold text-slate-700"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            <span>🌱 SENSOR ONLINE</span>
          </motion.div>

          {/* Top Right: WEATHER CONNECTED */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, y: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[22%] right-[22%] bg-white/70 backdrop-blur-md border border-white/40 p-3 rounded-2xl shadow-md flex items-center gap-2 text-[10px] font-bold text-slate-700"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span>☁️ WEATHER CONNECTED</span>
          </motion.div>

          {/* Bottom Left: IoT CONNECTED */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0, y: [0, 6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[22%] left-[20%] bg-white/70 backdrop-blur-md border border-white/40 p-3 rounded-2xl shadow-md flex items-center gap-2 text-[10px] font-bold text-slate-700"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>📡 IoT CONNECTED</span>
          </motion.div>

          {/* Bottom Right: IRRIGATION READY */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[24%] right-[24%] bg-white/70 backdrop-blur-md border border-white/40 p-3 rounded-2xl shadow-md flex items-center gap-2 text-[10px] font-bold text-slate-700"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span>
            <span>💧 IRRIGATION READY</span>
          </motion.div>

        </div>

        {/* LOGIN PORTAL CARD */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-[420px] max-w-[calc(100%-40px)] bg-white/92 border border-white/30 rounded-[28px] shadow-2xl p-8 sm:p-10 backdrop-blur-md flex flex-col justify-between"
        >
          
          {/* Card branding */}
          <div className="text-center space-y-2 mb-5">
            <img src="/logo.png" alt="Emblem" className="w-14 h-14 object-contain mx-auto transform transition duration-500 hover:scale-105" />
            <h2 className="text-xs font-black tracking-widest text-emerald-800 uppercase">
              SMART IRRIGATION
            </h2>
            <p className="text-[8px] font-black text-gray-400 tracking-wider uppercase">
              SMART FARMING. SMARTER DECISIONS.
            </p>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-1 text-left mb-5">
            <h3 className="text-lg font-black text-gray-900 font-display uppercase tracking-tight">
              {isLoginTab ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold leading-normal">
              {isLoginTab 
                ? 'Sign in to manage your Smart Irrigation device settings.' 
                : 'Sign up to register your hardware telemetry nodes.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {errorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-700 px-3.5 py-2.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Name field (Sign up only) */}
            {!isLoginTab && (
              <div className="space-y-1">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  FULL NAME
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-[17px] text-sm">👤</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-[52px] pl-10 pr-4 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-xs font-bold transition focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/5"
                  />
                </div>
              </div>
            )}

            {/* Phone field (Sign up only) */}
            {!isLoginTab && (
              <div className="space-y-1">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  PHONE NUMBER
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-[17px] text-sm">📞</span>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 XXXXX XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-[52px] pl-10 pr-4 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-xs font-bold transition focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/5"
                  />
                </div>
              </div>
            )}

            {/* Role selection (Sign up only) */}
            {!isLoginTab && (
              <div className="space-y-1">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  ACCOUNT ROLE
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => setRegRole('FARMER')}
                    className={`py-2.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer select-none text-center ${
                      regRole === 'FARMER' 
                        ? 'bg-white text-emerald-800 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    🌾 Farmer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('TECHNICIAN')}
                    className={`py-2.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer select-none text-center ${
                      regRole === 'TECHNICIAN' 
                        ? 'bg-white text-amber-800 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    👷 Tech
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('ADMIN')}
                    className={`py-2.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer select-none text-center ${
                      regRole === 'ADMIN' 
                        ? 'bg-white text-slate-800 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    ⚙️ Admin
                  </button>
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-[17px] text-sm">📧</span>
                <input
                  type="email"
                  required
                  placeholder="e.g. aarav.sharma@farm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[52px] pl-10 pr-4 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-xs font-bold transition focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/5"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  PASSWORD
                </label>
                {isLoginTab && (
                  <button 
                    type="button"
                    className="text-[9px] font-bold text-emerald-700 hover:underline cursor-pointer select-none"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-[17px] text-sm">🔑</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[52px] pl-10 pr-10 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-xs font-bold transition focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-[17px] text-slate-400 hover:text-emerald-700 transition cursor-pointer select-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Sign In / Sign Up Trigger Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[54px] bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl transition active:scale-95 cursor-pointer shadow-md hover:shadow-emerald-700/10 hover:-translate-y-0.5 flex justify-center items-center gap-1.5 text-xs uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{isLoginTab ? 'SIGNING IN...' : 'CREATING ACCOUNT...'}</span>
                </>
              ) : (
                <>
                  <span>{isLoginTab ? 'SIGN IN' : 'REGISTER'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>

          </form>

          {/* Form Switch Link (Login / Register Switcher) */}
          <div className="text-center mt-5">
            <button
              onClick={() => {
                setIsLoginTab(!isLoginTab);
                setErrorMsg('');
              }}
              className="text-xs text-emerald-700 hover:underline font-bold cursor-pointer select-none"
            >
              {isLoginTab ? "Don't have an account? Sign Up" : "Already registered? Sign In"}
            </button>
          </div>

        </motion.div>

        {/* Demo Accounts Quick-Fill Tiles */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex flex-wrap gap-3 justify-center max-w-sm w-full px-2"
        >
          {/* Farmer Card */}
          <button
            onClick={() => handleRoleChange('FARMER')}
            className="flex-1 min-w-[90px] bg-white/70 backdrop-blur-xs border border-white/40 hover:border-emerald-300 hover:bg-emerald-50/50 p-2.5 rounded-2xl shadow-sm text-center transition cursor-pointer select-none active:scale-95"
          >
            <span className="text-base">🌾</span>
            <p className="text-[9px] font-black text-emerald-800 uppercase tracking-wider mt-1">Farmer</p>
            <p className="text-[7.5px] text-slate-400 font-bold mt-0.5">Ramesh Demo</p>
          </button>

          {/* Tech Card */}
          <button
            onClick={() => handleRoleChange('TECHNICIAN')}
            className="flex-1 min-w-[90px] bg-white/70 backdrop-blur-xs border border-white/40 hover:border-amber-300 hover:bg-amber-50/50 p-2.5 rounded-2xl shadow-sm text-center transition cursor-pointer select-none active:scale-95"
          >
            <span className="text-base">👷</span>
            <p className="text-[9px] font-black text-amber-800 uppercase tracking-wider mt-1">Tech</p>
            <p className="text-[7.5px] text-slate-400 font-bold mt-0.5">Ravi Demo</p>
          </button>

          {/* Admin Card */}
          <button
            onClick={() => handleRoleChange('ADMIN')}
            className="flex-1 min-w-[90px] bg-white/70 backdrop-blur-xs border border-white/40 hover:border-slate-300 hover:bg-slate-100/50 p-2.5 rounded-2xl shadow-sm text-center transition cursor-pointer select-none active:scale-95"
          >
            <span className="text-base">⚙️</span>
            <p className="text-[9px] font-black text-slate-800 uppercase tracking-wider mt-1">Admin</p>
            <p className="text-[7.5px] text-slate-400 font-bold mt-0.5">System Demo</p>
          </button>
        </motion.div>

      </main>

      {/* FOOTER SECTION (Clean copyright) */}
      <footer className="w-full py-4 text-center z-10 relative">
        <p className="text-[9px] text-slate-400 font-bold tracking-wide uppercase">
          © 2026 SMART IRRIGATION Ecosystem. All rights reserved.
        </p>
      </footer>

    </div>
  );
}
