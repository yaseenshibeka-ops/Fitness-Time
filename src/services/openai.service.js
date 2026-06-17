const pool = require('../config/database');

const MAX_RETRIES = 2;

function getPlanLabel(subscription) {
    const plan = (subscription?.plan_type || 'basic').toLowerCase();
    if (!subscription || subscription.status !== 'active') return 'free';
    return plan;
}

function getGoalTypes(goals) {
    return (goals || []).map(g => (g.goal_type || '').toLowerCase());
}

function classifyIntent(message) {
    const m = message.toLowerCase();
    if (/\b(workout|exercise|train|gym|routine|plan|session)\b/.test(m)) return 'workout';
    if (/\b(eat|food|diet|nutrition|protein|calorie|meal|vitamin|supplement)\b/.test(m)) return 'nutrition';
    if (/\b(lose|weight|fat|loss|slim|belly)\b/.test(m)) return 'weight_loss';
    if (/\b(gain|muscle|bulk|build|strength)\b/.test(m)) return 'muscle_gain';
    if (/\b(product|buy|shop|equipment|gear|dumbbell|band|mat)\b/.test(m)) return 'products';
    if (/\b(recover|rest|sleep|sore|injury|pain|stretch|mobility)\b/.test(m)) return 'recovery';
    if (/\b(motivat|quote|encourage|keep|inspire|determin)\b/.test(m)) return 'motivation';
    if (/\b(progress|track|log|history|measure|weight|stats|chart)\b/.test(m)) return 'progress';
    if (/\b(subscription|plan|price|cost|upgrade|premium|basic|annual|pay)\b/.test(m)) return 'subscription';
    if (/\b(hello|hi|hey|good morning|good evening|howdy)\b/.test(m)) return 'greeting';
    if (/\b(help|what can you|capabilities|features|do you do)\b/.test(m)) return 'help';
    return 'general';
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
}

const productByGoal = {
    weight_loss: ['resistance bands', 'cardio equipment like jump ropes', 'fitness trackers'],
    muscle_gain: ['dumbbells', 'protein supplements', 'weight benches', 'barbells'],
    general: ['yoga mats', 'adjustable benches', 'resistance bands', 'foam rollers'],
    endurance: ['treadmills', 'exercise bikes', 'rowing machines'],
    flexibility: ['yoga mats', 'stretch straps', 'massage guns']
};

