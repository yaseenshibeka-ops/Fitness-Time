<template>
  <div>
    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else>
      <!-- Stat Cards -->
      <div class="row g-3 mb-4">
        <div v-for="card in statCards" :key="card.label" class="col-xl-3 col-sm-6 col-12">
          <div class="glass-card stat-card p-4 h-100 position-relative overflow-hidden">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <div class="text-muted small fw-semibold uppercase tracking-wider mb-1">{{ card.label }}</div>
                <div class="fs-2 fw-extrabold text-white mt-1">{{ card.value }}</div>
              </div>
              <div class="stat-icon-wrapper" :style="{ background: card.colorBg }">
                <i :class="card.icon" :style="{ color: card.colorText }"></i>
              </div>
            </div>
            <div class="card-glow" :style="{ background: `radial-gradient(circle, ${card.colorText} 0%, transparent 70%)` }"></div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="row g-3 mb-4">
        <div class="col-xl-6 col-12">
          <div class="glass-card chart-card p-4">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h6 class="fw-bold mb-0 text-light"><i class="bi bi-graph-up me-2 text-cyan"></i>Weight Progress</h6>
              <span class="badge bg-glass text-cyan">Last 30 Days</span>
            </div>
            <div class="chart-container" style="height:250px;"><canvas ref="weightChart"></canvas></div>
          </div>
        </div>
        <div class="col-xl-6 col-12">
          <div class="glass-card chart-card p-4">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h6 class="fw-bold mb-0 text-light"><i class="bi bi-fire me-2 text-primary"></i>Calories Burned</h6>
              <span class="badge bg-glass text-primary">Daily Burn</span>
            </div>
            <div class="chart-container" style="height:250px;"><canvas ref="caloriesChart"></canvas></div>
          </div>
        </div>
      </div>

      <!-- Row 3: Goals, Workout, Subscription -->
      <div class="row g-3">
        <div class="col-lg-4 col-md-6 col-12">
          <div class="glass-card p-4 h-100">
            <div class="d-flex align-items-center justify-content-between mb-4">
              <h6 class="fw-bold mb-0 text-light"><i class="bi bi-pie-chart me-2 text-purple"></i>Workout Split</h6>
            </div>
            <div class="chart-container mb-3" style="height:200px;"><canvas ref="workoutChart"></canvas></div>
          </div>
        </div>
        <div class="col-lg-4 col-md-6 col-12">
          <div class="glass-card p-4 h-100">
            <div class="d-flex align-items-center justify-content-between mb-4">
              <h6 class="fw-bold mb-0 text-light"><i class="bi bi-bullseye me-2 text-accent"></i>Active Goals</h6>
              <span class="badge bg-accent text-dark fw-bold">{{ goals.filter(g => g.status === 'completed').length }}/{{ goals.length }} Done</span>
            </div>
            <div v-if="goals.length" class="goals-list">
              <div v-for="g in goals" :key="g.goal_id" class="mb-3 p-2 rounded bg-surface-hover">
                <div class="d-flex justify-content-between small mb-1">
                  <span class="fw-semibold text-light">{{ g.goal_type }}</span>
                  <span class="text-muted">{{ g.current_value }} / {{ g.target_value }}</span>
                </div>
                <div class="progress" style="height:6px; background: rgba(255, 255, 255, 0.05);">
                  <div class="progress-bar progress-bar-striped progress-bar-animated animate-progress" :class="g.status==='completed'?'bg-success':'bg-cyan'" :style="{width:Math.min(100,(g.current_value/g.target_value)*100)+'%'}"></div>
                </div>
              </div>
            </div>
            <div v-else class="text-muted text-center py-4">No goals configured yet.</div>
          </div>
        </div>
        <div class="col-lg-4 col-md-12 col-12">
          <div class="glass-card p-4 h-100 position-relative overflow-hidden subscription-card">
            <div class="card-glow" style="background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);"></div>
            <h6 class="fw-bold mb-4 text-light"><i class="bi bi-star me-2 text-warning"></i>Membership Plan</h6>
            <div v-if="sub" class="d-flex flex-column h-100 justify-content-between">
              <div>
                <div class="fs-3 fw-bold text-warning mb-1">{{ sub.plan_type }}</div>
                <span class="badge bg-success-glow text-success px-3 py-2 rounded-pill mb-3">Active Member</span>
                <div class="text-muted small mt-2">Expires: {{ new Date(sub.end_date).toLocaleDateString() }}</div>
              </div>
              <router-link to="/dashboard/subscription" class="btn btn-outline-warning btn-sm w-100 mt-4 py-2">Manage Subscription</router-link>
            </div>
            <div v-else class="text-muted text-center py-4 d-flex flex-column justify-content-center align-items-center h-100">
              <i class="bi bi-shield-slash fs-1 text-muted mb-2" style="color: var(--text-muted);"></i>
              <p>No active plan subscription</p>
              <router-link to="/dashboard/subscription" class="btn btn-primary btn-sm px-4 mt-2">Subscribe Now</router-link>
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
      { label: 'Current Weight', value: s.currentWeight ? s.currentWeight + ' kg' : '--', icon: 'bi bi-person', colorText: '#06B6D4', colorBg: 'rgba(6, 182, 212, 0.1)' },
      { label: 'Workouts (30d)', value: s.totalMinutes30Days + ' min', icon: 'bi bi-activity', colorText: '#8B5CF6', colorBg: 'rgba(139, 92, 246, 0.1)' },
      { label: 'Calories (30d)', value: s.totalCalories30Days.toLocaleString(), icon: 'bi bi-fire', colorText: '#6366F1', colorBg: 'rgba(99, 102, 241, 0.1)' },
      { label: 'Goals Met', value: goals.value.filter(g => g.status === 'completed').length + '/' + goals.value.length, icon: 'bi bi-bullseye', colorText: '#10B981', colorBg: 'rgba(16, 185, 129, 0.1)' },
    ]

    await nextTick()
    const wData = progress.value.slice().reverse()

    // Chart options defaults helper
    const commonChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#121829',
          titleColor: '#F8FAFC',
          bodyColor: '#94A3B8',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          usePointStyle: true
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94A3B8', font: { family: 'Inter', size: 11 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.04)', drawTicks: false },
          ticks: { color: '#94A3B8', font: { family: 'Inter', size: 11 } }
        }
      }
    }

    if (wData.length > 1) {
      const wLabels = wData.map(p => new Date(p.recorded_date).toLocaleDateString())
      
      // Weight Line Chart
      new Chart(weightChart.value, {
        type: 'line',
        data: {
          labels: wLabels,
          datasets: [{
            label: 'Weight (kg)',
            data: wData.map(p => p.weight_kg),
            borderColor: '#06B6D4',
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#06B6D4',
            pointBorderColor: '#090D1A',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: commonChartOptions
      })

      // Calories Bar Chart
      new Chart(caloriesChart.value, {
        type: 'bar',
        data: {
          labels: wLabels,
          datasets: [{
            label: 'Calories',
            data: wData.map(p => p.calories_burned || 0),
            backgroundColor: 'rgba(99, 102, 241, 0.85)',
            hoverBackgroundColor: '#6366F1',
            borderRadius: 6,
            borderSkipped: false
          }]
        },
        options: commonChartOptions
      })
    }
    if (wData.length) {
      const types = [...new Set(wData.filter(p => p.workout_type).map(p => p.workout_type))]
      const counts = types.map(t => wData.filter(p => p.workout_type === t).length)
      
      // Workout Doughnut Chart
      new Chart(workoutChart.value, {
        type: 'doughnut',
        data: {
          labels: types,
          datasets: [{
            data: counts,
            backgroundColor: ['#6366F1', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B'],
            borderWidth: 2,
            borderColor: '#121829'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '75%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#94A3B8',
                padding: 15,
                font: { family: 'Inter', size: 12 },
                usePointStyle: true,
                pointStyle: 'circle'
              }
            }
          }
        }
      })
    }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})
</script>

<style scoped>
.fw-extrabold {
  font-weight: 800;
}
.text-cyan {
  color: #06B6D4 !important;
}
.text-purple {
  color: #8B5CF6 !important;
}
.bg-glass {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.bg-success-glow {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.15);
}
.bg-surface-hover {
  background: rgba(255, 255, 255, 0.02);
  transition: background 0.2s ease;
}
.bg-surface-hover:hover {
  background: rgba(255, 255, 255, 0.04);
}
.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: transform 0.3s ease;
}
.stat-card:hover .stat-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}
.card-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  opacity: 0.15;
  filter: blur(40px);
  pointer-events: none;
  transition: opacity 0.3s;
}
.stat-card:hover .card-glow {
  opacity: 0.25;
}
.chart-card {
  transition: border-color 0.3s, box-shadow 0.3s;
}
.subscription-card {
  background: linear-gradient(135deg, rgba(25, 20, 40, 0.4), rgba(18, 24, 41, 0.7));
}
.animate-progress {
  transition: width 0.6s ease;
}
</style>
