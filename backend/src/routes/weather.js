import express from 'express';
import { getWeatherData, updateSimulatedWeather } from '../services/weatherService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/weather
// @desc    Get current weather and irrigation recommendations (for Farmer Dashboard)
router.get('/', protect, async (req, res) => {
  try {
    const data = await getWeatherData(req.query.location || 'Ramesh Patel Farm');
    res.json({ success: true, weather: data });
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching weather forecasts.' });
  }
});

// @route   POST /api/weather/simulate
// @desc    Update weather simulation parameters (Admin or Farmer simulation panel)
router.post('/simulate', async (req, res) => {
  const { condition, probability, temp } = req.body;

  if (!condition || probability === undefined || temp === undefined) {
    return res.status(400).json({ success: false, message: 'Please provide condition, probability, and temp.' });
  }

  try {
    const updated = updateSimulatedWeather(condition, Number(probability), Number(temp));
    res.json({ success: true, weather: updated });
  } catch (error) {
    console.error('Simulate weather error:', error);
    res.status(500).json({ success: false, message: 'Server error simulating weather update.' });
  }
});

export default router;