function generateFallback(message, subscription, goals, recentWorkouts, progress) {
    const intent = classifyIntent(message);
    const plan = getPlanLabel(subscription);
    const goalTypes = getGoalTypes(goals);

    let weightTrend = null;
    if (recentWorkouts && recentWorkouts.length >= 2) {
        const weights = recentWorkouts.filter(w => w.weight_kg != null).map(w => parseFloat(w.weight_kg));
        if (weights.length >= 2) {
            const diff = weights[weights.length - 1] - weights[0];
            const days = Math.max(1, (new Date(recentWorkouts[0].recorded_date) - new Date(recentWorkouts[recentWorkouts.length - 1].recorded_date)) / 86400000);
            weightTrend = { diff: Math.round(diff * 100) / 100, weeklyRate: Math.round((diff / days) * 7 * 100) / 100 };
        }
    }

    const isPersonalized = plan === 'premium' || plan === 'annual';

    switch (intent) {
        case 'greeting':
            return `${getGreeting()}! I'm FitBot, your AI fitness assistant. I can help with workout plans, nutrition advice, product recommendations, and tracking your progress. How can I help you today?`;

        case 'help':
            return `I'm FitBot, your personal AI fitness coach. Here's what I can do:\n\n` +
                (plan === 'free'
                    ? `- Answer general fitness and nutrition questions\n- Guide you through using FitTrack Rwanda\n- Explain exercises and techniques\n\n💡 Upgrade to Premium for personalized workout plans and nutrition advice!`
                    : `- Generate personalized workout plans\n- Provide nutrition recommendations\n- Suggest products from our store\n- Analyze your progress\n- Give recovery tips\n- Keep you motivated!\n\nJust ask me anything about fitness!`);

        case 'workout':
            if (plan === 'free') {
                return `Here are some general workout guidelines:\n\n` +
                    `• Aim for 150+ minutes of moderate cardio per week\n• Include strength training 2-3x/week\n• Warm up for 5-10 min before each session\n• Stay hydrated and rest between sets\n\n` +
                    `🎯 Upgrade to Premium to get a personalized workout plan tailored to your goals and fitness level!`;
            }
            const goalForWorkout = goalTypes.find(g => g.includes('weight') || g.includes('muscle') || g.includes('strength'));
            if (goalForWorkout?.includes('weight') || goalForWorkout?.includes('loss')) {
                return `Based on your weight loss goal, here's a recommended weekly plan:\n\n` +
                    `• Cardio: 4 sessions/week (45-60 min each)\n• Strength: 2 sessions/week (full body)\n• HIIT: 1 session/week\n\n` +
                    (progress?.totalMinutes30Days
                        ? `You've done ${progress.totalMinutes30Days} min in the last 30 days. Try to reach 300+ min/month for optimal results.`
                        : `Start with 3 sessions/week and gradually increase intensity.`) +
                    `\n\n🏋️ Products to consider: resistance bands and jump ropes from our store.`;
            }
            if (goalForWorkout?.includes('muscle') || goalForWorkout?.includes('gain')) {
                return `Based on your muscle gain goal, here's a recommended plan:\n\n` +
                    `• Strength training: 4 sessions/week (push/pull/legs split)\n• Progressive overload: increase weight by 2.5-5kg weekly\n• Rest 48 hours between same muscle groups\n\n` +
                    `💪 Products to consider: dumbbells, protein supplements, and weight benches from our store.`;
            }
            return `A balanced workout routine includes:\n\n` +
                `• Cardio: 3-4 days/week (running, cycling, swimming)\n• Strength: 2-3 days/week (bodyweight or weights)\n• Flexibility: daily stretching (5-10 min)\n\n` +
                `Log your workouts in FitTrack to track your progress!`;

        case 'nutrition':
            if (plan === 'free') {
                return `General nutrition tips:\n\n` +
                    `• Eat a balanced diet with protein, carbs, and healthy fats\n• Stay hydrated (2-3L water daily)\n• Eat whole foods over processed foods\n• Consider 1.6-2.2g protein per kg of bodyweight\n\n` +
                    `🥗 Upgrade to Premium for personalized meal plans and nutrition advice!`;
            }
            const target = goals?.find(g => g.goal_type?.toLowerCase().includes('weight'));
            if (target) {
                return `Based on your ${target.target_value > (progress?.weight_kg || 0) ? 'muscle gain' : 'weight loss'} goal:\n\n` +
                    `• ${target.target_value > (progress?.weight_kg || 0) ? 'Caloric surplus: +300-500 calories/day' : 'Caloric deficit: -300-500 calories/day'}\n` +
                    `• Protein: 1.6-2.2g per kg of bodyweight\n• Prioritize whole foods\n• Pre-workout: carbs + protein 1-2 hours before\n\n` +
                    `Log your meals alongside workouts for better insights!`;
            }
            return `Here are balanced nutrition guidelines:\n\n` +
                `• Protein: 1.6-2.2g/kg bodyweight daily\n• Carbs: 3-5g/kg (more on training days)\n• Fats: 0.8-1.2g/kg daily\n• Fiber: 25-35g daily\n\n` +
                `Supplements like protein powder can help meet your goals. Check our store!`;

        case 'weight_loss':
            if (plan === 'free') {
                return `🎯 Tips for weight loss:\n\n` +
                    `• Create a calorie deficit of 300-500 calories/day\n• Cardio 4-5x/week (45-60 min sessions)\n• Strength training 2x/week to preserve muscle\n• Eat protein with every meal\n• Sleep 7-9 hours\n\n` +
                    `Upgrade to Premium for a personalized weight loss plan with meal recommendations and progress tracking!`;
            }
            return `Based on your profile:\n\n` +
                `${progress?.weight_kg ? `Your current weight is ${progress.weight_kg}kg. ` : ''}` +
                `${weightTrend ? `You're trending ${weightTrend.diff < 0 ? 'down' : 'up'} ${Math.abs(weightTrend.diff)}kg (${Math.abs(weightTrend.weeklyRate)}kg/week). ` : ''}` +
                `Key recommendations:\n• Maintain a 400-500 calorie deficit\n• Mix steady-state cardio with HIIT\n• Track your meals and workouts\n` +
                `${progress?.totalMinutes30Days ? `You've logged ${progress.totalMinutes30Days} min this month. Great consistency!` : 'Start logging your workouts to see progress trends.'}`;

        case 'muscle_gain':
            if (plan === 'free') {
                return `💪 Tips for muscle gain:\n\n` +
                    `• Eat in a calorie surplus (+300-500 cal/day)\n• Consume 1.6-2.2g protein per kg bodyweight\n• Lift heavy with progressive overload\n• Train each muscle group 2x/week\n• Get 7-9 hours of sleep\n\n` +
                    `Upgrade to Premium for a personalized muscle-building plan!`;
            }
            return `Based on your muscle gain goal:\n\n` +
                `• Focus on compound lifts (squat, deadlift, bench, row, overhead press)\n• Progressive overload: add 2.5-5kg per week\n• 4-5 strength sessions per week\n• Protein target: ${progress?.weight_kg ? Math.round(progress.weight_kg * 2) + 'g' : '120-160g'} daily\n` +
                `💪 Check out our dumbbells and protein supplements in the store!`;

        case 'recovery':
            return `Recovery is essential for progress:\n\n` +
                `• Sleep 7-9 hours per night\n• Active recovery: light walking or stretching on rest days\n• Foam rolling and stretching after workouts\n• Stay hydrated\n• Consider taking 1-2 rest days per week\n\n` +
                `🛒 Foam rollers and stretch straps available in our store!`;

        case 'motivation':
            return `💪 You've got this!\n\n` +
                `${progress?.totalMinutes30Days ? `You've trained ${progress.totalMinutes30Days} minutes this month alone! ` : ''}` +
                `Every workout brings you closer to your goals. Consistency beats perfection.\n\n` +
                `"The only bad workout is the one that didn't happen."\n\n` +
                `Keep showing up. Track your progress and celebrate small wins! 🎯`;

        case 'products':
            const primaryGoal = goalTypes.find(g => Object.keys(productByGoal).some(k => g.includes(k))) || 'general';
            const key = Object.keys(productByGoal).find(k => primaryGoal.includes(k)) || 'general';
            const items = productByGoal[key];
            return `Based on your ${key.replace('_', ' ')} goals, here are recommended products from FitTrack store:\n\n` +
                items.map(item => `• ${item}`).join('\n') +
                `\n\nBrowse our full catalog at /products for more options!`;

        case 'subscription':
            return `Here are our plans:\n\n📋 Basic: 10,000 RWF/month - General fitness tracking\n⭐ Premium: 25,000 RWF/month - Personalized plans & recommendations\n👑 Annual: 250,000 RWF/year - All Premium + advanced analytics & predictive insights\n\n` +
                `You're currently on the ${plan === 'free' ? 'Free tier' : plan + ' plan'}. ` +
                (plan === 'free' ? 'Upgrade to unlock personalized features!' : 'Check /subscriptions to manage your plan.');

        case 'progress':
            if (plan === 'free') {
                return `You can view your basic progress on your dashboard. 📊\n\n` +
                    `Upgrade to Premium for detailed insights including:\n• Weight trends\n• Workout analytics\n• Goal progress tracking\n• Personalized recommendations`;
            }
            let progMsg = `Here's your progress summary:\n\n`;
            if (progress?.weight_kg) progMsg += `⚖️ Current weight: ${progress.weight_kg}kg\n`;
            if (progress?.totalMinutes30Days) progMsg += `⏱️ Total training (30 days): ${progress.totalMinutes30Days} min\n`;
            if (progress?.totalCalories30Days) progMsg += `🔥 Calories burned (30 days): ${progress.totalCalories30Days} cal\n`;
            if (weightTrend) progMsg += `📈 Trend: ${weightTrend.diff < 0 ? 'Losing' : 'Gaining'} ${Math.abs(weightTrend.diff)}kg over recent period (${Math.abs(weightTrend.weeklyRate)}kg/week)\n`;
            if (plan === 'annual' && weightTrend && goals?.length) {
                const wGoal = goals.find(g => g.goal_type?.toLowerCase().includes('weight'));
                if (wGoal && weightTrend.weeklyRate !== 0) {
                    const weeksToGoal = Math.abs((parseFloat(wGoal.target_value) - (progress?.weight_kg || 0)) / weightTrend.weeklyRate);
                    if (isFinite(weeksToGoal) && weeksToGoal > 0) {
                        progMsg += `🎯 Projected to reach your target of ${wGoal.target_value}kg in ~${Math.round(weeksToGoal)} weeks (${new Date(Date.now() + weeksToGoal * 7 * 86400000).toLocaleDateString()})\n`;
                    }
                }
            }
            progMsg += `\nKeep up the great work! 💪`;
            return progMsg;

        default:
            return `I'm here to help with fitness, nutrition, workouts, and product recommendations! 🤖\n\n` +
                `Try asking me about:\n• Workout routines 🏋️\n• Nutrition advice 🥗\n• Weight loss or muscle gain 💪\n• Recovery tips 🧘\n• Product recommendations 🛒\n• Your progress stats 📊\n\n` +
                `How can I assist you today?`;
    }
}

