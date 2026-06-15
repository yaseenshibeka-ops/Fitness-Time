<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <div class="d-flex gap-2">
        <input type="search" class="form-control form-control-sm" placeholder="Search users..." v-model="search" @input="debouncedLoad" style="width:200px;">
        <select class="form-select form-select-sm" v-model="roleFilter" @change="loadUsers" style="width:130px;">
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button v-if="selected.length" class="btn btn-sm btn-outline-danger" @click="bulkDelete">Delete Selected ({{ selected.length }})</button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else-if="users.length" class="glass-card p-0 overflow-hidden">
      <table class="table table-dark table-hover mb-0">
        <thead><tr><th><input type="checkbox" @change="toggleAll" :checked="selected.length===users.length"></th><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Joined</th><th></th></tr></thead>
        <tbody>
          <tr v-for="u in users" :key="u.user_id">
            <td><input type="checkbox" :value="u.user_id" v-model="selected" :disabled="u.role==='admin'"></td>
            <td>{{ u.user_id }}</td>
            <td>{{ u.full_name }}</td>
            <td>{{ u.email }}</td>
            <td><span class="badge" :class="u.role==='admin'?'bg-accent text-dark':'bg-primary'">{{ u.role }}</span></td>
            <td>{{ u.phone || '-' }}</td>
            <td>{{ new Date(u.created_at).toLocaleDateString() }}</td>
            <td>
              <button class="btn btn-sm btn-outline-light me-1" @click="editUser(u)" data-bs-toggle="modal" data-bs-target="#userModal"><i class="bi bi-pencil"></i></button>
              <button v-if="u.role!=='admin'" class="btn btn-sm btn-outline-danger" @click="deleteUser(u.user_id)"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="pages > 1" class="d-flex justify-content-center p-3">
        <nav><ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{disabled:page<=1}"><button class="page-link bg-dark text-light border-secondary" @click="page--;loadUsers()">Prev</button></li>
          <li class="page-item disabled"><span class="page-link bg-dark text-light border-secondary">{{ page }}/{{ pages }}</span></li>
          <li class="page-item" :class="{disabled:page>=pages}"><button class="page-link bg-dark text-light border-secondary" @click="page++;loadUsers()">Next</button></li>
        </ul></nav>
      </div>
    </div>
    <div v-else class="text-center py-5 text-muted">No users found</div>

    <div class="modal fade" id="userModal" tabindex="-1">
      <div class="modal-dialog modal-dark"><div class="modal-content" style="background:var(--surface);color:var(--text-light);">
        <div class="modal-header border-0"><h5 class="fw-bold">Edit User</h5></div>
        <div class="modal-body">
          <div class="mb-3"><input class="form-control" v-model="form.full_name" placeholder="Full Name"></div>
          <div class="mb-3"><input class="form-control" v-model="form.email" placeholder="Email"></div>
          <div class="mb-3"><input class="form-control" v-model="form.phone" placeholder="Phone"></div>
          <div class="mb-3"><textarea class="form-control" v-model="form.address" placeholder="Address" rows="2"></textarea></div>
          <div class="mb-3">
            <select class="form-select" v-model="form.role">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div class="modal-footer border-0">
          <button class="btn btn-outline-light" data-bs-dismiss="modal">Cancel</button>
          <button class="btn btn-primary" @click="saveUser">Save</button>
        </div>
      </div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const users = ref([])
const loading = ref(true)
const search = ref('')
const roleFilter = ref('')
const page = ref(1)
const pages = ref(1)
const selected = ref([])
const form = ref({ full_name: '', email: '', phone: '', address: '', role: 'user' })
const editingId = ref(null)
let debounceTimer

function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; loadUsers() }, 300)
}

async function loadUsers() {
  loading.value = true
  try {
    const params = { page: page.value, limit: 20 }
    if (search.value) params.search = search.value
    if (roleFilter.value) params.role = roleFilter.value
    const res = await api.get('/admin/users', { params })
    users.value = res.data.users
    pages.value = res.data.pages
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

function editUser(u) {
  editingId.value = u.user_id
  form.value = { full_name: u.full_name, email: u.email, phone: u.phone || '', address: u.address || '', role: u.role }
}

async function saveUser() {
  await api.put(`/admin/users/${editingId.value}`, form.value)
  document.querySelector('[data-bs-dismiss="modal"]')?.click()
  await loadUsers()
}

function toggleAll() {
  const selectable = users.value.filter(u => u.role !== 'admin')
  selected.value = selected.value.length === selectable.length ? [] : selectable.map(u => u.user_id)
}

async function deleteUser(id) {
  if (!confirm('Delete this user?')) return
  await api.delete(`/admin/users/${id}`)
  await loadUsers()
}

async function bulkDelete() {
  if (!confirm(`Delete ${selected.value.length} users?`)) return
  await api.post('/admin/users/bulk-delete', { ids: selected.value })
  selected.value = []
  await loadUsers()
}

onMounted(loadUsers)
</script>
