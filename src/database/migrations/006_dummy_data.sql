-- 006_dummy_data.sql
-- Comprehensive dummy data for FitTrack Rwanda demo

-- ===== USERS =====
-- All test users share the same bcrypt hash (password: "admin123")
-- $2a$10$tb/xvby19C.1sahiS/wgt.W1pIKmzgMwUGzmtGgLsXT.ooo/5nPC.
INSERT IGNORE INTO users (user_id, full_name, email, password_hash, phone, address, role, date_of_birth, gender, height_cm) VALUES
(2,  'Jean-Pierre Habimana', 'jean@example.com',  '$2a$10$tb/xvby19C.1sahiS/wgt.W1pIKmzgMwUGzmtGgLsXT.ooo/5nPC.', '+250788100001', 'KG 123 St, Kigali',        'user', '1995-06-15', 'male',   178.00),
(3,  'Alice Mukamana',       'alice@example.com', '$2a$10$tb/xvby19C.1sahiS/wgt.W1pIKmzgMwUGzmtGgLsXT.ooo/5nPC.', '+250788100002', 'KN 45 Ave, Musanze',      'user', '1998-11-22', 'female', 165.00),
(4,  'David Niyonzima',      'david@example.com', '$2a$10$tb/xvby19C.1sahiS/wgt.W1pIKmzgMwUGzmtGgLsXT.ooo/5nPC.', '+250788100003', 'RB 7 St, Rubavu',         'user', '1993-03-10', 'male',   182.00),
(5,  'Grace Uwimana',        'grace@example.com', '$2a$10$tb/xvby19C.1sahiS/wgt.W1pIKmzgMwUGzmtGgLsXT.ooo/5nPC.', '+250788100004', 'KG 200 St, Kicukiro',     'user', '2000-09-05', 'female', 170.00),
(6,  'Patrick Mugabo',       'patrick@example.com','$2a$10$tb/xvby19C.1sahiS/wgt.W1pIKmzgMwUGzmtGgLsXT.ooo/5nPC.', '+250788100005', 'KK 15 Rd, Kigali',        'user', '1990-12-30', 'male',   175.00);

-- ===== SETTINGS =====
INSERT IGNORE INTO user_settings (user_id, theme, email_notifications, push_notifications, privacy_share_progress) VALUES
(2, 'dark',  TRUE,  TRUE,  TRUE),
(3, 'light', TRUE,  FALSE, FALSE),
(4, 'dark',  TRUE,  TRUE,  TRUE),
(5, 'system',FALSE, TRUE,  FALSE),
(6, 'dark',  TRUE,  TRUE,  TRUE);

-- ===== CATEGORIES =====
-- Note: IDs 1-4 already seeded by 004_seed_categories.sql:
-- 1=Gym Equipment, 2=Supplements, 3=Sportswear, 4=Fitness Accessories
INSERT IGNORE INTO categories (category_id, name, description) VALUES
(5, 'Yoga & Pilates',   'Yoga mats, blocks, straps, and pilates accessories'),
(6, 'Recovery',          'Foam rollers, massage guns, stretching bands'),
(7, 'Boxing & MMA',      'Boxing gloves, punching bags, hand wraps, MMA gear'),
(8, 'Swimming',          'Swimwear, goggles, caps, and training equipment');

