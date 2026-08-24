import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Settings, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';

export default function SimulationPanel() {
  const {
    simSoilMoisture,
    simTemperature,
    simHumidity,
    simBattery,
    simStatus,
    simWeather,
    simWeatherProb,
    updateSimulation,
    updateWeatherSim,
    backendActive
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [moisture, setMoisture] = useState(simSoilMoisture);
  const [temp, setTemp] = useState(simTemperature);
  const [hum, setHum] = useState(simHumidity);
  const [bat, setBat] = useState(simBattery);
  const [status, setStatus] = useState(simStatus);
  const [weatherCondition, setWeatherCondition] = useState(simWeather);
  const [weatherProb, setWeatherProb] = useState(simWeatherProb);
  const [syncing, setSyncing] = useState(false);

  const applySimulation = async () => {
    setSyncing(true);
    await updateSimulation({
      soilMoisture: Number(moisture),
      temperature: Number(temp),
      humidity: Number(hum),
      battery: Number(bat),
      status: status
    });
    await updateWeatherSim(weatherCondition, Number(weatherProb));
    setTimeout(() => setSyncing(false), 500);
  };

  // Helper presets to quickly configure the User Journey stages
  const applyPreset = async (type) => {
    setSyncing(true);
    if (type === 'NORMAL') {
      setMoisture(42);
      setTemp(30);
      setHum(65);
      setBat(87);
      setStatus('ONLINE');
      setWeatherCondition('Sunny weather');
      setWeatherProb(12);
      await updateSimulation({ soilMoisture: 42, temperature: 30, humidity: 65, battery: 87, status: 'ONLINE' });
      await updateWeatherSim('Sunny weather', 12);
    } else if (type === 'RAIN_EXPECTED') {
      setMoisture(42);
      setTemp(29);
      setHum(72);
      setBat(87);
      setStatus('ONLINE');
      setWeatherCondition('Rain expected');
      setWeatherProb(78);
      await updateSimulation({ soilMoisture: 42, temperature: 29, humidity: 72, battery: 87, status: 'ONLINE' });
      await updateWeatherSim('Rain expected', 78);
    } else if (type === 'FAULT') {
      setMoisture(10);
      setTemp(31);
      setHum(68);
      setBat(87);
      setStatus('ONLINE');
      setWeatherCondition('Rain expected');
      setWeatherProb(78);
      await updateSimulation({ soilMoisture: 10, temperature: 31, humidity: 68, battery: 87, status: 'ONLINE' });
      await updateWeatherSim('Rain expected', 78);
    } else if (type === 'OFFLINE') {
      setStatus('OFFLINE');
      await updateSimulation({ status: 'OFFLINE' });
    }
    setTimeout(() => setSyncing(false), 500);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 shadow-2xl rounded-2xl overflow-hidden max-w-sm w-full transition-all duration-300">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-3.5 px-4 flex justify-between items-center transition cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Settings className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-display uppercase tracking-wider">IoT Simulation Controls</span>
        </div>
        {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </button>

      {/* Body panel */}
      {isOpen && (
        <div className="bg-white/95 backdrop-blur px-5 py-5 max-h-[80vh] overflow-y-auto border border-t-0 border-emerald-800/20">
          <p className="text-[11px] text-gray-500 mb-4 leading-relaxed font-medium">
            Test device telemetry. Use presets below or sliders to adjust mock values, then click apply to sync dashboard.
          </p>

          {/* Quick presets */}
          <div className="mb-5 bg-emerald-50/50 p-3 rounded-xl border border-emerald-600/10">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 font-display">Journey Presets</h4>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => applyPreset('NORMAL')}
                className="bg-white hover:bg-emerald-50 text-emerald-800 text-[11px] font-bold py-1.5 px-2 border border-emerald-100 rounded-lg shadow-sm transition cursor-pointer"
              >
                1. Normal Ops
              </button>
              <button
                onClick={() => applyPreset('RAIN_EXPECTED')}
                className="bg-white hover:bg-emerald-50 text-emerald-800 text-[11px] font-bold py-1.5 px-2 border border-emerald-100 rounded-lg shadow-sm transition cursor-pointer"
              >
                2. Rain Forecast
              </button>
              <button
                onClick={() => applyPreset('FAULT')}
                className="bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold py-1.5 px-2 border border-red-100 rounded-lg shadow-sm transition cursor-pointer col-span-2"
              >
                3. Sensor Fault (10% Moisture)
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Connection Toggle */}
            <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-700">Device Status</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatus('ONLINE')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                    status === 'ONLINE' ? 'bg-green-600 text-white shadow' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  ONLINE
                </button>
                <button
                  onClick={() => setStatus('OFFLINE')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                    status === 'OFFLINE' ? 'bg-red-600 text-white shadow' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  OFFLINE
                </button>
              </div>
            </div>

            {/* Moisture Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                <span>Soil Moisture</span>
                <span className="text-emerald-700">{moisture}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={moisture}
                onChange={(e) => setMoisture(e.target.value)}
                className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Temperature Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                <span>Temperature</span>
                <span className="text-amber-700">{temp}°C</span>
              </div>
              <input
                type="range"
                min="-5"
                max="45"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="w-full accent-amber-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Humidity Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                <span>Humidity</span>
                <span className="text-sky-700">{hum}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={hum}
                onChange={(e) => setHum(e.target.value)}
                className="w-full accent-sky-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Battery Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                <span>Battery Level</span>
                <span className={bat < 20 ? 'text-red-600 font-bold' : 'text-gray-700'}>{bat}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={bat}
                onChange={(e) => setBat(e.target.value)}
                className="w-full accent-zinc-700 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Weather Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Weather Prediction</label>
              <select
                value={weatherCondition}
                onChange={(e) => setWeatherCondition(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="Sunny weather">Sunny / Clear Weather</option>
                <option value="Rain expected">Rain Expected</option>
                <option value="Storm warning">Storm Warning</option>
                <option value="Cloudy weather">Cloudy / Overcast</option>
              </select>
            </div>

            {/* Weather Prob Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                <span>Rain Probability</span>
                <span className="text-blue-600">{weatherProb}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weatherProb}
                onChange={(e) => setWeatherProb(e.target.value)}
                className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Apply Button */}
            <button
              onClick={applySimulation}
              disabled={syncing}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex justify-center items-center gap-1.5 transition shadow shadow-emerald-600/10 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'APPLYING TELEMETRY...' : 'SIMULATE SENSOR UPDATE'}</span>
            </button>

            {/* Connection Status Flag */}
            <div className="text-[10px] text-center font-bold text-gray-400">
              Backend Server status: {backendActive ? '🟢 CONNECTED (Live Sync)' : '🟡 OFFLINE (In-Browser Fallback)'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
