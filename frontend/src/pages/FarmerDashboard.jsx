import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CloudRain, Sun, Battery, Wifi, Thermometer, Droplet, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';

export default function FarmerDashboard({ setActiveTab }) {
  const {
    user,
    activeDevice,
    readings,
    weather,
    simSoilMoisture,
    simTemperature,
    simHumidity,
    simBattery,
    simStatus
  } = useApp();

  const [chartTab, setChartTab] = useState('moisture'); // 'moisture', 'weather'

  // Map sensor health indicators based on current readings
  const getSensorHealth = (sensorName) => {
    if (simStatus === 'OFFLINE') return { status: 'OFFLINE', color: 'bg-red-500' };
    
    switch (sensorName) {
      case 'soil':
        return simSoilMoisture <= 15
          ? { status: 'ERROR', color: 'bg-red-500' }
          : { status: 'ONLINE', color: 'bg-green-500' };
      case 'dht22':
        return { status: 'ONLINE', color: 'bg-green-500' };
      case 'wifi':
        return { status: 'ONLINE', color: 'bg-green-500' };
      case 'weather':
        return { status: 'ONLINE', color: 'bg-green-500' };
      case 'battery':
        return simBattery < 15
          ? { status: 'LOW', color: 'bg-yellow-500' }
          : { status: 'GOOD', color: 'bg-green-500' };
      default:
        return { status: 'ONLINE', color: 'bg-green-500' };
    }
  };

  const soilHealth = getSensorHealth('soil');
  const dhtHealth = getSensorHealth('dht22');
  const wifiHealth = getSensorHealth('wifi');
  const weatherHealth = getSensorHealth('weather');
  const batteryHealth = getSensorHealth('battery');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 font-display">MY FARM</h1>
          <p className="text-gray-500 text-sm font-medium">
            Farmer: <span className="text-emerald-800 font-bold">{user ? user.name : 'Ramesh Patel'}</span>
          </p>
        </div>

        {activeDevice ? (
          <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100">
            <div className="text-left">
              <p className="text-xs font-bold text-emerald-800">{activeDevice.model}</p>
              <p className="text-[10px] text-gray-400 font-mono">SN: {activeDevice.serialNumber}</p>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg shadow-sm border border-emerald-100/50">
              <span className={`w-2.5 h-2.5 rounded-full ${simStatus === 'ONLINE' ? 'bg-green-500 animate-status-pulse' : 'bg-red-500'} inline-block`}></span>
              <span className="text-xs font-bold text-gray-700 uppercase">{simStatus}</span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 text-amber-800 px-4 py-3 rounded-xl text-xs font-semibold">
            ⚠️ No devices registered. Go to My Product to register your hardware.
          </div>
        )}
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Soil Moisture */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Soil Moisture</span>
            <Droplet className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900 font-display transition duration-300">
              {simSoilMoisture}%
            </div>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">Target range: 35-55%</p>
          </div>
          {simSoilMoisture <= 15 && (
            <div className="absolute top-2 right-2 flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </div>
          )}
        </div>

        {/* Temp */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Temperature</span>
            <Thermometer className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900 font-display">
              {simTemperature}°C
            </div>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">Air Ambient</p>
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Humidity</span>
            <Droplet className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900 font-display">
              {simHumidity}%
            </div>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">Relative (RH)</p>
          </div>
        </div>

        {/* Battery */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Battery</span>
            <Battery className={`w-5 h-5 ${simBattery < 20 ? 'text-red-500 animate-pulse' : 'text-zinc-600'}`} />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900 font-display">
              {simBattery}%
            </div>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">Solar charged</p>
          </div>
        </div>

        {/* Connectivity */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm col-span-2 lg:col-span-1 flex flex-col justify-between">
          <div className="flex justify-between items-start text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Connectivity</span>
            <Wifi className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-gray-900 font-display flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${simStatus === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'} inline-block`}></span>
              <span>{simStatus}</span>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">RSSI -65dBm (Good)</p>
          </div>
        </div>
      </div>

      {/* Main Section Grid: Graph & Weather Intel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recharts Analytics Panel */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-bold text-gray-900 font-display">Historical Diagnostics</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setChartTab('moisture')}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                  chartTab === 'moisture' ? 'bg-emerald-700 text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                Soil Moisture Trend
              </button>
              <button
                onClick={() => setChartTab('weather')}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                  chartTab === 'weather' ? 'bg-emerald-700 text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                Temperature & Humidity
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartTab === 'moisture' ? (
                <AreaChart data={readings}>
                  <defs>
                    <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                  <Tooltip />
                  <Area type="monotone" dataKey="soilMoisture" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMoisture)" name="Moisture (%)" />
                </AreaChart>
              ) : (
                <AreaChart data={readings}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip />
                  <Area type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" name="Temp (°C)" />
                  <Area type="monotone" dataKey="humidity" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorHum)" name="Humidity (%)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Weather Card & Health diagnostics */}
        <div className="lg:col-span-4 space-y-6">
          {/* Weather recommendation */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 font-display">Weather Intelligence</h3>
            
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                {weather.condition.toLowerCase().includes('rain') ? <CloudRain size={28} /> : <Sun size={28} />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">{weather.condition}</h4>
                <p className="text-xs text-gray-400">Precipitation: <span className="text-blue-700 font-bold">{weather.probability}%</span></p>
              </div>
            </div>

            <div className={`p-4 rounded-xl border flex items-start gap-2.5 ${
              weather.recommendation.toLowerCase().includes('wait') 
                ? 'bg-blue-50/50 border-blue-100 text-blue-800' 
                : 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
            }`}>
              {weather.recommendation.toLowerCase().includes('wait') ? (
                <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider">AI RECOMMENDATION</p>
                <p className="text-sm font-extrabold mt-0.5">{weather.recommendation}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {weather.recommendation.toLowerCase().includes('wait') 
                    ? 'Wait on irrigation cycles. Forecast indicates rain is expected shortly, saving resources.' 
                    : 'Weather is clear. Continue standard scheduled irrigation cycles.'}
                </p>
              </div>
            </div>
          </div>

          {/* Diagnostic list */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 font-display">Hardware Diagnostician</h3>
            
            <div className="space-y-3">
              {/* Soil Sensor */}
              <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                <span className="text-xs font-semibold text-gray-600">Soil moisture sensor probe</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${soilHealth.color} ${soilHealth.status === 'ERROR' ? 'animate-alert-pulse' : 'animate-status-pulse'}`}></span>
                  <span className="text-xs font-bold text-gray-700">{soilHealth.status}</span>
                </div>
              </div>

              {/* Temp sensor */}
              <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                <span className="text-xs font-semibold text-gray-600">DHT22 Ambient Temp/Hum</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${dhtHealth.color} animate-status-pulse`}></span>
                  <span className="text-xs font-bold text-gray-700">{dhtHealth.status}</span>
                </div>
              </div>

              {/* Wifi sensor */}
              <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                <span className="text-xs font-semibold text-gray-600">ESP32 Wi-Fi connection transmitter</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${wifiHealth.color} animate-status-pulse`}></span>
                  <span className="text-xs font-bold text-gray-700">{wifiHealth.status}</span>
                </div>
              </div>

              {/* Weather sync */}
              <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                <span className="text-xs font-semibold text-gray-600">Weather forecast API link</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${weatherHealth.color} animate-status-pulse`}></span>
                  <span className="text-xs font-bold text-gray-700">{weatherHealth.status}</span>
                </div>
              </div>

              {/* Battery health */}
              <div className="flex justify-between items-center py-1.5">
                <span className="text-xs font-semibold text-gray-600">Lithium-Polymer cell status</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${batteryHealth.color} animate-status-pulse`}></span>
                  <span className="text-xs font-bold text-gray-700">{batteryHealth.status}</span>
                </div>
              </div>
            </div>

            {/* Error state warnings */}
            {soilHealth.status === 'ERROR' && (
              <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-red-800 space-y-2">
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold">Soil Sensor Error Flagged</p>
                    <p className="text-gray-500 mt-0.5">Sensor values dropped abnormally. This could mean a broken connection wire or dry air exposure.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    // Open AI chat drawer (we can trigger this through a global event or trigger chat drawer directly)
                    const aiBtn = document.getElementById('ai-floating-chat-btn');
                    if (aiBtn) aiBtn.click();
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <MessageSquare size={12} />
                  <span>Consult SmartCare AI Assistant</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
