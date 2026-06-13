<template>
  <div>
    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else>
      <div v-if="subscription" class="row g-4">
        <div class="col-md-6">
          <div class="glass-card p-4">
            <h5 class="fw-bold mb-3">Current Plan</h5>
            <div class="d-flex align-items-center gap-3 mb-3">
              <div style="width:60px;height:60px;border-radius:12px;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:1.8rem;"><i class="bi bi-star-fill"></i></div>
              <div>
                <h4 class="fw-bold mb-0 text-accent text-uppercase">{{ subscription.plan_type }}</h4>
                <span class="badge bg-success">{{ subscription.status }}</span>
              </div>
            </div>
            <table class="table table-dark table-sm">
              <tr><td>Price</td><td class="fw-bold">{{ Number(subscription.price).toLocaleString() }} RWF</td></tr>
              <tr><td>Start Date</td><td>{{ new Date(subscription.start_date).toLocaleDateString() }}</td></tr>
              <tr><td>End Date</td><td>{{ new Date(subscription.end_date).toLocaleDateString() }}</td></tr>
              <tr><td>Remaining Days</td><td class="fw-bold text-accent">{{ remainingDays }} days</td></tr>
            </table>
            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-outline-light" @click="cancelSub" :disabled="submitting">Cancel Subscription</button>
              <button class="btn btn-primary" @click="showUpgrade = true">Upgrade</button>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="glass-card p-4">
            <h5 class="fw-bold mb-3">Subscription Benefits</h5>
            <ul class="list-unstyled">
              <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Advanced progress tracking</li>
              <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Detailed fitness reports</li>
              <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Personalized recommendations</li>
              <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Priority support</li>
            </ul>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-5">
        <i class="bi bi-star display-1 text-muted" style="display:block;"></i>
        <h5 class="mt-3">No Active Subscription</h5>
        <p class="text-muted">Subscribe to unlock premium features.</p>
        <div class="row g-3 justify-content-center mt-3">
          <div v-for="plan in plans" :key="plan.name" class="col-md-4">
            <div class="glass-card p-4 text-center h-100" :class="plan.recommended ? 'border-accent' : ''">
              <h5 class="fw-bold">{{ plan.name }}</h5>
              <div class="display-6 fw-bold text-light my-3">{{ plan.price.toLocaleString() }} <small class="fs-6 text-muted">RWF</small></div>
              <ul class="list-unstyled text-start mb-3">
                <li v-for="f in plan.features" :key="f" class="mb-1 small"><i class="bi bi-check-circle-fill text-success me-1"></i>{{ f }}</li>
              </ul>
              <button class="btn w-100" :class="plan.recommended ? 'btn-primary' : 'btn-outline-light'" @click="subscribe(plan.slug)" :disabled="submitting">{{ plan.name === 'Premium' ? 'Upgrade' : 'Subscribe' }}</button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="msg" class="alert alert-success mt-3">{{ msg }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const subscription = ref(null)
const loading = ref(true)
const submitting = ref(false)
const msg = ref('')
const showUpgrade = ref(false)

const plans = [
  { name: 'Basic', slug: 'basic', price: 10000, features: ['Monthly progress tracking', 'Basic reports', 'Goal monitoring'] },
  { name: 'Premium', slug: 'premium', price: 25000, recommended: true, features: ['Advanced progress tracking', 'Detailed reports', 'Personalized recommendations', 'Priority support'] },
  { name: 'Annual', slug: 'annual', price: 250000, features: ['All Premium features', 'Best value', 'Year-long commitment', 'Exclusive content'] },
]

const remainingDays = computed(() => {
  if (!subscription.value?.end_date) return 0
  const diff = new Date(subscription.value.end_date) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

async function fetchSub() {
  try {
    const res = await api.get('/subscriptions/current')
    subscription.value = res.data.subscription
  } catch (e) { subscription.value = null }
  finally { loading.value = false }
}

async function subscribe(planType) {
  submitting.value = true
  try {
    await api.post('/subscriptions', { planType })
    msg.value = `Subscribed to ${planType} plan!`
    await fetchSub()
  } catch (e) { msg.value = 'Subscription failed' }
  finally { submitting.value = false }
}

async function cancelSub() {
  if (!confirm('Cancel your subscription?')) return
  submitting.value = true
  try {
    await api.post(`/subscriptions/${subscription.value.subscription_id}/cancel`)
    msg.value = 'Subscription cancelled'
    await fetchSub()
  } catch (e) { msg.value = 'Failed to cancel' }
  finally { submitting.value = false }
}

onMounted(fetchSub)
</script>
