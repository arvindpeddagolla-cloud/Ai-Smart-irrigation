import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  Wrench, Droplet, ShieldAlert, Cpu, Heart, CheckCircle2,
  AlertTriangle, Phone, FileText, MapPin, Upload, MessageSquare, ChevronLeft, Wifi, CloudRain, ShieldCheck, RefreshCw, Layers
} from 'lucide-react';

const categories = [
  { id: 'device-fail', title: 'Device Not Working', icon: '🔧', color: 'hover:bg-red-50 hover:border-red-200' },
  { id: 'repair-req', title: 'Request Repair', icon: '🛠', color: 'hover:bg-amber-50 hover:border-amber-200' },
  { id: 'wifi-issue', title: 'Connectivity Problem', icon: '📡', color: 'hover:bg-blue-50 hover:border-blue-200' },
  { id: 'sensor-issue', title: 'Sensor Problem', icon: '💧', color: 'hover:bg-emerald-50 hover:border-emerald-200' },
  { id: 'weather-issue', title: 'Weather Prediction Problem', icon: '🌧', color: 'hover:bg-sky-50 hover:border-sky-200' },
  { id: 'power-issue', title: 'Power/Battery Problem', icon: '🔋', color: 'hover:bg-zinc-50 hover:border-zinc-300' },
  { id: 'replace-req', title: 'Replacement Request', icon: '📦', color: 'hover:bg-purple-50 hover:border-purple-200' },
  { id: 'upgrade-req', title: 'Model Upgrade', icon: '🆕', color: 'hover:bg-indigo-50 hover:border-indigo-200' },
  { id: 'other-issue', title: 'Other Issue', icon: '💬', color: 'hover:bg-slate-50 hover:border-slate-200' }
];

