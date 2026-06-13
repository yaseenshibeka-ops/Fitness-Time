import { ref } from 'vue'
import api from '../services/api'

export function useUserStore() {
  const profile = ref(null)
  const loading = ref(false)

  async function fetchProfile() {
    loading.value = true
    try {
      const res = await api.get('/auth/profile')
      profile.value = res.data.user
    } catch (e) { console.error(e) }
    finally { loading.value = false }
    return profile.value
  }

  async function updateProfile(data) {
    const res = await api.put('/user/profile', data)
    profile.value = res.data.user
    return res.data.user
  }

  async function changePassword(currentPassword, newPassword) {
    return api.put('/user/change-password', { currentPassword, newPassword })
  }

  return { profile, loading, fetchProfile, updateProfile, changePassword }
}
