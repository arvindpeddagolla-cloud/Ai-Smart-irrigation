import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { 
  Sprout, ShieldAlert, Cpu, Heart, CheckCircle2, ChevronRight, 
  Play, Pause, ChevronLeft, Droplet, Thermometer, Wifi, CloudRain, 
  Sun, Battery, Check, Wrench, ArrowRight, Settings, Smartphone, Plus, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage({ setActiveTab }) {
  const { activeDevice, simSoilMoisture, simTemperature, simHumidity, simBattery } = useApp();
  
  // Carousel Autoplay & Progress State
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  // Video Playing State (Slide 3)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);

  // Installation Steps State (Slide 4)
  const [activeStep, setActiveStep] = useState(0);

  // Monitor slide simulated state (Slide 5)
  const [monitorMode, setMonitorMode] = useState('RAIN'); // 'RAIN' or 'DRY'

  // Slide list descriptions
  const slideTitles = ['PRODUCT', 'SERVICE', 'HOW IT WORKS', 'INSTALL', 'MONITOR'];

  // Toggle monitor mode on Slide 5
  useEffect(() => {
    if (activeSlide !== 4) return;
    const interval = setInterval(() => {
      setMonitorMode(prev => prev === 'RAIN' ? 'DRY' : 'RAIN');
    }, 3000);
    return () => clearInterval(interval);
  }, [activeSlide]);

  // Autoplay progression (6 seconds per slide)
  useEffect(() => {
    if (!isPlaying || isVideoPlaying) return;

    const tickRate = 60; // 60ms
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setActiveSlide((curr) => (curr + 1) % 5);
          return 0;
        }
        return p + 1; // 1% increment => reaches 100% in 6 seconds (60ms * 100)
      });
    }, tickRate);

    return () => clearInterval(interval);
  }, [isPlaying, isVideoPlaying, activeSlide]);

  const goToSlide = (idx) => {
    setActiveSlide(idx);
    setProgress(0);
    setIsVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const nextSlide = () => {
    goToSlide((activeSlide + 1) % 5);
  };

  const prevSlide = () => {
    goToSlide((activeSlide - 1 + 5) % 5);
  };

  // Video controller methods
  const playVideo = () => {
    setIsVideoPlaying(true);
    setIsPlaying(false);
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play();
    }
  };

  const pauseVideo = () => {
    setIsVideoPlaying(false);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Slide 4 Installation Steps content
  const installSteps = [
    {
      num: 1,
      title: 'PLACE SENSOR',
      icon: '📍',
      desc: 'Insert the soil moisture sensor probe into the ground near your crops\' root zone for accurate depth readings.'
    },
    {
      num: 2,
      title: 'CONNECT CONTROLLER',
      icon: '🔌',
      desc: 'Plug the probe wire pins into the waterproof main Smart Irrigation terminal inputs.'
    },
    {
      num: 3,
      title: 'PAIR WI-FI',
      icon: '📡',
      desc: 'Turn on the device. Connect to the device\'s local hotspot access point, configure farm Wi-Fi parameters, and link.'
    },
    {
      num: 4,
      title: 'HOOK IRRIGATION',
      icon: '💧',
      desc: 'Wire the controller relay outputs directly to your solenoid valves or local water pump engine switch.'
    },
    {
      num: 5,
      title: 'REGISTER PORTAL',
      icon: '📱',
      desc: 'Log in to your Smart Irrigation dashboard, type the serial number (e.g. SI123456) and submit device details.'
    },
    {
      num: 6,
      title: 'MONITOR TELEMETRY',
      icon: '🌱',
      desc: 'All sensors will start sending diagnostics to your screen, activating smart irrigation schedules immediately.'
    }
  ];

  return (
    <div className="bg-gradient-to-b from-emerald-50/40 via-white to-emerald-50/10 min-h-screen font-body pb-12">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Text Copy */}
          <div className="lg:col-span-5 space-y-6">
            <img 
              src="/logo.png" 
              alt="Ai Smart Irrigation Logo" 
              className="w-32 h-32 object-contain mb-2 drop-shadow-md transform transition hover:scale-105" 
            />
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider animate-bounce">
              <Sprout size={14} />
              <span>AI SMART IRRIGATION SYSTEM</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight font-display">
              SMART IRRIGATION
            </h1>
            
            <p className="text-2xl font-bold text-emerald-700 font-display">
              "Smart farming. Smarter decisions."
            </p>
            
            <p className="text-gray-600 text-sm leading-relaxed">
              Optimize agricultural water use using IoT moisture sensors, real-time weather integration, and smart AI diagnostics. Protect your fields, conserve resources, and get instant technical assistance.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => setActiveTab('my-farm')}
                className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3.5 px-7 rounded-xl shadow-lg shadow-emerald-700/20 hover:shadow-emerald-700/30 hover:-translate-y-0.5 transition cursor-pointer active:scale-[0.97]"
              >
                <span>🌱 MY FARM</span>
                <ChevronRight size={16} />
              </button>
              
              <button
                onClick={() => setActiveTab('customer-care')}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-extrabold py-3.5 px-7 rounded-xl shadow hover:-translate-y-0.5 transition cursor-pointer active:scale-[0.97]"
              >
                <span>🛠 CUSTOMER CARE</span>
              </button>
            </div>
          </div>

          {/* Right Column: 5-Slide Interactive Hero Showcase */}
          <div className="lg:col-span-7 flex flex-col gap-4 w-full">
            
            {/* Slide Categories / Top Progress Bars Indicator */}
            <div className="grid grid-cols-5 gap-1.5 px-2">
              {slideTitles.map((title, idx) => {
                const isActive = idx === activeSlide;
                return (
                  <button
                    key={title}
                    onClick={() => goToSlide(idx)}
                    className="flex flex-col text-left focus:outline-none cursor-pointer group"
                  >
                    {/* Label (Desktop Only) */}
                    <span className={`hidden md:block text-[9px] font-extrabold tracking-wider mb-1 transition ${
                      isActive ? 'text-emerald-800 font-black' : 'text-gray-400 group-hover:text-gray-700'
                    }`}>
                      {title}
                    </span>
                    {/* Progress Bar Track */}
                    <div className="h-1 bg-gray-200 rounded-full w-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-700 rounded-full transition-all duration-75"
                        style={{ width: `${isActive ? progress : (idx < activeSlide ? 100 : 0)}%` }}
                      ></div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Main Interactive Carousel Display Card */}
            <div className="relative w-full aspect-square bg-slate-950 text-white rounded-[28px] overflow-hidden shadow-2xl border border-gray-200/10 flex flex-col justify-between">
              
              {/* Slides Rendering Wrapper */}
              <div className="flex-1 w-full relative overflow-hidden">
                <AnimatePresence mode="wait">
                  
                  {/* SLIDE 1: PRODUCT */}
                  {activeSlide === 0 && (
                    <motion.div
                      key="slide1"
                      initial={{ opacity: 0, x: 50, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -50, scale: 0.98 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex flex-col justify-between"
                    >
                      {/* Product Box Background */}
                      <div className="absolute inset-0 z-0">
                        <img
                          src="/product.png"
                          alt="Smart Irrigation V1 Device"
                          className="w-full h-full object-cover transition duration-[6000ms] scale-105 hover:scale-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-900/10"></div>
                      </div>

                      {/* Header Badge */}
                      <div className="p-6 relative z-10">
                        <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                          🌱 PRODUCT
                        </span>
                      </div>

                      {/* Footer Info Overlay */}
                      <div className="p-6 relative z-10 space-y-3 bg-slate-950/45 backdrop-blur-xs rounded-b-[28px] border-t border-white/5">
                        <div className="flex justify-between items-end">
                          <div>
                            <h3 className="text-xl font-bold font-display text-white">SMART IRRIGATION V1</h3>
                            <p className="text-slate-300 text-xs mt-0.5">Your intelligent irrigation companion.</p>
                          </div>
                          
                          <button
                            onClick={() => setActiveTab('my-product')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] py-2 px-4 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                          >
                            VIEW PRODUCT
                          </button>
                        </div>

                        {/* Specs bullet tags */}
                        <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-emerald-300 font-bold">
                          <span className="bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/30">✓ Soil Moisture Probe</span>
                          <span className="bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/30">✓ Temp & Hum Ingestion</span>
                          <span className="bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/30">✓ AI Weather sync</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* SLIDE 2: CUSTOMER CARE */}
                  {activeSlide === 1 && (
                    <motion.div
                      key="slide2"
                      initial={{ opacity: 0, x: 50, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -50, scale: 0.98 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex flex-col justify-between"
                    >
                      {/* Image background */}
                      <div className="absolute inset-0 z-0">
                        <img
                          src="/repair.png"
                          alt="Technician repairing Smart Irrigation device"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-slate-900/10"></div>
                      </div>

                      {/* Header Badge */}
                      <div className="p-6 relative z-10 flex justify-between items-start">
                        <span className="bg-amber-600/90 backdrop-blur-xs text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                          🛠 CUSTOMER SUPPORT
                        </span>
                        
                        <button
                          onClick={() => setActiveTab('customer-care')}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] py-1.5 px-4 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                        >
                          GET SUPPORT
                        </button>
                      </div>

                      {/* Diagnostic flow and description */}
                      <div className="p-6 relative z-10 space-y-4 bg-slate-950/65 backdrop-blur-xs rounded-b-[28px] border-t border-white/5">
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold font-display text-white">SMARTCARE SERVICE</h3>
                          <p className="text-slate-300 text-xs font-semibold leading-relaxed">
                            Report issues, upload photos/videos, run AI checks, and dispatch certified hardware experts straight to your field.
                          </p>
                        </div>

                        {/* Dispatch step flow timeline */}
                        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
                          <div className="flex items-center justify-between text-[8px] font-bold text-slate-400">
                            <span>ISSUE FLAGGED</span>
                            <span className="text-slate-500">→</span>
                            <span>AI TROUBLESHOOT</span>
                            <span className="text-slate-500">→</span>
                            <span>TICKET DRAFT</span>
                            <span className="text-slate-500">→</span>
                            <span className="text-amber-400">TECH REPAIR</span>
                            <span className="text-slate-500">→</span>
                            <span className="text-emerald-400">COMPLETED ✓</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* SLIDE 3: HOW IT WORKS */}
                  {activeSlide === 2 && (
                    <motion.div
                      key="slide3"
                      initial={{ opacity: 0, x: 50, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -50, scale: 0.98 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex flex-col justify-between"
                    >
                      {/* Video Player/Preview */}
                      <div className="absolute inset-0 z-0 bg-slate-950 flex items-center justify-center">
                        <video
                          ref={videoRef}
                          playsInline
                          loop
                          muted={!isVideoPlaying}
                          controls={isVideoPlaying}
                          className="w-full h-full object-cover"
                          onPause={pauseVideo}
                          onEnded={pauseVideo}
                        >
                          <source src="/i_need_video_in_farmming_land.mp4" type="video/mp4" />
                        </video>
                        <div className={`absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-900/10 transition duration-300 ${isVideoPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}></div>

                        {/* Play overlay button */}
                        {!isVideoPlaying && (
                          <button
                            onClick={playVideo}
                            className="absolute z-20 w-16 h-16 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
                          >
                            <Play size={24} className="ml-1" />
                          </button>
                        )}
                      </div>

                      {/* Header Badge */}
                      {!isVideoPlaying && (
                        <div className="p-6 relative z-10">
                          <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                            🤖 SMART DECISION ENGINE
                          </span>
                        </div>
                      )}

                      {/* Flow schematic explanation */}
                      {!isVideoPlaying && (
                        <div className="p-6 relative z-10 space-y-4 bg-slate-950/65 backdrop-blur-xs rounded-b-[28px] border-t border-white/5">
                          <div className="flex justify-between items-end">
                            <div>
                              <h3 className="text-xl font-bold font-display text-white">HOW IT WORKS</h3>
                              <p className="text-slate-300 text-xs">AI cross-references soil data with rainfall probability forecasts.</p>
                            </div>
                            
                            <button
                              onClick={playVideo}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] py-2 px-4 rounded-xl flex items-center gap-1 shadow cursor-pointer"
                            >
                              <Play size={12} fill="white" />
                              <span>WATCH VIDEO</span>
                            </button>
                          </div>

                          {/* Node flow diagram */}
                          <div className="grid grid-cols-6 gap-1 text-[8px] font-black text-center text-slate-300">
                            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">🌱 SOIL (25%)</div>
                            <div className="flex items-center justify-center text-slate-600">→</div>
                            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">🌧️ RAIN (80%)</div>
                            <div className="flex items-center justify-center text-slate-600">→</div>
                            <div className="bg-emerald-950/80 text-emerald-300 p-1.5 rounded-lg border border-emerald-800/40">🤖 AI: WAIT</div>
                            <div className="bg-blue-950/80 text-blue-300 p-1.5 rounded-lg border border-blue-800/40">💧 PAUSED</div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* SLIDE 4: HOW TO INSTALL */}
                  {activeSlide === 3 && (
                    <motion.div
                      key="slide4"
                      initial={{ opacity: 0, x: 50, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -50, scale: 0.98 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex flex-col justify-between bg-slate-900 p-6"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                          📦 EASY SETUP
                        </span>
                        
                        <button
                          onClick={() => {
                            if (activeStep < 5) {
                              setActiveStep(activeStep + 1);
                            } else {
                              nextSlide();
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] py-1.5 px-4 rounded-xl flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-md"
                        >
                          <span>{activeStep === 5 ? 'NEXT SLIDE' : 'NEXT STEP →'}</span>
                        </button>
                      </div>

                      {/* Main stepping visual area */}
                      <div className="grid grid-cols-12 gap-4 items-center flex-1">
                        
                        {/* Numbers Left selector */}
                        <div className="col-span-4 space-y-1.5 border-r border-slate-800 pr-3">
                          {installSteps.map((step, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveStep(idx)}
                              className={`w-full flex items-center gap-2 p-2 rounded-xl text-left transition text-[10px] font-bold cursor-pointer ${
                                activeStep === idx 
                                  ? 'bg-emerald-900/60 border border-emerald-600/30 text-white' 
                                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black ${
                                activeStep === idx ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {step.num}
                              </span>
                              <span className="truncate hidden sm:inline">{step.title}</span>
                            </button>
                          ))}
                        </div>

                        {/* Visual details right display */}
                        <div className="col-span-8 flex flex-col justify-center space-y-3 pl-2 h-full justify-center">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-800/30 flex items-center justify-center text-2xl shadow-lg">
                            {installSteps[activeStep].icon}
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                              STEP 0{installSteps[activeStep].num} — {installSteps[activeStep].title}
                            </span>
                            <p className="text-sm font-bold text-white mt-1 leading-snug">
                              {installSteps[activeStep].title}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-medium">
                              {installSteps[activeStep].desc}
                            </p>
                          </div>
                        </div>

                      </div>

                    </motion.div>
                  )}

                  {/* SLIDE 5: MONITOR & DECIDE */}
                  {activeSlide === 4 && (
                    <motion.div
                      key="slide5"
                      initial={{ opacity: 0, x: 50, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -50, scale: 0.98 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex flex-col justify-between bg-slate-900 p-6 text-slate-300"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start border-b border-slate-800/40 pb-3">
                        <span className="bg-blue-600/90 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                          📊 MONITOR • UNDERSTAND • ACT
                        </span>
                        
                        <button
                          onClick={() => setActiveTab('my-farm')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] py-1.5 px-4 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                        >
                          OPEN MY FARM
                        </button>
                      </div>

                      {/* Mock Interactive Dashboard Preview */}
                      <div className="flex-1 flex flex-col justify-center space-y-4 max-w-sm mx-auto w-full">
                        
                        <div className="flex justify-between items-center text-xs font-bold bg-slate-950 p-3 rounded-2xl border border-slate-800/50">
                          <div>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">DEVICE FLEET STATUS</p>
                            <p className="text-white font-display mt-0.5">Smart Irrigation V1</p>
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-status-pulse"></span>
                            <span className="text-[10px] font-bold text-green-400">ONLINE</span>
                          </div>
                        </div>

                        {/* Dynamic telemetry stats grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {/* Soil Moisture */}
                          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/40">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Soil Moisture</span>
                            <p className="text-lg font-black text-emerald-400 mt-1 font-display">
                              {monitorMode === 'RAIN' ? '42%' : '18%'}
                            </p>
                          </div>

                          {/* Weather prediction */}
                          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/40">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Weather Forecast</span>
                            <p className="text-xs font-bold text-white mt-1.5 flex items-center gap-1">
                              {monitorMode === 'RAIN' ? (
                                <>
                                  <CloudRain size={13} className="text-blue-400 animate-bounce" />
                                  <span>Rain expected</span>
                                </>
                              ) : (
                                <>
                                  <Sun size={13} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                                  <span>Clear / Sunny</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Recommender card */}
                        <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                          monitorMode === 'RAIN' 
                            ? 'bg-blue-950/30 border-blue-900/30 text-blue-300' 
                            : 'bg-emerald-950/30 border-emerald-900/30 text-emerald-300'
                        }`}>
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">AI SYSTEM DECISION</p>
                            <p className="text-xs font-extrabold mt-0.5">
                              {monitorMode === 'RAIN' ? 'WAIT — Rain expected' : '💧 IRRIGATION RECOMMENDED'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 leading-normal font-medium">
                              {monitorMode === 'RAIN' 
                                ? 'Postpone irrigation. Rainfall prediction probability matches moisture buffers.' 
                                : 'Sensors detect dry soil. Watering threshold triggered.'}
                            </p>
                          </div>
                        </div>

                      </div>

                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Bottom Navigation controls */}
              <div className="bg-slate-950/80 px-6 py-4 border-t border-white/5 flex justify-between items-center z-20">
                <button
                  onClick={prevSlide}
                  aria-label="Previous Slide"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white transition cursor-pointer select-none"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                {/* Circle Dots indicators */}
                <div className="flex gap-2">
                  {slideTitles.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToSlide(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-2.5 rounded-full transition cursor-pointer ${
                        activeSlide === idx ? 'w-6 bg-emerald-500 shadow' : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                      }`}
                    ></button>
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  aria-label="Next Slide"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white transition cursor-pointer select-none"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* How it works section */}
      <div id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-100 scroll-mt-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 font-display mb-12">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm text-center space-y-4 hover:shadow-md transition">
            <img 
              src="/step_sensor.png" 
              alt="Deploy Sensors" 
              className="w-full h-40 object-cover rounded-2xl shadow-inner bg-slate-50" 
            />
            <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center mx-auto text-lg font-black font-display">
              1
            </div>
            <h3 className="font-bold text-lg text-gray-800">Deploy Sensors</h3>
            <p className="text-sm text-gray-600">
              Plug the IoT V1 moisture probe into target crop beds. Readings ingest every 30 seconds.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm text-center space-y-4 hover:shadow-md transition">
            <img 
              src="/step_ai.png" 
              alt="AI Weather Analytics" 
              className="w-full h-40 object-cover rounded-2xl shadow-inner bg-slate-50" 
            />
            <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center mx-auto text-lg font-black font-display">
              2
            </div>
            <h3 className="font-bold text-lg text-gray-800">AI Analyzes Data</h3>
            <p className="text-sm text-gray-600">
              Weather intelligence checks localized rain charts, cross-referencing values to predict needs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm text-center space-y-4 hover:shadow-md transition">
            <img 
              src="/step_irrigate.png" 
              alt="Irrigate Safely" 
              className="w-full h-40 object-cover rounded-2xl shadow-inner bg-slate-50" 
            />
            <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center mx-auto text-lg font-black font-display">
              3
            </div>
            <h3 className="font-bold text-lg text-gray-800">Irrigate Safely</h3>
            <p className="text-sm text-gray-600">
              Receive smart alerts recommending whether to spray or wait for incoming rain cycles.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits section */}
      <div className="bg-emerald-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <h2 className="text-3xl font-bold font-display">Benefits for Farmers</h2>
            <p className="text-emerald-100 text-sm">
              Smart Irrigation saves resources and secures crop yield through data-driven decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-extrabold font-display text-emerald-300">40%</div>
              <h4 className="font-bold text-sm">Water Saved</h4>
              <p className="text-xs text-emerald-100">Avoid overwatering when rain is predicted.</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-extrabold font-display text-emerald-300">18%</div>
              <h4 className="font-bold text-sm">Yield Increase</h4>
              <p className="text-xs text-emerald-100">Ensure root zones stay at optimal moisture bands.</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-extrabold font-display text-emerald-300">24/7</div>
              <h4 className="font-bold text-sm">Automated Logs</h4>
              <p className="text-xs text-emerald-100">Keep records of soil health trends over time.</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-extrabold font-display text-emerald-300">1 hr</div>
              <h4 className="font-bold text-sm">Dispatch Time</h4>
              <p className="text-xs text-emerald-100">Hardware technicians assigned instantly on faults.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Models */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold font-display text-gray-900 mb-12">Supported Models</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-left flex flex-col justify-between">
            <div>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full mb-3 inline-block">Active Model</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Irrigation V1</h3>
              <p className="text-gray-600 text-sm mb-4">
                Our legacy robust IoT unit. Equipped with a standard analog capacitive moisture probe, temperature sync, solar charger hook, and high-performance Wi-Fi transmitter.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('my-farm')}
              className="text-emerald-700 font-bold text-sm flex items-center gap-1 hover:underline cursor-pointer"
            >
              Configure V1 <ChevronRight size={16} />
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-left flex flex-col justify-between">
            <div>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full mb-3 inline-block">New Release</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Irrigation V2</h3>
              <p className="text-gray-600 text-sm mb-4">
                Premium multi-probe hardware. Features long-range sub-GHz radio connectivity, carbon enclosure, triple depth sensors, and a secondary lithium backup battery.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('upgrade')}
              className="text-amber-700 font-bold text-sm flex items-center gap-1 hover:underline cursor-pointer"
            >
              Explore Upgrade <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Customer Testimonial */}
      <div className="bg-gray-50 py-16 border-t border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 font-display">Customer Testimonial</h2>
          <blockquote className="text-lg text-gray-600 italic">
            "Before using the Smart Irrigation hub, I used to water the crop bed based on visual dryness. Often I watered just hours before heavy rain. Now, the Weather Intelligence tells me to wait. It saved me thousands in water bills this season."
          </blockquote>
          <div>
            <p className="font-bold text-emerald-800">Ramesh Patel</p>
            <p className="text-xs text-gray-400 font-semibold">Farmer, XYZ Village</p>
          </div>
        </div>
      </div>
    </div>
  );
}
