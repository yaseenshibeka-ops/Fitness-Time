<template>
  <div>
    <div class="d-flex align-items-center gap-2 mb-3">
      <h5 class="fw-bold mb-0"><i class="bi bi-bell me-2"></i>Notifications</h5>
      <button v-if="notifications.filter(n => !n.is_read).length" class="btn btn-sm btn-outline-light" @click="markAll">Mark all read</button>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else-if="notifications.length">
      <div v-for="n in notifications" :key="n.notification_id"
        class="glass-card p-3 mb-2 d-flex justify-content-between align-items-start"
        :class="{ 'opacity-75': n.is_read }">
        <div class="d-flex align-items-start gap-2">
          <span v-if="!n.is_read" class="badge bg-primary" style="width:8px;height:8px;border-radius:50%;padding:0;margin-top:6px;flex-shrink:0;"></span>
          <div>
            <div class="d-flex align-items-center gap-2">
              <strong>{{ n.title }}</strong>
              <span class="badge bg-accent text-dark" style="font-size:0.6rem;">{{ n.type }}</span>
            </div>
            <p class="mb-0 small text-muted">{{ n.message }}</p>
            <small class="text-muted">{{ timeAgo(n.created_at) }}</small>
          </div>
        </div>
        <div class="d-flex gap-1 flex-shrink-0">
          <button v-if="!n.is_read" class="btn btn-sm btn-outline-light" @click="mark(n.notification_id)" title="Mark read"><i class="bi bi-check"></i></button>
          <button class="btn btn-sm btn-outline-danger" @click="remove(n.notification_id)"><i class="bi bi-x"></i></button>
        </div>
      </div>
    </div>
    <div v-else class="glass-card p-5 text-center text-muted">
      <i class="bi bi-bell display-4 mb-3" style="display:block;"></i>
      <p>No notifications</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const notifications = ref([])
const loading = ref(true)

function timeAgo(d) {
  const sec = (new Date() - new Date(d)) / 1000
  if (sec < 60) return 'just now'
  if (sec < 3600) return Math.floor(sec / 60) + 'm ago'
  if (sec < 86400) return Math.floor(sec / 3600) + 'h ago'
  return Math.floor(sec / 86400) + 'd ago'
}

async function load() {
  loading.value = true
  try { const res = await api.get('/user/notifications'); notifications.value = res.data.notifications || [] }
  catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function mark(id) { await api.put(`/user/notifications/${id}/read`); await load() }
async function markAll() { await api.put('/user/notifications/read-all'); await load() }
async function remove(id) { await api.delete(`/user/notifications/${id}`); await load() }

onMounted(load)
</script>
