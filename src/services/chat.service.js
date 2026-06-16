const pool = require('../config/database');
const OpenAIService = require('./openai.service');

class ChatService {
    static async sendMessage(userId, messageText) {
        if (!messageText || typeof messageText !== 'string' || messageText.trim().length === 0) {
            throw { statusCode: 400, message: 'Message cannot be empty' };
        }
        if (messageText.length > 2000) {
            throw { statusCode: 400, message: 'Message too long (max 2000 characters)' };
        }

        const sanitized = messageText.trim().slice(0, 2000);

        const [result] = await pool.query(
            `INSERT INTO chat_messages (user_id, message, sender) VALUES (?, ?, 'user')`,
            [userId, sanitized]
        );
        const userMessageId = result.insertId;

        const subscription = await this.getUserSubscription(userId);
        const goals = await this.getUserGoals(userId);
        const recentWorkouts = await this.getRecentWorkouts(userId);
        const progress = await this.getProgressSummary(userId);

        const aiReply = await OpenAIService.generateResponse(
            sanitized, subscription, goals, recentWorkouts, progress
        );

        const [aiResult] = await pool.query(
            `INSERT INTO chat_messages (user_id, message, sender) VALUES (?, ?, 'bot')`,
            [userId, aiReply]
        );
        const botMessageId = aiResult.insertId;

        await OpenAIService.logUsage(userId, 'chat_message');

        return {
            userMessage: { messageId: userMessageId, message: sanitized, sender: 'user' },
            botMessage: { messageId: botMessageId, message: aiReply, sender: 'bot' }
        };
    }

    static async getHistory(userId, { limit = 50, before } = {}) {
        let sql = 'SELECT message_id, message, sender, created_at FROM chat_messages WHERE user_id=?';
        const params = [userId];

        if (before) {
            sql += ' AND message_id < ?';
            params.push(parseInt(before));
        }

        sql += ' ORDER BY created_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const [messages] = await pool.query(sql, params);
        return messages.reverse();
    }

    static async getUserSubscription(userId) {
        const [subs] = await pool.query(
            'SELECT * FROM subscriptions WHERE user_id = ? AND status = "active" ORDER BY created_at DESC LIMIT 1',
            [userId]
        );
        return subs.length > 0 ? subs[0] : null;
    }

    static async getUserGoals(userId) {
        const [goals] = await pool.query(
            'SELECT * FROM fitness_goals WHERE user_id = ? AND status = "in_progress" ORDER BY deadline ASC',
            [userId]
        );
        return goals;
    }

    static async getRecentWorkouts(userId) {
        const [workouts] = await pool.query(
            'SELECT * FROM fitness_progress WHERE user_id = ? ORDER BY recorded_date DESC LIMIT 10',
            [userId]
        );
        return workouts;
    }

    static async getProgressSummary(userId) {
        const [[weightStats]] = await pool.query(
            'SELECT weight_kg FROM fitness_progress WHERE user_id = ? AND weight_kg IS NOT NULL ORDER BY recorded_date DESC LIMIT 1',
            [userId]
        );

        const [[workoutStats]] = await pool.query(
            'SELECT SUM(duration_minutes) as total_minutes, SUM(calories_burned) as total_calories FROM fitness_progress WHERE user_id = ? AND recorded_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
            [userId]
        );

        return {
            weight_kg: weightStats ? weightStats.weight_kg : null,
            totalMinutes30Days: workoutStats && workoutStats.total_minutes ? workoutStats.total_minutes : 0,
            totalCalories30Days: workoutStats && workoutStats.total_calories ? workoutStats.total_calories : 0
        };
    }

    static async getAdminStats() {
        const [[totalMessages]] = await pool.query('SELECT COUNT(*) as count FROM chat_messages');
        const [[totalUsers]] = await pool.query('SELECT COUNT(DISTINCT user_id) as count FROM chat_messages');
        const [[todayMessages]] = await pool.query('SELECT COUNT(*) as count FROM chat_messages WHERE created_at >= CURRENT_DATE');
        const [[totalRecs]] = await pool.query('SELECT COUNT(*) as count FROM ai_recommendations');

        const [usageByDay] = await pool.query(
            `SELECT DATE(created_at) as date, COUNT(*) as count FROM ai_usage_log
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY date ORDER BY date`
        );

        const [flaggedConversations] = await pool.query(
            `SELECT cm.*, u.full_name, u.email FROM chat_messages cm
             JOIN users u ON cm.user_id = u.user_id
             WHERE cm.message ILIKE '%help%' OR cm.message ILIKE '%support%' OR cm.message ILIKE '%complaint%'
             ORDER BY cm.created_at DESC LIMIT 20`
        );

        return {
            totalMessages: totalMessages.count,
            totalUsers: totalUsers.count,
            todayMessages: todayMessages.count,
            totalRecommendations: totalRecs.count,
            usageByDay,
            flaggedConversations
        };
    }
}

module.exports = ChatService;
