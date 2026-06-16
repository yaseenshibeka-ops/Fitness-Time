<template>
  <div class="chat-page container py-4" style="padding-top: 80px;">
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="chat-main glass-card">
          <ChatWindow :embedded="true" />
        </div>
      </div>

      <div class="col-lg-4">
        <div class="d-flex flex-column gap-4">
          <SubscriptionUpgradeBanner
            :subscription="subscription"
            :dismissed="bannerDismissed"
            @dismiss="bannerDismissed = true"
          />

          <div class="glass-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h6 class="fw-bold mb-0"><i class="bi bi-lightning-charge me-1 text-accent"></i> Quick Actions</h6>
            </div>
            <div class="d-flex flex-column gap-2">
              <button v-for="action in quickActions" :key="action.label" class="btn btn-outline-primary btn-sm text-start d-flex align-items-center gap-2" @click="handleQuickAction(action)">
                <i :class="action.icon" style="width:18px;"></i>
                <span>{{ action.label }}</span>
              </button>
            </div>
          </div>

          <RecommendationCards
            title="Workout Recommendations"
            :items="workoutRecs"
            :loading="workoutLoading"
            :on-refresh="fetchWorkoutRecs"
            :on-generate-workout="() => handleQuickAction(quickActions[0])"
          />

          <RecommendationCards
            title="Product Suggestions"
            :items="productRecs"
            :loading="productLoading"
            :on-refresh="fetchProductRecs"
          />

          <RecommendationCards
            title="Progress Insights"
            :items="progressInsights"
            :loading="progressLoading"
            :on-refresh="fetchProgressInsights"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { chat } from '../stores/chat'
import { useSubscriptionStore } from '../stores/subscription'
import api from '../services/api'
import ChatWindow from '../components/ChatWindow.vue'
import RecommendationCards from '../components/RecommendationCards.vue'
import SubscriptionUpgradeBanner from '../components/SubscriptionUpgradeBanner.vue'

const subStore = useSubscriptionStore()
const subscription = ref(null)
const bannerDismissed = ref(false)

const workoutRecs = ref([])
const productRecs = ref([])
const progressInsights = ref([])
const workoutLoading = ref(false)
const productLoading = ref(false)
const progressLoading = ref(false)

const quickActions = [
  { label: 'Generate Workout Plan', icon: 'bi bi-activity', action: 'workout' },
  { label: 'View Progress Summary', icon: 'bi bi-graph-up', action: 'progress' },
  { label: 'Recommend Products', icon: 'bi bi-cart', action: 'products' },
  { label: 'Ask Nutrition Questions', icon: 'bi bi-cup-hot', action: 'nutrition' },
  { label: 'Renew Subscription', icon: 'bi bi-star', action: 'renew' },
]

onMounted(async () => {
  if (chat.messages.length === 0) chat.fetchHistory()
  const sub = await subStore.fetchCurrent()
  subscription.value = sub
  fetchWorkoutRecs()
  fetchProductRecs()
  fetchProgressInsights()
})

async function fetchWorkoutRecs() {
  workoutLoading.value = true
  try {
    const res = await api.get('/recommendations/workouts')
    workoutRecs.value = res.data.recommendations || []
  } catch (e) { console.error(e) }
  finally { workoutLoading.value = false }
}

async function fetchProductRecs() {
  productLoading.value = true
  try {
    const res = await api.get('/recommendations/products')
    productRecs.value = res.data.recommendations || []
  } catch (e) { console.error(e) }
  finally { productLoading.value = false }
}

async function fetchProgressInsights() {
  progressLoading.value = true
  try {
    const res = await api.get('/recommendations/progress')
    progressInsights.value = res.data.insights || []
  } catch (e) { console.error(e) }
  finally { progressLoading.value = false }
}

function handleQuickAction(action) {
  const prompts = {
    workout: 'Create a personalized workout plan for me based on my fitness goals.',
    progress: 'Give me a summary of my recent fitness progress and insights.',
    products: 'What fitness products do you recommend from the FitTrack store for my goals?',
    nutrition: 'Give me some nutrition tips to support my fitness journey.',
    renew: 'Tell me about the subscription plans and how to renew.',
  }
  chat.sendMessage(prompts[action.action] || prompts.workout)
}
</script>

<style scoped>
.chat-page {
  min-height: calc(100vh - 60px);
}

.chat-main {
  height: calc(100vh - 100px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-main .chat-window {
  height: 100%;
}
</style>
