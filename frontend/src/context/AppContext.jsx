import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

const API_BASE = 'http://localhost:5000/api';

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || 'FARMER');
  const [devices, setDevices] = useState([]);
  const [activeDevice, setActiveDevice] = useState(null);
  const [readings, setReadings] = useState([]);
  const [weather, setWeather] = useState({
    condition: 'Rain expected',
    probability: 78,
    temp: 29,
    recommendation: 'WAIT — Rain likely'
  });
  const [tickets, setTickets] = useState([]);
  const [upgrades, setUpgrades] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [techs, setTechs] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backendActive, setBackendActive] = useState(false);

  // Simulation Sliders
  const [simSoilMoisture, setSimSoilMoisture] = useState(42);
  const [simTemperature, setSimTemperature] = useState(31);
  const [simHumidity, setSimHumidity] = useState(68);
  const [simBattery, setSimBattery] = useState(87);
  const [simStatus, setSimStatus] = useState('ONLINE');
  const [simWeather, setSimWeather] = useState('Rain expected');
  const [simWeatherProb, setSimWeatherProb] = useState(78);

  // Set Auth headers
  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // Test backend status
  const checkBackend = async () => {
    try {
      const res = await fetch(`${API_BASE}/status`);
      if (res.ok) {
        setBackendActive(true);
        return true;
      }
      setBackendActive(false);
      return false;
    } catch (e) {
      setBackendActive(false);
      return false;
    }
  };

  // Fetch all initial data depending on role
  const loadData = async () => {
    const isUp = await checkBackend();
    if (!isUp) {
      loadFallbackData();
      return;
    }

    if (!token) return;

    setIsLoading(true);
    try {
      // 1. Load Profile
      const meRes = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
        setRole(meData.user.role);
      } else {
        // Token expired
        logout();
        setIsLoading(false);
        return;
      }

      // 2. Load Role-specific data
      if (role === 'FARMER' || (user && user.role === 'FARMER')) {
        // Devices
        const devRes = await fetch(`${API_BASE}/devices`, { headers: getHeaders() });
        if (devRes.ok) {
          const devData = await devRes.json();
          setDevices(devData.devices);
          if (devData.devices.length > 0) {
            const dev = devData.devices[0];
            setActiveDevice(dev);
            setSimSoilMoisture(dev.sensors.soilMoisture.value);
            setSimTemperature(dev.sensors.dht22.temp);
            setSimHumidity(dev.sensors.dht22.humidity);
            setSimBattery(dev.batteryLevel);
            setSimStatus(dev.status);

            // Fetch Readings for chart
            const readRes = await fetch(`${API_BASE}/iot/devices/${dev.serialNumber}/readings?limit=15`, { headers: getHeaders() });
            if (readRes.ok) {
              const readData = await readRes.json();
              setReadings(readData.readings);
            }
          }
        }

        // Weather
        const wRes = await fetch(`${API_BASE}/weather`, { headers: getHeaders() });
        if (wRes.ok) {
          const wData = await wRes.json();
          setWeather(wData.weather);
          setSimWeather(wData.weather.condition);
          setSimWeatherProb(wData.weather.probability);
        }

        // Support tickets
        const tRes = await fetch(`${API_BASE}/tickets`, { headers: getHeaders() });
        if (tRes.ok) {
          const tData = await tRes.json();
          setTickets(tData.tickets);
        }

        // Upgrades
        const upRes = await fetch(`${API_BASE}/upgrades`, { headers: getHeaders() });
        if (upRes.ok) {
          const upData = await upRes.json();
          setUpgrades(upData.upgrades);
        }

      } else if (role === 'ADMIN' || (user && user.role === 'ADMIN')) {
        // Admin Dashboard Stats & charts
        const adminRes = await fetch(`${API_BASE}/admin/dashboard`, { headers: getHeaders() });
        if (adminRes.ok) {
          const adData = await adminRes.json();
          setAdminStats(adData);
        }

        // Service Tickets list
        const tRes = await fetch(`${API_BASE}/tickets`, { headers: getHeaders() });
        if (tRes.ok) {
          const tData = await tRes.json();
          setTickets(tData.tickets);
        }

        // Technicians list
        const techRes = await fetch(`${API_BASE}/admin/technicians`, { headers: getHeaders() });
        if (techRes.ok) {
          const techData = await techRes.json();
          setTechs(techData.technicians);
        }

        // Notifications
        const notifRes = await fetch(`${API_BASE}/admin/notifications`, { headers: getHeaders() });
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(notifData.notifications);
        }

        // Upgrade Requests (Sells & Buys)
        const upRes = await fetch(`${API_BASE}/upgrades`, { headers: getHeaders() });
        if (upRes.ok) {
          const upData = await upRes.json();
          setUpgrades(upData.upgrades);
        }
      } else if (role === 'TECHNICIAN' || (user && user.role === 'TECHNICIAN')) {
        // Technician service tickets
        const tRes = await fetch(`${API_BASE}/tickets`, { headers: getHeaders() });
        if (tRes.ok) {
          const tData = await tRes.json();
          setTickets(tData.tickets);
        }
      }

    } catch (error) {
      console.error('API load error, using fallbacks:', error);
      loadFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFallbackData = () => {
    // Pure offline demo configuration
    setUser({
      _id: role === 'FARMER' ? 'u1' : role === 'ADMIN' ? 'u5' : 'u2',
      name: role === 'FARMER' ? 'Ramesh Patel' : role === 'ADMIN' ? 'Demo Admin' : 'Ravi Verma',
      email: role === 'FARMER' ? 'ramesh@farm.com' : role === 'ADMIN' ? 'admin@smartirrigation.com' : 'ravi@smartcare.com',
      role: role,
      phone: '+91 98765 43210',
      specialty: role === 'TECHNICIAN' ? 'HARDWARE' : undefined
    });

    const mockDevice = {
      _id: 'd1',
      model: 'Smart Irrigation V1',
      serialNumber: 'SI123456',
      owner: 'u1',
      firmwareVersion: 'v1.4.2',
      purchaseDate: '2026-06-12',
      batteryLevel: simBattery,
      status: simStatus,
      sensors: {
        soilMoisture: { status: simSoilMoisture <= 15 ? 'ERROR' : 'ONLINE', value: simSoilMoisture },
        dht22: { status: 'ONLINE', temp: simTemperature, humidity: simHumidity },
        wifi: { status: 'ONLINE', signalStrength: -65 },
        weatherApi: { status: 'ONLINE' },
        battery: { status: 'ONLINE', health: 'GOOD' }
      }
    };
    setDevices([mockDevice]);
    setActiveDevice(mockDevice);

    const mockReadings = [
      { soilMoisture: 45, temperature: 30, humidity: 65, battery: 90, timestamp: '10:00' },
      { soilMoisture: 44, temperature: 30, humidity: 66, battery: 89, timestamp: '11:00' },
      { soilMoisture: 43, temperature: 31, humidity: 67, battery: 88, timestamp: '12:00' },
      { soilMoisture: simSoilMoisture, temperature: simTemperature, humidity: simHumidity, battery: simBattery, timestamp: 'Now' }
    ];
    setReadings(mockReadings);

    setWeather({
      condition: simWeather,
      probability: simWeatherProb,
      temp: simTemperature - 2,
      recommendation: (simWeather.toLowerCase().includes('rain') && simWeatherProb >= 50) ? 'WAIT — Rain likely' : 'IRRIGATION RECOMMENDED'
    });

    // Mock admin structures
    setTechs([
      { _id: 'u2', name: 'Ravi Verma', role: 'TECHNICIAN', specialty: 'HARDWARE', activeJobs: 2, status: 'ONLINE' },
      { _id: 'u3', name: 'Kumar Swamy', role: 'TECHNICIAN', specialty: 'SOFTWARE_IOT', activeJobs: 1, status: 'ONLINE' },
      { _id: 'u4', name: 'Suresh Kumar', role: 'TECHNICIAN', specialty: 'FIELD', activeJobs: 0, status: 'OFFLINE' }
    ]);
  };

  useEffect(() => {
    loadData();
  }, [token, role]);

  // Auth Operations
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        setToken(data.token);
        setRole(data.user.role);
        setUser(data.user);
        setBackendActive(true);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e) {
      // Local Bypass
      console.warn('API error, executing frontend fallback login.');
      let targetRole = 'FARMER';
      let name = 'Ramesh Patel';
      if (email.includes('admin')) {
        targetRole = 'ADMIN';
        name = 'Demo Admin';
      } else if (email.includes('ravi') || email.includes('tech')) {
        targetRole = 'TECHNICIAN';
        name = 'Ravi Verma';
      }

      const mockUser = {
        _id: 'u_mock',
        name,
        email,
        role: targetRole,
        phone: '+91 99887 76655'
      };

      localStorage.setItem('token', 'mock_token');
      localStorage.setItem('role', targetRole);
      setToken('mock_token');
      setRole(targetRole);
      setUser(mockUser);
      return { success: true, bypassed: true };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken('');
    setRole('FARMER');
    setUser(null);
    setDevices([]);
    setActiveDevice(null);
    setTickets([]);
  };

  // Switch demo roles instantly
  const switchDemoRole = async (targetRole) => {
    setIsLoading(true);
    let email = 'ramesh@farm.com';
    if (targetRole === 'ADMIN') email = 'admin@smartirrigation.com';
    if (targetRole === 'TECHNICIAN') email = 'ravi@smartcare.com';

    try {
      const res = await login(email, 'password123');
      if (res.success) {
        setRole(targetRole);
        await loadData();
      }
    } catch (e) {
      localStorage.setItem('role', targetRole);
      setRole(targetRole);
      loadFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  // IoT Simulation triggers
  const updateSimulation = async (values) => {
    const updatedValues = {
      soilMoisture: values.soilMoisture !== undefined ? values.soilMoisture : simSoilMoisture,
      temperature: values.temperature !== undefined ? values.temperature : simTemperature,
      humidity: values.humidity !== undefined ? values.humidity : simHumidity,
      battery: values.battery !== undefined ? values.battery : simBattery,
      status: values.status !== undefined ? values.status : simStatus
    };

    setSimSoilMoisture(updatedValues.soilMoisture);
    setSimTemperature(updatedValues.temperature);
    setSimHumidity(updatedValues.humidity);
    setSimBattery(updatedValues.battery);
    setSimStatus(updatedValues.status);

    if (backendActive && activeDevice) {
      try {
        const res = await fetch(`${API_BASE}/iot/simulate`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            serialNumber: activeDevice.serialNumber,
            soilMoisture: updatedValues.soilMoisture,
            temperature: updatedValues.temperature,
            humidity: updatedValues.humidity,
            battery: updatedValues.battery,
            status: updatedValues.status
          })
        });
        if (res.ok) {
          await loadData();
        }
      } catch (err) {
        console.error('Simulation sync error:', err);
      }
    } else {
      // Local fallback updates
      if (activeDevice) {
        const copyDev = { ...activeDevice };
        copyDev.status = updatedValues.status;
        copyDev.batteryLevel = updatedValues.battery;
        copyDev.sensors.soilMoisture.value = updatedValues.soilMoisture;
        copyDev.sensors.soilMoisture.status = updatedValues.soilMoisture <= 15 ? 'ERROR' : 'ONLINE';
        copyDev.sensors.dht22.temp = updatedValues.temperature;
        copyDev.sensors.dht22.humidity = updatedValues.humidity;
        setActiveDevice(copyDev);
        setDevices([copyDev]);

        const nextLogs = [...readings];
        nextLogs.push({
          soilMoisture: updatedValues.soilMoisture,
          temperature: updatedValues.temperature,
          humidity: updatedValues.humidity,
          battery: updatedValues.battery,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        setReadings(nextLogs.slice(-15));
      }
    }
  };

  // Weather simulation
  const updateWeatherSim = async (cond, prob) => {
    setSimWeather(cond);
    setSimWeatherProb(prob);

    if (backendActive) {
      try {
        const res = await fetch(`${API_BASE}/weather/simulate`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            condition: cond,
            probability: prob,
            temp: simTemperature - 1
          })
        });
        if (res.ok) {
          const wData = await res.json();
          setWeather(wData.weather);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setWeather({
        condition: cond,
        probability: prob,
        temp: simTemperature - 2,
        recommendation: (cond.toLowerCase().includes('rain') && prob >= 50) ? 'WAIT — Rain likely' : 'IRRIGATION RECOMMENDED'
      });
    }
  };

  // Create Support Ticket
  const createTicket = async (ticketForm) => {
    setIsLoading(true);
    try {
      if (backendActive) {
        const res = await fetch(`${API_BASE}/tickets`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(ticketForm)
        });
        const data = await res.json();
        if (data.success) {
          setTickets([data.ticket, ...tickets]);
          setIsLoading(false);
          return { success: true, ticket: data.ticket };
        }
        return { success: false, message: data.message };
      } else {
        // Fallback local ticket creation
        const randId = `SI-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        const localTicket = {
          _id: `t_mock_${Date.now()}`,
          ticketId: randId,
          farmerId: user?._id || 'u1',
          farmerName: user?.name || 'Ramesh Patel',
          farmerPhone: user?.phone || '+91 98765 43210',
          serialNumber: ticketForm.serialNumber,
          productModel: ticketForm.productModel,
          category: ticketForm.category,
          description: ticketForm.description,
          priority: ticketForm.priority || 'HIGH',
          status: 'NEW',
          attachments: ticketForm.attachments || [],
          location: ticketForm.location || 'Plot F, Village Green',
          timeline: [
            { status: 'NEW', note: 'Support request logged in local simulation.', timestamp: new Date() }
          ],
          createdAt: new Date()
        };
        const nextTickets = [localTicket, ...tickets];
        setTickets(nextTickets);

        // Add to mock notifications
        setNotifications([{
          _id: `notif_${Date.now()}`,
          type: 'NEW_TICKET',
          ticketId: randId,
          category: ticketForm.category,
          farmerName: user?.name || 'Ramesh Patel',
          productModel: ticketForm.productModel,
          priority: ticketForm.priority || 'HIGH',
          timestamp: new Date()
        }, ...notifications]);

        setIsLoading(false);
        return { success: true, ticket: localTicket };
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      return { success: false, message: 'Connection failure drafting ticket.' };
    }
  };

  // Register device
  const registerDevice = async (regForm) => {
    setIsLoading(true);
    try {
      if (backendActive) {
        const res = await fetch(`${API_BASE}/devices/register`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(regForm)
        });
        const data = await res.json();
        if (data.success) {
          setDevices([data.device, ...devices]);
          setActiveDevice(data.device);
          setIsLoading(false);
          return { success: true, device: data.device };
        }
        return { success: false, message: data.message };
      } else {
        const mockNewDevice = {
          _id: `d_mock_${Date.now()}`,
          model: regForm.model || 'Smart Irrigation V1',
          serialNumber: regForm.serialNumber,
          owner: user?._id || 'u1',
          firmwareVersion: 'v1.0.0',
          purchaseDate: regForm.purchaseDate,
          batteryLevel: 100,
          status: 'ONLINE',
          sensors: {
            soilMoisture: { status: 'ONLINE', value: 50 },
            dht22: { status: 'ONLINE', temp: 29, humidity: 62 },
            wifi: { status: 'ONLINE', signalStrength: -70 },
            weatherApi: { status: 'ONLINE' },
            battery: { status: 'ONLINE', health: 'GOOD' }
          },
          registeredAt: new Date()
        };
        setDevices([mockNewDevice, ...devices]);
        setActiveDevice(mockNewDevice);
        setIsLoading(false);
        return { success: true, device: mockNewDevice };
      }
    } catch (e) {
      setIsLoading(false);
      return { success: false, message: 'Failed to connect for registration.' };
    }
  };

  // Assign technician (Admin)
  const assignTechnician = async (ticketId, techId) => {
    try {
      if (backendActive) {
        const res = await fetch(`${API_BASE}/tickets/${ticketId}/assign`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({ technicianId: techId })
        });
        if (res.ok) {
          await loadData();
          return { success: true };
        }
      } else {
        // Fallback local assign
        const targetTech = techs.find(t => t._id === techId);
        const nextTickets = tickets.map(t => {
          if (t._id === ticketId || t.ticketId === ticketId) {
            const upd = {
              ...t,
              status: 'ASSIGNED',
              assignedTechnicianId: techId,
              assignedTechnicianName: targetTech ? targetTech.name : 'Ravi Verma'
            };
            if (!upd.timeline) upd.timeline = [];
            upd.timeline.push({
              status: 'ASSIGNED',
              note: `Technician ${targetTech ? targetTech.name : 'Ravi Verma'} assigned in local simulation.`,
              timestamp: new Date()
            });
            return upd;
          }
          return t;
        });
        setTickets(nextTickets);
        
        // Workload increments
        setTechs(techs.map(t => t._id === techId ? { ...t, activeJobs: t.activeJobs + 1 } : t));
        return { success: true };
      }
    } catch (e) {
      console.error(e);
    }
    return { success: false };
  };

  // Update Ticket Status
  const updateTicketStatus = async (ticketId, nextStatus, details = {}) => {
    try {
      if (backendActive) {
        const res = await fetch(`${API_BASE}/tickets/${ticketId}/status`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({
            status: nextStatus,
            note: details.note,
            repairNotes: details.repairNotes,
            partsUsed: details.partsUsed,
            photosAfterRepair: details.photosAfterRepair
          })
        });
        if (res.ok) {
          await loadData();
          return { success: true };
        }
      } else {
        // Fallback status updater
        const nextTickets = tickets.map(t => {
          if (t._id === ticketId || t.ticketId === ticketId) {
            const copy = { ...t, status: nextStatus };
            if (details.repairNotes) copy.repairNotes = details.repairNotes;
            if (details.partsUsed) copy.partsUsed = details.partsUsed;
            if (!copy.timeline) copy.timeline = [];
            copy.timeline.push({
              status: nextStatus,
              note: details.note || `Stage changed to ${nextStatus}`,
              timestamp: new Date()
            });
            return copy;
          }
          return t;
        });
        setTickets(nextTickets);

        if (nextStatus === 'COMPLETED' || nextStatus === 'CANCELLED') {
          // Decrement mock tech active jobs
          const ticketObj = tickets.find(t => t._id === ticketId || t.ticketId === ticketId);
          if (ticketObj && ticketObj.assignedTechnicianId) {
            setTechs(techs.map(tech =>
              tech._id === ticketObj.assignedTechnicianId && tech.activeJobs > 0
                ? { ...tech, activeJobs: tech.activeJobs - 1 }
                : tech
            ));
          }
        }
        return { success: true };
      }
    } catch (e) {
      console.error(e);
    }
    return { success: false };
  };

  // Submit Upgrade
  const submitUpgradeRequest = async (upgradeForm) => {
    try {
      if (backendActive) {
        const res = await fetch(`${API_BASE}/upgrades`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(upgradeForm)
        });
        const data = await res.json();
        if (data.success) {
          setUpgrades([data.upgrade, ...upgrades]);
          return { success: true };
        }
        return { success: false, message: data.message };
      } else {
        const mockUpgrade = {
          _id: `up_mock_${Date.now()}`,
          farmerId: user?._id || 'u1',
          farmerName: user?.name || 'Ramesh Patel',
          serialNumber: upgradeForm.serialNumber,
          currentModel: upgradeForm.currentModel || 'Smart Irrigation V1',
          requestedUpgrade: upgradeForm.requestedUpgrade,
          status: 'PENDING',
          createdAt: new Date()
        };
        setUpgrades([mockUpgrade, ...upgrades]);
        return { success: true };
      }
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server connection failed.' };
    }
  };

  // Update Upgrade Status (Admin)
  const updateUpgradeStatus = async (upgradeId, nextStatus) => {
    try {
      if (backendActive) {
        const res = await fetch(`${API_BASE}/upgrades/${upgradeId}/status`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({ status: nextStatus })
        });
        if (res.ok) {
          await loadData();
          return { success: true };
        }
      } else {
        // Fallback local update
        const nextUpgrades = upgrades.map(u => 
          (u._id === upgradeId || u.ticketId === upgradeId) ? { ...u, status: nextStatus } : u
        );
        setUpgrades(nextUpgrades);
        return { success: true };
      }
    } catch (e) {
      console.error(e);
    }
    return { success: false };
  };

  // AI Chat integration
  const askAIChat = async (message) => {
    if (backendActive) {
      try {
        const res = await fetch(`${API_BASE}/ai/chat`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            message,
            deviceContext: activeDevice
          })
        });
        return await res.json();
      } catch (e) {
        console.error(e);
      }
    }

    // Dynamic mock response processor
    return new Promise((resolve) => {
      setTimeout(() => {
        const msg = message.toLowerCase();
        let text = '';
        let diagnosticStatus = null;
        let canEscalate = false;
        let ticketDraft = null;

        if (msg.includes('moisture') || msg.includes('soil') || msg.includes('sensor')) {
          diagnosticStatus = {
            device: activeDevice?.model || 'Smart Irrigation V1',
            sensor: 'Soil Moisture',
            latestReading: `${simSoilMoisture}%`,
            previousReading: '43%',
            connectivity: simStatus
          };

          if (simSoilMoisture <= 15) {
            text = `Your soil moisture reading changed unusually. Based on my analysis, the reading has dropped from a stable 43% down to ${simSoilMoisture}%. Please check whether the sensor probe is properly pushed into the dirt and that the connection wire isn't damaged.`;
            canEscalate = true;
          } else {
            text = `I see your soil moisture is at ${simSoilMoisture}%. This is within a reasonable range, but if the crops look dry, you may want to initiate a watering manual overwrite or inspect for pipe blockage.`;
          }
        } else if (msg.includes('still not working') || msg.includes('not working') || msg.includes('failed') || msg.includes('escalate')) {
          text = "I'll create a service request for you. I've prepared a service ticket draft for a Hardware Technician. Please review it below and confirm submission.";
          canEscalate = false;
          ticketDraft = {
            farmerName: 'Ramesh Patel',
            productModel: activeDevice?.model || 'Smart Irrigation V1',
            serialNumber: activeDevice?.serialNumber || 'SI123456',
            category: 'Sensor Problem',
            description: `Soil moisture reading is abnormally low (${simSoilMoisture}%). Checked connection wire, but sensor is still not reading correctly. Troubleshooting failed.`,
            priority: 'HIGH'
          };
        } else if (msg.includes('wifi') || msg.includes('offline') || msg.includes('connect')) {
          text = "It looks like your device is having connection trouble. Please try power cycling your Wi-Fi router. If the device remains offline, verify if the green LED on the main module is blinking slowly, which indicates searching for a signal.";
          canEscalate = true;
        } else {
          text = "Hello! I am your SmartCare Assistant. I can help troubleshoot your device sensors, connection state, battery charging, or draft a service ticket if something is broken. What issues are you experiencing?";
        }

        resolve({
          success: true,
          text,
          diagnosticStatus,
          canEscalate,
          ticketDraft
        });
      }, 1000);
    });
  };

  const checkWarrantyStatus = async (serial) => {
    if (backendActive) {
      try {
        const res = await fetch(`${API_BASE}/warranty/${serial}`, { headers: getHeaders() });
        return await res.json();
      } catch (e) {
        console.error(e);
      }
    }

    // Local check
    if (serial === 'SI123456') {
      return {
        success: true,
        warranty: {
          serialNumber: 'SI123456',
          productName: 'Smart Irrigation V1',
          purchaseDate: '2026-06-12',
          expiryDate: '2027-06-12',
          status: 'ACTIVE'
        }
      };
    } else {
      return {
        success: false,
        message: 'No warranty record found for this serial number.'
      };
    }
  };

  const dismissNotification = async (id) => {
    if (backendActive) {
      try {
        await fetch(`${API_BASE}/admin/notifications/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
      } catch (e) {
        console.error(e);
      }
    }
    setNotifications(notifications.filter(n => n._id !== id));
  };

  return (
    <AppContext.Provider value={{
      user, token, role, devices, activeDevice, readings, weather, tickets, upgrades, notifications, techs, adminStats, isLoading, backendActive,
      simSoilMoisture, simTemperature, simHumidity, simBattery, simStatus, simWeather, simWeatherProb,
      login, logout, switchDemoRole, updateSimulation, updateWeatherSim, createTicket, registerDevice, assignTechnician, updateTicketStatus, submitUpgradeRequest, updateUpgradeStatus, askAIChat, checkWarrantyStatus, dismissNotification, refreshData: loadData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
