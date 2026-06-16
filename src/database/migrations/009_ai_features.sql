-- 009_ai_features.sql
-- AI Fitness Chat Assistant tables

CREATE TABLE IF NOT EXISTS chat_messages (
    message_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    sender VARCHAR(10) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_recommendations (
    recommendation_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL,
    recommendation_text TEXT NOT NULL,
    metadata JSONB,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Add AI usage tracking to admin
CREATE TABLE IF NOT EXISTS ai_usage_log (
    log_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    tokens_used INT DEFAULT 0,
    model VARCHAR(50) DEFAULT 'gpt-3.5-turbo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user ON ai_recommendations(user_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_date ON ai_usage_log(created_at);
