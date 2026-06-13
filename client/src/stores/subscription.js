import { ref } from 'vue'
import api from '../services/api'

export function useSubscriptionStore() {
  const current = ref(null)
  const loading = ref(false)

  async function fetchCurrent() {
    loading.value = true
    try {
      const res = await api.get('/subscriptions/current')
      current.value = res.data.subscription
    } catch (e) { current.value = null }
    finally { loading.value = false }
    return current.value
  }

  async function subscribe(planType) {
    await api.post('/subscriptions', { planType })
    await fetchCurrent()
  }

  async function cancel(id) {
    await api.post(`/subscriptions/${id}/cancel`)
    await fetchCurrent()
  }

  return { current, loading, fetchCurrent, subscribe, cancel }
}
