<template>
  <div>
    <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
      <input type="search" class="form-control form-control-sm" placeholder="Search user..." v-model="search" @input="debouncedLoad" style="width:200px;">
      <select class="form-select form-select-sm" v-model="typeFilter" @change="loadFitness" style="width:160px;">
        <option value="">All Types</option><option value="workout">Workout</option><option value="nutrition">Nutrition</option><option value="measurement">Measurement</option>
      </select>
    </div>
    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else-if="records.length" class="glass-card p-0 overflow-hidden">
      <table class="table table-dark table-hover mb-0">
        <thead><tr><th>User</th><th>Type</th><th>Data</th><th>Date</th><th></th></tr></thead>
        <tbody>
          <tr v-for="r in records" :key="r.record_id">
            <td>{{ r.full_name }}</td>
            <td><span class="badge bg-accent text-dark">{{ r.record_type }}</span></td>
            <td><small>{{ JSON.stringify(r.record_data).substring(0,60) }}</small></td>
            <td>{{ new Date(r.created_at).toLocaleDateString() }}</td>
            <td>
              <button class="btn btn-sm btn-outline-danger" @click="deleteRecord(r.record_id)"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="pages>1" class="d-flex justify-content-center p-3">
        <nav><ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{disabled:page<=1}"><button class="page-link bg-dark text-light border-secondary" @click="page--;loadFitness()">Prev</button></li>
          <li class="page-item disabled"><span class="page-link bg-dark text-light border-secondary">{{ page }}/{{ pages }}</span></li>
          <li class="page-item" :class="{disabled:page>=pages}"><button class="page-link bg-dark text-light border-secondary" @click="page++;loadFitness()">Next</button></li>
        </ul></nav>
      </div>
    </div>
    <div v-else class="text-center py-5 text-muted">No fitness records found</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const records = ref([])
const loading = ref(true)
const search = ref('')
const typeFilter = ref('')
const page = ref(1)
const pages = ref(1)
let debounceTimer

function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; loadFitness() }, 300)
}

async function loadFitness() {
  loading.value = true
  try {
    const params = { page: page.value, limit: 20, search: search.value, record_type: typeFilter.value }
    const res = await api.get('/admin/fitness', { params })
    records.value = res.data.records || []
    pages.value = res.data.pages
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function deleteRecord(id) {
  if (!confirm('Delete this record?')) return
  await api.delete(`/admin/fitness/${id}`)
  await loadFitness()
}

onMounted(loadFitness)
</script>
