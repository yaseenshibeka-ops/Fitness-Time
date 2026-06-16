# AI Fitness Chat Assistant - Deployment Guide

## Overview

The AI Fitness Chat Assistant (FitBot) is a conversational AI system integrated into FitTrack Rwanda. It provides personalized fitness guidance, product recommendations, and progress insights based on the user's subscription plan.

## Architecture

```
Client (Vue.js)
  ├── ChatWidget.vue     - Floating chat icon (bottom-right)
  ├── ChatWindow.vue     - Chat message UI (embedded or full-screen)
  ├── ChatPage.vue       - Full-page chat with recommendations sidebar
  ├── RecommendationCards.vue  - Display recommendations
  └── SubscriptionUpgradeBanner.vue - Upgrade prompts

Server (Node.js/Express)
  ├── services/openai.service.js       - OpenAI API integration
  ├── services/chat.service.js         - Chat message handling
  ├── services/recommendation.service.js - Recommendation engine
  ├── controllers/chat.controller.js   - Chat REST endpoints
  ├── controllers/recommendation.controller.js - Recommendation endpoints
  └── routes/chat.routes.js, recommendation.routes.js - Route definitions

Database (PostgreSQL)
  ├── chat_messages     - Stores user and bot messages
  ├── ai_recommendations - Stores generated recommendations
  └── ai_usage_log      - Tracks AI API usage
```

## Prerequisites

1. **OpenAI API Key** - Get one at https://platform.openai.com/api-keys
2. **Node.js 18+** or Docker

## Installation

### 1. Environment Variables

Add to your `.env` file:

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=300
OPENAI_TEMPERATURE=0.7
```

### 2. Database Migration

Run the migration to create the new tables:

```bash
npm run migrate
```

This creates the following tables:
- `chat_messages` - Stores all chat messages (user and bot)
- `ai_recommendations` - Stores AI-generated recommendations
- `ai_usage_log` - Tracks API usage for admin analytics

### 3. Start the Application

```bash
npm run dev
```

Or with Docker:

```bash
docker compose up --build
```

The AI Assistant is accessible at `/chat` (requires authentication).

## API Endpoints

### Chat
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/chat/history` | Get chat history (paginated) | JWT |
| POST | `/api/chat/message` | Send a message and get AI response | JWT |
| GET | `/api/chat/admin/stats` | Get AI usage statistics | Admin |

### Recommendations
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/recommendations/workouts` | Get personalized workout recommendations | JWT |
| GET | `/api/recommendations/products` | Get product recommendations from store | JWT |
| GET | `/api/recommendations/progress` | Get progress insights and projections | JWT |

### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/ai-stats` | Get AI assistant usage statistics | Admin |

## Subscription-Based Behavior

### Free/Basic Users
- General fitness information only
- No personalized recommendations
- Upgrade prompts shown
- System prompt: "Provide only general fitness advice"

### Premium Users (25,000 RWF/month)
- Personalized workout and nutrition recommendations
- Product suggestions based on goals
- Progress data analysis
- System prompt includes: goals, recent workouts, current stats

### Annual Users (250,000 RWF/year)
- All Premium features
- Long-term fitness strategies
- Predictive progress forecasting ("projected to reach target in X weeks")
- Seasonal training programs
- Advanced analytics with trend analysis

## Integration with FitTrack Store

The recommendation engine maps fitness goals to product categories:

| Goal | Recommended Products |
|------|-------------------|
| Weight Loss | Resistance bands, cardio equipment, jump ropes, fitness trackers |
| Muscle Gain | Dumbbells, protein supplements, weight benches, barbells |
| General Fitness | Yoga mats, adjustable benches, resistance bands, foam rollers |
| Endurance | Treadmills, exercise bikes, rowing machines, hydration packs |
| Flexibility | Yoga mats, stretch straps, foam rollers, massage guns |

Products are fetched from the `products` table based on name/description matches.

## Frontend Components

### ChatWidget.vue
- Floating action button (bottom-right)
- Toggles ChatWindow overlay
- Responsive: full-screen on mobile

