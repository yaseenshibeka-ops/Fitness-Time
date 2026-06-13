<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bold mb-0"><i class="bi bi-bullseye me-2"></i>My Goals</h5>
      <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#goalModal" @click="openAdd"><i class="bi bi-plus"></i> New Goal</button>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else-if="goals.length" class="row g-3">
      <div v-for="g in goals" :key="g.goal_id" class="col-md-6">
        <div class="glass-card p-3">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <span class="badge" :class="g.status==='completed'?'bg-success':g.status==='abandoned'?'bg-danger':'bg-accent text-dark'">{{ g.status }}</span>
              <h6 class="fw-bold mt-1 mb-0">{{ g.goal_type }}</h6>
            </div>
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-light" data-bs-toggle="dropdown"><i class="bi bi-three-dots"></i></button>
              <ul class="dropdown-menu dropdown-menu-dark">
                <li><a class="dropdown-item" href="#" @click.prevent="editGoal(g)" data-bs-toggle="modal" data-bs-target="#goalModal">Edit</a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="complete(g.goal_id)">Mark Complete</a></li>
                <li><a class="dropdown-item text-danger" href="#" @click.prevent="remove(g.goal_id)">Delete</a></li>
              </ul>
            </div>
          </div>
          <div class="d-flex justify-content-between small mb-1 text-muted">
            <span>Progress</span><span>{{ g.current_value }} / {{ g.target_value }} {{ g.unit }}</span>
          </div>
          <div class="progress" style="height:8px;">
            <div class="progress-bar" :class="g.status==='completed'?'bg-success':'bg-accent'" :style="{width:Math.min(100,(g.current_value/g.target_value)*100)+'%'}"></div>
          </div>
          <div v-if="g.deadline" class="text-muted small mt-2">
            <i class="bi bi-calendar me-1"></i>Due: {{ new Date(g.deadline).toLocaleDateString() }}
          </div>
        </div>
      </div>
    </div>
    <div v-else class="glass-card p-5 text-center text-muted">
      <i class="bi bi-bullseye display-4 mb-3" style="display:block;"></i>
      <p>No goals set. Create your first fitness goal!</p>
    </div>

    <div class="modal fade" id="goalModal" tabindex="-1">
      <div class="modal-dialog"><div class="modal-content" style="background:var(--surface);color:var(--text-light);">
        <div class="modal-header border-0"><h5 class="fw-bold">{{ editingId ? 'Edit' : 'New' }} Goal</h5></div>
        <div class="modal-body">
          <div class="mb-3"><label class="form-label small">Goal Type</label>
            <select class="form-select" v-model="form.goal_type">
              <option value="Lose Weight">Lose Weight</option><option value="Gain Muscle">Gain Muscle</option>
              <option value="Increase Endurance">Increase Endurance</option><option value="Weekly Workout Target">Weekly Workout Target</option>
              <option value="Calories Target">Calories Target</option><option value="Other">Other</option>
            </select></div>
          <div class="row g-3 mb-3">
            <div class="col"><label class="form-label small">Target Value</label><input class="form-control" type="number" v-model.number="form.target_value"></div>
            <div class="col"><label class="form-label small">Current Value</label><input class="form-control" type="number" v-model.number="form.current_value"></div>
          </div>
          <div class="mb-3"><label class="form-label small">Unit (e.g., kg, min, sessions)</label><input class="form-control" v-model="form.unit"></div>
          <div class="mb-3"><label class="form-label small">Deadline</label><input class="form-control" type="date" v-model="form.deadline"></div>
        </div>
        <div class="modal-footer border-0">
          <button class="btn btn-outline-light" data-bs-dismiss="modal">Cancel</button>
          <button class="btn btn-primary" @click="save" :disabled="submitting">{{ submitting ? '...' : editingId ? 'Update' : 'Create' }}</button>
        </div>
      </div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const goals = ref([])
const loading = ref(true)
const submitting = ref(false)
const editingId = ref(null)
const form = ref({ goal_type: 'Lose Weight', target_value: null, current_value: 0, unit: 'kg', deadline: '' })

function openAdd() { editingId.value = null; form.value = { goal_type: 'Lose Weight', target_value: null, current_value: 0, unit: 'kg', deadline: '' } }
function editGoal(g) { editingId.value = g.goal_id; form.value = { goal_type: g.goal_type, target_value: g.target_value, current_value: g.current_value, unit: g.unit || 'kg', deadline: g.deadline ? g.deadline.split('T')[0] : '' } }

async function load() {
  loading.value = true
  try { const res = await api.get('/user/goals'); goals.value = res.data.goals || [] }
  catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function save() {
  submitting.value = true
  try {
    if (editingId.value) await api.put(`/user/goals/${editingId.value}`, form.value)
    else await api.post('/fitness/goals', form.value)
    document.querySelector('[data-bs-dismiss="modal"]')?.click()
    await load()
  } catch (e) { alert('Failed') }
  finally { submitting.value = false }
}

async function complete(id) {
  await api.put(`/user/goals/${id}`, { status: 'completed' })
  await load()
}

async function remove(id) {
  if (!confirm('Delete this goal?')) return
  await api.delete(`/user/goals/${id}`)
  await load()
}

onMounted(load)
</script>
