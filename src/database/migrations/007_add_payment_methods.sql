-- 007_add_payment_methods.sql
-- Add new payment methods: bank_transfer and paypal

ALTER TABLE payments
MODIFY COLUMN payment_method ENUM('mtn_momo', 'airtel_money', 'cash_on_delivery', 'bank_transfer', 'paypal') NOT NULL;
