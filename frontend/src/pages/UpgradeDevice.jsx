import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Cpu, ShieldCheck, ArrowRight, Zap, Check, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const features = [
  { name: 'Soil Moisture Probes', v1: 'Single depth capacitive probe', v2: 'Triple depth carbon sensors' },
  { name: 'Weather Forecast link', v1: 'Standard open APIs', v2: 'AI weather micro-climatology' },
  { name: 'Chassis/Enclosure', v1: 'IP65 ABS Plastic box', v2: 'IP68 Carbon-fiber reinforced' },
  { name: 'Battery Autonomy', v1: '2 weeks (solar assist)', v2: '6 weeks + dual backup battery' },
  { name: 'Wireless Transceiver', v1: '2.4GHz standard Wi-Fi', v2: 'Sub-GHz radio + Wi-Fi hybrid' },
  { name: 'Expansion Ports', v1: 'None', v2: '3 multi-sensor ports' }
];

export default function UpgradeDevice() {
  const { activeDevice, submitUpgradeRequest } = useApp();
  const [success, setSuccess] = useState(false);
  const [isV2Preview, setIsV2Preview] = useState(false); // Toggle to show transition

  const handleUpgradeSubmit = async (upgradeType) => {
    if (!activeDevice) return;
    const res = await submitUpgradeRequest({
      serialNumber: activeDevice.serialNumber,
      currentModel: activeDevice.model,
      requestedUpgrade: upgradeType
    });
    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 font-display">UPGRADE MY DEVICE</h1>
        <p className="text-gray-500 text-sm">Boost your farming intelligence with hardware upgrades.</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-2 animate-bounce">
          <CheckCircle size={16} />
          <span>UPGRADE REQUEST SUBMITTED SUCCESSFULY! OUR TEAM WILL CONTACT YOU.</span>
        </div>
      )}

      {/* Blueprint Visual Comparison */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xl border border-slate-800">
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
          
          {/* Controls & Features explanation */}
          <div className="space-y-4">
            <span className="bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Blueprint Simulator
            </span>
            <h3 className="text-2xl font-bold font-display leading-tight">
              Interactive Hardware Progression
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Toggle the switch to see the internal hardware layout changes from V1 (standard solar module) to V2 (heavy-duty sub-GHz deployment node).
            </p>

            <button
              onClick={() => setIsV2Preview(!isV2Preview)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/10 active:scale-95"
            >
              <span>{isV2Preview ? 'SHOW V1 SCHEMATIC' : 'TRANSITION TO V2 BLUEPRINT'}</span>
              <ArrowRight size={14} className={isV2Preview ? 'rotate-180 transition' : 'transition'} />
            </button>
          </div>

          {/* Graphical Frame */}
          <div className="flex justify-center h-64 relative bg-slate-950/60 rounded-2xl border border-slate-800/80 p-4">
            <AnimatePresence mode="wait">
              {!isV2Preview ? (
                <motion.div
                  key="v1"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center text-center space-y-3"
                >
                  {/* Schematic Drawing V1 */}
                  <div className="w-24 h-24 rounded-2xl border-2 border-emerald-500/30 flex items-center justify-center bg-emerald-500/5 relative">
                    <span className="text-3xl text-emerald-500">⚙️</span>
                    <span className="absolute bottom-1 right-2 text-[8px] font-mono text-emerald-400">V1.4</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Smart Irrigation V1 Box</h4>
                    <p className="text-[10px] text-slate-500 font-mono">Analog Capacitive Probe Node</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="v2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center text-center space-y-3"
                >
                  {/* Schematic Drawing V2 */}
                  <div className="w-28 h-28 rounded-3xl border-2 border-amber-400/50 flex items-center justify-center bg-amber-400/5 relative shadow-lg shadow-amber-500/5">
                    <span className="text-4xl text-amber-400 animate-pulse">🛰️</span>
                    <span className="absolute bottom-1.5 right-3.5 text-[8px] font-mono text-amber-400 font-bold">V2.0</span>
                    <span className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-400">Smart Irrigation V2 Carbon Pro</h4>
                    <p className="text-[10px] text-slate-500 font-mono">Tri-moisture Sub-GHz Transmitter</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Feature comparison table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 font-display">Specification Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 pl-6">Feature</th>
                <th className="p-4">V1 standard</th>
                <th className="p-4 text-emerald-800">V2 advanced</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {features.map((feat) => (
                <tr key={feat.name} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 pl-6 font-bold text-gray-700">{feat.name}</td>
                  <td className="p-4 text-gray-500">{feat.v1}</td>
                  <td className="p-4 text-emerald-800 font-bold flex items-center gap-1">
                    <Check size={14} className="text-emerald-600" />
                    <span>{feat.v2}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action buttons */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 font-display mb-4">Choose Your Upgrades</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleUpgradeSubmit('V2 Full Hardware')}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 px-6 rounded-xl text-xs transition shadow-md hover:-translate-y-0.5 cursor-pointer active:scale-95"
          >
            [ UPGRADE TO V2 ]
          </button>
          
          <button
            onClick={() => handleUpgradeSubmit('Additional Sensors Expansion')}
            className="bg-white hover:bg-slate-50 text-gray-700 border border-gray-200 font-bold py-3 px-5 rounded-xl text-xs transition cursor-pointer active:scale-95"
          >
            [ ADD MORE SENSORS ]
          </button>

          <button
            onClick={() => handleUpgradeSubmit('Sub-GHz Antenna')}
            className="bg-white hover:bg-slate-50 text-gray-700 border border-gray-200 font-bold py-3 px-5 rounded-xl text-xs transition cursor-pointer active:scale-95"
          >
            [ UPGRADE CONNECTIVITY ]
          </button>

          <button
            onClick={() => handleUpgradeSubmit('Battery Backup Extender')}
            className="bg-white hover:bg-slate-50 text-gray-700 border border-gray-200 font-bold py-3 px-5 rounded-xl text-xs transition cursor-pointer active:scale-95"
          >
            [ ADD BATTERY BACKUP ]
          </button>

          <a
            href="#support"
            onClick={(e) => {
              e.preventDefault();
              const chatbot = document.getElementById('ai-floating-chat-btn');
              if (chatbot) chatbot.click();
            }}
            className="bg-white hover:bg-slate-50 text-gray-700 border border-gray-200 font-bold py-3 px-5 rounded-xl text-xs transition cursor-pointer text-center"
          >
            [ TALK TO SUPPORT ]
          </a>
        </div>
      </div>

    </div>
  );
}