-- ===== PRODUCTS =====
-- Note: IDs 1-6 already seeded by 002_seed_data.sql
INSERT IGNORE INTO products (product_id, name, description, price, stock_quantity, image_url, category_id) VALUES
(7,  'Kettlebell 16kg',           'Cast iron kettlebell with flat base, perfect for swings and goblet squats',                        45000,  40, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop', 1),
(8,  'Resistance Bands Set',      'Set of 5 latex resistance bands from light to extra heavy, includes carrying bag',             25000,  80, 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=300&fit=crop', 4),
(9,  'Compression Tights',        'High-waist compression training tights, moisture-wicking fabric, available in 5 sizes',        35000,  60, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=300&fit=crop', 3),
(10, 'Jump Rope Speed Pro',       'Ball-bearing speed jump rope with adjustable length and foam handles',                          15000,  120,'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', 4),
(11, 'BCAA 2:1:1 Powder',         '500g branched-chain amino acids, blue raspberry flavour, aids muscle recovery',                35000,  45, 'https://images.unsplash.com/photo-1579722820308-d74e571dd0f8?w=400&h=300&fit=crop', 2),
(12, 'Boxing Gloves 12oz',        'Premium leather boxing gloves with wrist strap support, available in 10/12/14/16oz',            55000,  35, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop', 7),
(13, 'Foam Roller Premium',       'High-density EVA foam roller, 45cm length, muscle recovery and myofascial release',              22000,  55, 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=300&fit=crop', 6),
(14, 'Training Singlet',          'Breathable mesh training singlet, quick-dry fabric, ideal for gym and running',                18000,  90, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=300&fit=crop', 3),
(15, 'Creatine Monohydrate',      '300g micronized creatine monohydrate, unflavoured, increases strength and power',              28000,  70, 'https://images.unsplash.com/photo-1593095948071-474c5cc2c1cf?w=400&h=300&fit=crop', 2),
(16, 'Yoga Mat Premium',          'Extra thick 8mm natural rubber yoga mat with alignment markings and carrying strap',           55000,  40, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=300&fit=crop', 5),
(17, 'Pull-up Bar Doorway',       'Adjustable doorway pull-up bar with foam grips, supports up to 150kg, no drilling required',   35000,  30, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', 1),
(18, 'Swimming Goggles',          'Anti-fog UV-protection swimming goggles, adjustable strap, available in clear and tinted',    12000,  100,'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=300&fit=crop', 8),
(19, 'Massage Gun',               'Percussion massage gun with 6 speed levels and 4 head attachments, rechargeable battery',      120000, 20, 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=300&fit=crop', 6),
(20, 'Gym Drawstring Bag',        'Lightweight gym drawstring bag with shoe compartment and water bottle pocket',                  15000,  150,'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop', 4);

-- ===== ORDERS =====
INSERT IGNORE INTO orders (order_id, user_id, order_reference, full_name, email, phone, delivery_address, subtotal, delivery_fee, grand_total, status) VALUES
(1, 2, 'FT-2026-0001', 'Jean-Pierre Habimana', 'jean@example.com',  '+250788100001', 'KG 123 St, Kigali',               850000, 2000, 852000, 'delivered'),
(2, 3, 'FT-2026-0002', 'Alice Mukamana',       'alice@example.com', '+250788100002', 'KN 45 Ave, Musanze',              65000,  2000, 67000,  'delivered'),
(3, 4, 'FT-2026-0003', 'David Niyonzima',      'david@example.com', '+250788100003', 'RB 7 St, Rubavu',                 520000, 2000, 522000, 'shipped'),
(4, 5, 'FT-2026-0004', 'Grace Uwimana',        'grace@example.com','+250788100004', 'KG 200 St, Kicukiro',             35000,  2000, 37000,  'confirmed'),
(5, 2, 'FT-2026-0005', 'Jean-Pierre Habimana', 'jean@example.com',  '+250788100001', 'KG 123 St, Kigali',               70000,  2000, 72000,  'delivered'),
(6, 6, 'FT-2026-0006', 'Patrick Mugabo',       'patrick@example.com','+250788100005','KK 15 Rd, Kigali',                 84000,  2000, 86000,  'processing'),
(7, 3, 'FT-2026-0007', 'Alice Mukamana',       'alice@example.com', '+250788100002', 'KN 45 Ave, Musanze',              47000,  0,    47000,  'delivered'),
(8, 4, 'FT-2026-0008', 'David Niyonzima',      'david@example.com', '+250788100003', 'RB 7 St, Rubavu',                 180000, 2000, 182000, 'pending');

-- ===== ORDER ITEMS =====
INSERT IGNORE INTO order_items (item_id, order_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 1,  1, 850000, 850000),
(2, 2, 4,  1, 65000,  65000),
(3, 3, 5,  1, 520000, 520000),
(4, 4, 8,  1, 25000,  25000),
(5, 4, 10, 1, 15000,  15000),
(6, 5, 9,  2, 35000,  70000),
(7, 6, 14, 3, 18000,  54000),
(8, 6, 20, 2, 15000,  30000),
(9, 7, 13, 1, 22000,  22000),
(10,7, 8,  1, 25000,  25000),
(11,8, 6,  1, 180000, 180000);

-- ===== CARTS =====
INSERT IGNORE INTO carts (cart_id, user_id) VALUES
(1, 2), (2, 3), (3, 4);

-- ===== CART ITEMS =====
INSERT IGNORE INTO cart_items (cart_item_id, cart_id, product_id, quantity) VALUES
(1, 1, 7,  2),
(2, 1, 16, 1),
(3, 2, 11, 1),
(4, 3, 19, 1);

-- ===== SUBSCRIPTIONS =====
INSERT IGNORE INTO subscriptions (subscription_id, user_id, plan_type, price, status, start_date, end_date) VALUES
(1, 2, 'premium', 25000, 'active',   '2026-01-15', '2026-12-15'),
(2, 3, 'basic',   0,      'active',   '2026-02-01', '2027-02-01'),
(3, 4, 'annual',  200000, 'active',   '2026-01-01', '2027-01-01'),
(4, 5, 'premium', 25000,  'active',   '2026-03-01', '2026-12-01'),
(5, 6, 'premium', 25000,  'cancelled','2025-12-01', '2026-06-01');

-- ===== PAYMENTS =====
INSERT IGNORE INTO payments (payment_id, user_id, order_id, subscription_id, payment_method, phone_number, amount, transaction_reference, payment_status, payment_date) VALUES
(1,  2, 1, NULL, 'mtn_momo',    '+250788100001', 852000, 'MOMO-2026-001', 'completed', '2026-01-20 10:30:00'),
(2,  3, 2, NULL, 'airtel_money','+250788100002', 67000,  'AIR-2026-002',  'completed', '2026-02-05 14:15:00'),
(3,  4, 3, NULL, 'mtn_momo',    '+250788100003', 522000, 'MOMO-2026-003', 'completed', '2026-03-10 09:00:00'),
(4,  5, 4, NULL, 'mtn_momo',    '+250788100004', 37000,  'MOMO-2026-004', 'completed', '2026-03-15 16:45:00'),
(5,  2, 5, NULL, 'airtel_money','+250788100001', 72000,  'AIR-2026-005',  'completed', '2026-04-01 11:20:00'),
(6,  6, 6, NULL, 'mtn_momo',    '+250788100005', 86000,  'MOMO-2026-006', 'pending',   '2026-04-10 08:30:00'),
(7,  3, 7, NULL, 'cash_on_delivery', NULL,       47000,  'COD-2026-007',  'completed', '2026-04-12 17:00:00'),
(8,  4, 8, NULL, 'mtn_momo',    '+250788100003', 182000, 'MOMO-2026-008', 'pending',   '2026-04-15 12:00:00'),
(9,  2, NULL, 1,  'mtn_momo',    '+250788100001', 25000,  'MOMO-SUB-001',  'completed', '2026-01-15 08:00:00'),
(10, 4, NULL, 3,  'airtel_money','+250788100003', 200000, 'AIR-SUB-003',   'completed', '2026-01-01 07:30:00'),
(11, 5, NULL, 4,  'mtn_momo',    '+250788100004', 25000,  'MOMO-SUB-004',  'completed', '2026-03-01 09:00:00'),
(12, 6, NULL, 5,  'mtn_momo',    '+250788100005', 25000,  'MOMO-SUB-005',  'refunded',  '2025-12-01 10:00:00');

-- ===== FITNESS PROGRESS =====
INSERT IGNORE INTO fitness_progress (progress_id, user_id, weight_kg, height_cm, body_fat_pct, chest_cm, waist_cm, hips_cm, biceps_cm, workout_type, duration_minutes, calories_burned, notes, recorded_date) VALUES
(1,  2, 82.0, 178, 18.5, 102, 80,  98,  38, 'Strength',  60, 450, 'Good session, increased bench press weight', '2026-01-01'),
(2,  2, 81.5, 178, 18.2, 102, 79,  98,  38, 'Cardio',    45, 380, 'Morning run 5km',                           '2026-01-08'),
(3,  2, 80.8, 178, 17.8, 103, 78,  97,  39, 'Strength',  60, 480, 'New PR on deadlifts',                        '2026-01-15'),
(4,  2, 80.2, 178, 17.5, 103, 78,  97,  39, 'HIIT',      30, 350, 'Intense interval training',                  '2026-01-22'),
(5,  2, 79.5, 178, 17.0, 104, 77,  96,  40, 'Strength',  75, 520, 'Great progress overall',                      '2026-01-29'),
(6,  3, 62.0, 165, 24.0, 88,  68,  92,  28, 'Yoga',      60, 200, 'Flexibility improving',                       '2026-02-01'),
(7,  3, 61.5, 165, 23.5, 88,  67,  92,  28, 'Pilates',   50, 220, 'Core strength session',                       '2026-02-08'),
(8,  3, 61.0, 165, 23.0, 89,  67,  91,  29, 'Yoga',      60, 210, 'Advanced poses getting easier',               '2026-02-15'),
(9,  4, 88.0, 182, 20.0, 108, 85,  102, 42, 'Strength',  90, 600, 'Heavy leg day',                               '2026-01-02'),
(10, 4, 87.5, 182, 19.5, 108, 84,  102, 42, 'Cardio',    40, 400, '5km run',                                     '2026-01-09'),
(11, 4, 87.0, 182, 19.2, 109, 84,  101, 43, 'Strength',  75, 550, 'Push day',                                    '2026-01-16'),
(12, 4, 86.5, 182, 19.0, 109, 83,  101, 43, 'Swimming',  45, 500, 'Lap swimming 1km',                            '2026-01-23'),
(13, 5, 70.0, 170, 22.0, 94,  74,  96,  32, 'HIIT',      30, 320, 'First HIIT session',                          '2026-03-01'),
(14, 5, 69.5, 170, 21.5, 94,  73,  96,  32, 'Strength',  45, 380, 'Upper body',                                  '2026-03-08'),
(15, 5, 69.0, 170, 21.0, 95,  73,  95,  33, 'Cardio',    35, 350, 'Treadmill interval run',                      '2026-03-15'),
(16, 6, 92.0, 175, 25.0, 108, 90,  104, 40, 'Strength',  60, 450, 'Chest and triceps',                           '2025-12-01'),
(17, 6, 91.0, 175, 24.0, 110, 88,  103, 41, 'Strength',  60, 480, 'Back and biceps',                             '2025-12-15'),
(18, 6, 90.5, 175, 23.5, 110, 87,  103, 41, 'Cardio',    30, 300, 'Light cardio',                                '2025-12-22');

-- ===== FITNESS GOALS =====
INSERT IGNORE INTO fitness_goals (goal_id, user_id, goal_type, target_value, current_value, unit, deadline, status) VALUES
(1, 2, 'Weight Loss',       75.0,  79.5, 'kg',  '2026-06-30', 'in_progress'),
(2, 2, 'Bench Press Max',   100.0, 85.0,  'kg',  '2026-12-31', 'in_progress'),
(3, 3, 'Weight Maintenance', 60.0, 61.0,  'kg',  '2026-12-31', 'in_progress'),
(4, 3, 'Daily Yoga',         30,    22,    'min', '2026-06-30', 'in_progress'),
(5, 4, 'Weight Loss',       82.0,  86.5,  'kg',  '2026-06-30', 'in_progress'),
(6, 4, 'Deadlift Max',      200.0, 180.0, 'kg',  '2026-12-31', 'in_progress'),
(7, 5, 'Weight Loss',       65.0,  69.0,  'kg',  '2026-09-30', 'in_progress'),
(8, 5, 'Run 5km',           25.0,  30.0,  'min', '2026-08-31', 'in_progress'),
(9, 6, 'Weight Loss',       85.0,  90.5,  'kg',  '2026-06-30', 'completed'),
(10,6, 'Swim 1km',          30,    28,    'min', '2025-12-31', 'completed');

-- ===== WISHLIST =====
INSERT IGNORE INTO wishlist (user_id, product_id) VALUES
(2, 7), (2, 16), (2, 19),
(3, 11), (3, 15),
(4, 12), (4, 19),
(5, 9),  (5, 14),
(6, 13), (6, 17);

-- ===== WORKOUT HISTORY =====
INSERT IGNORE INTO workout_history (workout_id, user_id, workout_type, duration_minutes, calories_burned, notes, workout_date) VALUES
(1,  2, 'Strength Training',    60, 450, 'Bench press, rows, overhead press',          '2026-04-01'),
(2,  2, 'Running',              35, 320, '5km outdoor run',                            '2026-04-02'),
(3,  2, 'HIIT',                 25, 300, 'Tabata protocol',                            '2026-04-03'),
(4,  2, 'Strength Training',    60, 480, 'Deadlifts, squats, lunges',                  '2026-04-04'),
(5,  3, 'Yoga',                 60, 180, 'Vinyasa flow',                               '2026-04-01'),
(6,  3, 'Pilates',              45, 200, 'Mat pilates core focus',                     '2026-04-03'),
(7,  3, 'Walking',              40, 150, 'Brisk walk in park',                         '2026-04-05'),
(8,  4, 'Strength Training',    90, 600, 'Leg day: squats, leg press, extensions',     '2026-04-01'),
(9,  4, 'Swimming',             45, 500, 'Freestyle laps 1.5km',                       '2026-04-02'),
(10, 4, 'Strength Training',    75, 550, 'Push day: bench, incline, flyes',            '2026-04-03'),
(11, 5, 'HIIT',                 30, 320, 'Circuit training 4 rounds',                  '2026-04-01'),
(12, 5, 'Strength Training',    45, 350, 'Upper body light weights',                   '2026-04-02'),
(13, 5, 'Cycling',              40, 380, 'Stationary bike intervals',                  '2026-04-04'),
(14, 6, 'Boxing',               60, 550, 'Heavy bag and pad work',                     '2026-03-20'),
(15, 6, 'Strength Training',    60, 450, 'Chest and triceps',                          '2026-03-22');

-- ===== USER NOTIFICATIONS =====
INSERT IGNORE INTO user_notifications (user_id, type, title, message, link, is_read) VALUES
(2, 'order',     'Order Confirmed',       'Your order FT-2026-0001 has been confirmed and is being processed.',       '/dashboard/orders/1',       TRUE),
(2, 'order',     'Order Delivered',       'Your order FT-2026-0001 has been delivered. Enjoy your Smart Treadmill!', '/dashboard/orders/1',       TRUE),
(2, 'subscription','Premium Activated',   'Your Premium subscription is now active. Start tracking your progress!',  '/dashboard/subscription',   TRUE),
(2, 'order',     'Order Delivered',       'Your order FT-2026-0005 has been delivered successfully.',                  '/dashboard/orders/5',       FALSE),
(2, 'fitness',   'Goal Update',           'You are 60% toward your weight loss goal. Keep going!',                   '/dashboard/goals',          FALSE),
(3, 'order',     'Order Delivered',       'Your order FT-2026-0002 has been delivered. Enjoy your supplements!',     '/dashboard/orders/2',       TRUE),
(3, 'order',     'Order Delivered',       'Your order FT-2026-0007 has been delivered.',                             '/dashboard/orders/7',       FALSE),
(3, 'system',    'Welcome!',              'Welcome to FitTrack Rwanda! Start exploring your dashboard.',              '/dashboard',                TRUE),
(4, 'order',     'Order Shipped',         'Your order FT-2026-0003 has been shipped and is on its way!',             '/dashboard/orders/3',       TRUE),
(4, 'order',     'New Order',             'Your order FT-2026-0008 has been placed successfully.',                    '/dashboard/orders/8',       FALSE),
(4, 'subscription','Annual Plan Active',  'Your Annual subscription is active. Thank you for choosing FitTrack!',     '/dashboard/subscription',   TRUE),
(5, 'order',     'Order Confirmed',       'Your order FT-2026-0004 has been confirmed.',                              '/dashboard/orders/4',       TRUE),
(5, 'system',    'Complete Your Profile', 'Fill in your fitness details to get personalized recommendations.',       '/dashboard/settings',       FALSE),
(6, 'subscription','Subscription Cancelled','Your Premium subscription has been cancelled as requested.',              '/dashboard/subscription',   TRUE),
(6, 'system',    'Welcome Back',          'We miss you! Come back and check our new products.',                       '/products',                 FALSE);

-- ===== ADMIN NOTIFICATIONS =====
INSERT IGNORE INTO notifications (type, title, message, related_id, related_type, is_read) VALUES
('order',   'New Order Placed',     'Order FT-2026-0006 placed by Patrick Mugabo — 182,000 RWF',           6, 'order', FALSE),
('order',   'New Order Placed',     'Order FT-2026-0008 placed by David Niyonzima — 182,000 RWF',          8, 'order', FALSE),
('payment', 'Payment Pending',      'Payment for order FT-2026-0006 is pending — MOMO-2026-006',           6, 'order', FALSE),
('payment', 'Payment Pending',      'Payment for order FT-2026-0008 is pending — MOMO-2026-008',           8, 'order', FALSE),
('user',    'New User Registered',  'Patrick Mugabo (patrick@example.com) registered on the platform.',    6, 'user',  FALSE),
('system',  'Low Stock Alert',      'Massage Gun (ID 19) has only 20 units remaining.',                    19,'product',FALSE),
('system',  'Low Stock Alert',      'Pull-up Bar (ID 17) has only 30 units remaining.',                    17,'product',FALSE);

-- ===== UPDATE PRODUCT RATINGS (via order data — simulated) =====
-- Note: Products table doesn't have rating/review_count columns based on schema.
-- The frontend defaults to rating=4 and review_count=0. This is fine for demo.
