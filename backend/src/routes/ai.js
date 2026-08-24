import express from 'express';
import { processAIChat, classifyIssue } from '../services/aiService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/ai/chat
// @desc    Process a troubleshooting chat query from a farmer with their device context
router.post('/chat', protect, async (req, res) => {
  const { message, deviceContext } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required.' });
  }

  try {
    // Simulate AI response delay for natural chat flow UI
    setTimeout(async () => {
      try {
        const response = await processAIChat(message, deviceContext || {});
        res.json({ success: true, ...response });
      } catch (err) {
        console.error('AI inner chat processing error:', err);
        res.status(500).json({ success: false, message: 'AI failed to process message.' });
      }
    }, 1000); // 1-second delay
  } catch (error) {
    console.error('AI Route chat error:', error);
    res.status(500).json({ success: false, message: 'Server error in AI chat service.' });
  }
});

// @route   POST /api/ai/classify-ticket
// @desc    Analyze a ticket description to prefill category, priority, and recommended technician type
router.post('/classify-ticket', protect, async (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ success: false, message: 'Description is required.' });
  }

  try {
    const classification = classifyIssue(description);
    res.json({ success: true, classification });
  } catch (error) {
    console.error('AI Classification route error:', error);
    res.status(500).json({ success: false, message: 'Server error running issue classification.' });
  }
});

export default router;
