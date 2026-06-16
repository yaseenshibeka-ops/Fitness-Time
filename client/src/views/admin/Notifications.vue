<template>
  <div>
    <div class="d-flex align-items-center gap-2 mb-3">
      <button class="btn btn-primary btn-sm" @click="markAllRead" v-if="unreadCount">Mark all as read ({{ unreadCount }})</button>
      <select class="form-select form-select-sm" v-model="typeFilter" @change="loadNotifications" style="width:150px;">
        <option value="">All Types</option><option value="order">Order</option><option value="payment">Payment</option><option value="subscription">Subscription</option><option value="system">System</option>
      </select>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else-if="notifications.length" class="glass-card p-0 overflow-hidden">
      <div v-for="n in notifications" :key="n.notification_id"
        class="p-3 border-bottom d-flex justify-content-between align-items-start"
        :class="{ 'opacity-75': n.is_read }"
        style="border-color:var(--glass-border)!important;">
        <div>
          <div class="d-flex align-items-center gap-2">
            <span v-if="!n.is_read" class="badge bg-primary" style="width:8px;height:8px;border-radius:50%;padding:0;"></span>
            <strong>{{ n.title }}</strong>
            <span class="badge bg-accent text-dark" style="font-size:0.65rem;">{{ n.type }}</span>
          </div>
          <p class="mb-0 small text-muted mt-1">{{ n.message }}</p>
          <small class="text-muted">{{ new Date(n.created_at).toLocaleString() }}</small>
        </div>
        <div class="d-flex gap-1">
          <button v-if="!n.is_read" class="btn btn-sm btn-outline-primary" @click="markRead(n.notification_id)" title="Mark read"><i class="bi bi-check"></i></button>
          <button class="btn btn-sm btn-outline-danger" @click="deleteNotif(n.notification_id)"><i class="bi bi-x"></i></button>
        </div>
      </div>
      <div v-if="pages>1" class="d-flex justify-content-center p-3">
        <nav><ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{disabled:page<=1}"><button class="page-link" @click="page--;loadNotifications()">Prev</button></li>
          <li class="page-item disabled"><span class="page-link">{{ page }}/{{ pages }}</span></li>
          <li class="page-item" :class="{disabled:page>=pages}"><button class="page-link" @click="page++;loadNotifications()">Next</button></li>
        </ul></nav>
      </div>
    </div>
    <div v-else class="text-center py-5 text-muted">No notifications</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../../services/api'

const notifications = ref([])
const loading = ref(true)
const typeFilter = ref('')
const page = ref(1)
const pages = ref(1)
const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length)

async function loadNotifications() {
  loading.value = true
  try {
    const params = { page: page.value, limit: 20, type: typeFilter.value }
    const res = await api.get('/admin/notifications', { params })
    notifications.value = res.data.notifications || []
    pages.value = res.data.pages
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function markRead(id) {
  await api.put(`/admin/notifications/${id}/read`)
  await loadNotifications()
}

async function markAllRead() {
  await api.put('/admin/notifications/read-all')
  await loadNotifications()
}

async function deleteNotif(id) {
  await api.delete(`/admin/notifications/${id}`)
  await loadNotifications()
}

onMounted(loadNotifications)
</script>
