<template>
  <div>
    <div class="d-flex align-items-center gap-2 mb-3">
      <h5 class="fw-bold mb-0"><i class="bi bi-credit-card me-2"></i>Payment History</h5>
      <select class="form-select form-select-sm ms-auto" v-model="filter" @change="load" style="width:150px;">
        <option value="">All</option><option value="completed">Successful</option><option value="pending">Pending</option><option value="failed">Failed</option>
      </select>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else-if="payments.length" class="glass-card p-0 overflow-hidden">
      <div class="table-responsive">
        <table class="table table-dark table-hover mb-0">
          <thead><tr><th>Ref</th><th>Method</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            <tr v-for="p in payments" :key="p.payment_id">
              <td><code>{{ (p.transaction_reference || '').substring(0,12) }}...</code></td>
              <td>{{ p.payment_method }}</td>
              <td>{{ Number(p.amount).toLocaleString() }} RWF</td>
              <td><span class="badge" :class="p.payment_status==='completed'?'bg-success':p.payment_status==='failed'?'bg-danger':'bg-warning text-dark'">{{ p.payment_status }}</span></td>
              <td>{{ new Date(p.created_at).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="glass-card p-5 text-center text-muted">
      <i class="bi bi-credit-card display-4 mb-3" style="display:block;"></i>
      <p>No payment history yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const payments = ref([])
const loading = ref(true)
const filter = ref('')

async function load() {
  loading.value = true
  try {
    const params = {}
    if (filter.value) params.status = filter.value
    const res = await api.get('/payments/history', { params })
    payments.value = res.data.payments || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

onMounted(load)
</script>
