const bcrypt = require('bcryptjs');
const db = require('./db');

async function ensureColumn(table, column, definition) {
    try {
        await db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    } catch (err) {
        if (err.code !== 'ER_DUP_FIELDNAME') throw err;
    }
}

async function columnExists(table, column) {
    const [rows] = await db.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [column]);
    return rows.length > 0;
}

async function tableExists(table) {
    const [rows] = await db.query('SHOW TABLES LIKE ?', [table]);
    return rows.length > 0;
}

async function ensureAdminsTable() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

async function ensureUsersTable() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await ensureColumn('users', 'is_active', 'TINYINT(1) NOT NULL DEFAULT 1');
}

async function migrateLegacyUsersTable() {
    if (!(await tableExists('users'))) return;
    if (!(await columnExists('users', 'role'))) return;

    await ensureAdminsTable();

    const [legacyAdmins] = await db.query("SELECT * FROM users WHERE role = 'admin'");
    for (const row of legacyAdmins) {
        const [exists] = await db.query('SELECT id FROM admins WHERE email = ?', [row.email]);
        if (exists.length === 0) {
            await db.query(
                'INSERT INTO admins (name, email, password, is_active, created_at) VALUES (?, ?, ?, ?, ?)',
                [row.name, row.email, row.password, row.is_active ?? 1, row.created_at]
            );
        }
    }

    const [adminIdRows] = await db.query("SELECT id FROM users WHERE role = 'admin'");
    const adminIds = adminIdRows.map((r) => r.id);

    if (adminIds.length > 0 && (await tableExists('threats'))) {
        await ensureColumn('threats', 'created_by_user', 'INT NULL');
        await ensureColumn('threats', 'created_by_admin', 'INT NULL');

        if (await columnExists('threats', 'created_by')) {
            for (const adminId of adminIds) {
                const [adm] = await db.query(
                    'SELECT a.id FROM admins a INNER JOIN users u ON u.email = a.email WHERE u.id = ?',
                    [adminId]
                );
                if (adm.length > 0) {
                    await db.query(
                        'UPDATE threats SET created_by_admin = ?, created_by_user = NULL WHERE created_by = ?',
                        [adm[0].id, adminId]
                    );
                }
            }
            await db.query(
                'UPDATE threats SET created_by_user = created_by, created_by_admin = NULL WHERE created_by IS NOT NULL AND created_by_admin IS NULL'
            );
        }
    }

    await db.query("DELETE FROM users WHERE role = 'admin'");

    try {
        await db.query('ALTER TABLE users DROP COLUMN role');
    } catch (err) {
        if (err.code !== 'ER_CANT_DROP_FIELD_OR_KEY') throw err;
    }

    console.log('Migrated legacy users table → separate admins + users tables');
}

async function ensureThreatColumns() {
    if (!(await tableExists('threats'))) return;

    await db.query(
        "ALTER TABLE threats MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Active'"
    );
    await ensureColumn('threats', 'category', "VARCHAR(80) NOT NULL DEFAULT 'Malicious IP / URL'");
    await ensureColumn('threats', 'created_by_user', 'INT NULL');
    await ensureColumn('threats', 'created_by_admin', 'INT NULL');

    if (await columnExists('threats', 'created_by')) {
        await db.query(`
            UPDATE threats SET created_by_user = created_by
            WHERE created_by IS NOT NULL AND created_by_user IS NULL AND created_by_admin IS NULL
        `);
    }
}

async function ensureDefaultAdmin() {
    const email = 'admin@cti.local';
    const [rows] = await db.query('SELECT id FROM admins WHERE email = ?', [email]);

    if (rows.length === 0) {
        const hash = await bcrypt.hash('admin123', 10);
        await db.query(
            'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)',
            ['System Admin', email, hash]
        );
        console.log('Default admin created in admins table (admin@cti.local / admin123)');
    }
}

async function runSetup() {
    await ensureAdminsTable();
    await ensureUsersTable();
    await migrateLegacyUsersTable();
    await ensureThreatColumns();
    await ensureDefaultAdmin();
    console.log('Database setup verified (admins + users tables)');
}

module.exports = { runSetup };
