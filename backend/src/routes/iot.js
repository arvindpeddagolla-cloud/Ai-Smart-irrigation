import express from 'express';
import { mockDBActions, mockDB } from '../config/mockDb.js';
import Device from '../models/Device.js';
import SensorReading from '../models/SensorReading.js';

const router = express.Router();

// @route   POST /api/iot/readings
// @desc    Ingest telemetry data from physical NodeMCU/ESP32 devices or simulators
router.post('/readings', async (req, res) => {
  const {
    serialNumber,
    soilMoisture,
    temperature,
    humidity,
    battery,
    status,
    sensorsHealth // { soilMoisture: 'ONLINE', dht22: 'ONLINE', wifi: 'ONLINE' }
  } = req.body;

  if (!serialNumber) {
    return res.status(400).json({ success: false, message: 'serialNumber is required.' });
  }

  try {
    const moistureNum = Number(soilMoisture ?? 50);
    const tempNum = Number(temperature ?? 28);
    const humNum = Number(humidity ?? 60);
    const batNum = Number(battery ?? 100);
    const devStatus = status || 'ONLINE';

    if (global.isMockDB) {
      // Find and update Mock device
      const device = mockDB.devices.find(d => d.serialNumber === serialNumber);
      if (!device) {
        return res.status(404).json({ success: false, message: 'Device not found in mock database.' });
      }

      device.status = devStatus;
      device.batteryLevel = batNum;
      device.sensors.soilMoisture.value = moistureNum;
      device.sensors.dht22.temp = tempNum;
      device.sensors.dht22.humidity = humNum;

      if (sensorsHealth) {
        if (sensorsHealth.soilMoisture) device.sensors.soilMoisture.status = sensorsHealth.soilMoisture;
        if (sensorsHealth.dht22) device.sensors.dht22.status = sensorsHealth.dht22;
        if (sensorsHealth.wifi) device.sensors.wifi.status = sensorsHealth.wifi;
      }

      // Add sensor reading history log
      const log = mockDBActions.create('readings', {
        deviceId: device._id,
        serialNumber,
        soilMoisture: moistureNum,
        temperature: tempNum,
        humidity: humNum,
        battery: batNum,
        timestamp: new Date()
      });

      return res.status(201).json({ success: true, message: 'Mock reading saved.', log });
    } else {
      // Mongoose DB
      const device = await Device.findOne({ serialNumber });
      if (!device) {
        return res.status(404).json({ success: false, message: 'Device not registered.' });
      }

      // Update Device status & readings
      device.status = devStatus;
      device.batteryLevel = batNum;
      device.sensors.soilMoisture.value = moistureNum;
      device.sensors.dht22.temp = tempNum;
      device.sensors.dht22.humidity = humNum;

      if (sensorsHealth) {
        if (sensorsHealth.soilMoisture) device.sensors.soilMoisture.status = sensorsHealth.soilMoisture;
        if (sensorsHealth.dht22) device.sensors.dht22.status = sensorsHealth.dht22;
        if (sensorsHealth.wifi) device.sensors.wifi.status = sensorsHealth.wifi;
      }

      await device.save();

      // Log reading
      const log = await SensorReading.create({
        deviceId: device._id,
        serialNumber,
        soilMoisture: moistureNum,
        temperature: tempNum,
        humidity: humNum,
        battery: batNum,
        timestamp: new Date()
      });

      return res.status(201).json({ success: true, message: 'Reading saved.', log });
    }
  } catch (error) {
    console.error('IoT Ingestion error:', error);
    res.status(500).json({ success: false, message: 'Server error saving sensor readings.' });
  }
});

