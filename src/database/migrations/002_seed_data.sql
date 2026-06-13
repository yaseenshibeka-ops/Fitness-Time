-- 002_seed_data.sql
-- Sample categories and products for demo

INSERT INTO categories (category_id, name, description) VALUES
(1, 'Cardio', 'Treadmills, exercise bikes, and rowing machines'),
(2, 'Strength', 'Dumbbells, barbells, weight plates, and racks'),
(3, 'Accessories', 'Resistance bands, yoga mats, gloves, and more'),
(4, 'Supplements', 'Protein powders, vitamins, and recovery drinks')
ON CONFLICT (category_id) DO NOTHING;

INSERT INTO products (name, description, price, stock_quantity, image_url, category_id) VALUES
('Smart Treadmill Pro', 'Motorized treadmill with incline, heart rate monitor, and Bluetooth connectivity', 850000, 15, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', 1),
('Adjustable Dumbbell Set', 'Space-saving adjustable dumbbells from 2kg to 24kg each', 350000, 30, 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop', 2),
('Premium Yoga Mat', 'Extra thick 6mm eco-friendly TPE yoga mat with alignment lines', 45000, 100, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=300&fit=crop', 3),
('Whey Protein Isolate', '2.27kg pure whey protein isolate, vanilla flavour, 25g protein per serving', 65000, 50, 'https://images.unsplash.com/photo-1593095948071-474c5cc2c1cf?w=400&h=300&fit=crop', 4),
('Exercise Bike X500', 'Magnetic resistance spin bike with LCD display and tablet holder', 520000, 20, 'https://images.unsplash.com/photo-1534251369789-5067c8b8602a?w=400&h=300&fit=crop', 1),
('Olympic Barbell  20kg', 'Professional 20kg Olympic barbell with 2x needle bearings, 2200lb capacity', 180000, 25, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', 2);