### ChatWindow.vue
- Message display with bubbles
- Typing indicators
- Quick action buttons (Generate Workout, Progress Summary, etc.)
- Auto-scroll to latest message
- Embedded mode (in widget/page) support

### ChatPage.vue (Full-screen)
- Chat window on the left (8 columns)
- Right sidebar (4 columns) with:
  - Subscription upgrade banner
  - Quick action buttons
  - Workout recommendations card
  - Product suggestions card
  - Progress insights card

### RecommendationCards.vue
- Displays recommendations in glass cards
- Icons vary by type (workout, nutrition, product, progress)
- Product thumbnails and prices
- "Upgrade Now" CTA for free users

### SubscriptionUpgradeBanner.vue
- Shown to free/basic users
- Persistent across the chat page
- Dismissible

## Admin Dashboard

Accessible at `/admin/ai-assistant`:

- **Total Messages** - All-time chat message count
- **Active Users** - Unique users who have chatted
- **Today's Messages** - Messages sent today
- **Total Recommendations** - AI recommendations generated
- **AI Usage Chart** - Daily request volume (30-day)
- **Subscription Conversion** - Engagement-to-subscription metric
- **Flagged Conversations** - Messages containing help/support/complaint keywords

## Testing

```bash
npm test
```

Test files:
- `tests/chat.test.js` - Message validation, system prompt builder, subscription logic
- `tests/recommendations.test.js` - Product categories, progress insights, activity summaries
- `tests/api.test.js` - API endpoint validation

## Example Prompts

### Free User
```
User: "How can I lose weight?"
Bot: "To lose weight, focus on creating a calorie deficit through a combination of diet and exercise. General guidelines include:
- Eat whole, nutrient-dense foods
- Stay hydrated
- Aim for 150+ minutes of cardio per week
- Include strength training 2-3x/week
Upgrade to Premium to receive personalized workout and nutrition recommendations tailored to your goals and current fitness level!"
```

### Premium User (with weight loss goal)
```
User: "How can I lose weight?"
Bot: "Based on your goal to lose weight and your recent activity (3 cardio sessions, 45min avg), here's a personalized plan:
- Increase cardio to 4 sessions/week at 50min each
- Add 2 strength training sessions for muscle preservation
- Target: 500-calorie deficit per day
- Recommended products: resistance bands and jump rope from our store
Your last recorded weight was 78kg. Let's aim for 1kg loss every 2 weeks."
```

### Annual User (with weight loss goal + progress data)
```
User: "How can I lose weight?"
Bot: "I've analyzed your 8-week history. You're averaging 0.5kg loss per week with 4 sessions/week. At this rate:
- You're projected to reach your target weight of 72kg in approximately 10 weeks
- Recommended: Transition to HIIT for plateau breaking
- Consider our seasonal running program starting next month
- Add the FitTrack resistance bands (in your wishlist) for home sessions
Current trend: 78kg → 74kg over 8 weeks. Excellent consistency!"
```

## Security Considerations

1. **JWT Authentication** - All chat endpoints require valid JWT tokens
2. **User Isolation** - Users can only access their own chat history
3. **Rate Limiting** - API-wide rate limiting (100 requests/15 min)
4. **Input Validation** - Messages limited to 2000 chars, sanitized
5. **API Key Storage** - OPENAI_API_KEY stored as environment variable only
6. **SQL Injection Protection** - Parameterized queries throughout

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "AI assistant not configured" | Set `OPENAI_API_KEY` in `.env` |
| Chat history not loading | Run `npm run migrate` to create tables |
| Recommendations showing upgrade for premium users | Check user's subscription status in DB |
| OpenAI API errors | Check API key quota and billing at platform.openai.com |

## Performance Notes

- OpenAI calls have 2 retries with exponential backoff
- Chat history limited to 50 most recent messages by default
- System prompt builds include max 10 recent workouts
- Tokens capped at 300 per response (configurable via `OPENAI_MAX_TOKENS`)
