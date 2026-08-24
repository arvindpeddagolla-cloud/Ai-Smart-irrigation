import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { 
  Menu, X, LogOut, User, Cpu, ChevronDown, Wrench, Droplet, 
  ShieldCheck, AlertTriangle, FileText, Smartphone, Settings, Bell 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, role, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Navbar scroll animation height state
  const [scrolled, setScrolled] = useState(false);

  // Active dropdown index hover state ('product', 'support', 'service', 'profile')
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToHowItWorks = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    if (activeTab !== 'home') {
      setActiveTab('home');
      // Delay slightly for React to mount the landing page
      setTimeout(() => {
        const el = document.getElementById('how-it-works');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAIChatClick = () => {
    setActiveDropdown(null);
    // Dispatch open chat drawer event
    window.dispatchEvent(new CustomEvent('open-ai-chat'));
  };

  // Nav Item bottom border styles
  const getLinkClass = (tabId) => {
    const isActive = activeTab === tabId;
    return `relative py-2 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
      isActive ? 'text-emerald-700 font-extrabold' : 'text-gray-600 hover:text-emerald-800'
    }`;
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled 
        ? 'h-16 bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100' 
        : 'h-[76px] bg-white/80 backdrop-blur-xs border-b border-gray-100/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          
          {/* Logo Brand Panel */}
          <div className="flex items-center cursor-pointer select-none" onClick={() => handleNavClick('home')}>
            <img 
              src="/logo.png" 
              alt="Ai Smart Irrigation Logo" 
              className="w-12 h-12 object-contain mr-3 transform transition hover:scale-105 rounded-xl border border-gray-100 bg-white" 
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-emerald-800 leading-tight tracking-tight font-display sm:text-base">
                SMART <span className="text-gray-900 block sm:inline">IRRIGATION</span>
              </span>
              <span className="hidden sm:block text-[8px] text-gray-400 font-bold tracking-widest mt-0.5">
                SMART FARMING. SMARTER DECISIONS.
              </span>
            </div>
          </div>

          {/* Desktop Links Panel */}
          <nav className="hidden lg:flex space-x-8 items-center h-full">
            
            {/* 1. PUBLIC NAVIGATION */}
            {!user && (
              <>
                <button onClick={() => handleNavClick('home')} className={getLinkClass('home')}>
                  Home
                  {activeTab === 'home' && <motion.div layoutId="navline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
                </button>

                <button onClick={handleScrollToHowItWorks} className="py-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-emerald-800 transition cursor-pointer">
                  How It Works
                </button>

                {/* Product Dropdown (Public) */}
                <div 
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setActiveDropdown('product')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-emerald-800 transition cursor-pointer">
                    <span>Product</span>
                    <ChevronDown size={14} className={`transition duration-200 ${activeDropdown === 'product' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'product' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute top-14 left-0 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl p-3 flex flex-col gap-1.5"
                      >
                        <button onClick={() => handleNavClick('my-product')} className="text-left w-full px-3 py-2 text-xs font-bold rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer">
                          🌱 Smart Irrigation V1
                        </button>
                        <button onClick={() => handleNavClick('upgrade')} className="text-left w-full px-3 py-2 text-xs font-bold rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer">
                          🆕 Smart Irrigation V2
                        </button>
                        <button onClick={() => handleNavClick('upgrade')} className="text-left w-full px-3 py-2 text-xs font-bold rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer border-t border-gray-100/50 pt-2 mt-1">
                          🔄 Upgrade Device
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Support Dropdown (Public) */}
                <div 
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setActiveDropdown('support')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-emerald-800 transition cursor-pointer">
                    <span>Support</span>
                    <ChevronDown size={14} className={`transition duration-200 ${activeDropdown === 'support' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'support' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute top-14 left-0 w-60 bg-white rounded-2xl border border-gray-100 shadow-xl p-3 flex flex-col gap-1"
                      >
                        <button onClick={handleAIChatClick} className="flex gap-2 items-start w-full px-3 py-2 rounded-xl hover:bg-emerald-50 text-left transition cursor-pointer">
                          <span className="text-sm">🤖</span>
                          <div>
                            <p className="text-xs font-extrabold text-gray-800">AI SmartCare</p>
                            <p className="text-[10px] text-gray-400 font-bold">Get help with your device</p>
                          </div>
                        </button>
                        <button onClick={() => handleNavClick('customer-care')} className="flex gap-2 items-start w-full px-3 py-2 rounded-xl hover:bg-emerald-50 text-left transition cursor-pointer">
                          <span className="text-sm">🛠</span>
                          <div>
                            <p className="text-xs font-extrabold text-gray-800">Request Repair</p>
                            <p className="text-[10px] text-gray-400 font-bold">Report a hardware issue</p>
                          </div>
                        </button>
                        <button onClick={() => handleNavClick('track-service')} className="flex gap-2 items-start w-full px-3 py-2 rounded-xl hover:bg-emerald-50 text-left transition cursor-pointer">
                          <span className="text-sm">🎫</span>
                          <div>
                            <p className="text-xs font-extrabold text-gray-800">Track Service</p>
                            <p className="text-[10px] text-gray-400 font-bold">Check diagnostics status</p>
                          </div>
                        </button>
                        <button onClick={() => handleNavClick('warranty')} className="flex gap-2 items-start w-full px-3 py-2 rounded-xl hover:bg-emerald-50 text-left transition cursor-pointer border-t border-gray-100/50 pt-2 mt-1">
                          <span className="text-sm">🛡</span>
                          <div>
                            <p className="text-xs font-extrabold text-gray-800">Warranty Check</p>
                            <p className="text-[10px] text-gray-400 font-bold">Verify node serial coverage</p>
                          </div>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* 2. FARMER AUTHENTICATED NAVIGATION */}
            {user && role === 'FARMER' && (
              <>
                <button onClick={() => handleNavClick('my-farm')} className={getLinkClass('my-farm')}>
                  My Farm
                  {activeTab === 'my-farm' && <motion.div layoutId="navline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
                </button>

                {/* Product Dropdown (Farmer) */}
                <div 
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setActiveDropdown('product')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-emerald-800 transition cursor-pointer">
                    <span>Product</span>
                    <ChevronDown size={14} className={`transition duration-200 ${activeDropdown === 'product' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'product' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute top-14 left-0 w-48 bg-white rounded-2xl border border-gray-100 shadow-xl p-3 flex flex-col gap-1"
                      >
                        <button onClick={() => handleNavClick('my-product')} className="text-left w-full px-3 py-2 text-xs font-bold rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer">
                          🌱 My Device Info
                        </button>
                        <button onClick={() => handleNavClick('warranty')} className="text-left w-full px-3 py-2 text-xs font-bold rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer">
                          🛡️ Warranty Checker
                        </button>
                        <button onClick={() => handleNavClick('upgrade')} className="text-left w-full px-3 py-2 text-xs font-bold rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer border-t border-gray-100/50 pt-2 mt-1">
                          🔄 Upgrade V2 Node
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Service Dropdown (Farmer) */}
                <div 
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setActiveDropdown('service')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-emerald-800 transition cursor-pointer">
                    <span>Service</span>
                    <ChevronDown size={14} className={`transition duration-200 ${activeDropdown === 'service' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'service' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute top-14 left-0 w-48 bg-white rounded-2xl border border-gray-100 shadow-xl p-3 flex flex-col gap-1"
                      >
                        <button onClick={() => handleNavClick('request-repair')} className="text-left w-full px-3 py-2 text-xs font-bold rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer">
                          🛠️ Request Repair
                        </button>
                        <button onClick={() => handleNavClick('track-service')} className="text-left w-full px-3 py-2 text-xs font-bold rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer">
                          🎫 Track Service
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Support Dropdown (Farmer) */}
                <div 
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setActiveDropdown('support')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-emerald-800 transition cursor-pointer">
                    <span>Support</span>
                    <ChevronDown size={14} className={`transition duration-200 ${activeDropdown === 'support' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'support' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute top-14 left-0 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl p-3 flex flex-col gap-1"
                      >
                        <button onClick={handleAIChatClick} className="text-left w-full px-3 py-2 text-xs font-bold rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer">
                          🤖 AI SmartCare Chat
                        </button>
                        <button onClick={() => handleNavClick('customer-care')} className="text-left w-full px-3 py-2 text-xs font-bold rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer">
                          🛠️ Support Ticketing
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* 3. ADMIN ISOLATED LINKS */}
            {user && role === 'ADMIN' && (
              <button onClick={() => handleNavClick('admin-dashboard')} className={getLinkClass('admin-dashboard')}>
                Admin Control Room
                {activeTab === 'admin-dashboard' && <motion.div layoutId="navline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
              </button>
            )}

            {/* 4. TECHNICIAN ISOLATED LINKS */}
            {user && role === 'TECHNICIAN' && (
              <>
                <button onClick={() => handleNavClick('tech-jobs')} className={getLinkClass('tech-jobs')}>
                  My Service Jobs
                  {activeTab === 'tech-jobs' && <motion.div layoutId="navline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
                </button>
                <button onClick={() => handleNavClick('track-service')} className={getLinkClass('track-service')}>
                  Track Service
                  {activeTab === 'track-service' && <motion.div layoutId="navline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
                </button>
              </>
            )}

          </nav>

          {/* Right End: Auth Buttons & Profile Dropdown */}
          <div className="hidden lg:flex items-center gap-4 h-full">
            
            {/* Unauthenticated CTAs */}
            {!user ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleNavClick('login')} 
                  className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-emerald-700 transition cursor-pointer uppercase tracking-wider"
                >
                  Login
                </button>
                <button 
                  onClick={() => handleNavClick('register')}
                  className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-2.5 px-5 rounded-xl shadow-md transition active:scale-95 cursor-pointer text-xs uppercase tracking-wider hover:-translate-y-0.5"
                >
                  <span>🌱 Get Started</span>
                </button>
              </div>
            ) : (
              
              /* Authenticated User Menu */
              <div 
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveDropdown('profile')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 hover:border-emerald-100 hover:bg-emerald-50/30 rounded-xl text-xs font-extrabold text-gray-800 transition cursor-pointer select-none">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">
                    👤
                  </div>
                  <span>{user.name.split(' ')[0]}</span>
                  <ChevronDown size={12} className={`text-gray-400 transition duration-200 ${activeDropdown === 'profile' ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'profile' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98, y: 8 }}
                      className="absolute right-0 top-14 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl p-3 flex flex-col gap-1"
                    >
                      <div className="px-3 py-1.5 border-b border-gray-100/50 mb-1">
                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">{role} Profile</p>
                        <p className="text-xs font-bold text-gray-700 mt-0.5 truncate">{user.name}</p>
                      </div>

                      <button onClick={() => handleNavClick('home')} className="text-left w-full px-3 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 rounded-xl transition cursor-pointer">
                        🌐 Return to Home
                      </button>

                      {role === 'FARMER' && (
                        <>
                          <button onClick={() => handleNavClick('my-farm')} className="text-left w-full px-3 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 rounded-xl transition cursor-pointer">
                            📊 My Farm Dashboard
                          </button>
                          <button onClick={() => handleNavClick('my-product')} className="text-left w-full px-3 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 rounded-xl transition cursor-pointer">
                            🌱 Managed Devices
                          </button>
                        </>
                      )}

                      <button 
                        onClick={logout} 
                        className="text-left w-full px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer border-t border-gray-100/50 pt-2 mt-1 flex items-center gap-1.5"
                      >
                        <LogOut size={13} />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            )}

          </div>

          {/* Mobile Navigation controls */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden w-full bg-white border-t border-gray-100 shadow-xl overflow-hidden"
          >
            <div className="px-4 py-5 space-y-3.5">
              
              {/* Unauthenticated mobile links */}
              {!user ? (
                <>
                  <button onClick={() => handleNavClick('home')} className="block w-full text-left py-2 px-3 text-sm font-bold text-gray-800 hover:bg-emerald-50 rounded-xl transition">
                    Home
                  </button>
                  <button onClick={handleScrollToHowItWorks} className="block w-full text-left py-2 px-3 text-sm font-bold text-gray-800 hover:bg-emerald-50 rounded-xl transition">
                    How It Works
                  </button>
                  <button onClick={() => handleNavClick('my-product')} className="block w-full text-left py-2 px-3 text-sm font-bold text-gray-800 hover:bg-emerald-50 rounded-xl transition">
                    Products
                  </button>
                  <button onClick={() => handleNavClick('customer-care')} className="block w-full text-left py-2 px-3 text-sm font-bold text-gray-800 hover:bg-emerald-50 rounded-xl transition">
                    Support
                  </button>

                  <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 mt-2">
                    <button onClick={() => handleNavClick('login')} className="py-2.5 text-center text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200">
                      LOGIN
                    </button>
                    <button onClick={() => handleNavClick('register')} className="py-2.5 text-center text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl">
                      GET STARTED
                    </button>
                  </div>
                </>
              ) : (
                
                /* Authenticated mobile links */
                <>
                  <div className="px-3 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">{role}</p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">{user.name}</p>
                    </div>
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">FARMER</span>
                  </div>

                  {role === 'FARMER' && (
                    <>
                      <button onClick={() => handleNavClick('my-farm')} className="block w-full text-left py-2 px-3 text-sm font-bold text-gray-800 hover:bg-emerald-50 rounded-xl transition">
                        My Farm
                      </button>
                      <button onClick={() => handleNavClick('my-product')} className="block w-full text-left py-2 px-3 text-sm font-bold text-gray-800 hover:bg-emerald-50 rounded-xl transition">
                        Device Manager
                      </button>
                      <button onClick={() => handleNavClick('request-repair')} className="block w-full text-left py-2 px-3 text-sm font-bold text-gray-800 hover:bg-emerald-50 rounded-xl transition">
                        Request Repair
                      </button>
                      <button onClick={() => handleNavClick('track-service')} className="block w-full text-left py-2 px-3 text-sm font-bold text-gray-800 hover:bg-emerald-50 rounded-xl transition">
                        Track Service
                      </button>
                      <button onClick={() => handleNavClick('warranty')} className="block w-full text-left py-2 px-3 text-sm font-bold text-gray-800 hover:bg-emerald-50 rounded-xl transition">
                        Warranty Check
                      </button>
                    </>
                  )}

                  {role === 'ADMIN' && (
                    <button onClick={() => handleNavClick('admin-dashboard')} className="block w-full text-left py-2 px-3 text-sm font-bold text-gray-800 hover:bg-emerald-50 rounded-xl transition">
                      Admin Dashboard
                    </button>
                  )}

                  {role === 'TECHNICIAN' && (
                    <>
                      <button onClick={() => handleNavClick('tech-jobs')} className="block w-full text-left py-2 px-3 text-sm font-bold text-gray-800 hover:bg-emerald-50 rounded-xl transition">
                        My Service Jobs
                      </button>
                      <button onClick={() => handleNavClick('track-service')} className="block w-full text-left py-2 px-3 text-sm font-bold text-gray-800 hover:bg-emerald-50 rounded-xl transition">
                        Track Service
                      </button>
                    </>
                  )}

                  <button 
                    onClick={logout} 
                    className="flex items-center gap-1.5 w-full text-left py-3 px-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition border-t border-gray-100 pt-4"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </>

              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
