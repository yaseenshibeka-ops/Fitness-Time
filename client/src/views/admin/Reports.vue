<template>
  <div>
    <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
      <select class="form-select form-select-sm" v-model="reportType" style="width:180px;">
        <option value="revenue">Revenue Report</option>
        <option value="products">Product Report</option>
        <option value="users">User Report</option>
        <option value="orders">Order Report</option>
      </select>
      <input type="date" class="form-control form-control-sm" v-model="dateFrom" style="width:160px;">
      <input type="date" class="form-control form-control-sm" v-model="dateTo" style="width:160px;">
      <button class="btn btn-primary btn-sm" @click="generateReport">Generate</button>
      <button class="btn btn-outline-light btn-sm" @click="exportCSV">Export CSV</button>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else>
      <div class="row g-3 mb-4">
        <div v-for="(val, key) in summary" :key="key" class="col-md-3 col-6">
          <div class="glass-card p-3 text-center h-100">
            <div class="text-muted small text-uppercase">{{ key }}</div>
            <div class="fs-5 fw-bold text-accent">{{ val }}</div>
          </div>
        </div>
      </div>

      <div class="glass-card p-3">
        <h6 class="fw-bold mb-3">Report Data</h6>
        <div v-if="report.length" class="table-responsive">
          <table class="table table-dark table-sm mb-0">
            <thead><tr><th v-for="h in headers" :key="h">{{ h }}</th></tr></thead>
            <tbody>
              <tr v-for="(row, i) in report" :key="i">
                <td v-for="h in headers" :key="h">{{ row[h] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center text-muted py-4">No data. Click Generate to create a report.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../../services/api'

const loading = ref(false)
const reportType = ref('revenue')
const dateFrom = ref(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])
const dateTo = ref(new Date().toISOString().split('T')[0])
const report = ref([])
const headers = ref([])
const summary = ref({})

async function generateReport() {
  loading.value = true
  try {
    const res = await api.get('/admin/reports', { params: { type: reportType.value, date_from: dateFrom.value, date_to: dateTo.value } })
    report.value = res.data.report || []
    summary.value = res.data.summary || {}
    if (report.value.length) headers.value = Object.keys(report.value[0])
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

function exportCSV() {
  if (!report.value.length) return
  const csv = [headers.value.join(','), ...report.value.map(r => headers.value.map(h => r[h]).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `${reportType.value}_report.csv`; a.click()
  URL.revokeObjectURL(url)
}
</script>
