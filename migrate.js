const db = require('./backend/db');
async function migrate() {
    try {
        await db.query('ALTER TABLE threats DROP COLUMN value;');
        await db.query("ALTER TABLE threats MODIFY COLUMN risk_level ENUM('Critical', 'High', 'Medium', 'Low') NOT NULL;");
        console.log("Migration done");
        process.exit(0);
    } catch(e) { console.error(e); process.exit(1); }
}
migrate();