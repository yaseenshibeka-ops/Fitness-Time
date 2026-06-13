import { ref } from 'vue'
import api from '../services/api'

export function usePaymentStore() {
  const payments = ref([])
  const loading = ref(false)

  async function fetchPayments(params = {}) {
    loading.value = true
    try {
      const res = await api.get('/payments/history', { params })
      payments.value = res.data.payments || []
    } catch (e) { console.error(e) }
    finally { loading.value = false }
    return payments.value
  }

  return { payments, loading, fetchPayments }
}
