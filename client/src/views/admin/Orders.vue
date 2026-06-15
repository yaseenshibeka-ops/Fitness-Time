<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <div class="d-flex gap-2">
        <select class="form-select form-select-sm" v-model="statusFilter" @change="loadOrders" style="width:150px;">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input type="search" class="form-control form-control-sm" placeholder="Reference..." v-model="search" @input="debouncedLoad" style="width:180px;">
        <button v-if="selected.length" class="btn btn-sm btn-outline-danger" @click="bulkDelete">Delete Selected ({{ selected.length }})</button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else-if="orders.length" class="glass-card p-0 overflow-hidden">
      <table class="table table-dark table-hover mb-0">
        <thead><tr><th><input type="checkbox" @change="toggleAll" :checked="selected.length===orders.length"></th><th>#</th><th>Reference</th><th>Customer</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th><th></th></tr></thead>
        <tbody>
          <tr v-for="o in orders" :key="o.order_id">
            <td><input type="checkbox" :value="o.order_id" v-model="selected"></td>
            <td>{{ o.order_id }}</td>
            <td><code>{{ o.order_reference }}</code></td>
            <td>{{ o.full_name }}<br><small class="text-muted">{{ o.email }}</small></td>
            <td>{{ Number(o.total_amount).toLocaleString() }} RWF</td>
            <td>
              <select class="form-select form-select-sm" :value="o.status" @change="e => updateStatus(o.order_id, e.target.value)" style="width:130px;">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </td>
            <td><span class="badge" :class="o.payment_status === 'paid' ? 'bg-success' : 'bg-warning text-dark'">{{ o.payment_status || 'unpaid' }}</span></td>
            <td>{{ new Date(o.created_at).toLocaleDateString() }}</td>
            <td>
              <router-link :to="`/admin/orders/${o.order_id}`" class="btn btn-sm btn-outline-light"><i class="bi bi-eye"></i></router-link>
              <button class="btn btn-sm btn-outline-danger ms-1" @click="deleteOrder(o.order_id)"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="pages > 1" class="d-flex justify-content-center p-3">
        <nav><ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{disabled:page<=1}"><button class="page-link bg-dark text-light border-secondary" @click="page--;loadOrders()">Prev</button></li>
          <li class="page-item disabled"><span class="page-link bg-dark text-light border-secondary">{{ page }}/{{ pages }}</span></li>
          <li class="page-item" :class="{disabled:page>=pages}"><button class="page-link bg-dark text-light border-secondary" @click="page++;loadOrders()">Next</button></li>
        </ul></nav>
      </div>
    </div>
    <div v-else class="text-center py-5 text-muted">No orders found</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const orders = ref([])
const loading = ref(true)
const statusFilter = ref('')
const search = ref('')
const page = ref(1)
const pages = ref(1)
const selected = ref([])
let debounceTimer

function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; loadOrders() }, 300)
}

async function loadOrders() {
  loading.value = true
  try {
    const params = { page: page.value, limit: 20 }
    if (statusFilter.value) params.status = statusFilter.value
    if (search.value) params.search = search.value
    const res = await api.get('/admin/orders', { params })
    orders.value = res.data.orders || []
    pages.value = res.data.pages
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function updateStatus(id, status) {
  await api.put(`/admin/orders/${id}/status`, { status })
  await loadOrders()
}

function toggleAll() {
  selected.value = selected.value.length === orders.value.length ? [] : orders.value.map(o => o.order_id)
}

async function deleteOrder(id) {
  if (!confirm('Delete this order?')) return
  await api.delete(`/admin/orders/${id}`)
  await loadOrders()
}

async function bulkDelete() {
  if (!confirm(`Delete ${selected.value.length} orders?`)) return
  await api.post('/admin/orders/bulk-delete', { ids: selected.value })
  selected.value = []
  await loadOrders()
}

onMounted(loadOrders)
</script>
