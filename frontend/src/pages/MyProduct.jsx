import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Cpu, ShieldCheck, Calendar, FileText, Wrench, Plus, Upload, CheckCircle } from 'lucide-react';

export default function MyProduct() {
  const {
    devices,
    registerDevice,
    tickets
  } = useApp();

  const [showRegForm, setShowRegForm] = useState(devices.length === 0);
  const [formData, setFormData] = useState({
    model: 'Smart Irrigation V1',
    serialNumber: '',
    purchaseDate: '',
    purchaseLocation: '',
    invoiceFile: null
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  const activeDevice = devices[0];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadProgress(true);
      // Simulate file upload metadata collection
      setTimeout(() => {
        setFormData({ ...formData, invoiceFile: file.name });
        setUploadProgress(false);
      }, 800);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.serialNumber || !formData.purchaseDate) return;

    const res = await registerDevice({
      model: formData.model,
      serialNumber: formData.serialNumber,
      purchaseDate: formData.purchaseDate
    });

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setShowRegForm(false);
        setFormData({
          model: 'Smart Irrigation V1',
          serialNumber: '',
          purchaseDate: '',
          purchaseLocation: '',
          invoiceFile: null
        });
      }, 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 font-display">MY PRODUCT</h1>
          <p className="text-gray-500 text-sm">Review device specification records and warranty coverage.</p>
        </div>
        {!showRegForm && (
          <button
            onClick={() => setShowRegForm(true)}
            className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Register New Device</span>
          </button>
        )}
      </div>

      {showRegForm ? (
        /* Register form */
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6 max-w-xl mx-auto">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={36} className="animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 font-display">✓ DEVICE REGISTERED</h2>
              <p className="text-sm text-gray-500">Your hardware warranty has been activated and linked to your profile.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 font-display border-b border-gray-100 pb-2">REGISTER YOUR DEVICE</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Product Model</label>
                  <select
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  >
                    <option value="Smart Irrigation V1">Smart Irrigation V1</option>
                    <option value="Smart Irrigation V2">Smart Irrigation V2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Serial Number</label>
                  <input
                    type="text"
                    name="serialNumber"
                    required
                    placeholder="e.g. SI123456"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Purchase Date</label>
                  <input
                    type="date"
                    name="purchaseDate"
                    required
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Purchase Location</label>
                  <input
                    type="text"
                    name="purchaseLocation"
                    placeholder="Retail dealer name / Online"
                    value={formData.purchaseLocation}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* File upload abstraction */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Upload Purchase Invoice</label>
                <div className="border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 transition relative overflow-hidden">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-gray-400 mb-1.5" />
                  <p className="text-xs font-bold text-gray-700">
                    {formData.invoiceFile ? formData.invoiceFile : 'Click to select or drop invoice document'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG or PDF files up to 10MB</p>
                  {uploadProgress && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-xs font-bold text-emerald-800">
                      Uploading invoice...
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition cursor-pointer active:scale-95 text-center"
                >
                  REGISTER DEVICE
                </button>
                {devices.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowRegForm(false)}
                    className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      ) : (
        /* Device Detail View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* General Info Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:col-span-2 space-y-4">
              <h3 className="font-bold text-gray-900 font-display border-b border-gray-50 pb-2">Device Specs</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <Cpu className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Product model</p>
                    <p className="text-xs font-bold text-gray-800">{activeDevice.model}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Warranty Status</p>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold mt-0.5">
                      ✓ ACTIVE
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Registration Date</p>
                    <p className="text-xs font-bold text-gray-800">
                      {new Date(activeDevice.registeredAt || activeDevice.purchaseDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Firmware version</p>
                    <p className="text-xs font-bold text-gray-800 font-mono">{activeDevice.firmwareVersion}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sensors health list */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 font-display border-b border-gray-50 pb-2">Active Sensors</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-gray-600">
                  <span>Soil Moisture Probe</span>
                  <span className="text-emerald-700 font-bold">ONLINE</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-gray-600">
                  <span>DHT22 Temp/Humidity</span>
                  <span className="text-emerald-700 font-bold">ONLINE</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-gray-600">
                  <span>Solar battery health</span>
                  <span className="text-emerald-700 font-bold">GOOD</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-gray-600">
                  <span>Wi-Fi signal sync</span>
                  <span className="text-emerald-700 font-bold">EXCELLENT</span>
                </div>
              </div>
            </div>

          </div>

          {/* Service History */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-2 text-gray-800">
              <Wrench className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-gray-900 font-display">Service & Repair History</h3>
            </div>
            
            {tickets.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {tickets.map(ticket => (
                  <div key={ticket._id} className="py-3 flex justify-between items-start flex-wrap gap-2 text-xs">
                    <div>
                      <p className="font-bold text-gray-800">{ticket.category}</p>
                      <p className="text-gray-500 mt-0.5">{ticket.description}</p>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1">Ticket ID: {ticket.ticketId}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ticket.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ticket.status}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-4">No repair jobs recorded for this device.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
