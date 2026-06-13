<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <h5 class="fw-bold mb-0"><i class="bi bi-graph-up me-2"></i>Fitness Progress</h5>
      <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#progressModal" @click="openAdd"><i class="bi bi-plus"></i> Add Record</button>
    </div>

    <div v-if="fitStore.loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else>
      <div v-if="fitStore.progress.length" class="glass-card p-0 overflow-hidden mb-3">
        <div class="table-responsive">
          <table class="table table-dark table-hover mb-0">
            <thead><tr><th>Date</th><th>Weight</th><th>Body Fat</th><th>Workout</th><th>Duration</th><th>Calories</th><th>Notes</th><th></th></tr></thead>
            <tbody>
              <tr v-for="p in fitStore.progress" :key="p.progress_id">
                <td>{{ new Date(p.recorded_date).toLocaleDateString() }}</td>
                <td>{{ p.weight_kg ? p.weight_kg + ' kg' : '-' }}</td>
                <td>{{ p.body_fat_pct ? p.body_fat_pct + '%' : '-' }}</td>
                <td>{{ p.workout_type || '-' }}</td>
                <td>{{ p.duration_minutes ? p.duration_minutes + ' min' : '-' }}</td>
                <td>{{ p.calories_burned || '-' }}</td>
                <td><small class="text-muted">{{ (p.notes || '').substring(0,30) }}</small></td>
                <td><button class="btn btn-sm btn-outline-danger" @click="deleteProgress(p.progress_id)"><i class="bi bi-trash"></i></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="glass-card p-5 text-center text-muted">
        <i class="bi bi-graph-up display-4 mb-3" style="display:block;"></i>
        <p>No progress records yet. Start tracking your fitness journey!</p>
      </div>
    </div>

    <div class="modal fade" id="progressModal" tabindex="-1">
      <div class="modal-dialog modal-dark"><div class="modal-content" style="background:var(--surface);color:var(--text-light);">
        <div class="modal-header border-0"><h5 class="fw-bold">Add Progress Record</h5></div>
        <div class="modal-body">
          <div class="row g-3">
            <div class="col-6"><label class="form-label small">Date</label><input class="form-control" type="date" v-model="form.recorded_date"></div>
            <div class="col-6"><label class="form-label small">Weight (kg)</label><input class="form-control" type="number" step="0.1" v-model.number="form.weight_kg"></div>
            <div class="col-6"><label class="form-label small">Body Fat %</label><input class="form-control" type="number" step="0.1" v-model.number="form.body_fat_pct"></div>
            <div class="col-6"><label class="form-label small">Height (cm)</label><input class="form-control" type="number" step="0.1" v-model.number="form.height_cm"></div>
            <div class="col-6"><label class="form-label small">Workout Type</label>
              <select class="form-select" v-model="form.workout_type"><option value="">Select</option><option>Cardio</option><option>Strength</option><option>Yoga</option><option>HIIT</option><option>Running</option><option>Cycling</option><option>Swimming</option><option>Walking</option><option>Other</option></select></div>
            <div class="col-3"><label class="form-label small">Duration (min)</label><input class="form-control" type="number" v-model.number="form.duration_minutes"></div>
            <div class="col-3"><label class="form-label small">Calories</label><input class="form-control" type="number" v-model.number="form.calories_burned"></div>
            <div class="col-12"><label class="form-label small">Notes</label><textarea class="form-control" rows="2" v-model="form.notes"></textarea></div>
          </div>
        </div>
        <div class="modal-footer border-0">
          <button class="btn btn-outline-light" data-bs-dismiss="modal">Cancel</button>
          <button class="btn btn-primary" @click="save" :disabled="submitting">{{ submitting ? 'Saving...' : 'Save' }}</button>
        </div>
      </div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFitnessStore } from '../stores/fitness'

const fitStore = useFitnessStore()
const submitting = ref(false)
const form = ref({ recorded_date: new Date().toISOString().split('T')[0], weight_kg: null, body_fat_pct: null, height_cm: null, workout_type: '', duration_minutes: null, calories_burned: null, notes: '' })
const editingId = ref(null)

function openAdd() {
  editingId.value = null
  form.value = { recorded_date: new Date().toISOString().split('T')[0], weight_kg: null, body_fat_pct: null, height_cm: null, workout_type: '', duration_minutes: null, calories_burned: null, notes: '' }
}

async function save() {
  submitting.value = true
  try {
    await fitStore.addRecord(form.value)
    document.querySelector('[data-bs-dismiss="modal"]')?.click()
  } catch (e) { alert('Failed to save') }
  finally { submitting.value = false }
}

async function deleteProgress(id) {
  if (!confirm('Delete this record?')) return
  try {
    await api.delete(`/fitness/progress/${id}`)
    await fitStore.fetchProgress()
  } catch (e) { alert('Failed to delete') }
}

onMounted(() => fitStore.fetchProgress())
</script>
