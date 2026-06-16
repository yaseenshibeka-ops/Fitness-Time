const pool = require('../config/database');

const MAX_RETRIES = 2;

function buildSystemPrompt(subscription, goals, recentWorkouts, progress) {
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

class OpenAIService {
    static async generateResponse(userMessage, subscription, goals, recentWorkouts, progress) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return "I'm sorry, the AI assistant is not fully configured yet. Please contact support.";
        }

        const systemPrompt = buildSystemPrompt(subscription, goals, recentWorkouts, progress);

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
        return "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
    }

    static async generateRecommendation(userId, subscription, goals, recentWorkouts, progress) {
        const prompt = buildSystemPrompt(subscription, goals, recentWorkouts, progress);
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return null;

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
                        { role: 'system', content: prompt },
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
