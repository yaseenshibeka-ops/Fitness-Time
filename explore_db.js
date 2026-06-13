const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_C2Y5yfxXAhnZ@ep-icy-firefly-aigc7y42-pooler.c-4.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require',
  });
  await client.connect();
  
  const tables = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
  );
  
  console.log('Tables:', tables.rows.map(r => r.table_name));
  
  for (const t of tables.rows) {
    const cols = await client.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
      [t.table_name]
    );
    console.log(`\n--- ${t.table_name} ---`);
    cols.rows.forEach(c => {
      console.log(`  ${c.column_name} (${c.data_type}, nullable=${c.is_nullable}, default=${c.column_default || 'none'})`);
    });
    
    const count = await client.query(`SELECT COUNT(*) FROM "${t.table_name}"`);
    console.log(`  Rows: ${count.rows[0].count}`);
  }
  
  await client.end();
}
main().catch(e => { console.error(e); process.exit(1); });
