<template>
  <div>
    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else>
      <!-- Stat Cards -->
      <div class="row g-3 mb-4">
        <div v-for="card in statCards" :key="card.label" class="col-xl-3 col-sm-6 col-12">
          <div class="dash-card stat-card d-flex align-items-center gap-3 p-4">
            <div class="stat-icon flex-shrink-0 d-flex align-items-center justify-content-center rounded">
              <i :class="card.icon"></i>
            </div>
            <div class="min-w-0">
              <div class="stat-label text-uppercase small mb-1">{{ card.label }}</div>
              <div class="stat-value">{{ card.value }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="row g-3 mb-4">
        <div class="col-xl-6 col-12">
          <div class="dash-card p-4">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h6 class="fw-bold mb-0"><i class="bi bi-graph-up me-2"></i>Weight Progress</h6>
              <span class="badge badge-outline">Last 30 Days</span>
            </div>
            <div style="height:250px;"><canvas ref="weightChart"></canvas></div>
          </div>
        </div>
        <div class="col-xl-6 col-12">
          <div class="dash-card p-4">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h6 class="fw-bold mb-0"><i class="bi bi-fire me-2"></i>Calories Burned</h6>
              <span class="badge badge-outline">Daily Burn</span>
            </div>
            <div style="height:250px;"><canvas ref="caloriesChart"></canvas></div>
          </div>
        </div>
      </div>

      <!-- Row 3: Goals, Workout, Subscription -->
      <div class="row g-3">
        <div class="col-lg-4 col-md-6 col-12">
          <div class="dash-card p-4 h-100">
            <h6 class="fw-bold mb-3"><i class="bi bi-pie-chart me-2"></i>Workout Split</h6>
            <div style="height:200px;"><canvas ref="workoutChart"></canvas></div>
          </div>
        </div>
        <div class="col-lg-4 col-md-6 col-12">
          <div class="dash-card p-4 h-100">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h6 class="fw-bold mb-0"><i class="bi bi-bullseye me-2"></i>Active Goals</h6>
              <span class="badge badge-outline">{{ goals.filter(g => g.status === 'completed').length }}/{{ goals.length }} Done</span>
            </div>
            <div v-if="goals.length" class="d-flex flex-column gap-2">
              <div v-for="g in goals" :key="g.goal_id" class="goal-row p-2 rounded">
                <div class="d-flex justify-content-between small mb-1">
                  <span class="fw-semibold">{{ g.goal_type }}</span>
                  <span class="text-muted">{{ g.current_value }} / {{ g.target_value }}</span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill" :class="g.status==='completed' ? 'fill-done' : 'fill-active'" :style="{width:Math.min(100,(g.current_value/g.target_value)*100)+'%'}"></div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-muted">No goals configured yet.</div>
          </div>
        </div>
        <div class="col-lg-4 col-md-12 col-12">
          <div class="dash-card p-4 h-100 d-flex flex-column">
            <h6 class="fw-bold mb-3"><i class="bi bi-star me-2"></i>Membership Plan</h6>
            <div v-if="sub" class="flex-grow-1 d-flex flex-column">
              <div class="flex-grow-1">
                <div class="plan-type mb-1">{{ sub.plan_type }}</div>
                <span class="badge badge-active mb-3">Active Member</span>
                <div class="text-muted small">Expires: {{ new Date(sub.end_date).toLocaleDateString() }}</div>
              </div>
              <router-link to="/dashboard/subscription" class="btn btn-sm btn-outline w-100 mt-3 py-2">Manage Subscription</router-link>
            </div>
            <div v-else class="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center text-muted gap-2">
              <i class="bi bi-shield-slash fs-1"></i>
              <p class="mb-0">No active plan subscription</p>
              <router-link to="/dashboard/subscription" class="btn btn-sm btn-primary px-4 mt-2">Subscribe Now</router-link>
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
    progress.value = fitStore.progress.value || []
    goals.value = goalsRes.data.goals || []
    sub.value = subRes.data.subscription

    const s = statsRes.data.stats
    statCards.value = [
      { label: 'Current Weight', value: s.currentWeight ? s.currentWeight + ' kg' : '--', icon: 'bi bi-person' },
      { label: 'Workouts (30d)', value: s.totalMinutes30Days + ' min', icon: 'bi bi-activity' },
      { label: 'Calories (30d)', value: s.totalCalories30Days.toLocaleString(), icon: 'bi bi-fire' },
      { label: 'Goals Met', value: goals.value.filter(g => g.status === 'completed').length + '/' + goals.value.length, icon: 'bi bi-bullseye' },
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
.dash-card {
  background: var(--surface);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  transition: border-color 0.2s;
}
.dash-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
}

.stat-card {
  min-height: 90px;
}
.stat-icon {
  width: 44px;
  height: 44px;
  background: rgba(99, 102, 241, 0.12);
  color: var(--primary);
  font-size: 1.15rem;
  flex-shrink: 0;
}
.stat-label {
  color: var(--text-muted);
  letter-spacing: 0.5px;
  font-weight: 600;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-light);
  line-height: 1.2;
}

.badge-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.7rem;
  padding: 4px 10px;
  border-radius: 6px;
}
.badge-active {
  background: rgba(16, 185, 129, 0.12);
  color: var(--success);
  font-weight: 600;
  font-size: 0.75rem;
  padding: 4px 12px;
  border-radius: 6px;
}

.goal-row {
  background: rgba(255, 255, 255, 0.03);
  transition: background 0.15s;
}
.goal-row:hover {
  background: rgba(255, 255, 255, 0.06);
}
.progress-bar-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}
.fill-active {
  background: var(--primary);
}
.fill-done {
  background: var(--success);
}

.plan-type {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--warning);
}

.btn-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-light);
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.15s, border-color 0.15s;
}
.btn-outline:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
}

h6 i {
  color: var(--primary);
  opacity: 0.8;
}
.min-w-0 {
  min-width: 0;
}
</style>
