<template>
  <div>
    <!-- Top Header & Actions -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <h5 class="fw-bold mb-0 text-white">
        <i class="bi bi-graph-up text-cyan me-2"></i>Fitness Progress Tracking
      </h5>
      <button class="btn btn-primary px-3 shadow-sm" data-bs-toggle="modal" data-bs-target="#progressModal" @click="openAdd">
        <i class="bi bi-plus-lg me-1"></i> Add Record
      </button>
    </div>

    <!-- Summary Statistics -->
    <div v-if="!fitStore.loading && fitStore.progress.length" class="row g-3 mb-4">
      <!-- Latest Weight Card -->
      <div class="col-md-3 col-sm-6">
        <div class="glass-card stat-card p-3 h-100 position-relative overflow-hidden">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <div class="text-muted small fw-semibold uppercase tracking-wider mb-1">Latest Weight</div>
              <div class="fs-3 fw-bold text-white mt-1">{{ latestWeight ? latestWeight + ' kg' : '--' }}</div>
              <div v-if="weightChange !== null" class="small mt-2" :class="weightChange <= 0 ? 'text-success' : 'text-warning'">
                <i :class="weightChange <= 0 ? 'bi bi-arrow-down' : 'bi bi-arrow-up'"></i>
                {{ Math.abs(weightChange).toFixed(1) }} kg trend
              </div>
            </div>
            <div class="stat-icon-wrapper" style="background: rgba(6, 182, 212, 0.1);">
              <i class="bi bi-person text-cyan"></i>
            </div>
          </div>
          <div class="card-glow" style="background: radial-gradient(circle, #06B6D4 0%, transparent 70%);"></div>
        </div>
      </div>

      <!-- Latest Body Fat Card -->
      <div class="col-md-3 col-sm-6">
        <div class="glass-card stat-card p-3 h-100 position-relative overflow-hidden">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <div class="text-muted small fw-semibold uppercase tracking-wider mb-1">Body Fat %</div>
              <div class="fs-3 fw-bold text-white mt-1">{{ latestBodyFat ? latestBodyFat + '%' : '--' }}</div>
              <div v-if="bodyFatChange !== null" class="small mt-2" :class="bodyFatChange <= 0 ? 'text-success' : 'text-warning'">
                <i :class="bodyFatChange <= 0 ? 'bi bi-arrow-down' : 'bi bi-arrow-up'"></i>
                {{ Math.abs(bodyFatChange).toFixed(1) }}% trend
              </div>
            </div>
            <div class="stat-icon-wrapper" style="background: rgba(139, 92, 246, 0.1);">
              <i class="bi bi-percent text-purple"></i>
            </div>
          </div>
          <div class="card-glow" style="background: radial-gradient(circle, #8B5CF6 0%, transparent 70%);"></div>
        </div>
      </div>

      <!-- Total Workouts -->
      <div class="col-md-3 col-sm-6">
        <div class="glass-card stat-card p-3 h-100 position-relative overflow-hidden">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <div class="text-muted small fw-semibold uppercase tracking-wider mb-1">Workouts Logged</div>
              <div class="fs-3 fw-bold text-white mt-1">{{ workoutCount }}</div>
              <div class="text-muted small mt-2">Active Tracker</div>
            </div>
            <div class="stat-icon-wrapper" style="background: rgba(16, 185, 129, 0.1);">
              <i class="bi bi-activity text-success"></i>
            </div>
          </div>
          <div class="card-glow" style="background: radial-gradient(circle, #10B981 0%, transparent 70%);"></div>
        </div>
      </div>

      <!-- Total Calories -->
      <div class="col-md-3 col-sm-6">
        <div class="glass-card stat-card p-3 h-100 position-relative overflow-hidden">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <div class="text-muted small fw-semibold uppercase tracking-wider mb-1">Calories Burned</div>
              <div class="fs-3 fw-bold text-white mt-1">{{ totalCalories.toLocaleString() }} kcal</div>
              <div class="text-muted small mt-2">Cumulative</div>
            </div>
            <div class="stat-icon-wrapper" style="background: rgba(239, 68, 68, 0.1);">
              <i class="bi bi-fire text-danger"></i>
            </div>
          </div>
          <div class="card-glow" style="background: radial-gradient(circle, #EF4444 0%, transparent 70%);"></div>
        </div>
      </div>
    </div>

    <!-- Chart Panel -->
    <div v-if="!fitStore.loading && fitStore.progress.length" class="glass-card p-4 mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h6 class="fw-bold mb-0 text-light"><i class="bi bi-activity text-cyan me-2"></i>Progress Visualizer</h6>
        <div class="d-flex align-items-center gap-2">
          <!-- Metric selector -->
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-light" :class="{ active: chartMetric === 'weight' }" @click="setMetric('weight')">Weight</button>
            <button class="btn btn-outline-light" :class="{ active: chartMetric === 'bodyfat' }" @click="setMetric('bodyfat')">Body Fat</button>
            <button class="btn btn-outline-light" :class="{ active: chartMetric === 'calories' }" @click="setMetric('calories')">Calories</button>
          </div>
          <!-- Timeframe filter -->
          <select class="form-select form-select-sm bg-dark text-white border-secondary" v-model="timeframe" @change="updateChartData" style="width:130px;">
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>
      <div style="height: 280px; position: relative;">
        <canvas ref="progressChartCanvas"></canvas>
      </div>
    </div>

    <!-- Main Content State handler -->
    <div v-if="fitStore.loading" class="text-center py-5">
      <div class="spinner"></div>
    </div>
    <div v-else>
      <div v-if="fitStore.progress.length" class="glass-card p-0 overflow-hidden mb-3">
        <div class="table-responsive">
          <table class="table table-dark table-hover mb-0 align-middle">
            <thead>
              <tr class="text-muted small">
                <th class="ps-3">Date</th>
                <th>Weight</th>
                <th>Body Fat</th>
                <th>Workout</th>
                <th>Duration</th>
                <th>Calories</th>
                <th>Measurements</th>
                <th>Notes</th>
                <th class="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in fitStore.progress" :key="p.progress_id" class="progress-row">
                <td class="ps-3 fw-semibold">{{ new Date(p.recorded_date).toLocaleDateString() }}</td>
                <td>
                  <span class="badge bg-glass text-cyan px-2 py-1">
                    {{ p.weight_kg ? p.weight_kg + ' kg' : '-' }}
                  </span>
                </td>
                <td>{{ p.body_fat_pct ? p.body_fat_pct + '%' : '-' }}</td>
                <td>
                  <span v-if="p.workout_type" class="badge bg-secondary text-white px-2 py-1">
                    {{ p.workout_type }}
                  </span>
                  <span v-else>-</span>
                </td>
                <td>{{ p.duration_minutes ? p.duration_minutes + ' min' : '-' }}</td>
                <td>
                  <span v-if="p.calories_burned" class="text-danger fw-semibold">
                    <i class="bi bi-fire me-1"></i>{{ p.calories_burned }}
                  </span>
                  <span v-else>-</span>
                </td>
                <td>
                  <span v-if="hasMeasurements(p)" class="text-info small" :title="getMeasurementsTitle(p)" style="cursor:help;">
                    <i class="bi bi-rulers me-1"></i>Hover to view
                  </span>
                  <span v-else class="text-muted small">-</span>
                </td>
                <td>
                  <small class="text-muted" :title="p.notes">{{ truncateNotes(p.notes) }}</small>
                </td>
                <td class="text-end pe-3">
                  <button class="btn btn-sm btn-outline-info me-2 transition-scale" data-bs-toggle="modal" data-bs-target="#progressModal" @click="openEdit(p)" title="Edit Record">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger transition-scale" @click="deleteProgress(p.progress_id)" title="Delete Record">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="glass-card p-5 text-center text-muted">
        <i class="bi bi-graph-up display-4 mb-3 text-cyan" style="display:block;"></i>
        <h5>No progress records yet</h5>
        <p class="small">Start tracking your weight, body fat, measurements, and workouts to see your analytics here!</p>
        <button class="btn btn-primary btn-sm px-4 mt-2" data-bs-toggle="modal" data-bs-target="#progressModal" @click="openAdd">
          Add First Record
        </button>
      </div>
    </div>

    <!-- Modal Form -->
    <div class="modal fade" id="progressModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dark modal-dialog-centered">
        <div class="modal-content shadow-lg" style="background:var(--surface); color:var(--text-light); border: 1px solid rgba(255, 255, 255, 0.08);">
          <div class="modal-header border-0 pb-0">
            <h5 class="fw-bold text-white mb-0">
              <i class="bi bi-calendar-check text-cyan me-2"></i>{{ editingId ? 'Edit Progress Record' : 'Add Progress Record' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body py-3">
            <form @submit.prevent="save" class="row g-3">
              <!-- Essential metrics -->
              <div class="col-6">
                <label class="form-label small text-muted">Date <span class="text-danger">*</span></label>
                <input class="form-control" type="date" v-model="form.recorded_date" required>
              </div>
              <div class="col-6">
                <label class="form-label small text-muted">Weight (kg)</label>
                <input class="form-control" type="number" step="0.1" v-model.number="form.weight_kg" placeholder="e.g. 72.5">
              </div>
              <div class="col-6">
                <label class="form-label small text-muted">Body Fat %</label>
                <input class="form-control" type="number" step="0.1" v-model.number="form.body_fat_pct" placeholder="e.g. 18.4">
              </div>
              <div class="col-6">
                <label class="form-label small text-muted">Height (cm)</label>
                <input class="form-control" type="number" step="0.1" v-model.number="form.height_cm" placeholder="e.g. 175">
              </div>

              <!-- Workout metrics -->
              <div class="col-6">
                <label class="form-label small text-muted">Workout Type</label>
                <select class="form-select" v-model="form.workout_type">
                  <option value="">None / Rest Day</option>
                  <option>Cardio</option>
                  <option>Strength</option>
                  <option>Yoga</option>
                  <option>HIIT</option>
                  <option>Running</option>
                  <option>Cycling</option>
                  <option>Swimming</option>
                  <option>Walking</option>
                  <option>Other</option>
                </select>
              </div>
              <div class="col-3">
                <label class="form-label small text-muted">Duration (m)</label>
                <input class="form-control" type="number" v-model.number="form.duration_minutes" placeholder="Min">
              </div>
              <div class="col-3">
                <label class="form-label small text-muted">Calories</label>
                <input class="form-control" type="number" v-model.number="form.calories_burned" placeholder="kcal">
              </div>

              <!-- Collapsible Body Measurements -->
              <div class="col-12 mt-2">
                <button type="button" class="btn btn-sm btn-outline-secondary w-100 text-start d-flex justify-content-between align-items-center" @click="showMeasurements = !showMeasurements">
                  <span><i class="bi bi-rulers me-2"></i>Body Measurements (Optional)</span>
                  <i :class="showMeasurements ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
                </button>
                <div v-show="showMeasurements" class="row g-2 mt-2 p-2 rounded bg-dark-glow border border-secondary-subtle">
                  <div class="col-6">
                    <label class="form-label small text-muted">Chest (cm)</label>
                    <input class="form-control form-control-sm" type="number" step="0.1" v-model.number="form.chest_cm" placeholder="Chest">
                  </div>
                  <div class="col-6">
                    <label class="form-label small text-muted">Waist (cm)</label>
                    <input class="form-control form-control-sm" type="number" step="0.1" v-model.number="form.waist_cm" placeholder="Waist">
                  </div>
                  <div class="col-6">
                    <label class="form-label small text-muted">Hips (cm)</label>
                    <input class="form-control form-control-sm" type="number" step="0.1" v-model.number="form.hips_cm" placeholder="Hips">
                  </div>
                  <div class="col-6">
                    <label class="form-label small text-muted">Biceps (cm)</label>
                    <input class="form-control form-control-sm" type="number" step="0.1" v-model.number="form.biceps_cm" placeholder="Biceps">
                  </div>
                </div>
              </div>

              <!-- Notes -->
              <div class="col-12 mt-2">
                <label class="form-label small text-muted">Notes / Journal</label>
                <textarea class="form-control" rows="2" v-model="form.notes" placeholder="How did you feel today?"></textarea>
              </div>

              <!-- Actions -->
              <div class="col-12 d-flex justify-content-end gap-2 border-0 pt-3 mt-3">
                <button type="button" class="btn btn-outline-light px-3" data-bs-dismiss="modal" id="closeProgressModal">Cancel</button>
                <button type="submit" class="btn btn-primary px-4" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
                  {{ submitting ? 'Saving...' : 'Save Record' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useFitnessStore } from '../stores/fitness'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const fitStore = useFitnessStore()
const submitting = ref(false)
const editingId = ref(null)
const showMeasurements = ref(false)

// Chart configuration
const progressChartCanvas = ref(null)
const chartMetric = ref('weight')
const timeframe = ref('30') // default to 30 days
let chartInstance = null

const form = ref({
  recorded_date: new Date().toISOString().split('T')[0],
  weight_kg: null,
  body_fat_pct: null,
  height_cm: null,
  workout_type: '',
  duration_minutes: null,
  calories_burned: null,
  notes: '',
  chest_cm: null,
  waist_cm: null,
  hips_cm: null,
  biceps_cm: null
})

// Summary Computations
const sortedProgress = computed(() => {
  return [...fitStore.progress].sort((a, b) => new Date(a.recorded_date) - new Date(b.recorded_date))
})

const latestWeight = computed(() => {
  const records = sortedProgress.value.filter(r => r.weight_kg)
  return records.length ? records[records.length - 1].weight_kg : null
})

const weightChange = computed(() => {
  const records = sortedProgress.value.filter(r => r.weight_kg)
  if (records.length < 2) return null
  return records[records.length - 1].weight_kg - records[0].weight_kg
})

const latestBodyFat = computed(() => {
  const records = sortedProgress.value.filter(r => r.body_fat_pct)
  return records.length ? records[records.length - 1].body_fat_pct : null
})

const bodyFatChange = computed(() => {
  const records = sortedProgress.value.filter(r => r.body_fat_pct)
  if (records.length < 2) return null
  return records[records.length - 1].body_fat_pct - records[0].body_fat_pct
})

const workoutCount = computed(() => {
  return fitStore.progress.filter(r => r.workout_type).length
})

const totalCalories = computed(() => {
  return fitStore.progress.reduce((sum, r) => sum + (r.calories_burned || 0), 0)
})

// Utility functions
function truncateNotes(notes) {
  if (!notes) return '-'
  return notes.length > 40 ? notes.substring(0, 37) + '...' : notes
}

function hasMeasurements(p) {
  return p.chest_cm || p.waist_cm || p.hips_cm || p.biceps_cm
}

function getMeasurementsTitle(p) {
  const parts = []
  if (p.chest_cm) parts.push(`Chest: ${p.chest_cm}cm`)
  if (p.waist_cm) parts.push(`Waist: ${p.waist_cm}cm`)
  if (p.hips_cm) parts.push(`Hips: ${p.hips_cm}cm`)
  if (p.biceps_cm) parts.push(`Biceps: ${p.biceps_cm}cm`)
  return parts.join(', ') || 'No measurements'
}

// Modal handlers
function openAdd() {
  editingId.value = null
  showMeasurements.value = false
  form.value = {
    recorded_date: new Date().toISOString().split('T')[0],
    weight_kg: null,
    body_fat_pct: null,
    height_cm: null,
    workout_type: '',
    duration_minutes: null,
    calories_burned: null,
    notes: '',
    chest_cm: null,
    waist_cm: null,
    hips_cm: null,
    biceps_cm: null
  }
}

function openEdit(record) {
  editingId.value = record.progress_id
  showMeasurements.value = !!(record.chest_cm || record.waist_cm || record.hips_cm || record.biceps_cm)
  form.value = {
    recorded_date: new Date(record.recorded_date).toISOString().split('T')[0],
    weight_kg: record.weight_kg,
    body_fat_pct: record.body_fat_pct,
    height_cm: record.height_cm,
    workout_type: record.workout_type || '',
    duration_minutes: record.duration_minutes,
    calories_burned: record.calories_burned,
    notes: record.notes || '',
    chest_cm: record.chest_cm,
    waist_cm: record.waist_cm,
    hips_cm: record.hips_cm,
    biceps_cm: record.biceps_cm
  }
}

async function save() {
  submitting.value = true
  try {
    if (editingId.value) {
      await fitStore.updateRecord(editingId.value, form.value)
    } else {
      await fitStore.addRecord(form.value)
    }
    document.getElementById('closeProgressModal')?.click()
    await updateChartData()
  } catch (e) {
    alert(e.message || 'Failed to save progress record')
  } finally {
    submitting.value = false
  }
}

async function deleteProgress(id) {
  if (!confirm('Are you sure you want to delete this record?')) return
  try {
    await fitStore.deleteRecord(id)
    await updateChartData()
  } catch (e) {
    alert('Failed to delete progress record')
  }
}

// Chart rendering & metrics
function setMetric(metric) {
  chartMetric.value = metric
  renderChart()
}

async function updateChartData() {
  await nextTick()
  renderChart()
}

function renderChart() {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
  
  if (!progressChartCanvas.value || !fitStore.progress.length) return

  // Filter and sort records
  let records = [...fitStore.progress].sort((a, b) => new Date(a.recorded_date) - new Date(b.recorded_date))
  
  if (timeframe.value !== 'all') {
    const days = parseInt(timeframe.value)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    records = records.filter(r => new Date(r.recorded_date) >= cutoff)
  }

  if (!records.length) return

  const labels = records.map(r => new Date(r.recorded_date).toLocaleDateString())
  let chartDataValues = []
  let label = ''
  let color = '#06B6D4'
  let fillBg = 'rgba(6, 182, 212, 0.06)'
  let type = 'line'

  if (chartMetric.value === 'weight') {
    chartDataValues = records.map(r => r.weight_kg || null)
    label = 'Weight (kg)'
    color = '#06B6D4'
    fillBg = 'rgba(6, 182, 212, 0.05)'
  } else if (chartMetric.value === 'bodyfat') {
    chartDataValues = records.map(r => r.body_fat_pct || null)
    label = 'Body Fat (%)'
    color = '#8B5CF6'
    fillBg = 'rgba(139, 92, 246, 0.05)'
  } else if (chartMetric.value === 'calories') {
    chartDataValues = records.map(r => r.calories_burned || 0)
    label = 'Calories Burned (kcal)'
    color = '#EF4444'
    type = 'bar'
  }

  chartInstance = new Chart(progressChartCanvas.value, {
    type: type,
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: chartDataValues,
        borderColor: color,
        backgroundColor: fillBg,
        borderWidth: type === 'line' ? 3 : 0,
        borderRadius: type === 'bar' ? 6 : 0,
        tension: 0.35,
        fill: type === 'line',
        pointBackgroundColor: color,
        pointBorderColor: '#090D1A',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: true
      }]
    },
    options: {
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
  })
}

onMounted(async () => {
  await fitStore.fetchProgress()
  renderChart()
})
</script>

<style scoped>
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
.bg-dark-glow {
  background: rgba(0, 0, 0, 0.2);
}
.stat-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
.card-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  opacity: 0.1;
  filter: blur(35px);
  pointer-events: none;
  transition: opacity 0.3s;
}
.stat-card:hover .card-glow {
  opacity: 0.18;
}
.transition-scale {
  transition: transform 0.15s ease, background-color 0.15s ease;
}
.transition-scale:hover {
  transform: scale(1.05);
}
.progress-row {
  transition: background-color 0.2s ease;
}
.progress-row:hover {
  background: rgba(255, 255, 255, 0.02) !important;
}
</style>
