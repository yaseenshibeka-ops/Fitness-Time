<template>
  <div>
    <!-- Top Header & Actions -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <h5 class="fw-bold mb-0">
        <i class="bi bi-graph-up me-2"></i>Fitness Progress Tracking
      </h5>
      <button class="btn btn-primary btn-sm px-3" data-bs-toggle="modal" data-bs-target="#progressModal" @click="openAdd">
        <i class="bi bi-plus-lg me-1"></i> Add Record
      </button>
    </div>

    <!-- Summary Statistics -->
    <div v-if="!loading && progress.length" class="row g-3 mb-4">
      <div class="col-md-3 col-sm-6">
        <div class="stat-card d-flex align-items-center gap-3 p-3">
          <div class="stat-icon icon-cyan flex-shrink-0 d-flex align-items-center justify-content-center rounded">
            <i class="bi bi-person"></i>
          </div>
          <div class="min-w-0">
            <div class="stat-label text-uppercase small mb-1">Latest Weight</div>
            <div class="stat-value">{{ latestWeight ? latestWeight + ' kg' : '--' }}</div>
            <div v-if="weightChange !== null" class="stat-trend mt-1" :class="weightChange <= 0 ? 'trend-down' : 'trend-up'">
              <i :class="weightChange <= 0 ? 'bi bi-arrow-down' : 'bi bi-arrow-up'"></i>
              {{ Math.abs(weightChange).toFixed(1) }} kg
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3 col-sm-6">
        <div class="stat-card d-flex align-items-center gap-3 p-3">
          <div class="stat-icon icon-purple flex-shrink-0 d-flex align-items-center justify-content-center rounded">
            <i class="bi bi-percent"></i>
          </div>
          <div class="min-w-0">
            <div class="stat-label text-uppercase small mb-1">Body Fat %</div>
            <div class="stat-value">{{ latestBodyFat ? latestBodyFat + '%' : '--' }}</div>
            <div v-if="bodyFatChange !== null" class="stat-trend mt-1" :class="bodyFatChange <= 0 ? 'trend-down' : 'trend-up'">
              <i :class="bodyFatChange <= 0 ? 'bi bi-arrow-down' : 'bi bi-arrow-up'"></i>
              {{ Math.abs(bodyFatChange).toFixed(1) }}%
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3 col-sm-6">
        <div class="stat-card d-flex align-items-center gap-3 p-3">
          <div class="stat-icon icon-indigo flex-shrink-0 d-flex align-items-center justify-content-center rounded">
            <i class="bi bi-activity"></i>
          </div>
          <div class="min-w-0">
            <div class="stat-label text-uppercase small mb-1">Workouts Logged</div>
            <div class="stat-value">{{ workoutCount }}</div>
            <div class="stat-trend mt-1 text-accent">Active Tracker</div>
          </div>
        </div>
      </div>

      <div class="col-md-3 col-sm-6">
        <div class="stat-card d-flex align-items-center gap-3 p-3">
          <div class="stat-icon icon-orange flex-shrink-0 d-flex align-items-center justify-content-center rounded">
            <i class="bi bi-fire"></i>
          </div>
          <div class="min-w-0">
            <div class="stat-label text-uppercase small mb-1">Calories Burned</div>
            <div class="stat-value text-calories">{{ totalCalories.toLocaleString() }} kcal</div>
            <div class="stat-trend mt-1 text-muted">Cumulative</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Panel -->
    <div v-if="!loading && progress.length" class="dash-card p-4 mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h6 class="fw-bold mb-0"><i class="bi bi-activity me-2"></i>Progress Visualizer</h6>
        <div class="d-flex align-items-center gap-2">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-sm btn-metric" :class="{ active: chartMetric === 'weight' }" @click="setMetric('weight')">Weight</button>
            <button class="btn btn-sm btn-metric" :class="{ active: chartMetric === 'bodyfat' }" @click="setMetric('bodyfat')">Body Fat</button>
            <button class="btn btn-sm btn-metric" :class="{ active: chartMetric === 'calories' }" @click="setMetric('calories')">Calories</button>
          </div>
          <select class="form-select form-select-sm timeframe-select" v-model="timeframe" @change="updateChartData" style="width:120px;">
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
            <option value="90">90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>
      <div style="height: 280px; position: relative;">
        <canvas ref="progressChartCanvas"></canvas>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner"></div>
    </div>
    <div v-else>
      <div v-if="progress.length" class="dash-card p-0 mb-3">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead>
              <tr class="small">
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
              <tr v-for="p in progress" :key="p.progress_id" class="progress-row">
                <td class="ps-3 fw-semibold">{{ new Date(p.recorded_date).toLocaleDateString() }}</td>
                <td>
                  <span class="badge badge-weight">{{ p.weight_kg ? p.weight_kg + ' kg' : '-' }}</span>
                </td>
                <td>{{ p.body_fat_pct ? p.body_fat_pct + '%' : '-' }}</td>
                <td>
                  <span v-if="p.workout_type" class="badge badge-workout">{{ p.workout_type }}</span>
                  <span v-else>-</span>
                </td>
                <td>{{ p.duration_minutes ? p.duration_minutes + ' min' : '-' }}</td>
                <td>
                  <span v-if="p.calories_burned" class="text-calories fw-semibold">
                    <i class="bi bi-fire me-1"></i>{{ p.calories_burned }}
                  </span>
                  <span v-else>-</span>
                </td>
                <td>
                  <span v-if="hasMeasurements(p)" class="text-muted small" :title="getMeasurementsTitle(p)" style="cursor:help;">
                    <i class="bi bi-rulers me-1"></i>View
                  </span>
                  <span v-else class="text-muted small">-</span>
                </td>
                <td>
                  <small class="text-muted" :title="p.notes">{{ truncateNotes(p.notes) }}</small>
                </td>
                <td class="text-end pe-3">
                  <button class="btn btn-sm btn-row-action me-1" data-bs-toggle="modal" data-bs-target="#progressModal" @click="openEdit(p)" title="Edit Record">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-row-action btn-row-danger" @click="deleteProgress(p.progress_id)" title="Delete Record">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="dash-card p-5 text-center text-muted">
        <i class="bi bi-graph-up display-4 mb-3" style="display:block; opacity:0.4;"></i>
        <h5>No progress records yet</h5>
        <p class="small">Start tracking your weight, body fat, measurements, and workouts to see your analytics here!</p>
        <button class="btn btn-primary btn-sm px-4 mt-2" data-bs-toggle="modal" data-bs-target="#progressModal" @click="openAdd">
          Add First Record
        </button>
      </div>
    </div>

    <!-- Modal Form -->
    <div class="modal fade" id="progressModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header pb-0">
            <h5 class="fw-bold mb-0">
              <i class="bi bi-calendar-check me-2"></i>{{ editingId ? 'Edit Progress Record' : 'Add Progress Record' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body py-3">
            <form @submit.prevent="save" class="row g-3">
              <div class="col-6">
                <label class="form-label small">Date <span class="text-danger">*</span></label>
                <input class="form-control" type="date" v-model="form.recorded_date" required>
              </div>
              <div class="col-6">
                <label class="form-label small">Weight (kg)</label>
                <input class="form-control" type="number" step="0.1" v-model.number="form.weight_kg" placeholder="e.g. 72.5">
              </div>
              <div class="col-6">
                <label class="form-label small">Body Fat %</label>
                <input class="form-control" type="number" step="0.1" v-model.number="form.body_fat_pct" placeholder="e.g. 18.4">
              </div>
              <div class="col-6">
                <label class="form-label small">Height (cm)</label>
                <input class="form-control" type="number" step="0.1" v-model.number="form.height_cm" placeholder="e.g. 175">
              </div>

              <div class="col-6">
                <label class="form-label small">Workout Type</label>
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
                <label class="form-label small">Duration (m)</label>
                <input class="form-control" type="number" v-model.number="form.duration_minutes" placeholder="Min">
              </div>
              <div class="col-3">
                <label class="form-label small">Calories</label>
                <input class="form-control" type="number" v-model.number="form.calories_burned" placeholder="kcal">
              </div>

              <div class="col-12 mt-2">
                <button type="button" class="btn btn-sm btn-outline w-100 text-start d-flex justify-content-between align-items-center" @click="showMeasurements = !showMeasurements">
                  <span><i class="bi bi-rulers me-2"></i>Body Measurements (Optional)</span>
                  <i :class="showMeasurements ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
                </button>
                <div v-show="showMeasurements" class="row g-2 mt-2 p-2 rounded measurements-panel">
                  <div class="col-6">
                    <label class="form-label small">Chest (cm)</label>
                    <input class="form-control form-control-sm" type="number" step="0.1" v-model.number="form.chest_cm" placeholder="Chest">
                  </div>
                  <div class="col-6">
                    <label class="form-label small">Waist (cm)</label>
                    <input class="form-control form-control-sm" type="number" step="0.1" v-model.number="form.waist_cm" placeholder="Waist">
                  </div>
                  <div class="col-6">
                    <label class="form-label small">Hips (cm)</label>
                    <input class="form-control form-control-sm" type="number" step="0.1" v-model.number="form.hips_cm" placeholder="Hips">
                  </div>
                  <div class="col-6">
                    <label class="form-label small">Biceps (cm)</label>
                    <input class="form-control form-control-sm" type="number" step="0.1" v-model.number="form.biceps_cm" placeholder="Biceps">
                  </div>
                </div>
              </div>

              <div class="col-12 mt-2">
                <label class="form-label small">Notes / Journal</label>
                <textarea class="form-control" rows="2" v-model="form.notes" placeholder="How did you feel today?"></textarea>
              </div>

              <div class="col-12 d-flex justify-content-end gap-2 pt-3 mt-3 border-0">
                <button type="button" class="btn btn-sm btn-outline px-3" data-bs-dismiss="modal" id="closeProgressModal">Cancel</button>
                <button type="submit" class="btn btn-primary btn-sm px-4" :disabled="submitting">
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
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useFitnessStore } from '../stores/fitness'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const { progress, loading, fetchProgress, addRecord, deleteRecord, updateRecord } = useFitnessStore()
const submitting = ref(false)
const editingId = ref(null)
const showMeasurements = ref(false)

// Chart configuration
const progressChartCanvas = ref(null)
const chartMetric = ref('weight')
const timeframe = ref('30') // default to 30 days
let chartInstance = null
let themeObserver = null

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
  return [...progress.value].sort((a, b) => new Date(a.recorded_date) - new Date(b.recorded_date))
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
  return progress.value.filter(r => r.workout_type).length
})