// @route   GET /api/iot/devices/:serialNumber/readings
// @desc    Get historical readings for Recharts graphics
router.get('/devices/:serialNumber/readings', async (req, res) => {
  const { serialNumber } = req.params;
  const limit = Number(req.query.limit || 20);

  try {
    if (global.isMockDB) {
      const logs = mockDB.readings
        .filter(r => r.serialNumber === serialNumber)
        .slice(-limit);
      return res.json({ success: true, readings: logs });
    } else {
      const readings = await SensorReading.find({ serialNumber })
        .sort({ timestamp: -1 })
        .limit(limit);
      // Reverse so it flows left to right on the graph
      res.json({ success: true, readings: readings.reverse() });
    }
  } catch (error) {
    console.error('Fetch logs error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching logs.' });
  }
});

// @route   POST /api/iot/simulate
// @desc    Update device state directly from simulation panel UI
router.post('/simulate', async (req, res) => {
  const { serialNumber, soilMoisture, temperature, humidity, battery, status, sensorHealth } = req.body;

  try {
    if (global.isMockDB) {
      const device = mockDB.devices.find(d => d.serialNumber === serialNumber);
      if (!device) return res.status(404).json({ success: false, message: 'Device not found.' });

      if (soilMoisture !== undefined) {
        device.sensors.soilMoisture.value = Number(soilMoisture);
        if (Number(soilMoisture) <= 15) {
          // If soil moisture drops below 15, simulate sensor degradation/warning
          device.sensors.soilMoisture.status = 'ERROR';
        } else {
          device.sensors.soilMoisture.status = 'ONLINE';
        }
      }
      if (temperature !== undefined) device.sensors.dht22.temp = Number(temperature);
      if (humidity !== undefined) device.sensors.dht22.humidity = Number(humidity);
      if (battery !== undefined) device.batteryLevel = Number(battery);
      if (status !== undefined) device.status = status;
      
      if (sensorHealth) {
        if (sensorHealth.soilMoisture) device.sensors.soilMoisture.status = sensorHealth.soilMoisture;
        if (sensorHealth.dht22) device.sensors.dht22.status = sensorHealth.dht22;
        if (sensorHealth.wifi) device.sensors.wifi.status = sensorHealth.wifi;
      }

      // Add a history record for the simulation
      mockDBActions.create('readings', {
        deviceId: device._id,
        serialNumber,
        soilMoisture: device.sensors.soilMoisture.value,
        temperature: device.sensors.dht22.temp,
        humidity: device.sensors.dht22.humidity,
        battery: device.batteryLevel,
        timestamp: new Date()
      });

      return res.json({ success: true, device });
    } else {
      const device = await Device.findOne({ serialNumber });
      if (!device) return res.status(404).json({ success: false, message: 'Device not found.' });

      if (soilMoisture !== undefined) {
        device.sensors.soilMoisture.value = Number(soilMoisture);
        if (Number(soilMoisture) <= 15) {
          device.sensors.soilMoisture.status = 'ERROR';
        } else {
          device.sensors.soilMoisture.status = 'ONLINE';
        }
      }
      if (temperature !== undefined) device.sensors.dht22.temp = Number(temperature);
      if (humidity !== undefined) device.sensors.dht22.humidity = Number(humidity);
      if (battery !== undefined) device.batteryLevel = Number(battery);
      if (status !== undefined) device.status = status;

      if (sensorHealth) {
        if (sensorHealth.soilMoisture) device.sensors.soilMoisture.status = sensorHealth.soilMoisture;
        if (sensorHealth.dht22) device.sensors.dht22.status = sensorHealth.dht22;
        if (sensorHealth.wifi) device.sensors.wifi.status = sensorHealth.wifi;
      }

      await device.save();

      await SensorReading.create({
        deviceId: device._id,
        serialNumber,
        soilMoisture: device.sensors.soilMoisture.value,
        temperature: device.sensors.dht22.temp,
        humidity: device.sensors.dht22.humidity,
        battery: device.batteryLevel,
        timestamp: new Date()
      });

      return res.json({ success: true, device });
    }
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ success: false, message: 'Server error updating simulation.' });
  }
});

export default router;
