const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

async function emailExists(email) {
    const [admins] = await db.query('SELECT id FROM admins WHERE email = ?', [email]);
    if (admins.length > 0) return true;
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    return users.length > 0;
}

// Register — role routes for users or admins
router.post('/register', async (req, res) => {
    const { name, email, password, role = 'user' } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Role must be either user or admin' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: 'Password must be at least 8 characters long and contain both letters and numbers'
        });
    }

    try {
        if (await emailExists(email)) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        if (role === 'admin') {
            await db.query(
                'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword]
            );
            return res.status(201).json({ message: 'Admin registered successfully' });
        }

        await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login — role selects which table to use (admin → admins, user → users)
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
        return res.status(400).json({
            message: 'Select a sign-in role: Administrator or Analyst.'
        });
    }

    try {
        if (role === 'admin') {
            const [admins] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
            if (admins.length === 0) {
                const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
                if (users.length > 0) {
                    return res.status(400).json({
                        message: 'This email is registered as Analyst. Choose Analyst to sign in.'
                    });
                }
                return res.status(400).json({ message: 'Administrator account not found for this email.' });
            }

            const admin = admins[0];
            if (admin.is_active === 0) {
                return res.status(403).json({ message: 'Administrator account is blocked.' });
            }
            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid email or password.' });
            }
            const token = jwt.sign(
                { id: admin.id, role: 'admin', name: admin.name, accountType: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );
            return res.json({
                token,
                user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin', accountType: 'admin' }
            });
        }

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            const [admins] = await db.query('SELECT id FROM admins WHERE email = ?', [email]);
            if (admins.length > 0) {
                return res.status(400).json({
                    message: 'This email is registered as Administrator. Choose Administrator to sign in.'
                });
            }
            return res.status(400).json({ message: 'Analyst account not found for this email.' });
        }

        const user = users[0];
        if (user.is_active === 0) {
            return res.status(403).json({ message: 'Your account has been blocked. Contact an administrator.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user.id, role: 'user', name: user.name, accountType: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: 'user', accountType: 'user' }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
