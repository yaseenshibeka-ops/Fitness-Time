<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex gap-2">
        <input type="search" class="form-control form-control-sm" placeholder="Search..." v-model="search" @input="debouncedLoad" style="width:200px;">
      </div>
      <button class="btn btn-primary btn-sm" @click="openAdd" data-bs-toggle="modal" data-bs-target="#catModal"><i class="bi bi-plus"></i> Add Category</button>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else-if="categories.length" class="glass-card p-0 overflow-hidden">
      <table class="table table-dark table-hover mb-0">
        <thead><tr><th>#</th><th>Name</th><th>Slug</th><th>Products</th><th>Active</th><th></th></tr></thead>
        <tbody>
          <tr v-for="c in categories" :key="c.category_id">
            <td>{{ c.category_id }}</td>
            <td>{{ c.name }}</td>
            <td><code>{{ c.slug }}</code></td>
            <td>{{ c.product_count || 0 }}</td>
            <td><span class="badge" :class="c.is_active ? 'bg-success' : 'bg-secondary'">{{ c.is_active ? 'Yes' : 'No' }}</span></td>
            <td>
              <button class="btn btn-sm btn-outline-light me-1" @click="editCat(c)" data-bs-toggle="modal" data-bs-target="#catModal"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" @click="deleteCat(c.category_id)"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center py-5 text-muted">No categories found</div>

    <div class="modal fade" id="catModal" tabindex="-1">
      <div class="modal-dialog modal-dark"><div class="modal-content" style="background:var(--surface);color:var(--text-light);">
        <div class="modal-header border-0"><h5 class="fw-bold">{{ editingId ? 'Edit' : 'Add' }} Category</h5></div>
        <div class="modal-body">
          <div class="mb-3"><input class="form-control" v-model="form.name" placeholder="Category Name"></div>
          <div class="mb-3"><input class="form-control" v-model="form.slug" placeholder="slug (auto)"></div>
          <div class="mb-3"><textarea class="form-control" v-model="form.description" placeholder="Description" rows="2"></textarea></div>
        </div>
        <div class="modal-footer border-0">
          <button class="btn btn-outline-light" data-bs-dismiss="modal">Cancel</button>
          <button class="btn btn-primary" @click="saveCat">{{ editingId ? 'Update' : 'Create' }}</button>
        </div>
      </div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const categories = ref([])
const loading = ref(true)
const search = ref('')
const editingId = ref(null)
const form = ref({ name: '', slug: '', description: '' })
let debounceTimer

function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; loadCategories() }, 300)
}
const page = ref(1)

async function loadCategories() {
  loading.value = true
  try {
    const res = await api.get('/admin/categories', { params: { search: search.value, page: page.value, limit: 50 } })
    categories.value = res.data.categories
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

function openAdd() { editingId.value = null; form.value = { name: '', slug: '', description: '' } }
function editCat(c) { editingId.value = c.category_id; form.value = { name: c.name, slug: c.slug, description: c.description || '' } }

async function saveCat() {
  if (editingId.value) await api.put(`/admin/categories/${editingId.value}`, form.value)
  else await api.post('/admin/categories', form.value)
  document.querySelector('[data-bs-dismiss="modal"]')?.click()
  await loadCategories()
}

async function deleteCat(id) {
  if (!confirm('Delete this category?')) return
  await api.delete(`/admin/categories/${id}`)
  await loadCategories()
}

onMounted(loadCategories)
</script>
