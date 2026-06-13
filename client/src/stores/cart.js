import { ref } from 'vue'
import api from '../services/api'
import { auth } from './auth'

export const cart = {
  count: ref(0),

  async fetchCount() {
    if (!auth.isLoggedIn) {
      this.count.value = 0
      return
    }
    try {
      const res = await api.get('/cart')
      const items = res.data?.cart?.items || []
      this.count.value = items.reduce((sum, it) => sum + (it.quantity || 0), 0)
    } catch {
      this.count.value = 0
    }
  },
}
