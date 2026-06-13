const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function migrate() {
    console.log('Starting database migration...');
    
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'secret',
        port: process.env.DB_PORT || 3306,
    });

    const dbName = process.env.DB_NAME || 'fittrack';

    try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        console.log(`Database '${dbName}' ensured.`);
        
        await connection.query(`USE \`${dbName}\`;`);

        const migrationsDir = path.join(__dirname, 'migrations');
        const sqlFiles = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        for (const file of sqlFiles) {
            const sqlFilePath = path.join(migrationsDir, file);
            const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
            console.log(`Executing ${file}...`);

            const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);

            for (let statement of statements) {
                if (statement.trim()) {
                    await connection.query(statement);
                }
            }
        }
        
        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

migrate();
