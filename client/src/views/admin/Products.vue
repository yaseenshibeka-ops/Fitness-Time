<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <div class="d-flex gap-2">
        <input type="search" class="form-control form-control-sm" placeholder="Search..." v-model="search" @input="debouncedLoad" style="width:200px;">
        <select class="form-select form-select-sm" v-model="categoryFilter" @change="loadProducts" style="width:150px;">
          <option value="">All Categories</option>
          <option v-for="c in categories" :key="c.category_id" :value="c.category_id">{{ c.name }}</option>
        </select>
        <button v-if="selected.length" class="btn btn-sm btn-outline-danger" @click="bulkDelete">Delete Selected ({{ selected.length }})</button>
      </div>
      <button class="btn btn-primary btn-sm" @click="openAdd" data-bs-toggle="modal" data-bs-target="#productModal"><i class="bi bi-plus"></i> Add Product</button>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else-if="products.length" class="glass-card p-0 overflow-hidden">
      <table class="table table-hover mb-0">
        <thead><tr>
          <th><input type="checkbox" @change="toggleAll" :checked="selected.length===products.length"></th>
          <th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th>
        </tr></thead>
        <tbody>
          <tr v-for="p in products" :key="p.product_id">
            <td><input type="checkbox" :value="p.product_id" v-model="selected"></td>
            <td><div class="d-flex align-items-center gap-2">
              <img :src="p.image_url || 'https://via.placeholder.com/40'" style="width:32px;height:32px;object-fit:cover;border-radius:4px;">
              <span>{{ p.name }}</span>
            </div></td>
            <td>{{ p.category_name || '-' }}</td>
            <td>{{ Number(p.price).toLocaleString() }} RWF</td>
            <td><span :class="'badge ' + (p.stock_quantity < 10 ? 'bg-danger' : 'bg-success')">{{ p.stock_quantity }}</span></td>
            <td><span class="badge" :class="p.is_active ? 'bg-success' : 'bg-secondary'">{{ p.is_active ? 'Active' : 'Inactive' }}</span></td>
            <td>
              <button class="btn btn-sm btn-outline-primary me-1" @click="editProduct(p)" data-bs-toggle="modal" data-bs-target="#productModal"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" @click="deleteProduct(p.product_id)"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="pages > 1" class="d-flex justify-content-center p-3">
        <nav><ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{disabled:page<=1}"><button class="page-link" @click="page--;loadProducts()">Prev</button></li>
          <li class="page-item disabled"><span class="page-link">{{ page }}/{{ pages }}</span></li>
          <li class="page-item" :class="{disabled:page>=pages}"><button class="page-link" @click="page++;loadProducts()">Next</button></li>
        </ul></nav>
      </div>
    </div>
    <div v-else class="text-center py-5 text-muted">No products found</div>

    <div class="modal fade" id="productModal" tabindex="-1">
      <div class="modal-dialog modal-dark"><div class="modal-content" style="background:var(--surface);color:var(--text-light);">
        <div class="modal-header border-0"><h5 class="fw-bold">{{ editingId ? 'Edit' : 'Add' }} Product</h5></div>
        <div class="modal-body">
          <div class="mb-3"><input class="form-control" v-model="form.name" placeholder="Product Name"></div>
          <div class="mb-3"><textarea class="form-control" v-model="form.description" placeholder="Description" rows="3"></textarea></div>
          <div class="row g-2 mb-3">
            <div class="col"><input class="form-control" v-model.number="form.price" placeholder="Price" type="number"></div>
            <div class="col"><input class="form-control" v-model.number="form.stock_quantity" placeholder="Stock" type="number"></div>
          </div>
          <div class="mb-3">
            <select class="form-select" v-model="form.category_id">
              <option value="">No category</option>
              <option v-for="c in categories" :key="c.category_id" :value="c.category_id">{{ c.name }}</option>
            </select>
          </div>
          <div class="mb-3"><input class="form-control" v-model="form.image_url" placeholder="Image URL"></div>
        </div>
        <div class="modal-footer border-0">
          <button class="btn btn-outline-primary" data-bs-dismiss="modal">Cancel</button>
          <button class="btn btn-primary" @click="saveProduct">{{ editingId ? 'Update' : 'Create' }}</button>
        </div>
      </div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const products = ref([])
const categories = ref([])
const loading = ref(true)
const search = ref('')
const categoryFilter = ref('')
const page = ref(1)
const pages = ref(1)
const selected = ref([])
const editingId = ref(null)
const form = ref({ name: '', description: '', price: 0, stock_quantity: 0, category_id: '', image_url: '' })
let debounceTimer

function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; loadProducts() }, 300)
}

async function loadProducts() {
  loading.value = true
  try {
    const params = { page: page.value, limit: 20 }
    if (search.value) params.search = search.value
    if (categoryFilter.value) params.category_id = categoryFilter.value
    const [pRes, cRes] = await Promise.all([
      api.get('/admin/products', { params }),
      api.get('/admin/categories')
    ])
    products.value = pRes.data.products
    pages.value = pRes.data.pages
    categories.value = cRes.data.categories
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

function toggleAll() {
  selected.value = selected.value.length === products.value.length ? [] : products.value.map(p => p.product_id)
}

function openAdd() {
  editingId.value = null
  form.value = { name: '', description: '', price: 0, stock_quantity: 0, category_id: '', image_url: '' }
}

function editProduct(p) {
  editingId.value = p.product_id
  form.value = { name: p.name, description: p.description, price: p.price, stock_quantity: p.stock_quantity, category_id: p.category_id || '', image_url: p.image_url || '' }
}

async function saveProduct() {
  if (editingId.value) {
    await api.put(`/admin/products/${editingId.value}`, form.value)
  } else {
    await api.post('/admin/products', form.value)
  }
  document.querySelector('[data-bs-dismiss="modal"]')?.click()
  await loadProducts()
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return
  try {
    const res = await api.delete(`/admin/products/${id}`)
    alert(res.data?.message || 'Product deleted')
  } catch (e) {
    alert(e?.message || 'Failed to delete product')
  }
  await loadProducts()
}

async function bulkDelete() {
  if (!confirm(`Delete ${selected.value.length} products?`)) return
  try {
    const res = await api.post('/admin/products/bulk-delete', { ids: selected.value })
    alert(res.data?.message || `${selected.value.length} products processed`)
  } catch (e) {
    alert(e?.message || 'Failed to delete products')
  }
  selected.value = []
  await loadProducts()
}

onMounted(loadProducts)
</script>
