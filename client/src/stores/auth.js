import { reactive } from 'vue'
import api from '../services/api'

const user = JSON.parse(localStorage.getItem('user') || 'null')
const token = localStorage.getItem('token') || null

export const auth = reactive({
  user,
  token,
  get isLoggedIn() { return !!this.token },
  get isAdmin() { return this.user?.role === 'admin' },
  get fullName() { return this.user?.fullName || this.user?.full_name || '' },
  get email() { return this.user?.email || '' },
  get avatar() { return this.user?.avatar_url || '' },

  async login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    this.token = res.data.token
    this.user = res.data.user
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    return res.data.user
  },

  async register(data) {
    const res = await api.post('/auth/register', data)
    this.token = res.data.token
    this.user = res.data.user
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    return res.data.user
  },

  logout() {
    this.token = null
    this.user = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
})
