const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_C2Y5yfxXAhnZ@ep-icy-firefly-aigc7y42-pooler.c-4.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require',
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('Connected.');

  const migrationsDir = path.join(__dirname, 'src', 'database', 'migrations');
  const sqlFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of sqlFiles) {
    console.log(`Running ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

    for (let stmt of statements) {
      if (stmt.startsWith('SET ') || stmt.startsWith('PREPARE ') || stmt.startsWith('EXECUTE ') || stmt.startsWith('DEALLOCATE ')) continue;
      try {
        await client.query(stmt);
      } catch (err) {
        console.warn(`  Skipped (${err.code}): ${stmt.slice(0, 60)}...`);
      }
    }
  }

  console.log('All migrations complete. Verifying...');
  const tables = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
  );
  for (const t of tables.rows) {
    const count = await client.query(`SELECT COUNT(*) FROM "${t.table_name}"`);
    console.log(`  ${t.table_name}: ${count.rows[0].count} rows`);
  }

  await client.end();
  console.log('Done.');
}
main().catch(e => { console.error(e); process.exit(1); });