const totalCalories = computed(() => {
  return progress.value.reduce((sum, r) => sum + (r.calories_burned || 0), 0)
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

// Keep close modal helper
function closeModal() {
  document.getElementById('closeProgressModal')?.click()
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
      await updateRecord(editingId.value, form.value)
    } else {
      await addRecord(form.value)
    }
    closeModal()
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
    await deleteRecord(id)
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
  
  if (!progressChartCanvas.value || !progress.value.length) return

  // Filter and sort records
  let records = [...progress.value].sort((a, b) => new Date(a.recorded_date) - new Date(b.recorded_date))
  
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

  // Get active theme variables
  const isLight = document.documentElement.classList.contains('light')
  const gridColor = isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.04)'
  const ticksColor = isLight ? '#475569' : '#94A3B8'
  const ptBorderColor = isLight ? '#FFFFFF' : '#090D1A'
  
  const tooltipBg = isLight ? '#FFFFFF' : '#121829'
  const tooltipTitle = isLight ? '#0F172A' : '#F8FAFC'
  const tooltipBody = isLight ? '#475569' : '#94A3B8'
  const tooltipBorder = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.08)'

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
        pointBorderColor: ptBorderColor,
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
          backgroundColor: tooltipBg,
          titleColor: tooltipTitle,
          bodyColor: tooltipBody,
          borderColor: tooltipBorder,
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          usePointStyle: true
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: ticksColor, font: { family: 'Inter', size: 11 } }
        },
        y: {
          grid: { color: gridColor, drawTicks: false },
          ticks: { color: ticksColor, font: { family: 'Inter', size: 11 } }
        }
      }
    }
  })
}

