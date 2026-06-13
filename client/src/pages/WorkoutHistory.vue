<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <h5 class="fw-bold mb-0"><i class="bi bi-activity me-2"></i>Workout History</h5>
      <div class="d-flex gap-2 align-items-center">
        <select class="form-select form-select-sm" v-model="filter" style="width:140px;" @change="load">
          <option value="">All Time</option><option value="week">This Week</option><option value="month">This Month</option>
        </select>
        <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#workoutModal" @click="openAdd"><i class="bi bi-plus"></i> Log Workout</button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else-if="workouts.length" class="glass-card p-0 overflow-hidden">
      <div class="table-responsive">
        <table class="table table-dark table-hover mb-0">
          <thead><tr><th>Date</th><th>Type</th><th>Duration</th><th>Calories</th><th>Notes</th><th></th></tr></thead>
          <tbody>
            <tr v-for="w in workouts" :key="w.workout_id">
              <td>{{ new Date(w.workout_date).toLocaleDateString() }}</td>
              <td><span class="badge bg-accent text-dark">{{ w.workout_type }}</span></td>
              <td>{{ w.duration_minutes }} min</td>
              <td>{{ w.calories_burned || 0 }}</td>
              <td><small class="text-muted">{{ (w.notes || '').substring(0,30) }}</small></td>
              <td><button class="btn btn-sm btn-outline-danger" @click="remove(w.workout_id)"><i class="bi bi-trash"></i></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="glass-card p-5 text-center text-muted">
      <i class="bi bi-activity display-4 mb-3" style="display:block;"></i>
      <p>No workouts logged yet. Start tracking your exercise!</p>
    </div>

    <div class="modal fade" id="workoutModal" tabindex="-1">
      <div class="modal-dialog"><div class="modal-content" style="background:var(--surface);color:var(--text-light);">
        <div class="modal-header border-0"><h5 class="fw-bold">Log Workout</h5></div>
        <div class="modal-body">
          <div class="mb-3"><label class="form-label small">Workout Type</label>
            <select class="form-select" v-model="form.workoutType"><option>Cardio</option><option>Strength</option><option>Yoga</option><option>HIIT</option><option>Running</option><option>Cycling</option><option>Swimming</option><option>Walking</option><option>Other</option></select></div>
          <div class="row g-3 mb-3">
            <div class="col"><label class="form-label small">Duration (min)</label><input class="form-control" type="number" v-model.number="form.durationMinutes"></div>
            <div class="col"><label class="form-label small">Calories Burned</label><input class="form-control" type="number" v-model.number="form.caloriesBurned"></div>
          </div>
          <div class="mb-3"><label class="form-label small">Date</label><input class="form-control" type="date" v-model="form.workoutDate"></div>
          <div class="mb-3"><label class="form-label small">Notes</label><textarea class="form-control" rows="2" v-model="form.notes"></textarea></div>
        </div>
        <div class="modal-footer border-0">
          <button class="btn btn-outline-light" data-bs-dismiss="modal">Cancel</button>
          <button class="btn btn-primary" @click="save" :disabled="submitting">{{ submitting ? '...' : 'Log' }}</button>
        </div>
      </div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const workouts = ref([])
const loading = ref(true)
const submitting = ref(false)
const filter = ref('')
const form = ref({ workoutType: 'Cardio', durationMinutes: 30, caloriesBurned: 0, workoutDate: new Date().toISOString().split('T')[0], notes: '' })

async function load() {
  loading.value = true
  try {
    const params = {}
    if (filter.value === 'week') {
      const d = new Date(); d.setDate(d.getDate() - d.getDay())
      params.from = d.toISOString().split('T')[0]
    } else if (filter.value === 'month') {
      const d = new Date(); d.setDate(1)
      params.from = d.toISOString().split('T')[0]
    }
    const res = await api.get('/user/workouts', { params })
    workouts.value = res.data.workouts || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

function openAdd() { form.value = { workoutType: 'Cardio', durationMinutes: 30, caloriesBurned: 0, workoutDate: new Date().toISOString().split('T')[0], notes: '' } }

async function save() {
  submitting.value = true
  try {
    await api.post('/user/workouts', form.value)
    document.querySelector('[data-bs-dismiss="modal"]')?.click()
    await load()
  } catch (e) { alert('Failed') }
  finally { submitting.value = false }
}

async function remove(id) {
  if (!confirm('Delete this workout?')) return
  await api.delete(`/user/workouts/${id}`)
  await load()
}

onMounted(load)
</script>
