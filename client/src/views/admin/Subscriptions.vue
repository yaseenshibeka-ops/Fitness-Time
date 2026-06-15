<template>
  <div>
    <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
      <select class="form-select form-select-sm" v-model="planFilter" @change="loadSubs" style="width:160px;">
        <option value="">All Plans</option><option value="basic">Basic</option><option value="premium">Premium</option><option value="elite">Elite</option>
      </select>
      <select class="form-select form-select-sm" v-model="statusFilter" @change="loadSubs" style="width:150px;">
        <option value="">All Statuses</option><option value="active">Active</option><option value="expired">Expired</option><option value="cancelled">Cancelled</option>
      </select>
      <button v-if="selected.length" class="btn btn-sm btn-outline-danger" @click="bulkDelete">Delete Selected ({{ selected.length }})</button>
    </div>
    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else-if="subscriptions.length" class="glass-card p-0 overflow-hidden">
      <table class="table table-dark table-hover mb-0">
        <thead><tr><th><input type="checkbox" @change="toggleAll" :checked="selected.length===subscriptions.length"></th><th>User</th><th>Plan</th><th>Price</th><th>Status</th><th>Start</th><th>End</th><th></th></tr></thead>
        <tbody>
          <tr v-for="s in subscriptions" :key="s.subscription_id">
            <td><input type="checkbox" :value="s.subscription_id" v-model="selected"></td>
            <td>{{ s.full_name }}<br><small class="text-muted">{{ s.email }}</small></td>
            <td><span class="badge bg-accent text-dark">{{ s.plan_name || s.plan }}</span></td>
            <td>{{ Number(s.price).toLocaleString() }} RWF</td>
            <td><span class="badge" :class="s.status==='active'?'bg-success':s.status==='expired'?'bg-danger':'bg-secondary'">{{ s.status }}</span></td>
            <td>{{ new Date(s.start_date).toLocaleDateString() }}</td>
            <td>{{ new Date(s.end_date).toLocaleDateString() }}</td>
            <td>
              <button class="btn btn-sm btn-outline-warning me-1" @click="cancelSub(s.subscription_id)">Cancel</button>
              <button class="btn btn-sm btn-outline-danger" @click="deleteSub(s.subscription_id)"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="pages>1" class="d-flex justify-content-center p-3">
        <nav><ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{disabled:page<=1}"><button class="page-link bg-dark text-light border-secondary" @click="page--;loadSubs()">Prev</button></li>
          <li class="page-item disabled"><span class="page-link bg-dark text-light border-secondary">{{ page }}/{{ pages }}</span></li>
          <li class="page-item" :class="{disabled:page>=pages}"><button class="page-link bg-dark text-light border-secondary" @click="page++;loadSubs()">Next</button></li>
        </ul></nav>
      </div>
    </div>
    <div v-else class="text-center py-5 text-muted">No subscriptions found</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const subscriptions = ref([])
const loading = ref(true)
const planFilter = ref('')
const statusFilter = ref('')
const page = ref(1)
const pages = ref(1)
const selected = ref([])

async function loadSubs() {
  loading.value = true
  try {
    const params = { page: page.value, limit: 20, plan: planFilter.value, status: statusFilter.value }
    const res = await api.get('/admin/subscriptions', { params })
    subscriptions.value = res.data.subscriptions || []
    pages.value = res.data.pages
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

function toggleAll() {
  selected.value = selected.value.length === subscriptions.value.length ? [] : subscriptions.value.map(s => s.subscription_id)
}

async function cancelSub(id) {
  if (!confirm('Cancel this subscription?')) return
  await api.put(`/admin/subscriptions/${id}/cancel`)
  await loadSubs()
}

async function deleteSub(id) {
  if (!confirm('Delete this subscription?')) return
  await api.delete(`/admin/subscriptions/${id}`)
  await loadSubs()
}

async function bulkDelete() {
  if (!confirm(`Delete ${selected.value.length} subscriptions?`)) return
  await api.post('/admin/subscriptions/bulk-delete', { ids: selected.value })
  selected.value = []
  await loadSubs()
}

onMounted(loadSubs)
</script>
