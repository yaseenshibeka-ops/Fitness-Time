import { ref, computed } from 'vue'
import api from '../services/api'
import { auth } from './auth'

export const cart = {
  count: ref(0),
  timeLeft: ref(0),
  showExpiryAlert: ref(false),
  timerInterval: null,

  countdownText: computed(() => {
    const m = Math.floor(cart.timeLeft.value / 60).toString().padStart(2, '0')
    const s = (cart.timeLeft.value % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }),

  async fetchCount() {
    if (!auth.isLoggedIn) {
      this.count.value = 0
      this.stopCountdown()
      return
    }
    try {
      const res = await api.get('/cart')
      const items = res.data?.cart?.items || []
      this.count.value = items.reduce((sum, it) => sum + (it.quantity || 0), 0)
      
      if (this.count.value > 0) {
        this.initCountdown()
      } else {
        this.stopCountdown()
      }
    } catch {
      this.count.value = 0
      this.stopCountdown()
    }
  },

  initCountdown() {
    if (this.timerInterval) clearInterval(this.timerInterval)

    let expiry = localStorage.getItem('cart_expiry')
    if (!expiry) {
      expiry = Date.now() + 10 * 60 * 1000
      localStorage.setItem('cart_expiry', expiry.toString())
    } else {
      expiry = parseInt(expiry)
      if (expiry <= Date.now()) {
        this.handleCartExpiration()
        return
      }
    }

    const calcTimeLeft = () => {
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000))
      this.timeLeft.value = remaining

      if (remaining <= 0) {
        this.stopCountdown()
        this.handleCartExpiration()
      }
    }

    calcTimeLeft()
    this.timerInterval = setInterval(calcTimeLeft, 1000)
  },

  stopCountdown() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
    this.timeLeft.value = 0
    localStorage.removeItem('cart_expiry')
  },

  async handleCartExpiration() {
    try {
      await api.delete('/cart')
      this.count.value = 0
      this.showExpiryAlert.value = true
      this.stopCountdown()
    } catch (e) {
      console.error('Failed to clear cart on expiration:', e)
    }
  }
}
