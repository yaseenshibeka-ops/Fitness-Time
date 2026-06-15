const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_C2Y5yfxXAhnZ@ep-icy-firefly-aigc7y42-pooler.c-4.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require',
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  
  try {
    console.log('Querying order 35 from Neon...');
    const orderRes = await client.query('SELECT * FROM orders WHERE order_id = 35');
    console.log('Order 35:', orderRes.rows);

    console.log('Querying payments for order 35 from Neon...');
    const payRes = await client.query('SELECT * FROM payments WHERE order_id = 35');
    console.log('Payments for order 35:', payRes.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
main();