onMounted(async () => {
  await fetchProgress()
  renderChart()

  // Track theme switches
  themeObserver = new MutationObserver(() => {
    renderChart()
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
  if (themeObserver) {
    themeObserver.disconnect()
  }
})
</script>

<style scoped>
/* Smooth animations and transitions */
* {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
}

.dash-card {
  background: var(--glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.15);
}
.dash-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 12px 40px 0 rgba(99, 102, 241, 0.15);
}

.stat-card {
  background: var(--glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  min-height: 85px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
}
.stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 12px 30px rgba(99, 102, 241, 0.18);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px !important;
  font-size: 1.25rem;
}

/* Glowing icon wrappers */
.icon-cyan {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.18), rgba(6, 182, 212, 0.05));
  color: #06B6D4;
  border: 1px solid rgba(6, 182, 212, 0.2);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.15);
}
.icon-purple {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(139, 92, 246, 0.05));
  color: #8B5CF6;
  border: 1px solid rgba(139, 92, 246, 0.2);
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.15);
}
.icon-indigo {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(99, 102, 241, 0.05));
  color: #6366F1;
  border: 1px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.15);
}
.icon-orange {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.18), rgba(249, 115, 22, 0.05));
  color: #F97316;
  border: 1px solid rgba(249, 115, 22, 0.2);
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.15);
}