export default function CustomerCare({ setActiveTab, setTrackedTicketId }) {
  const {
    user,
    activeDevice,
    createTicket
  } = useApp();

  const [selectedCat, setSelectedCat] = useState(null);
  const [successTicket, setSuccessTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState(user ? user.name : 'Ramesh Patel');
  const [phone, setPhone] = useState(user ? user.phone : '+91 98765 43210');
  const [email, setEmail] = useState(user ? user.email : 'ramesh@gmail.com');
  const [serial, setSerial] = useState(activeDevice ? activeDevice.serialNumber : 'SI123456');
  const [subType, setSubType] = useState('Soil Moisture Sensor');
  const [desc, setDesc] = useState('');
  const [location, setLocation] = useState('XYZ Village, Block 4, Farm Plot B');
  const [photoMeta, setPhotoMeta] = useState(null);
  const [videoMeta, setVideoMeta] = useState(null);

  // Validations
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = 'Farmer name is required.';
    if (!phone.trim()) {
      nextErrors.phone = 'Phone number is required.';
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(phone)) {
      nextErrors.phone = 'Invalid phone number format.';
    }
    if (!email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Invalid email address format.';
    }
    if (!serial.trim()) {
      nextErrors.serial = 'Serial number is required.';
    } else if (!/^SI[0-9]{6}$/.test(serial.trim().toUpperCase())) {
      nextErrors.serial = 'Invalid Serial format. Must be like SI123456.';
    }
    if (!desc.trim() || desc.length < 10) {
      nextErrors.desc = 'Please describe the problem details (minimum 10 characters).';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const meta = { name: file.name, size: file.size, type: file.type };
      if (type === 'photo') setPhotoMeta(meta);
      if (type === 'video') setVideoMeta(meta);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const attachments = [];
    if (photoMeta) attachments.push({ name: photoMeta.name, url: 'https://smart-irrigation-bucket.s3.amazonaws.com/uploads/photo.jpg', type: 'image' });
    if (videoMeta) attachments.push({ name: videoMeta.name, url: 'https://smart-irrigation-bucket.s3.amazonaws.com/uploads/video.mp4', type: 'video' });

    const ticketData = {
      productModel: activeDevice ? activeDevice.model : 'Smart Irrigation V1',
      serialNumber: serial.toUpperCase(),
      category: selectedCat.title,
      description: `[${subType}] ${desc}`,
      location,
      attachments,
      farmerName: name,
      farmerPhone: phone,
      email: email
    };

    const res = await createTicket(ticketData);
    setLoading(false);

    if (res.success) {
      setSuccessTicket(res.ticket);
    }
  };

  const resetState = () => {
    setSelectedCat(null);
    setSuccessTicket(null);
    setDesc('');
    setPhotoMeta(null);
    setVideoMeta(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back link */}
      {(selectedCat && !successTicket) && (
        <button
          onClick={resetState}
          className="inline-flex items-center gap-1 text-gray-500 hover:text-emerald-700 font-semibold text-sm transition cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back to Help Options</span>
        </button>
      )}

      {/* Success View */}
      {successTicket ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg text-center space-y-6 max-w-md mx-auto">
          {/* Animated Success checkmark */}
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="animate-[dash_0.6s_ease-in-out_forwards]" style={{ strokeDasharray: 50, strokeDashoffset: 50 }} />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-emerald-800 font-display">✓ COMPLAINT REGISTERED</h2>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left space-y-2">
            <p className="text-sm font-bold text-gray-700">Ticket ID: <span className="font-mono font-extrabold text-slate-800">{successTicket.ticketId}</span></p>
            <p className="text-xs text-gray-500 mt-2 font-medium">
              Your complaint has been successfully registered.<br />
              Our support team will contact you shortly by phone.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setTrackedTicketId(successTicket.ticketId);
                setActiveTab('track-service');
              }}
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
            >
              TRACK SERVICE
            </button>
            <button
              onClick={resetState}
              className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
            >
              File Another Request
            </button>
          </div>
        </div>
      ) : selectedCat ? (
        /* Form view */
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm max-w-2xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 font-display">
              {selectedCat.icon} {selectedCat.title.toUpperCase()}
            </h2>
            <p className="text-gray-400 text-xs mt-1">Please provide the details below to open a technical service card.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-slate-50 border rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold ${
                    errors.name ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-slate-50 border rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold ${
                    errors.email ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Phone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full bg-slate-50 border rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold ${
                    errors.phone ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  className={`w-full bg-slate-50 border rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold ${
                    errors.serial ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.serial && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.serial}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Specific Problem Type</label>
              <select
                value={subType}
                onChange={(e) => setSubType(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="Soil Moisture Sensor">Soil Moisture Sensor</option>
                <option value="DHT22">DHT22 Temp/Hum Sensor</option>
                <option value="Weather Prediction">Weather Prediction Link</option>
                <option value="Voice Call">Voice Call Dialer</option>
                <option value="Wi-Fi">Wi-Fi Wireless Node</option>
                <option value="Power">Solar charging / Battery</option>
                <option value="Other">Other Mechanical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Problem Description</label>
              <textarea
                required
                rows="4"
                placeholder="Please describe what is happening with the device..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className={`w-full bg-slate-50 border rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium ${
                  errors.desc ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.desc && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.desc}</p>}
            </div>

            {/* Media Uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Upload Photo</label>
                <div className="border border-dashed border-gray-200 hover:border-emerald-500 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 transition relative">
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Upload size={16} className="text-gray-400 mb-1" />
                  <span className="text-[10px] font-bold text-gray-600 truncate max-w-full px-2">
                    {photoMeta ? photoMeta.name : 'Select JPG/PNG'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Upload Video</label>
                <div className="border border-dashed border-gray-200 hover:border-emerald-500 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 transition relative">
                  <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Upload size={16} className="text-gray-400 mb-1" />
                  <span className="text-[10px] font-bold text-gray-600 truncate max-w-full px-2">
                    {videoMeta ? videoMeta.name : 'Select MP4/MOV'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Location Details</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs transition cursor-pointer active:scale-95 flex justify-center items-center gap-1.5 shadow"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>SUBMITTING REQUEST...</span>
                </>
              ) : (
                <span>SUBMIT REQUEST</span>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Categories Grid */
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h1 className="text-4xl font-extrabold text-gray-900 font-display">HOW CAN WE HELP?</h1>
            <p className="text-gray-500 text-sm font-medium">Select a category below that best describes the issue you are experiencing.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat)}
                className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center gap-3 transition duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${cat.color}`}
              >
                <span className="text-3xl filter drop-shadow-sm">{cat.icon}</span>
                <span className="font-bold text-xs text-gray-800 leading-tight">{cat.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
