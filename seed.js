const { Pool } = require('pg');

const poolConfig = {};
if (process.env.DATABASE_URL) {
  poolConfig.connectionString = process.env.DATABASE_URL;
  if (poolConfig.connectionString.includes('-pooler')) {
    poolConfig.connectionString = poolConfig.connectionString.replace('-pooler', '');
  }
} else {
  poolConfig.host = process.env.DB_HOST || 'localhost';
  poolConfig.user = process.env.DB_USER || 'postgres';
  poolConfig.password = process.env.DB_PASSWORD || 'secret';
  poolConfig.database = process.env.DB_NAME || 'fittrack';
  poolConfig.port = parseInt(process.env.DB_PORT || '5432', 10);
}
if ((poolConfig.connectionString && poolConfig.connectionString.includes('neon.tech')) || process.env.NODE_ENV === 'production') {
  poolConfig.ssl = { rejectUnauthorized: false };
}
poolConfig.connectionTimeoutMillis = 10000;
poolConfig.idleTimeoutMillis = 30000;
poolConfig.max = 10;

const pool = new Pool(poolConfig);
const query = pool.query.bind(pool);

async function run() {
  console.log('=== FitTrack Rwanda — Full Seed ===\n');

  // ── Clear tables in reverse dependency order ──
  console.log('Clearing existing data...');
  const clearTables = [
    'product_reviews', 'user_notifications', 'notifications',
    'workout_history', 'fitness_goals', 'fitness_progress',
    'cart_items', 'payments', 'order_items', 'orders',
    'wishlist', 'subscriptions', 'carts',
    'user_settings', 'products', 'categories', 'users', 'settings'
  ];
  for (const t of clearTables) {
    try { await query(`DELETE FROM ${t}`); } catch {}
  }
  console.log('Existing data cleared.\n');

  // ── USERS ──
  // password_hash is bcrypt of "admin123"
  const pw = '$2a$10$tb/xvby19C.1sahiS/wgt.W1pIKmzgMwUGzmtGgLsXT.ooo/5nPC.';
  console.log('Inserting users...');
  await query(`
    INSERT INTO users (user_id, full_name, email, password_hash, phone, address, role, date_of_birth, gender, height_cm) VALUES
    (1, 'System Admin',    'admin@fittrack.rw',      $1, '+250788000000', 'KG 1 Ave, Kigali',     'admin', NULL,           NULL,   NULL),
    (2, 'Jean-Pierre Habimana','jean@example.com',   $1, '+250788100001', 'KG 123 St, Kigali',     'user',  '1995-06-15', 'male',   178),
    (3, 'Alice Mukamana',  'alice@example.com',      $1, '+250788100002', 'KN 45 Ave, Musanze',    'user',  '1998-11-22', 'female', 165),
    (4, 'David Niyonzima', 'david@example.com',      $1, '+250788100003', 'RB 7 St, Rubavu',       'user',  '1993-03-10', 'male',   182),
    (5, 'Grace Uwimana',   'grace@example.com',      $1, '+250788100004', 'KG 200 St, Kicukiro',  'user',  '2000-09-05', 'female', 170),
    (6, 'Patrick Mugabo',  'patrick@example.com',    $1, '+250788100005', 'KK 15 Rd, Kigali',      'user',  '1990-12-30', 'male',   175),
    (7, 'Diane Ishimwe',   'diane@example.com',      $1, '+250788100006', 'KN 78 St, Kicukiro',   'user',  '1997-04-18', 'female', 168),
    (8, 'Samuel Biregeya', 'samuel@example.com',     $1, '+250788100007', 'KG 56 Ave, Gasabo',    'user',  '1994-08-12', 'male',   180),
    (9, 'Chantal Uwase',   'chantal@example.com',    $1, '+250788100008', 'RB 12 St, Rubavu',     'user',  '1999-01-25', 'female', 163),
    (10,'Eric Ndayishimiye','eric@example.com',       $1, '+250788100009', 'KK 34 Rd, Kigali',     'user',  '1992-07-07', 'male',   185)
    ON CONFLICT (user_id) DO NOTHING
  `, [pw]);
  console.log('  10 users inserted.');

  // ── SETTINGS ──
  console.log('Inserting settings...');
  await query(`
    INSERT INTO settings (setting_key, setting_value) VALUES
    ('platform_name', 'FitTrack Rwanda'),
    ('platform_email', 'info@fittrack.rw'),
    ('platform_phone', '+250 788 000 000'),
    ('delivery_fee', '2000'),
    ('tax_rate', '0'),
    ('basic_plan_price', '10000'),
    ('premium_plan_price', '25000'),
    ('annual_plan_price', '250000'),
    ('mtn_momo_api_key', ''),
    ('airtel_money_api_key', '')
    ON CONFLICT (setting_key) DO NOTHING
  `);

  // ── CATEGORIES ──
  console.log('Inserting categories...');
  await query(`
    INSERT INTO categories (category_id, name, description) VALUES
    (1, 'Gym Equipment',     'Treadmills, dumbbells, barbells, benches, racks and machines'),
    (2, 'Supplements',       'Protein powders, BCAAs, creatine, vitamins and recovery drinks'),
    (3, 'Sportswear',        'Training shoes, shorts, singlets, gloves and accessories'),
    (4, 'Fitness Accessories','Resistance bands, yoga mats, jump ropes, straps and belts'),
    (5, 'Yoga & Pilates',    'Yoga mats, blocks, straps, and pilates accessories'),
    (6, 'Recovery',          'Foam rollers, massage guns, stretching bands'),
    (7, 'Boxing & MMA',      'Boxing gloves, punching bags, hand wraps, MMA gear'),
    (8, 'Swimming',          'Swimwear, goggles, caps, and training equipment')
    ON CONFLICT (category_id) DO NOTHING
  `);

  // ── USER SETTINGS ──
  console.log('Inserting user settings...');
  await query(`
    INSERT INTO user_settings (user_id, theme, email_notifications, push_notifications, privacy_share_progress) VALUES
    (2, 'dark',   TRUE,  TRUE,  TRUE),
    (3, 'light',  TRUE,  FALSE, FALSE),
    (4, 'dark',   TRUE,  TRUE,  TRUE),
    (5, 'system', FALSE, TRUE,  FALSE),
    (6, 'dark',   TRUE,  TRUE,  TRUE),
    (7, 'dark',   TRUE,  TRUE,  FALSE),
    (8, 'light',  FALSE, FALSE, TRUE),
    (9, 'system', TRUE,  TRUE,  TRUE),
    (10,'dark',   FALSE, TRUE,  FALSE)
    ON CONFLICT (user_id) DO NOTHING
  `);

  // ── PRODUCTS ──
  console.log('Inserting products...');
  await query(`
    INSERT INTO products (product_id, name, description, price, stock_quantity, image_url, category_id) VALUES
    (1,  'Smart Treadmill Pro',     'Motorized treadmill with incline, heart rate monitor, Bluetooth',                             850000, 15,  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', 1),
    (2,  'Adjustable Dumbbell Set', 'Space-saving adjustable dumbbells 2kg to 24kg each',                                        350000, 30,  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop', 1),
    (3,  'Premium Yoga Mat',        'Extra thick 6mm eco-friendly TPE yoga mat with alignment lines',                             45000,  100, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=300&fit=crop', 5),
    (4,  'Whey Protein Isolate',    '2.27kg pure whey protein isolate, vanilla, 25g protein per serving',                        65000,  50,  'https://images.unsplash.com/photo-1593095948071-474c5cc2c1cf?w=400&h=300&fit=crop', 2),
    (5,  'Exercise Bike X500',      'Magnetic resistance spin bike with LCD display and tablet holder',                           520000, 20,  'https://images.unsplash.com/photo-1534251369789-5067c8b8602a?w=400&h=300&fit=crop', 1),
    (6,  'Olympic Barbell 20kg',    'Professional 20kg Olympic barbell, 2x needle bearings, 2200lb capacity',                    180000, 25,  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', 1),
    (7,  'Kettlebell 16kg',         'Cast iron kettlebell with flat base, perfect for swings',                                    45000,  40,  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop', 1),
    (8,  'Resistance Bands Set',    'Set of 5 latex resistance bands from light to extra heavy',                                 25000,  80,  'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=300&fit=crop', 4),
    (9,  'Compression Tights',      'High-waist compression training tights, moisture-wicking, 5 sizes',                         35000,  60,  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=300&fit=crop', 3),
    (10, 'Jump Rope Speed Pro',     'Ball-bearing speed jump rope, adjustable length, foam handles',                              15000,  120, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', 4),
    (11, 'BCAA 2:1:1 Powder',       '500g branched-chain amino acids, blue raspberry, aids recovery',                            35000,  45,  'https://images.unsplash.com/photo-1579722820308-d74e571dd0f8?w=400&h=300&fit=crop', 2),
    (12, 'Boxing Gloves 12oz',      'Premium leather boxing gloves with wrist strap support',                                     55000,  35,  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop', 7),
    (13, 'Foam Roller Premium',     'High-density EVA foam roller, 45cm, muscle recovery',                                       22000,  55,  'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=300&fit=crop', 6),
    (14, 'Training Singlet',        'Breathable mesh training singlet, quick-dry fabric',                                        18000,  90,  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=300&fit=crop', 3),
    (15, 'Creatine Monohydrate',    '300g micronized creatine monohydrate, unflavoured',                                         28000,  70,  'https://images.unsplash.com/photo-1593095948071-474c5cc2c1cf?w=400&h=300&fit=crop', 2),
    (16, 'Yoga Mat Premium',        'Extra thick 8mm natural rubber yoga mat with alignment markings',                            55000,  40,  'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=300&fit=crop', 5),
    (17, 'Pull-up Bar Doorway',     'Adjustable doorway pull-up bar with foam grips, 150kg capacity',                             35000,  30,  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', 1),
    (18, 'Swimming Goggles',        'Anti-fog UV-protection swimming goggles, adjustable strap',                                  12000,  100, 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=300&fit=crop', 8),
    (19, 'Massage Gun',             'Percussion massage gun, 6 speeds, 4 head attachments, rechargeable',                         120000, 20,  'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=300&fit=crop', 6),
    (20, 'Gym Drawstring Bag',      'Lightweight gym bag with shoe compartment and water bottle pocket',                          15000,  150, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop', 4),
    (21, 'Pro Weight Bench',        'Adjustable bench with 7 back positions, 3 seat positions, 300kg capacity',                   180000, 20,  'https://images.unsplash.com/photo-1639815188547-89e0da10e35e?w=400&h=300&fit=crop', 1),
    (22, 'Battle Rope 15m',         '15m x 38mm heavy-duty poly-dacron battle rope for explosive training',                       35000,  40,  'https://images.unsplash.com/photo-1534258936925-c8bed0f9c84e?w=400&h=300&fit=crop', 1),
    (23, 'Pre-Workout 300g',        'High-stimulant pre-workout powder, green apple, 30 servings',                                32000,  60,  'https://images.unsplash.com/photo-1593095948071-474c5cc2c1cf?w=400&h=300&fit=crop', 2),
    (24, 'Mass Gainer 3kg',         'High-calorie mass gainer powder, chocolate, 12 servings',                                    55000,  35,  'https://images.unsplash.com/photo-1579722820308-d74e571dd0f8?w=400&h=300&fit=crop', 2),
    (25, 'Multivitamin Pack',       'Daily multivitamin and mineral supplement, 90 tablets',                                      18000,  120, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop', 2),
    (26, 'Running Shoes Pro',       'Lightweight performance running shoes with responsive cushioning',                            95000,  45,  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop', 3),
    (27, 'Training Shorts Elite',   'Moisture-wicking 2-in-1 shorts with compression liner and zip pocket',                       28000,  80,  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=300&fit=crop', 3),
    (28, 'Compression Top',         'Seamless compression top with ventilation panels',                                           32000,  65,  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=300&fit=crop', 3),
    (29, 'Weightlifting Belt',      'Premium 4-inch suede leather belt with double-prong buckle',                                  45000,  30,  'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=300&fit=crop', 4),
    (30, 'Gym Gloves',              'Breathable gloves with silicone grip padding and wrist support',                              15000,  100, 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=300&fit=crop', 4),
    (31, 'Skipping Rope Speed',     'Ball-bearing speed jump rope, 4.5m adjustable PVC-coated steel',                             10000,  150, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', 4),
    (32, 'Ankle Weights 2x2.5kg',  'Adjustable ankle weights, sand filling, neoprene padding',                                    22000,  55,  'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=300&fit=crop', 4)
    ON CONFLICT (product_id) DO NOTHING
  `);
  console.log('  32 products inserted.');

  // ── CARTS ──
  console.log('Inserting carts...');
  await query(`
    INSERT INTO carts (cart_id, user_id) VALUES
    (1, 2), (2, 3), (3, 4), (4, 7), (5, 9)
    ON CONFLICT (cart_id) DO NOTHING
  `);

  // ── CART ITEMS ──
  console.log('Inserting cart items...');
  await query(`
    INSERT INTO cart_items (cart_id, product_id, quantity) VALUES
    (1, 7,  2), (1, 16, 1), (1, 26, 1), (1, 31, 2),
    (2, 11, 1), (2, 25, 1),
    (3, 19, 1), (3, 21, 1), (3, 30, 2),
    (4, 26, 1), (4, 31, 2),
    (5, 9,  3), (5, 14, 2)
    ON CONFLICT (cart_id, product_id) DO NOTHING
  `);

  // ── ORDERS ──
  console.log('Inserting orders...');
  await query(`
    INSERT INTO orders (order_id, user_id, order_reference, full_name, email, phone, delivery_address, subtotal, delivery_fee, grand_total, status, created_at) VALUES
    (1, 2, 'FT-2026-0001', 'Jean-Pierre Habimana', 'jean@example.com',  '+250788100001', 'KG 123 St, Kigali',               850000, 2000, 852000, 'delivered',  '2026-01-20 10:30:00'),
    (2, 3, 'FT-2026-0002', 'Alice Mukamana',       'alice@example.com', '+250788100002', 'KN 45 Ave, Musanze',              65000,  2000, 67000,  'delivered',  '2026-02-05 14:15:00'),
    (3, 4, 'FT-2026-0003', 'David Niyonzima',      'david@example.com', '+250788100003', 'RB 7 St, Rubavu',                 520000, 2000, 522000, 'shipped',    '2026-03-10 09:00:00'),
    (4, 5, 'FT-2026-0004', 'Grace Uwimana',        'grace@example.com','+250788100004',  'KG 200 St, Kicukiro',             35000,  2000, 37000,  'confirmed',  '2026-03-15 16:45:00'),
    (5, 2, 'FT-2026-0005', 'Jean-Pierre Habimana', 'jean@example.com',  '+250788100001', 'KG 123 St, Kigali',               70000,  2000, 72000,  'delivered',  '2026-04-01 11:20:00'),
    (6, 6, 'FT-2026-0006', 'Patrick Mugabo',       'patrick@example.com','+250788100005','KK 15 Rd, Kigali',                 84000,  2000, 86000,  'processing', '2026-04-10 08:30:00'),
    (7, 3, 'FT-2026-0007', 'Alice Mukamana',       'alice@example.com', '+250788100002', 'KN 45 Ave, Musanze',              47000,  0,    47000,  'delivered',  '2026-04-12 17:00:00'),
    (8, 4, 'FT-2026-0008', 'David Niyonzima',      'david@example.com', '+250788100003', 'RB 7 St, Rubavu',                 180000, 2000, 182000, 'pending',    '2026-04-15 12:00:00'),
    (9, 2, 'FT-2026-0009', 'Jean-Pierre Habimana', 'jean@example.com',  '+250788100001', 'KG 123 St, Kigali',               180000, 0,    180000, 'delivered',  '2026-02-15 10:00:00'),
    (10,3, 'FT-2026-0010', 'Alice Mukamana',       'alice@example.com', '+250788100002', 'KN 45 Ave, Musanze',              64000,  2000, 66000,  'delivered',  '2026-02-20 14:30:00'),
    (11,5, 'FT-2026-0011', 'Grace Uwimana',        'grace@example.com','+250788100004',  'KG 200 St, Kicukiro',             127000, 0,    127000, 'delivered',  '2026-03-25 09:15:00'),
    (12,6, 'FT-2026-0012', 'Patrick Mugabo',       'patrick@example.com','+250788100005','KK 15 Rd, Kigali',                 40000,  2000, 42000,  'shipped',    '2026-04-20 11:45:00'),
    (13,2, 'FT-2026-0013', 'Jean-Pierre Habimana', 'jean@example.com',  '+250788100001', 'KG 123 St, Kigali',               95000,  0,    95000,  'confirmed',  '2026-05-01 08:00:00'),
    (14,4, 'FT-2026-0014', 'David Niyonzima',      'david@example.com', '+250788100003', 'RB 7 St, Rubavu',                 222000, 0,    222000, 'processing', '2026-05-05 16:20:00'),
    (15,3, 'FT-2026-0015', 'Alice Mukamana',       'alice@example.com', '+250788100002', 'KN 45 Ave, Musanze',              50000,  2000, 52000,  'pending',    '2026-05-12 13:00:00'),
    (16,7, 'FT-2026-0016', 'Diane Ishimwe',        'diane@example.com', '+250788100006', 'KN 78 St, Kicukiro',              135000, 2000, 137000, 'delivered',  '2026-04-22 10:00:00'),
    (17,8, 'FT-2026-0017', 'Samuel Biregeya',      'samuel@example.com','+250788100007',  'KG 56 Ave, Gasabo',              28000,  0,    28000,  'shipped',    '2026-05-08 14:00:00'),
    (18,9, 'FT-2026-0018', 'Chantal Uwase',        'chantal@example.com','+250788100008', 'RB 12 St, Rubavu',               60000,  2000, 62000,  'confirmed',  '2026-05-15 09:30:00'),
    (19,10,'FT-2026-0019', 'Eric Ndayishimiye',    'eric@example.com',  '+250788100009', 'KK 34 Rd, Kigali',                220000, 0,    220000, 'processing', '2026-05-18 11:00:00'),
    (20,2, 'FT-2026-0020', 'Jean-Pierre Habimana', 'jean@example.com',  '+250788100001', 'KG 123 St, Kigali',               45000,  2000, 47000,  'pending',    '2026-05-22 16:00:00')
    ON CONFLICT (order_id) DO NOTHING
  `);
  console.log('  20 orders inserted.');

  // ── ORDER ITEMS ──
  console.log('Inserting order items...');
  await query(`
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
    (1,  1,  1, 850000, 850000),
    (2,  4,  1, 65000,  65000),
    (3,  5,  1, 520000, 520000),
    (4,  8,  1, 25000,  25000),
    (4,  10, 1, 15000,  15000),
    (5,  9,  2, 35000,  70000),
    (6,  14, 3, 18000,  54000),
    (6,  20, 2, 15000,  30000),
    (7,  13, 1, 22000,  22000),
    (7,  8,  1, 25000,  25000),
    (8,  6,  1, 180000, 180000),
    (9,  21, 1, 180000, 180000),
    (10, 8,  1, 25000,  25000),
    (10, 10, 1, 15000,  15000),
    (10, 31, 1, 10000,  10000),
    (10, 30, 1, 14000,  14000),
    (11, 26, 1, 95000,  95000),
    (11, 30, 1, 15000,  15000),
    (11, 32, 1, 17000,  17000),
    (12, 31, 2, 10000,  20000),
    (12, 8,  1, 20000,  20000),
    (13, 26, 1, 95000,  95000),
    (14, 2,  1, 180000, 180000),
    (14, 24, 1, 42000,  42000),
    (15, 25, 2, 18000,  36000),
    (15, 32, 1, 14000,  14000),
    (16, 3,  2, 45000,  90000),
    (16, 16, 1, 45000,  45000),
    (17, 10, 1, 15000,  15000),
    (17, 31, 1, 13000,  13000),
    (18, 4,  1, 60000,  60000),
    (19, 2,  1, 160000, 160000),
    (19, 19, 1, 60000,  60000),
    (20, 7,  1, 45000,  45000)
  `);

  // ── SUBSCRIPTIONS ──
  console.log('Inserting subscriptions...');
  await query(`
    INSERT INTO subscriptions (subscription_id, user_id, plan_type, price, status, start_date, end_date) VALUES
    (1, 2, 'premium', 25000, 'active',    '2026-01-15', '2026-12-15'),
    (2, 3, 'basic',   0,      'active',   '2026-02-01', '2027-02-01'),
    (3, 4, 'annual',  200000, 'active',   '2026-01-01', '2027-01-01'),
    (4, 5, 'premium', 25000,  'active',   '2026-03-01', '2026-12-01'),
    (5, 6, 'premium', 25000,  'cancelled','2025-12-01', '2026-06-01'),
    (6, 7, 'basic',   10000,  'active',   '2026-04-01', '2026-10-01'),
    (7, 8, 'premium', 25000,  'expired',  '2025-06-01', '2025-12-01'),
    (8, 9, 'premium', 25000,  'active',   '2026-05-01', '2026-11-01'),
    (9, 10,'basic',   10000,  'pending',  '2026-05-20', '2026-06-20'),
    (10,2, 'annual',  200000, 'cancelled','2025-01-01', '2026-01-01')
    ON CONFLICT (subscription_id) DO NOTHING
  `);
  console.log('  10 subscriptions inserted.');

  // ── PAYMENTS ──
  console.log('Inserting payments...');
  await query(`
    INSERT INTO payments (user_id, order_id, subscription_id, payment_method, phone_number, amount, transaction_reference, payment_status, payment_date) VALUES
    (2,  1,  NULL, 'mtn_momo',    '+250788100001', 852000, 'MOMO-2026-001', 'completed',  '2026-01-20 10:30:00'),
    (3,  2,  NULL, 'airtel_money','+250788100002', 67000,  'AIR-2026-002',  'completed',  '2026-02-05 14:15:00'),
    (4,  3,  NULL, 'mtn_momo',    '+250788100003', 522000, 'MOMO-2026-003', 'completed',  '2026-03-10 09:00:00'),
    (5,  4,  NULL, 'mtn_momo',    '+250788100004', 37000,  'MOMO-2026-004', 'completed',  '2026-03-15 16:45:00'),
    (2,  5,  NULL, 'airtel_money','+250788100001', 72000,  'AIR-2026-005',  'completed',  '2026-04-01 11:20:00'),
    (6,  6,  NULL, 'mtn_momo',    '+250788100005', 86000,  'MOMO-2026-006', 'pending',    '2026-04-10 08:30:00'),
    (3,  7,  NULL, 'cash_on_delivery', NULL,       47000,  'COD-2026-007',  'completed',  '2026-04-12 17:00:00'),
    (4,  8,  NULL, 'mtn_momo',    '+250788100003', 182000, 'MOMO-2026-008', 'pending',    '2026-04-15 12:00:00'),
    (2,  NULL, 1,   'mtn_momo',    '+250788100001', 25000,  'MOMO-SUB-001',  'completed',  '2026-01-15 08:00:00'),
    (4,  NULL, 3,   'airtel_money','+250788100003', 200000, 'AIR-SUB-003',   'completed',  '2026-01-01 07:30:00'),
    (5,  NULL, 4,   'mtn_momo',    '+250788100004', 25000,  'MOMO-SUB-004',  'completed',  '2026-03-01 09:00:00'),
    (6,  NULL, 5,   'mtn_momo',    '+250788100005', 25000,  'MOMO-SUB-005',  'refunded',   '2025-12-01 10:00:00'),
    (2,  9,  NULL, 'mtn_momo',    '+250788100001', 180000, 'MOMO-2026-009', 'completed',  '2026-02-15 10:05:00'),
    (3,  10, NULL, 'airtel_money','+250788100002', 66000,  'AIR-2026-010',  'completed',  '2026-02-20 14:35:00'),
    (5,  11, NULL, 'mtn_momo',    '+250788100004', 127000, 'MOMO-2026-011', 'completed',  '2026-03-25 09:20:00'),
    (6,  12, NULL, 'mtn_momo',    '+250788100005', 42000,  'MOMO-2026-012', 'completed',  '2026-04-20 11:50:00'),
    (2,  13, NULL, 'bank_transfer', NULL,          95000,  'TXN-2026-013',  'pending',    NULL),
    (4,  14, NULL, 'paypal',       NULL,          222000, 'PPL-2026-014',   'pending',    NULL),
    (3,  15, NULL, 'cash_on_delivery', NULL,       52000,  'COD-2026-015',  'pending',    NULL),
    (7,  16, NULL, 'mtn_momo',    '+250788100006', 137000, 'MOMO-2026-016', 'completed',  '2026-04-22 10:30:00'),
    (8,  17, NULL, 'mtn_momo',    '+250788100007', 28000,  'MOMO-2026-017', 'completed',  '2026-05-08 14:30:00'),
    (9,  18, NULL, 'airtel_money','+250788100008', 62000,  'AIR-2026-018',  'pending',    '2026-05-15 10:00:00'),
    (10, 19, NULL, 'mtn_momo',    '+250788100009', 220000, 'MOMO-2026-019', 'pending',    '2026-05-18 11:30:00'),
    (2,  20, NULL, 'airtel_money','+250788100001', 47000,  'AIR-2026-020',  'pending',    '2026-05-22 16:30:00')
    ON CONFLICT (transaction_reference) DO NOTHING
  `);
  console.log('  24 payments inserted.');

  // ── FITNESS PROGRESS ──
  console.log('Inserting fitness progress...');
  await query(`
    INSERT INTO fitness_progress (user_id, weight_kg, height_cm, body_fat_pct, chest_cm, waist_cm, hips_cm, biceps_cm, workout_type, duration_minutes, calories_burned, notes, recorded_date) VALUES
    (2, 82.0, 178, 18.5, 102, 80,  98,  38, 'Strength', 60, 450, 'Good session, increased bench press weight',            '2026-01-01'),
    (2, 81.5, 178, 18.2, 102, 79,  98,  38, 'Cardio',   45, 380, 'Morning run 5km',                                       '2026-01-08'),
    (2, 80.8, 178, 17.8, 103, 78,  97,  39, 'Strength', 60, 480, 'New PR on deadlifts',                                  '2026-01-15'),
    (2, 80.2, 178, 17.5, 103, 78,  97,  39, 'HIIT',     30, 350, 'Intense interval training',                             '2026-01-22'),
    (2, 79.5, 178, 17.0, 104, 77,  96,  40, 'Strength', 75, 520, 'Great progress overall',                                '2026-01-29'),
    (3, 62.0, 165, 24.0, 88,  68,  92,  28, 'Yoga',     60, 200, 'Flexibility improving',                                 '2026-02-01'),
    (3, 61.5, 165, 23.5, 88,  67,  92,  28, 'Pilates',  50, 220, 'Core strength session',                                 '2026-02-08'),
    (3, 61.0, 165, 23.0, 89,  67,  91,  29, 'Yoga',     60, 210, 'Advanced poses getting easier',                          '2026-02-15'),
    (4, 88.0, 182, 20.0, 108, 85,  102, 42, 'Strength', 90, 600, 'Heavy leg day',                                         '2026-01-02'),
    (4, 87.5, 182, 19.5, 108, 84,  102, 42, 'Cardio',   40, 400, '5km run',                                               '2026-01-09'),
    (4, 87.0, 182, 19.2, 109, 84,  101, 43, 'Strength', 75, 550, 'Push day',                                              '2026-01-16'),
    (4, 86.5, 182, 19.0, 109, 83,  101, 43, 'Swimming', 45, 500, 'Lap swimming 1km',                                      '2026-01-23'),
    (5, 70.0, 170, 22.0, 94,  74,  96,  32, 'HIIT',     30, 320, 'First HIIT session',                                   '2026-03-01'),
    (5, 69.5, 170, 21.5, 94,  73,  96,  32, 'Strength', 45, 380, 'Upper body',                                            '2026-03-08'),
    (5, 69.0, 170, 21.0, 95,  73,  95,  33, 'Cardio',   35, 350, 'Treadmill interval run',                                '2026-03-15'),
    (6, 92.0, 175, 25.0, 108, 90,  104, 40, 'Strength', 60, 450, 'Chest and triceps',                                    '2025-12-01'),
    (6, 91.0, 175, 24.0, 110, 88,  103, 41, 'Strength', 60, 480, 'Back and biceps',                                      '2025-12-15'),
    (6, 90.5, 175, 23.5, 110, 87,  103, 41, 'Cardio',   30, 300, 'Light cardio',                                         '2025-12-22'),
    (7, 66.0, 168, 22.0, 90,  70,  94,  30, 'Yoga',     45, 180, 'Morning yoga routine',                                 '2026-04-01'),
    (7, 65.5, 168, 21.5, 90,  69,  94,  30, 'Pilates',  40, 200, 'Core and glutes',                                      '2026-04-08'),
    (8, 78.0, 180, 16.0, 106, 82,  100, 40, 'Strength', 60, 500, 'Chest day',                                             '2026-04-02'),
    (8, 77.5, 180, 15.8, 106, 81,  100, 40, 'HIIT',     30, 380, 'Metcon workout',                                       '2026-04-09'),
    (9, 58.0, 163, 20.0, 86,  65,  90,  27, 'Yoga',     50, 170, 'Flexibility training',                                 '2026-05-01'),
    (10,85.0, 185, 18.0, 110, 86,  104, 44, 'Strength', 75, 600, 'Leg day',                                               '2026-05-02'),
    (10,84.5, 185, 17.5, 110, 85,  104, 44, 'Running',  40, 450, '5km outdoor run',                                      '2026-05-09')
  `);

  // ── FITNESS GOALS ──
  console.log('Inserting fitness goals...');
  await query(`
    INSERT INTO fitness_goals (user_id, goal_type, target_value, current_value, unit, deadline, status) VALUES
    (2,  'Weight Loss',       75.0,  79.5, 'kg',  '2026-06-30', 'in_progress'),
    (2,  'Bench Press Max',   100.0, 85.0,  'kg',  '2026-12-31', 'in_progress'),
    (3,  'Weight Maintenance',60.0,  61.0,  'kg',  '2026-12-31', 'in_progress'),
    (3,  'Daily Yoga',        30,    22,    'min', '2026-06-30', 'in_progress'),
    (4,  'Weight Loss',       82.0,  86.5,  'kg',  '2026-06-30', 'in_progress'),
    (4,  'Deadlift Max',      200.0, 180.0, 'kg',  '2026-12-31', 'in_progress'),
    (5,  'Weight Loss',       65.0,  69.0,  'kg',  '2026-09-30', 'in_progress'),
    (5,  'Run 5km',           25.0,  30.0,  'min', '2026-08-31', 'in_progress'),
    (6,  'Weight Loss',       85.0,  90.5,  'kg',  '2026-06-30', 'completed'),
    (6,  'Swim 1km',          30,    28,    'min', '2025-12-31', 'completed'),
    (7,  'Weight Loss',       62.0,  65.5,  'kg',  '2026-09-30', 'in_progress'),
    (7,  'Flexibility',       90,    60,    'days','2026-12-31', 'in_progress'),
    (8,  'Weight Loss',       75.0,  77.5,  'kg',  '2026-08-31', 'in_progress'),
    (8,  'Pull-ups',          20,    12,    'reps','2026-12-31', 'in_progress'),
    (9,  'Weight Maintenance',58.0,  58.0,  'kg',  '2026-12-31', 'in_progress'),
    (10, 'Weight Loss',       82.0,  84.5,  'kg',  '2026-08-31', 'in_progress'),
    (10, 'Squat Max',         140.0, 120.0, 'kg',  '2026-12-31', 'in_progress')
  `);

  // ── WISHLIST ──
  console.log('Inserting wishlist...');
  await query(`
    INSERT INTO wishlist (user_id, product_id) VALUES
    (2, 7), (2, 16), (2, 19), (3, 11), (3, 15),
    (4, 12), (4, 19), (5, 9), (5, 14), (6, 13),
    (6, 17), (7, 3), (7, 26), (8, 1), (8, 21),
    (9, 4), (9, 24), (10, 2), (10, 19)
    ON CONFLICT (user_id, product_id) DO NOTHING
  `);

  // ── WORKOUT HISTORY ──
  console.log('Inserting workout history...');
  await query(`
    INSERT INTO workout_history (user_id, workout_type, duration_minutes, calories_burned, notes, workout_date) VALUES
    (2, 'Strength Training', 60, 450, 'Bench press, rows, overhead press',                           '2026-04-01'),
    (2, 'Running',           35, 320, '5km outdoor run',                                             '2026-04-02'),
    (2, 'HIIT',              25, 300, 'Tabata protocol',                                             '2026-04-03'),
    (2, 'Strength Training', 60, 480, 'Deadlifts, squats, lunges',                                   '2026-04-04'),
    (2, 'Swimming',          30, 280, 'Freestyle laps 800m',                                         '2026-04-08'),
    (3, 'Yoga',              60, 180, 'Vinyasa flow',                                                '2026-04-01'),
    (3, 'Pilates',           45, 200, 'Mat pilates core focus',                                      '2026-04-03'),
    (3, 'Walking',           40, 150, 'Brisk walk in park',                                          '2026-04-05'),
    (3, 'Yoga',              60, 200, 'Hatha flow hip openers',                                      '2026-04-12'),
    (4, 'Strength Training', 90, 600, 'Leg day: squats, leg press, extensions',                      '2026-04-01'),
    (4, 'Swimming',          45, 500, 'Freestyle laps 1.5km',                                        '2026-04-02'),
    (4, 'Strength Training', 75, 550, 'Push day: bench, incline, flyes',                             '2026-04-03'),
    (4, 'Boxing',            60, 560, 'Heavy bag and pad work',                                      '2026-04-06'),
    (5, 'HIIT',              30, 320, 'Circuit training 4 rounds',                                   '2026-04-01'),
    (5, 'Strength Training', 45, 350, 'Upper body light weights',                                    '2026-04-02'),
    (5, 'Cycling',           40, 380, 'Stationary bike intervals',                                   '2026-04-04'),
    (6, 'Boxing',            60, 550, 'Heavy bag and pad work',                                      '2026-03-20'),
    (6, 'Strength Training', 60, 450, 'Chest and triceps',                                           '2026-03-22'),
    (6, 'Boxing',            60, 540, 'Sparring and pad work 5 rounds',                              '2026-03-26'),
    (7, 'Yoga',              45, 170, 'Sun salutations and stretching',                              '2026-04-05'),
    (7, 'Pilates',           40, 190, 'Core strengthening',                                          '2026-04-07'),
    (8, 'Strength Training', 60, 500, 'Upper body push focus',                                       '2026-04-06'),
    (8, 'HIIT',              30, 350, 'Full body circuit',                                           '2026-04-08'),
    (9, 'Yoga',              40, 150, 'Gentle flow',                                                 '2026-05-02'),
    (9, 'Walking',           35, 120, 'Evening walk',                                                '2026-05-04'),
    (10,'Strength Training', 75, 580, 'Leg day: squats, lunges, leg curls',                          '2026-05-03'),
    (10,'Running',           40, 420, '5km tempo run',                                               '2026-05-05'),
    (10,'Strength Training', 60, 500, 'Push day: bench press, overhead press, lateral raises',        '2026-05-07')
  `);
  console.log('  28 workouts inserted.');

  // ── USER NOTIFICATIONS ──
  console.log('Inserting user notifications...');
  await query(`
    INSERT INTO user_notifications (user_id, type, title, message, link, is_read) VALUES
    (2, 'order',     'Order Confirmed',              'Your order FT-2026-0001 has been confirmed.',              '/dashboard/orders/1',       TRUE),
    (2, 'order',     'Order Delivered',              'Order FT-2026-0001 delivered. Enjoy!',                     '/dashboard/orders/1',       TRUE),
    (2, 'subscription','Premium Activated',           'Your Premium subscription is active!',                     '/dashboard/subscription',   TRUE),
    (2, 'order',     'Order Delivered',              'Order FT-2026-0005 delivered successfully.',               '/dashboard/orders/5',       FALSE),
    (2, 'fitness',   'Goal Update',                  '60% toward weight loss goal. Keep going!',                 '/dashboard/goals',          FALSE),
    (2, 'order',     'New Order',                    'Order FT-2026-0013 confirmed and being prepared.',          '/dashboard/orders/13',      FALSE),
    (2, 'fitness',   'New PR!',                      'New bench press PR: 85kg!',                               '/dashboard/fitness',        TRUE),
    (3, 'order',     'Order Delivered',              'Order FT-2026-0002 delivered. Enjoy!',                     '/dashboard/orders/2',       TRUE),
    (3, 'order',     'Order Delivered',              'Order FT-2026-0007 delivered.',                            '/dashboard/orders/7',       FALSE),
    (3, 'system',    'Welcome!',                     'Welcome to FitTrack Rwanda!',                              '/dashboard',                TRUE),
    (3, 'order',     'Order Placed',                 'Order FT-2026-0015 placed successfully.',                  '/dashboard/orders/15',      FALSE),
    (3, 'fitness',   'Weekly Summary',               '4 workouts this week. +20%!',                             '/dashboard/fitness',        TRUE),
    (4, 'order',     'Order Shipped',                'Order FT-2026-0003 shipped!',                              '/dashboard/orders/3',       TRUE),
    (4, 'order',     'New Order',                    'Order FT-2026-0008 placed.',                               '/dashboard/orders/8',       FALSE),
    (4, 'subscription','Annual Plan Active',          'Annual subscription active. Thank you!',                   '/dashboard/subscription',   TRUE),
    (4, 'payment',   'Payment Pending',              'PayPal payment for order FT-2026-0014 pending.',           '/dashboard/orders/14',      FALSE),
    (4, 'fitness',   'Goal Progress',                '75% toward weight loss goal!',                             '/dashboard/goals',          TRUE),
    (5, 'order',     'Order Confirmed',              'Order FT-2026-0004 confirmed.',                            '/dashboard/orders/4',       TRUE),
    (5, 'order',     'Order Delivered',              'Order FT-2026-0011 delivered.',                            '/dashboard/orders/11',      TRUE),
    (5, 'system',    'Complete Your Profile',        'Fill in fitness details for personalized recommendations.', '/dashboard/settings',       FALSE),
    (5, 'system',    'Profile Complete',             'Great job completing your fitness profile!',                '/dashboard/profile',        TRUE),
    (6, 'subscription','Subscription Cancelled',      'Premium subscription cancelled as requested.',              '/dashboard/subscription',   TRUE),
    (6, 'order',     'Order Shipped',                'Order FT-2026-0012 is on its way!',                        '/dashboard/orders/12',      TRUE),
    (6, 'system',    'Welcome Back',                 'Check our new products!',                                 '/products',                 FALSE),
    (6, 'fitness',   'Welcome to Boxing',            'Try boxing workout plans!',                               '/dashboard/fitness',        FALSE),
    (7, 'order',     'Order Delivered',              'Order FT-2026-0016 delivered.',                            '/dashboard/orders/16',      TRUE),
    (7, 'system',    'Welcome!',                     'Welcome! Explore your dashboard.',                         '/dashboard',                TRUE),
    (8, 'order',     'Order Shipped',                'Order FT-2026-0017 shipped!',                             '/dashboard/orders/17',      FALSE),
    (9, 'order',     'Order Confirmed',              'Order FT-2026-0018 confirmed.',                            '/dashboard/orders/18',      FALSE),
    (9, 'system',    'Welcome!',                     'Welcome to FitTrack Rwanda!',                              '/dashboard',                TRUE),
    (10,'order',     'New Order',                    'Order FT-2026-0019 placed.',                               '/dashboard/orders/19',      FALSE),
    (10,'system',    'Welcome!',                     'Welcome! Start tracking your fitness!',                    '/dashboard',                TRUE)
  `);

  // ── ADMIN NOTIFICATIONS ──
  console.log('Inserting admin notifications...');
  await query(`
    INSERT INTO notifications (type, title, message, related_id, related_type, is_read) VALUES
    ('order',   'New Order',            'Order FT-2026-0006 placed by Patrick Mugabo — 86,000 RWF',      6,  'order',  FALSE),
    ('order',   'New Order',            'Order FT-2026-0008 placed by David Niyonzima — 182,000 RWF',    8,  'order',  FALSE),
    ('payment', 'Payment Pending',      'Payment for order FT-2026-0006 pending',                        6,  'order',  FALSE),
    ('payment', 'Payment Pending',      'Payment for order FT-2026-0008 pending',                        8,  'order',  FALSE),
    ('user',    'New User',             'Patrick Mugabo registered.',                                    6,  'user',   FALSE),
    ('system',  'Low Stock',            'Massage Gun (ID 19) — 20 remaining.',                           19, 'product',FALSE),
    ('system',  'Low Stock',            'Pro Weight Bench (ID 21) — 20 remaining.',                      21, 'product',FALSE),
    ('order',   'New Order',            'Order FT-2026-0013 placed by Jean-Pierre — 95,000 RWF',         13, 'order',  FALSE),
    ('order',   'New Order',            'Order FT-2026-0014 placed by David Niyonzima — 222,000 RWF',    14, 'order',  FALSE),
    ('order',   'New Order',            'Order FT-2026-0015 placed by Alice Mukamana — 52,000 RWF',      15, 'order',  FALSE),
    ('payment', 'Bank Transfer Pending', 'Bank transfer for FT-2026-0013 (95,000 RWF) pending.',        13, 'order',  FALSE),
    ('payment', 'PayPal Pending',        'PayPal payment for FT-2026-0014 (222,000 RWF) pending.',       14, 'order',  FALSE),
    ('system',  'Low Stock',            'Running Shoes Pro (ID 26) — 45 remaining.',                     26, 'product',FALSE),
    ('system',  'Popular Product',      'Whey Protein Isolate trending with 15+ orders!',                4,  'product',FALSE),
    ('system',  'Low Stock',            'Smart Treadmill (ID 1) — 15 remaining.',                        1,  'product',FALSE),
    ('order',   'New Order',            'Order FT-2026-0016 placed by Diane Ishimwe — 137,000 RWF',      16, 'order',  FALSE),
    ('order',   'New Order',            'Order FT-2026-0019 placed by Eric — 220,000 RWF',               19, 'order',  FALSE),
    ('user',    'New User',             'Diane Ishimwe registered.',                                     7,  'user',   FALSE),
    ('user',    'New User',             'Samuel Biregeya registered.',                                   8,  'user',   FALSE),
    ('user',    'New User',             'Chantal Uwase registered.',                                     9,  'user',   FALSE),
    ('user',    'New User',             'Eric Ndayishimiye registered.',                                 10, 'user',   FALSE)
  `);

  // ── PRODUCT REVIEWS ──
  console.log('Inserting product reviews...');
  await query(`
    INSERT INTO product_reviews (product_id, user_id, rating, review_text, is_verified_purchase, created_at) VALUES
    (1, 2, 5, 'Excellent treadmill! Bluetooth with FitTrack app makes tracking seamless. Easy assembly.', TRUE,  '2026-02-01'),
    (1, 3, 4, 'Great quality treadmill. Incline works perfectly. Recommended for runners.',              TRUE,  '2026-02-15'),
    (1, 4, 5, 'Game changer for home gym. Quiet motor, easy on joints.',                                 TRUE,  '2026-03-01'),
    (2, 5, 5, 'Saved so much space. Adjustment mechanism is smooth and sturdy.',                          TRUE,  '2026-02-10'),
    (2, 6, 4, 'Good quality. Covers most exercises. A bit pricey but worth it.',                         TRUE,  '2026-02-20'),
    (3, 2, 5, 'Best yoga mat ever. Alignment lines really help with proper form.',                       TRUE,  '2026-01-20'),
    (3, 3, 4, 'Thick, comfortable. Does not slip even during hot yoga.',                                 TRUE,  '2026-03-05'),
    (4, 4, 5, 'Mixes easily, tastes great. No bloating. Highly recommend!',                              TRUE,  '2026-01-25'),
    (4, 5, 5, 'Great protein. Vanilla is delicious, dissolves completely.',                              TRUE,  '2026-02-14'),
    (4, 6, 4, 'Good quality at fair price. Easy on the stomach.',                                        TRUE,  '2026-03-10'),
    (5, 2, 5, 'Solid spin bike. Smooth magnetic resistance. Tablet holder is nice.',                     TRUE,  '2026-02-28'),
    (6, 3, 5, 'Professional grade barbell. Great knurling. Smooth bearings.',                            TRUE,  '2026-01-15'),
    (7, 4, 4, 'Solid cast iron. Flat base. Great for swings.',                                           TRUE,  '2026-03-15'),
    (7, 2, 5, 'Perfect weight. Handle is comfortable for two-handed swings.',                            TRUE,  '2026-04-01'),
    (8, 5, 5, 'Excellent band set. Varying resistance. Carrying bag keeps organized.',                    TRUE,  '2026-03-20'),
    (8, 6, 4, 'Good quality latex. Heaviest band provides serious resistance.',                           TRUE,  '2026-04-05'),
    (11,3, 4, 'Tastes great, helps with recovery. Mix with water during workouts.',                      TRUE,  '2026-03-25'),
    (15,4, 5, 'Micronized, mixes instantly. Strength increase after 2 weeks.',                           TRUE,  '2026-04-10'),
    (15,2, 5, 'Best value creatine. Unflavoured, mixes with anything.',                                  TRUE,  '2026-04-15'),
    (16,5, 4, 'Great mat with alignment markings. Natural rubber smells at first but fades.',            TRUE,  '2026-03-28'),
    (17,6, 5, 'Easy to install. Very sturdy. No drilling required.',                                     TRUE,  '2026-04-02'),
    (19,2, 5, 'Incredible for recovery. Different heads target all muscle groups.',                      TRUE,  '2026-04-20'),
    (19,3, 4, 'Powerful and relatively quiet. Battery lasts ~4 hours on low.',                           TRUE,  '2026-04-25'),
    (21,4, 5, 'Solid bench with multiple positions. Leg hold-down great for decline.',                   FALSE, '2026-05-05'),
    (26,2, 5, 'Extremely comfortable. Lightweight with great arch support for long distances.',          FALSE, '2026-05-10'),
    (26,5, 4, 'Good quality. True to size. Very breathable.',                                           FALSE, '2026-05-12'),
    (27,6, 5, 'Compression liner is a game changer. No chafing, zip pocket fits phone.',                FALSE, '2026-05-08')
    ON CONFLICT (user_id, product_id) DO NOTHING
  `);

  // ── Sync sequences ──
  console.log('\nSyncing sequences...');
  const seqMap = [
    ['users', 'user_id'], ['categories', 'category_id'], ['products', 'product_id'],
    ['orders', 'order_id'], ['order_items', 'item_id'], ['carts', 'cart_id'],
    ['cart_items', 'cart_item_id'], ['subscriptions', 'subscription_id'],
    ['payments', 'payment_id'], ['fitness_progress', 'progress_id'],
    ['fitness_goals', 'goal_id'], ['workout_history', 'workout_id'],
    ['user_notifications', 'notification_id'], ['notifications', 'notification_id'],
    ['product_reviews', 'review_id']
  ];
  for (const [table, key] of seqMap) {
    try {
      const { rows } = await query(`SELECT pg_get_serial_sequence($1, $2) as seq`, [table, key]);
      const seq = rows[0]?.seq;
      if (seq) await query(`SELECT setval($1, COALESCE(MAX(${key}), 1)) FROM ${table}`, [seq]);
    } catch {}
  }

  // ── Summary ──
  console.log('\n=== Seed Complete ===\n');
  const { rows: allTables } = await query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
  );
  for (const { table_name } of allTables) {
    const { rows: [cnt] } = await query(`SELECT COUNT(*)::int as count FROM "${table_name}"`);
    console.log(`  ${table_name}: ${cnt.count} rows`);
  }

  await pool.end();
  console.log('\nDone.');
}

run().catch(e => { console.error('Seed failed:', e); process.exit(1); });
