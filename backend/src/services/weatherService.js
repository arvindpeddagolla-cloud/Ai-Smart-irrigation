// Global simulation state initialization
if (!global.simulationState) {
  global.simulationState = {
    weather: {
      condition: 'Rain expected',
      probability: 78,
      temp: 29,
      recommendation: 'WAIT — Rain likely'
    }
  };
}

export const getWeatherData = async (location = 'Default Farm') => {
  // In production, you would fetch from an API like OpenWeatherMap:
  // const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.WEATHER_API_KEY}`);
  // return parseWeatherData(await res.json());

  // Dynamic simulation fallback:
  return global.simulationState.weather;
};

export const updateSimulatedWeather = (condition, probability, temp) => {
  let recommendation = 'IRRIGATION RECOMMENDED';
  if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('shower') || condition.toLowerCase().includes('drizzle')) {
    if (probability >= 50) {
      recommendation = 'WAIT — Rain likely';
    }
  }

  global.simulationState.weather = {
    condition,
    probability,
    temp,
    recommendation
  };
  return global.simulationState.weather;
};
