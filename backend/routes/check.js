const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { analyzeIndicator } = require('../utils/threatCheck');

router.post('/', authenticateToken, (req, res) => {
    const { indicator } = req.body;
    if (!indicator || !String(indicator).trim()) {
        return res.status(400).json({ message: 'URL, domain, or IP is required' });
    }
    const result = analyzeIndicator(indicator);
    res.json(result);
});

module.exports = router;
