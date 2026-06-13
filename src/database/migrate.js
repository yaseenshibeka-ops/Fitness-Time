const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function migrate() {
    console.log('Starting database migration...');
    
    let clientConfig = {};
    if (process.env.DATABASE_URL) {
        clientConfig.connectionString = process.env.DATABASE_URL;
    } else {
        clientConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'secret',
            database: process.env.DB_NAME || 'fittrack',
            port: parseInt(process.env.DB_PORT || '5432', 10),
        };
    }

    const isProduction = process.env.NODE_ENV === 'production';
    if ((clientConfig.connectionString && clientConfig.connectionString.includes('neon.tech')) || isProduction) {
        clientConfig.ssl = { rejectUnauthorized: false };
    }

    const client = new Client(clientConfig);

    try {
        await client.connect();
        console.log('Connected to database successfully.');

        const migrationsDir = path.join(__dirname, 'migrations');
        const sqlFiles = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        for (const file of sqlFiles) {
            const sqlFilePath = path.join(migrationsDir, file);
            let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
            console.log(`Executing ${file}...`);

            // Split by semicolon, but ignore semicolons within comments or strings if possible.
            // A simple split on ';' works for these migration files, but we should trim and execute.
            const statements = sqlContent.split(';').map(s => s.trim()).filter(s => s.length > 0);

            for (let statement of statements) {
                // Skip MySQL specific session variable queries
                if (statement.startsWith('SET ') || statement.startsWith('PREPARE ') || statement.startsWith('EXECUTE ') || statement.startsWith('DEALLOCATE ')) {
                    continue;
                }
                
                await client.query(statement);
            }
        }
        
        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
