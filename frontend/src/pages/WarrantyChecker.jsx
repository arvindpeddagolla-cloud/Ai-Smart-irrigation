import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { ShieldCheck, ShieldAlert, Search, RefreshCw, Wrench, RefreshCcw } from 'lucide-react';

export default function WarrantyChecker({ setActiveTab }) {
  const { checkWarrantyStatus } = useApp();
  const [serial, setSerial] = useState('SI123456');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!serial.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    const res = await checkWarrantyStatus(serial.trim().toUpperCase());
    setLoading(false);

    if (res.success) {
      setResult(res.warranty);
    } else {
      setErrorMsg(res.message || 'No records found.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 font-display">WARRANTY CHECK</h1>
          <p className="text-xs text-gray-400 mt-1">Look up warranty status and period calculations for your registered hardware.</p>
        </div>

        <form onSubmit={handleCheck} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Enter Serial Number (e.g. SI123456)"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'CHECK WARRANTY'}
          </button>
        </form>

        {errorMsg && (
          <p className="text-center text-xs text-red-500 font-bold">{errorMsg}</p>
        )}

        {/* Results view */}
        {result && (
          <div className="border-t border-gray-100 pt-6 space-y-4">
            
            {result.status === 'ACTIVE' ? (
              <div className="flex gap-3 items-center bg-green-50 p-4 rounded-xl border border-green-100 text-green-800">
                <ShieldCheck className="w-8 h-8 text-green-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Coverage status</h4>
                  <p className="text-sm font-extrabold mt-0.5">✓ ACTIVE WARRANTY</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 items-center bg-red-50 p-4 rounded-xl border border-red-100 text-red-800">
                <ShieldAlert className="w-8 h-8 text-red-600 shrink-0 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Coverage status</h4>
                  <p className="text-sm font-extrabold mt-0.5">⚠ WARRANTY EXPIRED</p>
                </div>
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold uppercase text-[10px]">PRODUCT</span>
                <span className="font-bold text-gray-800">{result.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold uppercase text-[10px]">SERIAL</span>
                <span className="font-mono font-bold text-gray-800">{result.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold uppercase text-[10px]">PURCHASED</span>
                <span className="font-bold text-gray-700">
                  {new Date(result.purchaseDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold uppercase text-[10px]">EXPIRES</span>
                <span className="font-bold text-gray-700">
                  {new Date(result.expiryDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Expired Action Items */}
            {result.status === 'EXPIRED' && (
              <div className="space-y-2 pt-2">
                <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                  Your device warranty has expired. You can renew support or request model upgrades.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('upgrade')}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 rounded-lg text-[10px] sm:text-xs transition text-center cursor-pointer"
                  >
                    Upgrade Model
                  </button>
                  <button
                    onClick={() => setActiveTab('customer-care')}
                    className="flex-1 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-bold py-2 rounded-lg text-[10px] sm:text-xs transition text-center cursor-pointer"
                  >
                    Talk to Support
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
