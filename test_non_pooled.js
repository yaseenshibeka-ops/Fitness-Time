const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_C2Y5yfxXAhnZ@ep-icy-firefly-aigc7y42.c-4.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require',
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('Connecting to non-pooled Neon endpoint...');
    await client.connect();
    console.log('Connected successfully!');
    
    const res = await client.query('SELECT NOW()');
    console.log('Time:', res.rows[0]);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await client.end();
  }
}
main();
