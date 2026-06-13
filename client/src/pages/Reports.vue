<template>
  <div>
    <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
      <h5 class="fw-bold mb-0"><i class="bi bi-file-earmark-bar-graph me-2"></i>Reports</h5>
      <select class="form-select form-select-sm ms-auto" v-model="reportType" style="width:200px;">
        <option value="fitness">Fitness Progress</option><option value="workouts">Workout History</option>
        <option value="calories">Calories Burned</option><option value="weight">Weight Changes</option>
        <option value="purchases">Purchases</option>
      </select>
      <input type="date" class="form-control form-control-sm" v-model="fromDate" style="width:150px;">
      <input type="date" class="form-control form-control-sm" v-model="toDate" style="width:150px;">
      <button class="btn btn-primary btn-sm" @click="generate">Generate</button>
      <button class="btn btn-outline-light btn-sm" @click="exportCsv">CSV</button>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else-if="chartData.length">
      <div class="row g-3 mb-3">
        <div class="col-md-8"><div class="glass-card p-3">
          <div style="height:280px;"><canvas ref="reportChart"></canvas></div>
        </div></div>
        <div class="col-md-4"><div class="glass-card p-3">
          <h6 class="fw-bold mb-3">Summary</h6>
          <div v-if="reportType==='fitness'"><p class="mb-1">Records: {{ chartData.length }}</p></div>
          <div v-else-if="reportType==='workouts'"><p class="mb-1">Workouts: {{ chartData.length }}</p><p class="mb-1">Total Duration: {{ chartData.reduce((a,r)=>a+Number(r.duration_minutes||0),0) }} min</p></div>
          <div v-else-if="reportType==='calories'"><p class="mb-1">Total: {{ chartData.reduce((a,r)=>a+Number(r.calories_burned||r.calories||0),0).toLocaleString() }} cal</p></div>
          <div v-else-if="reportType==='purchases'"><p class="mb-1">Orders: {{ chartData.length }}</p></div>
        </div></div>
      </div>
      <div class="glass-card p-0 overflow-hidden">
        <div class="table-responsive">
          <table class="table table-dark table-sm mb-0">
            <thead><tr><th v-for="h in headers" :key="h">{{ h }}</th></tr></thead>
            <tbody>
              <tr v-for="(r,i) in chartData" :key="i"><td v-for="h in headers" :key="h">{{ r[h] }}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div v-else class="glass-card p-5 text-center text-muted">
      <i class="bi bi-file-earmark-bar-graph display-4 mb-3" style="display:block;"></i>
      <p>Select a report type and date range, then click Generate.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import api from '../services/api'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const reportType = ref('fitness')
const fromDate = ref(new Date(Date.now() - 30*86400000).toISOString().split('T')[0])
const toDate = ref(new Date().toISOString().split('T')[0])
const loading = ref(false)
const chartData = ref([])
const headers = ref([])
const reportChart = ref(null)
let chartInstance = null

async function generate() {
  loading.value = true
  try {
    let data = []
    if (reportType.value === 'fitness' || reportType.value === 'weight' || reportType.value === 'calories') {
      const p = { from: fromDate.value, to: toDate.value }
      if (reportType.value === 'calories') p.record_type = 'calories_burned'
      const res = await api.get('/fitness/progress', { params: p })
      data = res.data.history || []
      if (reportType.value === 'weight') data = data.filter(d => d.weight_kg)
      if (reportType.value === 'calories') data = data.filter(d => d.calories_burned)
    } else if (reportType.value === 'workouts') {
      const res = await api.get('/user/workouts', { params: { from: fromDate.value, to: toDate.value, limit: 200 } })
      data = res.data.workouts || []
    } else if (reportType.value === 'purchases') {
      const res = await api.get('/orders', { params: { page: 1, limit: 200 } })
      data = res.data.orders || []
    }
    chartData.value = data
    headers.value = data.length ? Object.keys(data[0]) : []

    await nextTick()
    if (chartInstance) chartInstance.destroy()
    if (data.length && reportChart.value) {
      const labels = data.map(d => {
        const date = new Date(d.recorded_date || d.workout_date || d.created_at)
        return date.toLocaleDateString()
      }).reverse()
      let values, label, color
      if (reportType.value === 'weight') { values = data.map(d => d.weight_kg).reverse(); label = 'Weight (kg)'; color = '#00B4D8' }
      else if (reportType.value === 'calories') { values = data.map(d => d.calories_burned).reverse(); label = 'Calories'; color = '#FF6B35' }
      else if (reportType.value === 'workouts') { values = data.map(d => d.duration_minutes).reverse(); label = 'Duration (min)'; color = '#0066FF' }
      else if (reportType.value === 'fitness') { values = data.map(d => d.weight_kg || 0).reverse(); label = 'Weight (kg)'; color = '#00B4D8' }
      else if (reportType.value === 'purchases') { values = data.map(d => Number(d.grand_total)).reverse(); label = 'Amount (RWF)'; color = '#00C853' }
      if (values) {
        chartInstance = new Chart(reportChart.value, {
          type: 'line',
          data: { labels, datasets: [{ label, data: values, borderColor: color, tension: 0.3, fill: false }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#ADB5BD' } }, y: { ticks: { color: '#ADB5BD' } } } }
        })
      }
    }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

function exportCsv() {
  if (!chartData.value.length) return
  const csv = [headers.value.join(','), ...chartData.value.map(r => headers.value.map(h => {
    const v = r[h]; return typeof v === 'string' && v.includes(',') ? `"${v}"` : v
  }).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${reportType.value}_report.csv`; a.click()
}
</script>
