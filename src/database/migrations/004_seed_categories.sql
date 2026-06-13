-- 004_seed_categories.sql

INSERT IGNORE INTO categories (category_id, name, description) VALUES
(1, 'Gym Equipment', 'Treadmills, dumbbells, barbells, benches, racks and machines'),
(2, 'Supplements', 'Protein powders, BCAAs, creatine, vitamins and recovery drinks'),
(3, 'Sportswear', 'Training shoes, shorts, singlets, gloves and accessories'),
(4, 'Fitness Accessories', 'Resistance bands, yoga mats, jump ropes, straps and belts');
