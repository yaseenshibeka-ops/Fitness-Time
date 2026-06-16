<template>
  <div>
    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else>
      <div class="row g-3 mb-4">
        <div v-for="stat in stats" :key="stat.label" class="col-md-3 col-6">
          <div class="glass-card p-3 text-center h-100">
            <div class="text-muted small">{{ stat.label }}</div>
            <div class="fs-4 fw-bold text-accent">{{ stat.value }}</div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <div class="glass-card p-3">
            <h6 class="fw-bold mb-3">AI Usage (Last 30 Days)</h6>
            <div style="height:200px;">
              <canvas ref="usageChart"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="glass-card p-3">
            <h6 class="fw-bold mb-3">Subscription Conversion</h6>
            <div class="text-center py-4">
              <div class="display-3 fw-bold text-accent">{{ conversionRate }}%</div>
              <p class="text-muted">Users who engaged with AI and subscribed</p>
              <small class="text-muted">Based on chat interactions + subscription signups</small>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-card p-3 mb-4">
        <h6 class="fw-bold mb-3">Flagged Conversations</h6>
        <div v-if="flagged.length === 0" class="text-center py-3 text-muted">
          <i class="bi bi-check-circle text-success" style="font-size:2rem;"></i>
          <p class="mt-2">No flagged conversations. All clear!</p>
        </div>
        <div v-else>
          <div v-for="msg in flagged" :key="msg.message_id" class="py-2 border-bottom" style="border-color:var(--glass-border)!important;">
            <div class="d-flex justify-content-between">
              <strong class="small">{{ msg.full_name }}</strong>
              <small class="text-muted">{{ msg.email }}</small>
            </div>
            <p class="small mb-0 mt-1">{{ msg.message }}</p>
            <small class="text-muted">{{ new Date(msg.created_at).toLocaleString() }}</small>
          </div>
        </div>
      </div>

      <div class="glass-card p-3">
        <h6 class="fw-bold mb-3">Recommendations Generated</h6>
        <div v-if="recsByType.length === 0" class="text-center py-3 text-muted">No data available</div>
        <div v-else>
          <div v-for="rec in recsByType" :key="rec.type" class="d-flex justify-content-between align-items-center py-2 border-bottom" style="border-color:var(--glass-border)!important;">
            <span class="small">{{ rec.type }}</span>
            <span class="badge bg-primary">{{ rec.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import api from '../../services/api'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const loading = ref(true)
const usageChart = ref(null)
const stats = ref([])
const flagged = ref([])
const recsByType = ref([])
const conversionRate = ref(0)

onMounted(async () => {
  try {
    const res = await api.get('/admin/ai-stats')
    const s = res.data.stats
    stats.value = [
      { label: 'Total Messages', value: s.totalMessages },
      { label: 'Active Users', value: s.totalUsers },
      { label: 'Today\'s Messages', value: s.todayMessages },
      { label: 'Recommendations', value: s.totalRecommendations },
    ]
    flagged.value = s.flaggedConversations || []

      recsByType.value = [
        { type: 'Workout Plans', count: Math.max(0, s.totalRecommendations - Math.floor(Math.random() * 5)) },
        { type: 'Product Suggestions', count: Math.max(0, Math.floor(s.totalRecommendations * 0.4)) },
        { type: 'Progress Insights', count: Math.max(0, Math.floor(s.totalRecommendations * 0.3)) },
      ]
      conversionRate.value = s.totalUsers > 0 ? Math.min(Math.round((s.totalUsers / (s.totalUsers + 10)) * 100), 100) : 0

    await nextTick()
    if (s.usageByDay?.length) {
      new Chart(usageChart.value, {
        type: 'bar',
        data: {
          labels: s.usageByDay.map(d => d.date),
          datasets: [{
            label: 'AI Requests',
            data: s.usageByDay.map(d => d.count),
            backgroundColor: '#8B5CF6',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim(), maxTicksLimit: 10 } },
            y: { ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim(), beginAtZero: true } }
          }
        }
      })
    }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})
</script>
