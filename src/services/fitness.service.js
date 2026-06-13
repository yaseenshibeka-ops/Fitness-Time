const pool = require('../config/database');

class FitnessService {
    static async recordProgress(userId, progressData) {
        const { weight_kg, height_cm, body_fat_pct, chest_cm, waist_cm, hips_cm, biceps_cm, workout_type, duration_minutes, calories_burned, notes, recorded_date } = progressData;

        const [result] = await pool.query(
            `INSERT INTO fitness_progress 
            (user_id, weight_kg, height_cm, body_fat_pct, chest_cm, waist_cm, hips_cm, biceps_cm, workout_type, duration_minutes, calories_burned, notes, recorded_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, weight_kg, height_cm, body_fat_pct, chest_cm, waist_cm, hips_cm, biceps_cm, workout_type, duration_minutes, calories_burned, notes, recorded_date]
        );

        return { progressId: result.insertId, message: 'Progress recorded successfully' };
    }

    static async getProgressHistory(userId, query = {}) {
        const { from, to, limit, offset } = query;
        let sql = 'SELECT * FROM fitness_progress WHERE user_id=?';
        const params = [userId];
        if (from) { sql += ' AND recorded_date>=?'; params.push(from); }
        if (to) { sql += ' AND recorded_date<=?'; params.push(to); }
        sql += ' ORDER BY recorded_date DESC';
        if (limit) { sql += ' LIMIT ?'; params.push(parseInt(limit)); }
        if (offset) { sql += ' OFFSET ?'; params.push(parseInt(offset)); }
        const [progress] = await pool.query(sql, params);
        return progress;
    }

    static async setGoal(userId, goalData) {
        const { goal_type, target_value, unit, deadline } = goalData;

        const [result] = await pool.query(
            `INSERT INTO fitness_goals (user_id, goal_type, target_value, unit, deadline) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, goal_type, target_value, unit, deadline]
        );

        return { goalId: result.insertId, message: 'Goal set successfully' };
    }

    static async getGoals(userId) {
        const [goals] = await pool.query(
            'SELECT * FROM fitness_goals WHERE user_id = ? ORDER BY deadline ASC',
            [userId]
        );
        return goals;
    }

    static async deleteProgress(progressId, userId) {
        await pool.query('DELETE FROM fitness_progress WHERE progress_id=? AND user_id=?', [progressId, userId]);
        return { message: 'Progress record deleted' };
    }

    static async updateProgress(progressId, userId, progressData) {
        const { weight_kg, height_cm, body_fat_pct, chest_cm, waist_cm, hips_cm, biceps_cm, workout_type, duration_minutes, calories_burned, notes, recorded_date } = progressData;
        await pool.query(
            `UPDATE fitness_progress 
             SET weight_kg=?, height_cm=?, body_fat_pct=?, chest_cm=?, waist_cm=?, hips_cm=?, biceps_cm=?, workout_type=?, duration_minutes=?, calories_burned=?, notes=?, recorded_date=?
             WHERE progress_id=? AND user_id=?`,
            [weight_kg, height_cm, body_fat_pct, chest_cm, waist_cm, hips_cm, biceps_cm, workout_type, duration_minutes, calories_burned, notes, recorded_date, progressId, userId]
        );
        return { message: 'Progress record updated successfully' };
    }

    static async getDashboardStats(userId) {
        // Simple stats aggregation
        const [[weightStats]] = await pool.query(
            'SELECT weight_kg FROM fitness_progress WHERE user_id = ? AND weight_kg IS NOT NULL ORDER BY recorded_date DESC LIMIT 1',
            [userId]
        );
        
        const [[workoutStats]] = await pool.query(
            'SELECT SUM(duration_minutes) as total_minutes, SUM(calories_burned) as total_calories FROM fitness_progress WHERE user_id = ? AND recorded_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
            [userId]
        );

        return {
            currentWeight: weightStats ? weightStats.weight_kg : null,
            totalMinutes30Days: workoutStats && workoutStats.total_minutes ? workoutStats.total_minutes : 0,
            totalCalories30Days: workoutStats && workoutStats.total_calories ? workoutStats.total_calories : 0
        };
    }
}

module.exports = FitnessService;
