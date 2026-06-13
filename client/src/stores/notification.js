import { ref } from 'vue'
import api from '../services/api'

export function useNotificationStore() {
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)

  async function fetchNotifications(params = {}) {
    loading.value = true
    try {
      const res = await api.get('/user/notifications', { params })
      notifications.value = res.data.notifications || []
    } catch (e) { console.error(e) }
    finally { loading.value = false }
    return notifications.value
  }

  async function fetchUnreadCount() {
    try {
      const res = await api.get('/user/notifications', { params: { unreadOnly: 'true', limit: 1 } })
      unreadCount.value = res.data.notifications?.length || 0
    } catch (e) { /* ignore */ }
  }

  async function markRead(id) {
    await api.put(`/user/notifications/${id}/read`)
    await fetchNotifications()
    await fetchUnreadCount()
  }

  async function markAllRead() {
    await api.put('/user/notifications/read-all')
    await fetchNotifications()
    unreadCount.value = 0
  }

  async function remove(id) {
    await api.delete(`/user/notifications/${id}`)
    await fetchNotifications()
    await fetchUnreadCount()
  }

  return { notifications, unreadCount, loading, fetchNotifications, fetchUnreadCount, markRead, markAllRead, remove }
}
