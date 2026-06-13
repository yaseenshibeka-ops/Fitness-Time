const pool = require('../config/database');

const PLAN_PRICES = {
    'basic': 10000,
    'premium': 25000,
    'annual': 250000
};

class SubscriptionService {
    static async createSubscription(userId, planType) {
        if (!PLAN_PRICES[planType]) {
            throw { statusCode: 400, message: 'Invalid plan type' };
        }

        const price = PLAN_PRICES[planType];
        
        // Calculate dates
        const startDate = new Date();
        const endDate = new Date();
        if (planType === 'annual') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        const [result] = await pool.query(
            `INSERT INTO subscriptions (user_id, plan_type, price, status, start_date, end_date)
             VALUES (?, ?, ?, 'pending', ?, ?)`,
            [userId, planType, price, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
        );

        return {
            subscriptionId: result.insertId,
            planType,
            price,
            status: 'pending',
            startDate,
            endDate
        };
    }

    static async getUserSubscription(userId) {
        const [subs] = await pool.query(
            'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            [userId]
        );
        return subs.length > 0 ? subs[0] : null;
    }

    static async cancelSubscription(userId, subscriptionId) {
        const [subs] = await pool.query('SELECT * FROM subscriptions WHERE subscription_id = ? AND user_id = ?', [subscriptionId, userId]);
        if (subs.length === 0) throw { statusCode: 404, message: 'Subscription not found' };

        await pool.query('UPDATE subscriptions SET status = "cancelled" WHERE subscription_id = ?', [subscriptionId]);
        return { message: 'Subscription cancelled successfully' };
    }
}

module.exports = SubscriptionService;
