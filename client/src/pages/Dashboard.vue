<template>
  <div>
    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else>
      <div class="row g-3 mb-4">
        <div v-for="card in statCards" :key="card.label" class="col-md-3 col-6">
          <div class="glass-card p-3 text-center h-100">
            <i :class="card.icon" style="font-size:1.5rem;color:var(--accent);"></i>
            <div class="fs-3 fw-bold text-accent mt-1">{{ card.value }}</div>
            <div class="text-muted small">{{ card.label }}</div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <div class="glass-card p-3">
            <h6 class="fw-bold mb-3"><i class="bi bi-graph-up me-2"></i>Weight Progress</h6>
            <div style="height:220px;"><canvas ref="weightChart"></canvas></div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="glass-card p-3">
            <h6 class="fw-bold mb-3"><i class="bi bi-fire me-2"></i>Calories Burned</h6>
            <div style="height:220px;"><canvas ref="caloriesChart"></canvas></div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-md-4">
          <div class="glass-card p-3">
            <h6 class="fw-bold mb-3"><i class="bi bi-pie-chart me-2"></i>Workout Distribution</h6>
            <div style="height:220px;"><canvas ref="workoutChart"></canvas></div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="glass-card p-3">
            <h6 class="fw-bold mb-3"><i class="bi bi-bullseye me-2"></i>Goals Progress</h6>
            <div v-if="goals.length">
              <div v-for="g in goals" :key="g.goal_id" class="mb-2">
                <div class="d-flex justify-content-between small"><span>{{ g.goal_type }}</span><span>{{ g.current_value }}/{{ g.target_value }}</span></div>
                <div class="progress" style="height:6px;"><div class="progress-bar" :class="g.status==='completed'?'bg-success':'bg-accent'" :style="{width:Math.min(100,(g.current_value/g.target_value)*100)+'%'}"></div></div>
              </div>
            </div>
            <div v-else class="text-muted text-center py-4">No goals yet</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="glass-card p-3">
            <h6 class="fw-bold mb-3"><i class="bi bi-star me-2"></i>Subscription</h6>
            <div v-if="sub">
              <div class="fs-4 fw-bold text-accent">{{ sub.plan_type }}</div>
              <span class="badge bg-success">{{ sub.status }}</span>
              <div class="text-muted small mt-2">Expires: {{ new Date(sub.end_date).toLocaleDateString() }}</div>
            </div>
            <div v-else class="text-muted text-center py-4">
              <p>No active plan</p>
              <router-link to="/dashboard/subscription" class="btn btn-primary btn-sm">Subscribe</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import api from '../services/api'
import { useFitnessStore } from '../stores/fitness'
import { useSubscriptionStore } from '../stores/subscription'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const fitStore = useFitnessStore()
const subStore = useSubscriptionStore()
const loading = ref(true)
const stats = ref(null)
const progress = ref([])
const goals = ref([])
const sub = ref(null)
const weightChart = ref(null)
const caloriesChart = ref(null)
const workoutChart = ref(null)

const statCards = ref([])

onMounted(async () => {
  try {
    const [statsRes, , goalsRes, subRes] = await Promise.all([
      api.get('/fitness/dashboard-stats'),
      fitStore.fetchProgress(),
      api.get('/user/goals'),
      api.get('/subscriptions/current').catch(() => ({ data: { subscription: null } }))
    ])
    stats.value = statsRes.data.stats
    progress.value = fitStore.progress
    goals.value = goalsRes.data.goals || []
    sub.value = subRes.data.subscription

    const s = statsRes.data.stats
    statCards.value = [
      { label: 'Current Weight', value: s.currentWeight ? s.currentWeight + ' kg' : '--', icon: 'bi bi-person' },
      { label: 'Workouts (30d)', value: s.totalMinutes30Days + ' min', icon: 'bi bi-activity' },
      { label: 'Calories (30d)', value: s.totalCalories30Days.toLocaleString(), icon: 'bi bi-fire' },
      { label: 'Goals', value: goals.value.filter(g => g.status === 'completed').length + '/' + goals.value.length, icon: 'bi bi-bullseye' },
    ]

    await nextTick()
    const wData = progress.value.slice().reverse()
    if (wData.length > 1) {
      const wLabels = wData.map(p => new Date(p.recorded_date).toLocaleDateString())
      new Chart(weightChart.value, {
        type: 'line',
        data: { labels: wLabels, datasets: [{ label: 'Weight (kg)', data: wData.map(p => p.weight_kg), borderColor: '#00B4D8', tension: 0.3, fill: false }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#ADB5BD' } }, y: { ticks: { color: '#ADB5BD' } } } }
      })
      new Chart(caloriesChart.value, {
        type: 'bar',
        data: { labels: wLabels, datasets: [{ label: 'Calories', data: wData.map(p => p.calories_burned || 0), backgroundColor: '#0066FF' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#ADB5BD' } }, y: { ticks: { color: '#ADB5BD' } } } }
      })
    }
    if (wData.length) {
      const types = [...new Set(wData.filter(p => p.workout_type).map(p => p.workout_type))]
      const counts = types.map(t => wData.filter(p => p.workout_type === t).length)
      new Chart(workoutChart.value, {
        type: 'doughnut',
        data: { labels: types, datasets: [{ data: counts, backgroundColor: ['#0066FF', '#00B4D8', '#00C853', '#FF6B35', '#FFD166'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#ADB5BD' } } } }
      })
    }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})
</script>