class OpenAIService {
    static async generateResponse(userMessage, subscription, goals, recentWorkouts, progress) {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return generateFallback(userMessage, subscription, goals, recentWorkouts, progress);
        }

        const systemPrompt = this.buildSystemPrompt(subscription, goals, recentWorkouts, progress);

        let lastError;
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userMessage }
                        ],
                        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '300', 10),
                        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7')
                    })
                });

                if (!response.ok) {
                    const errBody = await response.text();
                    throw new Error(`OpenAI API error ${response.status}: ${errBody}`);
                }

                const data = await response.json();
                const reply = data.choices?.[0]?.message?.content?.trim() || "I'm not sure how to respond to that. Can you rephrase?";
                return reply;

            } catch (error) {
                lastError = error;
                if (attempt < MAX_RETRIES) {
                    await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                }
            }
        }

        console.error('OpenAI call failed after retries:', lastError);
        return generateFallback(userMessage, subscription, goals, recentWorkouts, progress);
    }

    static buildSystemPrompt(subscription, goals, recentWorkouts, progress) {
        let prompt = `You are FitBot, an AI fitness assistant for FitTrack Rwanda. You help users with fitness, nutrition, and wellness advice. You have access to the user's subscription plan and fitness data.

Key rules:
- Be encouraging, concise, and practical.
- Only provide advice within safe, general fitness knowledge. Never give medical advice.
- Keep responses under 200 words unless the user asks for detailed information.
- For product recommendations, mention specific types of products available in the FitTrack store (resistance bands, dumbbells, yoga mats, protein supplements, cardio equipment, adjustable benches).
- Encourage users to log their workouts and track progress using FitTrack Rwanda.
- If the user asks about pricing or subscriptions, explain the Basic (10,000 RWF/month), Premium (25,000 RWF/month), and Annual (250,000 RWF/year) plans.`;

        const planType = (subscription?.plan_type || 'basic').toLowerCase();

        if (planType === 'basic' || !subscription || subscription.status !== 'active') {
            prompt += `\n\nUser subscription: Free/Basic\n- Provide only general fitness advice and information.\n- Do NOT provide personalized workout plans, diet plans, or recommendations based on their data.\n- Encourage upgrading to Premium for personalized recommendations.\n- You may answer general questions about exercises, nutrition, and fitness concepts.`;
        } else if (planType === 'premium') {
            prompt += `\n\nUser subscription: Premium\n- Provide personalized workout recommendations, nutrition tips, and fitness advice based on their goals and history.\n- Suggest products from FitTrack store that match their fitness goals.\n- Analyze their progress data and provide insights.`;
            if (goals?.length) {
                prompt += `\nUser goals: ${goals.map(g => `${g.goal_type} (target: ${g.target_value} ${g.unit || ''}, deadline: ${g.deadline || 'not set'})`).join(', ')}`;
            }
            if (recentWorkouts?.length) {
                const recent = recentWorkouts.slice(0, 5);
                prompt += `\nRecent activity (last 5 entries): ${recent.map(w => `${w.workout_type || 'workout'} - ${w.duration_minutes || 0}min, ${w.calories_burned || 0} cal`).join(' | ')}`;
            }
            if (progress) {
                prompt += `\nCurrent stats: Weight=${progress.weight_kg || 'N/A'}kg, Total workouts last 30 days=${progress.totalMinutes30Days || 0}min, Calories=${progress.totalCalories30Days || 0}`;
            }
        } else if (planType === 'annual') {
            prompt += `\n\nUser subscription: Annual (VIP)\n- Provide advanced coaching with long-term fitness strategies.\n- Offer predictive insights about progress based on trends.\n- Suggest seasonal training programs.\n- Provide detailed analysis of their data and projections.\n- Recommend products from FitTrack store.`;
            if (goals?.length) {
                prompt += `\nUser goals: ${goals.map(g => `${g.goal_type} (target: ${g.target_value} ${g.unit || ''}, current: ${g.current_value || 0}, deadline: ${g.deadline || 'not set'})`).join(', ')}`;
            }
            if (recentWorkouts?.length) {
                const recent = recentWorkouts.slice(0, 10);
                prompt += `\nRecent activity: ${recent.map(w => `${w.recorded_date}: ${w.workout_type || 'workout'} ${w.duration_minutes || 0}min, ${w.calories_burned || 0} cal`).join(' | ')}`;
            }
            if (progress) {
                prompt += `\nCurrent stats: Weight=${progress.weight_kg || 'N/A'}kg, Total time=${progress.totalMinutes30Days || 0}min, Calories=${progress.totalCalories30Days || 0}`;
                prompt += `\nProvide projections: if they maintain consistency, predict when they will reach their goals.`;
            }
        }

        return prompt;
    }

    static async generateRecommendation(userId, subscription, goals, recentWorkouts, progress) {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            const plan = getPlanLabel(subscription);
            if (plan === 'free') return null;

            const goalTypes = getGoalTypes(goals);
            const primary = goalTypes.find(g => g) || 'general';

            const rec = {
                type: 'workout',
                title: plan === 'annual' ? 'Advanced Weekly Strategy' : 'Personalized Workout Plan',
                description: plan === 'annual'
                    ? 'Based on your long-term data, focus on progressive overload and periodization. Alternate between strength and hypertrophy blocks every 4 weeks.'
                    : `Based on your ${primary} goals and recent activity, aim for 4 sessions/week mixing cardio and strength training.`
            };

            const [result] = await pool.query(
                `INSERT INTO ai_recommendations (user_id, recommendation_type, recommendation_text, metadata)
                 VALUES (?, ?, ?, ?)`,
                [userId, rec.type, rec.description, JSON.stringify(rec)]
            );

            return { recommendationId: result.insertId, ...rec };
        }

        const systemPrompt = this.buildSystemPrompt(subscription, goals, recentWorkouts, progress);

        try {
            const userContext = `Based on the user's data above, generate a specific actionable recommendation. Format as JSON: {"type": "workout|nutrition|product|progress", "title": "short title", "description": "detailed recommendation (2-3 sentences)"}`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userContext }
                    ],
                    max_tokens: 250,
                    temperature: 0.7
                })
            });

            if (!response.ok) return null;

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content?.trim();
            if (!content) return null;

            let parsed;
            try {
                parsed = JSON.parse(content);
            } catch {
                parsed = { type: 'workout', title: 'Recommendation', description: content };
            }

            const [result] = await pool.query(
                `INSERT INTO ai_recommendations (user_id, recommendation_type, recommendation_text, metadata)
                 VALUES (?, ?, ?, ?)`,
                [userId, parsed.type || 'general', parsed.description || content, JSON.stringify(parsed)]
            );

            return { recommendationId: result.insertId, ...parsed };
        } catch (error) {
            console.error('Error generating recommendation:', error);
            return null;
        }
    }

    static async logUsage(userId, action, tokensUsed = 0, model = 'gpt-3.5-turbo') {
        try {
            await pool.query(
                `INSERT INTO ai_usage_log (user_id, action, tokens_used, model) VALUES (?, ?, ?, ?)`,
                [userId, action, tokensUsed, model]
            );
        } catch (err) {
            console.error('Failed to log AI usage:', err);
        }
    }
}

module.exports = OpenAIService;