.stat-label {
  color: var(--text-muted);
  letter-spacing: 0.5px;
  font-weight: 600;
}
.stat-value {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--text-light);
  line-height: 1.2;
}
.stat-trend {
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 20px;
}
.trend-down {
  color: #10B981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.15);
}
.trend-up {
  color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.15);
}

/* Premium segmented controls */
.btn-group {
  background: rgba(148, 163, 184, 0.08);
  padding: 4px;
  border-radius: 30px;
  border: 1px solid var(--glass-border);
}
.btn-metric {
  background: transparent;
  border: none;
  color: var(--text-muted);
  border-radius: 20px !important;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 14px;
}
.btn-metric:hover {
  color: var(--text-light);
}
.btn-metric.active {
  background: var(--primary) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.timeframe-select {
  background-color: var(--surface);
  border: 1px solid var(--glass-border);
  color: var(--text-light);
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 20px;
  padding-left: 12px;
  padding-right: 28px;
}
.timeframe-select:focus {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

table.table {
  color: var(--text-light);
}
table.table thead th {
  color: var(--text-muted);
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.75px;
  border-bottom: 1px solid var(--glass-border);
  padding: 1rem 0.75rem;
}
table.table tbody td {
  border-color: var(--glass-border);
  padding: 1rem 0.75rem;
  vertical-align: middle;
}
.progress-row:hover {
  background: rgba(99, 102, 241, 0.06);
}

.badge-weight {
  background: rgba(99, 102, 241, 0.12);
  color: #8B5CF6;
  border: 1px solid rgba(99, 102, 241, 0.2);
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 8px;
}
.badge-workout {
  background: rgba(6, 182, 212, 0.1);
  color: #06B6D4;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(6, 182, 212, 0.2);
}
.text-calories {
  color: #F97316;
}

.btn-row-action {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
  padding: 6px 10px;
  border-radius: 8px;
}
.btn-row-action:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-light);
  border-color: rgba(255, 255, 255, 0.2);
}
html.light .btn-row-action:hover {
  background: rgba(15, 23, 42, 0.06);
  color: var(--text-light);
  border-color: rgba(15, 23, 42, 0.2);
}
.btn-row-danger:hover {
  background: rgba(239, 68, 68, 0.12);
  color: var(--danger);
  border-color: rgba(239, 68, 68, 0.25);
}

.min-w-0 {
  min-width: 0;
}

.modal-content {
  background: var(--surface);
  color: var(--text-light);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}
.modal-header {
  border-bottom: 1px solid var(--glass-border);
  padding: 1.25rem 1.5rem;
}
.btn-close {
  filter: invert(1);
}
html.light .btn-close {
  filter: none;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-light);
  border-radius: 10px;
  font-weight: 600;
}
.btn-outline:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.25);
}
html.light .btn-outline:hover {
  background: rgba(15, 23, 42, 0.06);
  border-color: rgba(15, 23, 42, 0.25);
}

.measurements-panel {
  background: var(--surface-variant);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
}
</style>
