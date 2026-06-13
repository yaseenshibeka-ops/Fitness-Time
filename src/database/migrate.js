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
                
                try {
                    await client.query(statement);
                } catch (err) {
                    // Ignore duplicate key/existence errors (standard migration re-run safety)
                    if (['23505', '42P07', '42701', '42710'].includes(err.code)) {
                        console.log(`  Skipped code ${err.code}: ${statement.slice(0, 50)}...`);
                    } else {
                        throw err; // rethrow critical errors
                    }
                }
            }
        }
        
        
        console.log('Synchronizing primary key sequences...');
        const tablesToSync = [
            { table: 'users', key: 'user_id' },
            { table: 'categories', key: 'category_id' },
            { table: 'products', key: 'product_id' },
            { table: 'orders', key: 'order_id' },
            { table: 'order_items', key: 'item_id' },
            { table: 'carts', key: 'cart_id' },
            { table: 'cart_items', key: 'cart_item_id' },
            { table: 'subscriptions', key: 'subscription_id' },
            { table: 'payments', key: 'payment_id' },
            { table: 'fitness_progress', key: 'progress_id' },
            { table: 'fitness_goals', key: 'goal_id' },
            { table: 'workout_history', key: 'workout_id' },
            { table: 'user_notifications', key: 'notification_id' },
            { table: 'notifications', key: 'notification_id' }
        ];

        for (const { table, key } of tablesToSync) {
            try {
                // Check if sequence exists
                const seqRes = await client.query(
                    `SELECT pg_get_serial_sequence($1, $2) as seq`, 
                    [table, key]
                );
                const seq = seqRes.rows[0]?.seq;
                if (seq) {
                    await client.query(
                        `SELECT setval($1, COALESCE(MAX(${key}), 1)) FROM ${table}`,
                        [seq]
                    );
                }
            } catch (err) {
                console.warn(`Could not sync sequence for table ${table}:`, err.message);
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
