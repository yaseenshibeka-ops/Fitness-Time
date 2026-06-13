-- 003_admin_tables.sql

CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    related_id INT,
    related_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO settings (setting_key, setting_value) VALUES
('platform_name', 'FitTrack Rwanda'),
('platform_email', 'info@fittrack.rw'),
('platform_phone', '+250 788 000 000'),
('delivery_fee', '2000'),
('tax_rate', '0'),
('basic_plan_price', '10000'),
('premium_plan_price', '25000'),
('annual_plan_price', '250000'),
('mtn_momo_api_key', ''),
('airtel_money_api_key', '');
