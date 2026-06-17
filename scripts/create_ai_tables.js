require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

const sqlPath = path.join(__dirname, '..', 'src', 'database', 'migrations', '009_ai_features.sql');

async function main() {
  let sql = fs.readFileSync(sqlPath, 'utf8');
  sql = sql.replace(/^--.*$/gm, '');
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

  let cfg = {};
  if (process.env.DATABASE_URL) {
    cfg.connectionString = process.env.DATABASE_URL;
  } else {
    cfg = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'secret',
      database: process.env.DB_NAME || 'fittrack',
      port: parseInt(process.env.DB_PORT || '5432'),
    };
  }
  if (cfg.connectionString && cfg.connectionString.includes('neon.tech')) {
    cfg.ssl = { rejectUnauthorized: false };
  }

  const client = new Client(cfg);
  await client.connect();
  console.log('Connected.');

  for (const stmt of statements) {
    try {
      await client.query(stmt);
      console.log('OK: ' + stmt.slice(0, 80) + '...');
    } catch (err) {
      if (['23505', '42P07', '42701', '42710'].includes(err.code)) {
        console.log('Exists: ' + err.code);
      } else {
        console.error('Error:', err.message);
      }
    }
  }

  await client.end();
  console.log('Done.');
}

main().catch(e => console.error('Failed:', e.message));
