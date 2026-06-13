-- 007_add_payment_methods.sql
-- In PostgreSQL migration, payments.payment_method is already VARCHAR(50) which supports any string method.
-- We ensure the column type matches.
ALTER TABLE payments ALTER COLUMN payment_method TYPE VARCHAR(50);
