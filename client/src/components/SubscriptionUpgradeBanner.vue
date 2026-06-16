<template>
  <div v-if="showBanner" class="upgrade-banner glass-card p-3 mb-4">
    <div class="d-flex align-items-center gap-3 flex-wrap">
      <div class="upgrade-icon">
        <i class="bi bi-gem"></i>
      </div>
      <div class="flex-grow-1 min-w-0">
        <h6 class="fw-bold mb-0">Unlock Premium Features</h6>
        <p class="small text-muted mb-0 mt-1">
          {{ message }}
        </p>
      </div>
      <div class="d-flex gap-2 flex-shrink-0">
        <button class="btn btn-sm btn-outline-secondary" @click="$emit('dismiss')">
          <i class="bi bi-x"></i> Dismiss
        </button>
        <router-link to="/subscriptions" class="btn btn-sm btn-primary">
          <i class="bi bi-star me-1"></i> Upgrade Now
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  subscription: { type: Object, default: null },
  dismissed: { type: Boolean, default: false }
})

defineEmits(['dismiss'])

const isActive = computed(() => props.subscription && props.subscription.status === 'active')
const plan = computed(() => props.subscription?.plan_type || 'basic')

const showBanner = computed(() => {
  if (props.dismissed) return false
  if (!isActive.value || plan.value === 'basic') return true
  return false
})

const message = computed(() => {
  if (!isActive.value) {
    return 'Subscribe to Premium or Annual to get personalized workout plans, nutrition advice, and product recommendations tailored to your goals.'
  }
  if (plan.value === 'basic') {
    return 'Upgrade to Premium for personalized fitness recommendations and detailed progress insights!'
  }
  return ''
})
</script>

<style scoped>
.upgrade-banner {
  border-left: 4px solid var(--accent-purple);
}

.upgrade-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-purple), var(--primary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
  flex-shrink: 0;
}
</style>
