const pool = require('../config/database');
const OpenAIService = require('./openai.service');

class RecommendationService {
    static async getWorkoutRecommendations(userId) {
        const subscription = await this.getUserSubscription(userId);
        if (!subscription || subscription.status !== 'active') {
            return [{
                type: 'upgrade',
                title: 'Upgrade for Personalized Workouts',
                description: 'Upgrade to Premium or Annual plan to receive personalized workout plans based on your goals and fitness level.',
                action: 'upgrade'
            }];
        }

        const goals = await this.getUserGoals(userId);
        const recentWorkouts = await this.getRecentWorkouts(userId);
        const progress = await this.getProgressSummary(userId);

        let rec = { type: 'workout', title: 'Weekly Workout Plan', description: '', action: 'generate' };

        const planType = (subscription.plan_type || 'basic').toLowerCase();
        if (planType === 'annual') {
            rec.description = 'Based on your long-term goals and progress trends, here\'s your advanced workout strategy. Focus on progressive overload and periodization.';
        } else {
            rec.description = 'Based on your goals and recent activity, here are tailored workout suggestions. Increase intensity gradually for best results.';
        }

        return [rec];
    }

    static async getProductRecommendations(userId) {
        const subscription = await this.getUserSubscription(userId);
        const goals = await this.getUserGoals(userId);
        const recipes = [];

        if (!subscription || subscription.status !== 'active') {
            recipes.push({
                type: 'product', title: 'Explore Our Store',
                description: 'Browse our catalog of fitness equipment and supplements to support your journey.',
                category: 'general'
            });
        }

        const categories = {
            'weight_loss': ['resistance bands', 'cardio equipment', 'jump ropes', 'fitness trackers'],
            'muscle_gain': ['dumbbells', 'protein supplements', 'weight benches', 'barbells'],
            'general_fitness': ['yoga mats', 'adjustable benches', 'resistance bands', 'foam rollers'],
            'endurance': ['treadmills', 'exercise bikes', 'rowing machines', 'hydration packs'],
            'flexibility': ['yoga mats', 'stretch straps', 'foam rollers', 'massage guns']
        };

        const primaryGoal = goals.length > 0 ? goals[0].goal_type.toLowerCase() : 'general_fitness';
        const goalKey = Object.keys(categories).find(k => primaryGoal.includes(k)) || 'general_fitness';
        const recommended = categories[goalKey];

        const [products] = await pool.query(
            `SELECT product_id, name, price, image_url FROM products WHERE is_active = TRUE
             AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)
             LIMIT 5`,
            [`%${recommended[0]}%`, `%${recommended[0]}%`]
        );

        if (products.length === 0) {
            const [allProducts] = await pool.query(
                'SELECT product_id, name, price, image_url FROM products WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 4'
            );
            recipes.push({
                type: 'product', title: 'Recommended Products',
                description: `Based on your interest in ${primaryGoal.replace('_', ' ')}, check out these popular items from our store.`,
                products: allProducts
            });
        } else {
            recipes.push({
                type: 'product', title: `Products for ${primaryGoal.replace('_', ' ')}`,
                description: `Enhance your ${primaryGoal.replace('_', ' ')} journey with these products.`,
                products
            });
        }

        return recipes;
    }

    static async getProgressInsights(userId) {
        const subscription = await this.getUserSubscription(userId);

        if (!subscription || subscription.status !== 'active') {
            return [{
                type: 'progress', title: 'Track Your Progress',
                description: 'Subscribe to Premium or Annual to get detailed progress insights, trends, and personalized recommendations.',
                action: 'upgrade'
            }];
        }

        const progress = await this.getProgressSummary(userId);
        const [recentWeights] = await pool.query(
            'SELECT weight_kg, recorded_date FROM fitness_progress WHERE user_id = ? AND weight_kg IS NOT NULL ORDER BY recorded_date ASC LIMIT 10',
            [userId]
        );

        const insights = [];

        if (progress.weight_kg) {
            insights.push({
                type: 'progress', title: 'Current Weight',
                description: `Your current weight is ${progress.weight_kg} kg. ${recentWeights.length > 1 ? 'Tracked consistently.' : 'Keep logging your weight to see trends.'}`
            });
        }

        if (progress.totalMinutes30Days > 0) {
            insights.push({
                type: 'progress', title: '30-Day Activity',
                description: `You've trained ${progress.totalMinutes30Days} minutes and burned ${progress.totalCalories30Days} calories in the last 30 days. ${progress.totalMinutes30Days >= 300 ? 'Great consistency!' : 'Try to reach 300 minutes per month for optimal results.'}`
            });
        }

        if (recentWeights.length >= 2 && subscription.plan_type === 'annual') {
            const first = parseFloat(recentWeights[0].weight_kg);
            const last = parseFloat(recentWeights[recentWeights.length - 1].weight_kg);
            const diff = last - first;
            const daysDiff = Math.max(1, (new Date(recentWeights[recentWeights.length - 1].recorded_date) - new Date(recentWeights[0].recorded_date)) / (1000 * 60 * 60 * 24));
            const weeklyRate = diff / (daysDiff / 7);

            insights.push({
                type: 'progress', title: 'Weight Trend',
                description: `Your weight has changed by ${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg over ${Math.round(daysDiff)} days (${weeklyRate > 0 ? '+' : ''}${weeklyRate.toFixed(2)} kg/week). ${Math.abs(weeklyRate) < 0.5 ? 'Steady progress. Keep going!' : 'Significant change detected.'}`
            });

            if (weeklyRate !== 0) {
                const goals = await this.getUserGoals(userId);
                const weightGoal = goals.find(g => g.goal_type.toLowerCase().includes('weight'));
                if (weightGoal && weeklyRate !== 0) {
                    const targetDiff = parseFloat(weightGoal.target_value) - last;
                    const weeksToGoal = Math.abs(targetDiff / weeklyRate);
                    insights.push({
                        type: 'progress', title: 'Goal Projection',
                        description: `At your current rate, you're projected to reach your target weight of ${weightGoal.target_value} kg in approximately ${Math.round(weeksToGoal)} weeks (by ${new Date(Date.now() + weeksToGoal * 7 * 86400000).toLocaleDateString()}).`
                    });
                }
            }
        }

        return insights;
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
}

module.exports = RecommendationService;
