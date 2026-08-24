/**
 * AI Service Layer
 * Processes farmer messages, provides context-aware troubleshooting,
 * classifies ticket categories, and suggests escalations.
 */

// Simple keyword classifier for demonstration that mimics LLM classification
export const classifyIssue = (description) => {
  const desc = description.toLowerCase();
  let category = 'Other Issue';
  let recommendedPriority = 'LOW';
  let recommendedSpecialty = 'FIELD';

  // 1. Category Classification
  if (desc.includes('soil') || desc.includes('moisture') || desc.includes('dht') || desc.includes('sensor') || desc.includes('dht22')) {
    category = 'Sensor Problem';
    recommendedSpecialty = 'HARDWARE';
  } else if (desc.includes('wifi') || desc.includes('wi-fi') || desc.includes('internet') || desc.includes('connect') || desc.includes('offline') || desc.includes('signal')) {
    category = 'Connectivity Problem';
    recommendedSpecialty = 'SOFTWARE_IOT';
  } else if (desc.includes('battery') || desc.includes('charge') || desc.includes('power') || desc.includes('solar') || desc.includes('voltage') || desc.includes('plug')) {
    category = 'Power/Battery Problem';
    recommendedSpecialty = 'HARDWARE';
  } else if (desc.includes('rain') || desc.includes('weather') || desc.includes('forecast') || desc.includes('predict')) {
    category = 'Weather Prediction Problem';
    recommendedSpecialty = 'SOFTWARE_IOT';
  } else if (desc.includes('upgrade') || desc.includes('new version') || desc.includes('v2')) {
    category = 'Model Upgrade';
    recommendedSpecialty = 'FIELD';
  } else if (desc.includes('leak') || desc.includes('pipe') || desc.includes('valve') || desc.includes('pump') || desc.includes('broken')) {
    category = 'Request Repair';
    recommendedSpecialty = 'HARDWARE';
  }

  // 2. Priority Classification
  if (desc.includes('shock') || desc.includes('smoke') || desc.includes('fire') || desc.includes('burning') || desc.includes('overheat') || desc.includes('dangerous')) {
    recommendedPriority = 'CRITICAL';
  } else if (desc.includes('not watering') || desc.includes('dry') || desc.includes('failed') || desc.includes('broken') || desc.includes('offline') || desc.includes('completely')) {
    recommendedPriority = 'HIGH';
  } else if (desc.includes('wrong') || desc.includes('reading') || desc.includes('incorrect') || desc.includes('fluctuating') || desc.includes('intermittent')) {
    recommendedPriority = 'MEDIUM';
  }

  return { category, recommendedPriority, recommendedSpecialty };
};

// Main chat route backend intelligence
export const processAIChat = async (message, deviceContext = {}) => {
  const msg = message.toLowerCase();
  
  // Simulated delay in response processing is handled at the controller level
  let text = '';
  let diagnosticStatus = null;
  let canEscalate = false;
  let ticketDraft = null;

  // Flow A: Farmer complains about soil moisture
  if (msg.includes('moisture') || msg.includes('soil') || msg.includes('sensor')) {
    const moistureVal = deviceContext.sensors?.soilMoisture?.value ?? 10;
    
    diagnosticStatus = {
      device: deviceContext.model || 'Smart Irrigation V1',
      sensor: 'Soil Moisture',
      latestReading: `${moistureVal}%`,
      previousReading: '43%',
      connectivity: deviceContext.status || 'ONLINE'
    };

    if (moistureVal <= 15) {
      text = `Your soil moisture reading changed unusually. Based on my analysis, the reading has dropped from a stable 43% down to ${moistureVal}%. Please check whether the sensor probe is properly pushed into the dirt and that the connection wire isn't damaged.`;
      canEscalate = true;
    } else {
      text = `I see your soil moisture is at ${moistureVal}%. This is within a reasonable range, but if the crops look dry, you may want to initiate a watering manual overwrite or inspect for pipe blockage.`;
    }
  }
  // Flow B: User triggers escalation (e.g. STILL NOT WORKING or clicking helper button)
  else if (msg.includes('still not working') || msg.includes('not working') || msg.includes('failed') || msg.includes('escalate')) {
    text = "I'll create a service request for you. I've prepared a service ticket draft for a Hardware Technician. Please review it below and confirm submission.";
    canEscalate = false;
    ticketDraft = {
      farmerName: 'Ramesh Patel',
      productModel: deviceContext.model || 'Smart Irrigation V1',
      serialNumber: deviceContext.serialNumber || 'SI123456',
      category: 'Sensor Problem',
      description: `Soil moisture reading is abnormally low (${deviceContext.sensors?.soilMoisture?.value ?? 10}%). Checked connection wire, but sensor is still not reading correctly. Troubleshooting failed.`,
      priority: 'HIGH'
    };
  }
  // Flow C: Wifi / Connection Issues
  else if (msg.includes('wifi') || msg.includes('offline') || msg.includes('connect')) {
    text = "It looks like your device is having connection trouble. Please try power cycling your Wi-Fi router. If the device remains offline, verify if the green LED on the main module is blinking slowly, which indicates searching for a signal.";
    canEscalate = true;
  }
  // Flow D: Battery Issues
  else if (msg.includes('battery') || msg.includes('power') || msg.includes('charge')) {
    const batVal = deviceContext.batteryLevel ?? 87;
    text = `Your device battery is currently at ${batVal}%. If it is not charging via the solar panels, check for dust buildup on the solar glass or verify that the cable from the panel is plugged into the DC input port.`;
    canEscalate = true;
  }
  // Default greetings/fallback
  else {
    text = "Hello! I am your SmartCare Assistant. I can help troubleshoot your device sensors, connection state, battery charging, or draft a service ticket if something is broken. What issues are you experiencing?";
  }

  return {
    text,
    diagnosticStatus,
    canEscalate,
    ticketDraft
  };
};
