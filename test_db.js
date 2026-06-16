const pool = require('./src/config/database');

async function test() {
  try {
    const userId = 1; // test user ID
    console.log('Running test query...');
    const result = await pool.query(
      'SELECT SUM(duration_minutes) as total_minutes, SUM(calories_burned) as total_calories FROM fitness_progress WHERE user_id = ? AND recorded_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
      [userId]
    );
    console.log('Result:', result);
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await pool.end();
  }
}
// ahmed mostafa 
test();
