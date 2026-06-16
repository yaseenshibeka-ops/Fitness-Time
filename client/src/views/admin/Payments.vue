<template>
  <div>
    <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
      <select class="form-select form-select-sm" v-model="statusFilter" @change="loadPayments" style="width:150px;">
        <option value="">All Statuses</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="refunded">Refunded</option>
      </select>
      <select class="form-select form-select-sm" v-model="methodFilter" @change="loadPayments" style="width:160px;">
        <option value="">All Methods</option><option value="mtn_momo">MTN MoMo</option><option value="airtel_money">Airtel Money</option><option value="card">Card</option>
      </select>
    </div>
    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else-if="payments.length" class="glass-card p-0 overflow-hidden">
      <table class="table table-hover mb-0">
        <thead><tr><th>Ref</th><th>Order</th><th>Method</th><th>Amount</th><th>Status</th><th>Date</th><th></th></tr></thead>
        <tbody>
          <tr v-for="p in payments" :key="p.payment_id">
            <td><code>{{ p.transaction_ref }}</code></td>
            <td>#{{ p.order_reference }}</td>
            <td>{{ p.payment_method }}</td>
            <td>{{ Number(p.amount).toLocaleString() }} RWF</td>
            <td><span class="badge" :class="p.status==='completed'?'bg-success':p.status==='failed'?'bg-danger':p.status==='refunded'?'bg-info':'bg-warning text-dark'">{{ p.status }}</span></td>
            <td>{{ new Date(p.created_at).toLocaleDateString() }}</td>
            <td><button class="btn btn-sm btn-outline-danger" @click="refund(p)"><i class="bi bi-arrow-return-left"></i></button></td>
          </tr>
        </tbody>
      </table>
      <div v-if="pages>1" class="d-flex justify-content-center p-3">
        <nav><ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{disabled:page<=1}"><button class="page-link" @click="page--;loadPayments()">Prev</button></li>
          <li class="page-item disabled"><span class="page-link">{{ page }}/{{ pages }}</span></li>
          <li class="page-item" :class="{disabled:page>=pages}"><button class="page-link" @click="page++;loadPayments()">Next</button></li>
        </ul></nav>
      </div>
    </div>
    <div v-else class="text-center py-5 text-muted">No payments found</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const payments = ref([])
const loading = ref(true)
const statusFilter = ref('')
const methodFilter = ref('')
const page = ref(1)
const pages = ref(1)

async function loadPayments() {
  loading.value = true
  try {
    const params = { page: page.value, limit: 20, status: statusFilter.value, payment_method: methodFilter.value }
    const res = await api.get('/admin/payments', { params })
    payments.value = res.data.payments || []
    pages.value = res.data.pages
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function refund(p) {
  if (!confirm(`Refund ${p.transaction_ref}?`)) return
  await api.post(`/admin/payments/${p.payment_id}/refund`)
  await loadPayments()
}

onMounted(loadPayments)
</script>
