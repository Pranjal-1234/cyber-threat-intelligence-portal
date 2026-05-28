const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// List analysts from users table only
router.get('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT id, name, email, is_active, created_at, 'user' as role, 'users' as account_table
             FROM users ORDER BY created_at DESC`
        );
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/:id/status', authenticateToken, isAdmin, async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
        return res.status(400).json({ message: 'is_active must be true or false' });
    }

    try {
        const [rows] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found in users table' });
        }

        await db.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, userId]);
        res.json({
            message: is_active ? 'User unblocked successfully' : 'User blocked successfully'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
