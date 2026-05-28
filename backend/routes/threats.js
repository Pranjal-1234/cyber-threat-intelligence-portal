const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const ALLOWED_STATUSES = ['Active', 'Investigating', 'Resolved', 'Pending Approval', 'Rejected'];
const ALLOWED_CATEGORIES = [
    'Malicious IP / URL',
    'Fake Email / Phishing Email',
    'Hacked Account',
    'Suspicious Message',
    'Malware Attack',
    'Ransomware',
    'DDoS',
    'Other'
];

const CREATOR_SELECT = `
    COALESCE(u.name, a.name) as creator_name,
    CASE WHEN t.created_by_admin IS NOT NULL THEN 'admin' ELSE 'user' END as creator_role
`;

const CREATOR_JOINS = `
    LEFT JOIN users u ON t.created_by_user = u.id
    LEFT JOIN admins a ON t.created_by_admin = a.id
`;

function searchFilter(q) {
    if (!q || !String(q).trim()) {
        return { sql: '', params: [] };
    }
    const like = `%${String(q).trim()}%`;
    return {
        sql: ` AND (t.indicator LIKE ? OR t.type LIKE ? OR t.source LIKE ? OR t.category LIKE ? OR u.name LIKE ? OR a.name LIKE ?)`,
        params: [like, like, like, like, like, like]
    };
}

async function notifyUser(userId, title, message) {
    if (!userId) return;
    await db.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [userId, title, message]
    );
}

router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const approvedWhere = "status NOT IN ('Rejected', 'Pending Approval')";

        const [severityRows] = await db.query(
            `SELECT risk_level, COUNT(*) as count FROM threats WHERE ${approvedWhere} GROUP BY risk_level`
        );

        const severity = { Critical: 0, High: 0, Medium: 0, Low: 0 };
        severityRows.forEach((row) => {
            if (severity[row.risk_level] !== undefined) {
                severity[row.risk_level] = Number(row.count);
            }
        });

        const [pending] = await db.query("SELECT COUNT(*) as count FROM threats WHERE status = 'Pending Approval'");
        const [sources] = await db.query(
            `SELECT source, COUNT(*) as count FROM threats WHERE ${approvedWhere} GROUP BY source ORDER BY count DESC LIMIT 5`
        );
        const [recent] = await db.query(`
            SELECT t.*, ${CREATOR_SELECT}
            FROM threats t
            ${CREATOR_JOINS}
            WHERE ${approvedWhere}
            ORDER BY t.date DESC LIMIT 5
        `);

        res.json({
            total: severity.Critical + severity.High + severity.Medium + severity.Low,
            critical: severity.Critical,
            high: severity.High,
            medium: severity.Medium,
            low: severity.Low,
            pending: Number(pending[0].count),
            topSources: sources.map((s) => ({ source: s.source, count: Number(s.count) })),
            recentActivity: recent
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const { q } = req.query;
        const filter = searchFilter(q);
        const [threats] = await db.query(
            `SELECT t.*, ${CREATOR_SELECT}
             FROM threats t
             ${CREATOR_JOINS}
             WHERE t.status != 'Rejected' AND t.status != 'Pending Approval'${filter.sql}
             ORDER BY t.date DESC`,
            filter.params
        );
        res.json(threats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/mine', authenticateToken, async (req, res) => {
    if (req.user.role === 'admin') {
        return res.json([]);
    }
    try {
        const { q } = req.query;
        const filter = searchFilter(q);
        const [threats] = await db.query(
            `SELECT t.*, ${CREATOR_SELECT}
             FROM threats t
             ${CREATOR_JOINS}
             WHERE t.created_by_user = ?${filter.sql}
             ORDER BY t.date DESC`,
            [req.user.id, ...filter.params]
        );
        res.json(threats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/pending', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { q } = req.query;
        const filter = searchFilter(q);
        const [threats] = await db.query(
            `SELECT t.*, ${CREATOR_SELECT}
             FROM threats t
             ${CREATOR_JOINS}
             WHERE t.status = 'Pending Approval' AND t.created_by_user IS NOT NULL${filter.sql}
             ORDER BY t.date DESC`,
            filter.params
        );
        res.json(threats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    let { indicator, type, source, category, risk_score, confidence_score, status } = req.body;

    if (!indicator || !type || !source) {
        return res.status(400).json({ error: 'Indicator, Type, and Source are required' });
    }

    category = category || 'Malicious IP / URL';
    if (!ALLOWED_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}` });
    }

    if (source.toLowerCase() === 'virus total') source = 'VirusTotal';
    if (type === 'IP Address') type = 'Suspicious IP';

    risk_score = parseInt(risk_score, 10);
    if (isNaN(risk_score) || risk_score < 0 || risk_score > 100) {
        return res.status(400).json({ error: 'Risk Score must be between 0 and 100' });
    }

    confidence_score = parseInt(confidence_score, 10);
    if (isNaN(confidence_score) || confidence_score < 0 || confidence_score > 100) {
        return res.status(400).json({ error: 'Confidence must be between 0 and 100' });
    }

    let risk_level = 'Low';
    if (risk_score >= 90) risk_level = 'Critical';
    else if (risk_score >= 71) risk_level = 'High';
    else if (risk_score >= 31) risk_level = 'Medium';

    const finalStatus = req.user.role === 'admin' ? (status || 'Active') : 'Pending Approval';

    if (!ALLOWED_STATUSES.includes(finalStatus)) {
        return res.status(400).json({ error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}` });
    }

    try {
        if (req.user.role === 'admin') {
            await db.query(
                `INSERT INTO threats (indicator, type, source, category, risk_score, confidence_score, risk_level, status, created_by_admin, created_by_user)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
                [indicator, type, source, category, risk_score, confidence_score, risk_level, finalStatus, req.user.id]
            );
        } else {
            await db.query(
                `INSERT INTO threats (indicator, type, source, category, risk_score, confidence_score, risk_level, status, created_by_user, created_by_admin)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
                [indicator, type, source, category, risk_score, confidence_score, risk_level, finalStatus, req.user.id]
            );
        }
        res.status(201).json({
            message: req.user.role === 'admin' ? 'Threat added successfully' : 'Threat submitted for approval'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/:id/approve', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM threats WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Threat not found' });
        }

        const threat = rows[0];
        await db.query("UPDATE threats SET status = 'Active' WHERE id = ?", [req.params.id]);

        await notifyUser(
            threat.created_by_user,
            'Threat Report Approved',
            `Your report for "${threat.indicator}" was approved and published to the intelligence feed.`
        );

        res.json({ message: 'Threat approved and added to intelligence feed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/:id/reject', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM threats WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Threat not found' });
        }

        const threat = rows[0];
        await db.query("UPDATE threats SET status = 'Rejected' WHERE id = ?", [req.params.id]);

        await notifyUser(
            threat.created_by_user,
            'Threat Report Rejected',
            `Your report for "${threat.indicator}" was rejected. Contact an administrator for details.`
        );

        res.json({ message: 'Threat rejected' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/:id/status', authenticateToken, isAdmin, async (req, res) => {
    const { status } = req.body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}` });
    }

    try {
        await db.query('UPDATE threats SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Status updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM threats WHERE id = ?', [req.params.id]);
        res.json({ message: 'Threat deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
