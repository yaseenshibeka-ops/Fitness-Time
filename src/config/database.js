const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

// Configuration
let poolConfig = {};
if (process.env.DATABASE_URL) {
  poolConfig.connectionString = process.env.DATABASE_URL;
} else {
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'secret',
    database: process.env.DB_NAME || 'fittrack',
    port: parseInt(process.env.DB_PORT || '5432', 10),
  };
}

// Enable SSL for Neon or production
if ((poolConfig.connectionString && poolConfig.connectionString.includes('neon.tech')) || isProduction) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

poolConfig.connectionTimeoutMillis = 10000;
poolConfig.idleTimeoutMillis = 30000;
poolConfig.max = 5;
const pgPool = new Pool(poolConfig);

pgPool.on('connect', (client) => {
  client.query("SET statement_timeout = '15000'").catch(() => {});
});

// Helper to translate MySQL query strings and parameters to Postgres-compatible ones
function adaptQuery(sql, values = []) {
  let index = 1;
  let adaptedSql = sql.replace(/\?/g, () => `$${index++}`);
  
  // Convert double-quoted values (e.g. role = "user") to single-quoted strings
  adaptedSql = adaptedSql.replace(/"([a-zA-Z0-9_-]+)"/g, "'$1'");

  // Convert common MySQL functions to PG equivalents
  adaptedSql = adaptedSql.replace(/DATE_FORMAT\(([^,]+),\s*'%Y-%m'\)/gi, "TO_CHAR($1, 'YYYY-MM')");
  adaptedSql = adaptedSql.replace(/DATE_FORMAT\(([^,]+),\s*'%Y-%m-%d'\)/gi, "TO_CHAR($1, 'YYYY-MM-DD')");
  adaptedSql = adaptedSql.replace(/CURDATE\(\)/gi, "CURRENT_DATE");
  adaptedSql = adaptedSql.replace(/DATE_SUB\(([^,]+),\s*INTERVAL\s*(\d+)\s*([a-zA-Z]+)\)/gi, "$1 - INTERVAL '$2 $3'");
  adaptedSql = adaptedSql.replace(/DATE_ADD\(([^,]+),\s*INTERVAL\s*(\d+)\s*([a-zA-Z]+)\)/gi, "$1 + INTERVAL '$2 $3'");
  adaptedSql = adaptedSql.replace(/MONTH\(([^)]+)\)/gi, "EXTRACT(MONTH FROM $1)");
  adaptedSql = adaptedSql.replace(/YEAR\(([^)]+)\)/gi, "EXTRACT(YEAR FROM $1)");

  // Append RETURNING * to INSERT queries so we can get insertId
  const trimmed = adaptedSql.trim().toUpperCase();
  if (trimmed.startsWith('INSERT') && !trimmed.includes('RETURNING')) {
    if (adaptedSql.endsWith(';')) {
      adaptedSql = adaptedSql.slice(0, -1) + ' RETURNING *;';
    } else {
      adaptedSql = adaptedSql + ' RETURNING *';
    }
  }

  return adaptedSql;
}

// Helper to format PostgreSQL result to match mysql2 promise query result
function formatResult(sql, pgResult) {
  const trimmed = sql.trim().toUpperCase();
  const rows = pgResult.rows || [];
  
  if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH') || trimmed.startsWith('SHOW')) {
    return [rows, pgResult.fields];
  } else {
    let insertId = null;
    if (trimmed.startsWith('INSERT') && rows[0]) {
      const row = rows[0];
      const idKey = Object.keys(row).find(k => k.toLowerCase().endsWith('_id') || k.toLowerCase() === 'id');
      if (idKey) {
        insertId = parseInt(row[idKey], 10) || row[idKey];
      }
    }
    const info = {
      insertId: insertId,
      affectedRows: pgResult.rowCount,
      rowCount: pgResult.rowCount
    };
    return [info];
  }
}

// Wrap Pool Query
const originalQuery = pgPool.query.bind(pgPool);
pgPool.query = async function (sql, values) {
  // mysql2 allows query(sql, callback) or query(sql, values)
  // Our code uses: await pool.query(sql, values)
  const pgSql = adaptQuery(sql, values);
  console.log('ADAPTED SQL:', pgSql);
  const result = await originalQuery(pgSql, values);
  return formatResult(sql, result);
};

// Implement getConnection
pgPool.getConnection = async function () {
  const client = await pgPool.connect();
  
  // Capture original methods before wrapping
  const originalClientQuery = client.query.bind(client);
  const originalClientRelease = client.release.bind(client);

  client.query = async function (sql, values) {
    const pgSql = adaptQuery(sql, values);
    const result = await originalClientQuery(pgSql, values);
    return formatResult(sql, result);
  };
  
  // Transaction helpers
  client.beginTransaction = async function () {
    await originalClientQuery('BEGIN');
  };
  
  client.commit = async function () {
    await originalClientQuery('COMMIT');
  };
  
  client.rollback = async function () {
    await originalClientQuery('ROLLBACK');
  };
  
  client.release = function () {
    originalClientRelease();
  };

  return client;
};

module.exports = pgPool;
