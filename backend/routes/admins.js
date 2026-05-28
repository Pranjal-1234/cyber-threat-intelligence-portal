const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// List administrators from admins table
router.get('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [admins] = await db.query(
            `SELECT id, name, email, is_active, created_at, 'admin' as role, 'admins' as account_table
             FROM admins ORDER BY created_at DESC`
        );
        res.json(admins);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
