import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function RepairRequest({ setActiveTab, setTrackedTicketId }) {
  const {
    user,
    activeDevice,
    createTicket
  } = useApp();

  const [serialNumber, setSerialNumber] = useState(activeDevice ? activeDevice.serialNumber : 'SI123456');
  const [problem, setProblem] = useState('');
  const [isWorking, setIsWorking] = useState('NO');
  const [hasWarranty, setHasWarranty] = useState('YES');
  const [preferredService, setPreferredService] = useState('Technician Visit');
  const [location, setLocation] = useState('XYZ Village, Block 4, Farm Plot B');
  const [loading, setLoading] = useState(false);
  const [successTicket, setSuccessTicket] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problem.trim()) return;

    setLoading(true);
    const ticketData = {
      productModel: activeDevice ? activeDevice.model : 'Smart Irrigation V1',
      serialNumber: serialNumber.toUpperCase(),
      category: 'Request Repair',
      description: `[Is Working: ${isWorking}] [Warranty: ${hasWarranty}] [Service Preference: ${preferredService}] ${problem}`,
      priority: 'HIGH',
      location: location
    };

    const res = await createTicket(ticketData);
    setLoading(false);

    if (res.success) {
      setSuccessTicket(res.ticket);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {successTicket ? (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={32} />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-emerald-800 font-display">✓ REPAIR TICKET FILED</h2>
            <p className="text-xs text-gray-500 font-semibold">Your device is now queued for service.</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left space-y-1">
            <p className="text-[10px] text-gray-400 font-bold">REPAIR TICKET ID</p>
            <p className="text-base font-mono font-extrabold text-slate-800">{successTicket.ticketId}</p>
            <p className="text-xs text-gray-500 mt-2">Preferred Dispatch: <span className="font-bold text-gray-700">{preferredService}</span></p>
          </div>

          <button
            onClick={() => {
              setTrackedTicketId(successTicket.ticketId);
              setActiveTab('track-service');
            }}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
          >
            TRACK SERVICE
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-display">REQUEST A REPAIR</h1>
            <p className="text-gray-400 text-xs mt-1">Book repairs or hardware replacements for your smart modules.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Product Model</label>
              <input
                type="text"
                readOnly
                value={activeDevice ? activeDevice.model : 'Smart Irrigation V1'}
                className="w-full bg-slate-100 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none text-gray-500 font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Serial Number</label>
              <input
                type="text"
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
              />
            </div>

            {/* Is device working? */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Is device working?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsWorking('YES')}
                  className={`py-2 px-4 text-xs font-bold border rounded-xl transition cursor-pointer ${
                    isWorking === 'YES' ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' : 'bg-slate-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  YES
                </button>
                <button
                  type="button"
                  onClick={() => setIsWorking('NO')}
                  className={`py-2 px-4 text-xs font-bold border rounded-xl transition cursor-pointer ${
                    isWorking === 'NO' ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' : 'bg-slate-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  NO
                </button>
              </div>
            </div>

            {/* Warranty status? */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Warranty?</label>
              <div className="grid grid-cols-3 gap-2">
                {['YES', 'NO', "DON'T KNOW"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setHasWarranty(opt)}
                    className={`py-2 text-[10px] sm:text-xs font-bold border rounded-xl transition cursor-pointer ${
                      hasWarranty === opt ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' : 'bg-slate-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Service */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Preferred service:</label>
              <div className="space-y-2">
                {[
                  { value: 'Technician Visit', desc: 'Hardware field technician visits your farm plot.' },
                  { value: 'Send Device', desc: 'Mail your core box to our repair center.' },
                  { value: 'Phone Support', desc: 'Schedule a call with an IoT support engineer.' }
                ].map((serv) => (
                  <label
                    key={serv.value}
                    onClick={() => setPreferredService(serv.value)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      preferredService === serv.value ? 'bg-emerald-50/50 border-emerald-600/30' : 'bg-slate-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="preferredService"
                      checked={preferredService === serv.value}
                      onChange={() => {}}
                      className="accent-emerald-700 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-800">{serv.value}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{serv.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Farm Location Address</label>
              <input
                type="text"
                required
                placeholder="e.g. Block C, Plot 14, XYZ Village, India"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Explain the problem</label>
              <textarea
                required
                rows="3"
                placeholder="Explain the damage or symptom..."
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs transition cursor-pointer active:scale-95 flex justify-center items-center gap-1.5 shadow"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>REQUESTING REPAIR...</span>
                </>
              ) : (
                <span>REQUEST REPAIR</span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
