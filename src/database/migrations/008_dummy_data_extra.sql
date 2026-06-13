-- 008_dummy_data_extra.sql
-- Extra dummy data: reviews table, more products, orders, payments, etc.

-- ===== REVIEWS TABLE =====
CREATE TABLE IF NOT EXISTS product_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_review (user_id, product_id)
);

-- ===== EXTRA PRODUCTS =====
INSERT IGNORE INTO products (product_id, name, description, price, stock_quantity, image_url, category_id) VALUES
(21, 'Pro Weight Bench', 'Adjustable weight bench with 7 back positions and 3 seat positions, supports up to 300kg', 180000, 20, 'https://images.unsplash.com/photo-1639815188547-89e0da10e35e?w=400&h=300&fit=crop', 1),
(22, 'Battle Rope 15m', '15m x 38mm heavy-duty poly-dacron battle rope for explosive strength training', 35000, 40, 'https://images.unsplash.com/photo-1534258936925-c8bed0f9c84e?w=400&h=300&fit=crop', 1),
(23, 'Pre-Workout 300g', 'High-stimulant pre-workout powder, green apple flavour, 30 servings', 32000, 60, 'https://images.unsplash.com/photo-1593095948071-474c5cc2c1cf?w=400&h=300&fit=crop', 2),
(24, 'Mass Gainer 3kg', 'High-calorie mass gainer powder, chocolate flavour, 12 servings', 55000, 35, 'https://images.unsplash.com/photo-1579722820308-d74e571dd0f8?w=400&h=300&fit=crop', 2),
(25, 'Multivitamin Pack', 'Daily multivitamin and mineral supplement, 90 tablets', 18000, 120, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop', 2),
(26, 'Running Shoes Pro', 'Lightweight performance running shoes with responsive cushioning and breathable mesh upper', 95000, 45, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop', 3),
(27, 'Training Shorts Elite', 'Moisture-wicking 2-in-1 training shorts with compression liner and zip pocket', 28000, 80, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=300&fit=crop', 3),
(28, 'Compression Top', 'Seamless compression training top with ventilation panels for optimal breathability', 32000, 65, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=300&fit=crop', 3),
(29, 'Weightlifting Belt', 'Premium 4-inch suede leather weightlifting belt with double-prong buckle', 45000, 30, 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=300&fit=crop', 4),
(30, 'Gym Gloves', 'Breathable gym gloves with silicone grip padding and wrist support straps', 15000, 100, 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=300&fit=crop', 4),
(31, 'Skipping Rope Speed', 'Ball-bearing speed jump rope with 4.5m adjustable PVC-coated steel cable', 10000, 150, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', 4),
(32, 'Ankle Weights 2x2.5kg', 'Adjustable ankle weights with sand filling, comfortable neoprene padding', 22000, 55, 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=300&fit=crop', 4);

-- ===== PRODUCT REVIEWS =====
INSERT IGNORE INTO product_reviews (product_id, user_id, rating, review_text, is_verified_purchase, created_at) VALUES
-- Product 1: Smart Treadmill Pro
(1, 2, 5, 'Excellent treadmill! The Bluetooth connectivity with the FitTrack app makes tracking seamless. Delivery was prompt and assembly was straightforward.', TRUE, '2026-02-01'),
(1, 3, 4, 'Great quality treadmill for the price. The incline feature works perfectly. Would recommend to serious runners.', TRUE, '2026-02-15'),
(1, 4, 5, 'Game changer for my home gym. The motor is quiet and the cushioning is easy on the joints.', TRUE, '2026-03-01'),
-- Product 2: Adjustable Dumbbell Set
(2, 5, 5, 'These dumbbells saved so much space in my apartment. The adjustment mechanism is smooth and sturdy.', TRUE, '2026-02-10'),
(2, 6, 4, 'Good quality dumbbells. The weight range covers most exercises I need. A bit pricey but worth it.', TRUE, '2026-02-20'),
-- Product 3: Premium Yoga Mat
(3, 2, 5, 'Best yoga mat I have ever used. The alignment lines are really helpful for proper form.', TRUE, '2026-01-20'),
(3, 3, 4, 'Thick and comfortable. Does not slip even during intense hot yoga sessions.', TRUE, '2026-03-05'),
-- Product 4: Whey Protein Isolate
(4, 4, 5, 'Mixes easily and tastes great. No bloating like other brands. Highly recommend!', TRUE, '2026-01-25'),
(4, 5, 5, 'Great protein powder. The vanilla flavour is delicious and it dissolves completely in water.', TRUE, '2026-02-14'),
(4, 6, 4, 'Good quality protein at a fair price. Digestive enzymes make it easy on the stomach.', TRUE, '2026-03-10'),
-- Product 5: Exercise Bike X500
(5, 2, 5, 'Solid spin bike with smooth magnetic resistance. The tablet holder is a nice touch for workout classes.', TRUE, '2026-02-28'),
-- Product 6: Olympic Barbell
(6, 3, 5, 'Professional grade barbell with great knurling. The bearings spin smoothly for Olympic lifts.', TRUE, '2026-01-15'),
-- Product 7: Kettlebell 16kg
(7, 4, 4, 'Solid cast iron kettlebell with a flat base. Great for swings and Turkish get-ups.', TRUE, '2026-03-15'),
(7, 2, 5, 'Perfect weight for my home workouts. The handle is comfortable for two-handed swings.', TRUE, '2026-04-01'),
-- Product 8: Resistance Bands Set
(8, 5, 5, 'Excellent band set with varying resistance levels. The carrying bag keeps everything organized.', TRUE, '2026-03-20'),
(8, 6, 4, 'Good quality latex bands. The heaviest band provides serious resistance for upper body work.', TRUE, '2026-04-05'),
-- Product 11: BCAA Powder
(11, 3, 4, 'Tastes great and helps with recovery. I mix it with my water during workouts.', TRUE, '2026-03-25'),
-- Product 15: Creatine Monohydrate
(15, 4, 5, 'Micronized creatine that mixes instantly. Noticed a significant strength increase after 2 weeks.', TRUE, '2026-04-10'),
(15, 2, 5, 'Best value creatine on the platform. Unflavoured so it mixes with anything.', TRUE, '2026-04-15'),
-- Product 16: Yoga Mat Premium
(16, 5, 4, 'Great mat with alignment markings. The natural rubber smells a bit at first but fades quickly.', TRUE, '2026-03-28'),
-- Product 17: Pull-up Bar
(17, 6, 5, 'Easy to install and feels very sturdy. No drilling required and fits my doorway perfectly.', TRUE, '2026-04-02'),
-- Product 19: Massage Gun
(19, 2, 5, 'This massage gun is incredible for recovery. The different head attachments target all muscle groups.', TRUE, '2026-04-20'),
(19, 3, 4, 'Powerful and relatively quiet. Battery life is good — lasts about 4 hours on low speed.', TRUE, '2026-04-25'),
-- Product 21: Pro Weight Bench
(21, 4, 5, 'Solid bench with multiple positions. The leg hold-down feature is great for decline exercises.', FALSE, '2026-05-05'),
-- Product 26: Running Shoes Pro
(26, 2, 5, 'Extremely comfortable running shoes. Lightweight with great arch support for long distances.', FALSE, '2026-05-10'),
(26, 5, 4, 'Good quality training shoes. True to size and very breathable for intense workouts.', FALSE, '2026-05-12'),
-- Product 27: Training Shorts Elite
(27, 6, 5, 'The compression liner is a game changer. No chafing during long runs and the zip pocket fits my phone.', FALSE, '2026-05-08');

-- ===== EXTRA ORDERS =====
INSERT IGNORE INTO orders (order_id, user_id, order_reference, full_name, email, phone, delivery_address, subtotal, delivery_fee, grand_total, status, created_at) VALUES
(9,  2, 'FT-2026-0009', 'Jean-Pierre Habimana', 'jean@example.com',  '+250788100001', 'KG 123 St, Kigali',                180000, 0,    180000, 'delivered', '2026-02-15 10:00:00'),
(10, 3, 'FT-2026-0010', 'Alice Mukamana',       'alice@example.com', '+250788100002', 'KN 45 Ave, Musanze',               64000,  2000, 66000,  'delivered', '2026-02-20 14:30:00'),
(11, 5, 'FT-2026-0011', 'Grace Uwimana',        'grace@example.com','+250788100004', 'KG 200 St, Kicukiro',              127000, 0,    127000, 'delivered', '2026-03-25 09:15:00'),
(12, 6, 'FT-2026-0012', 'Patrick Mugabo',       'patrick@example.com','+250788100005','KK 15 Rd, Kigali',                 40000,  2000, 42000,  'shipped',   '2026-04-20 11:45:00'),
(13, 2, 'FT-2026-0013', 'Jean-Pierre Habimana', 'jean@example.com',  '+250788100001', 'KG 123 St, Kigali',                95000,  0,    95000,  'confirmed', '2026-05-01 08:00:00'),
(14, 4, 'FT-2026-0014', 'David Niyonzima',      'david@example.com', '+250788100003', 'RB 7 St, Rubavu',                  222000, 0,    222000, 'processing','2026-05-05 16:20:00'),
(15, 3, 'FT-2026-0015', 'Alice Mukamana',       'alice@example.com', '+250788100002', 'KN 45 Ave, Musanze',               50000,  2000, 52000,  'pending',   '2026-05-12 13:00:00');

-- ===== EXTRA ORDER ITEMS =====
INSERT IGNORE INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
-- Order 9: Jean's 2nd order — Pro Weight Bench
(9,  21, 1, 180000, 180000),
-- Order 10: Alice's 2nd order — Resistance Bands + Jump Rope
(10, 8,  1, 25000,  25000),
(10, 10, 1, 15000,  15000),
(10, 31, 1, 10000,  10000),
(10, 30, 1, 14000,  14000),
-- Order 11: Grace's 2nd order — Running Shoes + Gym Gloves + Ankle Weights
(11, 26, 1, 95000,  95000),
(11, 30, 1, 15000,  15000),
(11, 32, 1, 17000,  17000),
-- Order 12: Patrick's 2nd order — Skipping Rope + Resistance Bands
(12, 31, 2, 10000,  20000),
(12, 8,  1, 20000,  20000),
-- Order 13: Jean's 3rd order — Running Shoes
(13, 26, 1, 95000,  95000),
-- Order 14: David's 2nd order — Adjustable Dumbbell Set + Mass Gainer
(14, 2,  1, 180000, 180000),
(14, 24, 1, 42000,  42000),
-- Order 15: Alice's 3rd order — Multivitamin + Ankle Weights
(15, 25, 2, 18000,  36000),
(15, 32, 1, 14000,  14000);

-- ===== EXTRA PAYMENTS =====
INSERT IGNORE INTO payments (user_id, order_id, payment_method, phone_number, amount, transaction_reference, payment_status, payment_date) VALUES
(2, 9,  'mtn_momo',    '+250788100001', 180000, 'MOMO-2026-009', 'completed', '2026-02-15 10:05:00'),
(3, 10, 'airtel_money','+250788100002', 66000,  'AIR-2026-010',  'completed', '2026-02-20 14:35:00'),
(5, 11, 'mtn_momo',    '+250788100004', 127000, 'MOMO-2026-011', 'completed', '2026-03-25 09:20:00'),
(6, 12, 'mtn_momo',    '+250788100005', 42000,  'MOMO-2026-012', 'completed', '2026-04-20 11:50:00'),
(2, 13, 'bank_transfer', NULL,          95000,  'TXN-2026-013',  'pending',   NULL),
(4, 14, 'paypal',       NULL,          222000, 'PPL-2026-014',   'pending',   NULL),
(3, 15, 'cash_on_delivery', NULL,       52000,  'COD-2026-015',  'pending',   NULL);

-- ===== EXTRA CART ITEMS =====
INSERT IGNORE INTO cart_items (cart_id, product_id, quantity) VALUES
(1, 26, 1),
(1, 31, 2),
(2, 25, 1),
(3, 21, 1),
(3, 30, 2);

-- ===== EXTRA WORKOUT HISTORY =====
INSERT IGNORE INTO workout_history (user_id, workout_type, duration_minutes, calories_burned, notes, workout_date) VALUES
(2, 'Strength Training', 60, 500, 'Chest and triceps: bench press 5x5, incline 3x10, tricep pushdowns 3x12', '2026-04-06'),
(2, 'Running',           40, 360, '6km interval run: 4 min fast / 1 min recovery',                       '2026-04-07'),
(2, 'Swimming',          30, 280, 'Freestyle laps 800m',                                                 '2026-04-08'),
(2, 'Strength Training', 75, 580, 'Back and biceps: deadlifts 3x5, pull-ups 4x8, barbell rows 3x10',    '2026-04-09'),
(2, 'HIIT',              25, 320, 'Tabata: burpees, mountain climbers, squats, push-ups',                 '2026-04-10'),
(3, 'Yoga',              60, 190, 'Hatha yoga flow focusing on hip openers and hamstring flexibility',    '2026-04-06'),
(3, 'Pilates',           45, 210, 'Reformer pilates — core and glute activation',                        '2026-04-08'),
(3, 'Walking',           50, 170, 'Park walk with incline sections',                                      '2026-04-10'),
(3, 'Yoga',              60, 200, 'Vinyasa flow: sun salutations and standing balances',                  '2026-04-12'),
(4, 'Strength Training', 90, 620, 'Leg day: squats 5x5, leg press 4x10, Romanian deadlifts 3x12',       '2026-04-05'),
(4, 'Boxing',            60, 560, 'Heavy bag work: combinations, footwork, 3 min rounds',                '2026-04-06'),
(4, 'Strength Training', 75, 540, 'Push day: overhead press 4x6, lateral raises 3x15, face pulls 3x15', '2026-04-08'),
(4, 'Swimming',          45, 480, 'Mixed strokes 1.5km',                                                 '2026-04-10'),
(5, 'HIIT',              30, 340, 'Circuit: 5 rounds of 10 exercises — 45s work / 15s rest',             '2026-04-05'),
(5, 'Cycling',           40, 370, 'Stationary bike: hill climb intervals',                                '2026-04-07'),
(5, 'Strength Training', 50, 400, 'Full body: goblet squats, push-ups, rows, planks',                    '2026-04-09'),
(6, 'Strength Training', 60, 470, 'Chest and triceps: dumbbell press, flyes, skull crushers',            '2026-03-24'),
(6, 'Boxing',            60, 540, 'Sparring and pad work 5 rounds',                                       '2026-03-26'),
(6, 'Strength Training', 60, 460, 'Back and biceps: pull-ups, cable rows, curls',                        '2026-03-28');

-- ===== EXTRA USER NOTIFICATIONS =====
INSERT IGNORE INTO user_notifications (user_id, type, title, message, link, is_read) VALUES
(2, 'order',     'New Order',             'Your order FT-2026-0013 is confirmed and being prepared.',              '/dashboard/orders/13',     FALSE),
(2, 'fitness',   'New PR!',               'Congratulations! You hit a new personal record on bench press: 85kg!', '/dashboard/fitness',       TRUE),
(3, 'order',     'Order Placed',          'Your order FT-2026-0015 has been placed successfully.',                 '/dashboard/orders/15',     FALSE),
(3, 'fitness',   'Weekly Summary',        'You completed 4 workouts this week. 20% more than last week!',          '/dashboard/fitness',       TRUE),
(4, 'payment',   'Payment Pending',       'Your PayPal payment for order FT-2026-0014 is pending confirmation.',   '/dashboard/orders/14',     FALSE),
(4, 'fitness',   'Goal Progress',         'You are 75% toward your weight loss goal. Keep pushing!',               '/dashboard/goals',         TRUE),
(5, 'order',     'Order Delivered',       'Your order FT-2026-0011 has been delivered. Enjoy your new gear!',      '/dashboard/orders/11',     TRUE),
(5, 'system',    'Profile Complete',      'Great job completing your fitness profile!',                            '/dashboard/profile',       TRUE),
(6, 'order',     'Order Shipped',         'Your order FT-2026-0012 is on its way!',                                '/dashboard/orders/12',     TRUE),
(6, 'fitness',   'Welcome to Boxing',     'Try our new boxing workout plans in the fitness tracker!',              '/dashboard/fitness',       FALSE);

-- ===== EXTRA ADMIN NOTIFICATIONS =====
INSERT IGNORE INTO notifications (type, title, message, related_id, related_type, is_read) VALUES
('order',   'New Order Placed',     'Order FT-2026-0013 placed by Jean-Pierre Habimana — 95,000 RWF',            13, 'order',  FALSE),
('order',   'New Order Placed',     'Order FT-2026-0014 placed by David Niyonzima — 222,000 RWF',               14, 'order',  FALSE),
('order',   'New Order Placed',     'Order FT-2026-0015 placed by Alice Mukamana — 52,000 RWF',                 15, 'order',  FALSE),
('payment', 'Bank Transfer Pending','Bank transfer for order FT-2026-0013 (95,000 RWF) awaiting verification.',  13, 'order',  FALSE),
('payment', 'PayPal Pending',       'PayPal payment for order FT-2026-0014 (222,000 RWF) pending.',              14, 'order',  FALSE),
('system',  'Low Stock Alert',      'Running Shoes Pro (ID 26) has only 45 units remaining.',                    26, 'product',FALSE),
('system',  'Low Stock Alert',      'Pro Weight Bench (ID 21) has only 20 units remaining.',                     21, 'product',FALSE),
('system',  'Popular Product',      'Whey Protein Isolate (ID 4) is trending this week with 15+ orders!',        4,  'product',FALSE);
