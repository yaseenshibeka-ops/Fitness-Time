<template>
  <div class="container py-5" style="padding-top: 100px;">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold mb-0">Shop Products</h2>
      <div class="d-flex gap-2">
        <select class="form-select" v-model="categoryId" @change="loadProducts">
          <option value="">All Categories</option>
          <option v-for="c in categories" :key="c.category_id" :value="c.category_id">{{ c.name }}</option>
        </select>
        <input type="search" class="form-control" placeholder="Search..." v-model="search" @input="debouncedSearch">
      </div>
    </div>
    <div class="row g-4">
      <div v-if="loading" class="text-center w-100 py-5"><div class="spinner"></div></div>
      <div v-else-if="products.length" v-for="(p, i) in products" :key="p.product_id" class="col-md-4 col-lg-3">
        <div class="glass-card product-card h-100">
          <img :src="p.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop'" :alt="p.name" loading="lazy" class="card-img-top">
          <div class="card-body p-3 d-flex flex-column">
            <span class="badge bg-primary mb-2 align-self-start">{{ p.category_name || 'General' }}</span>
            <h5 class="fw-bold mb-2">{{ p.name }}</h5>
            <p class="text-muted small mb-3 flex-grow-1">{{ p.description ? p.description.substring(0, 80) + '...' : '' }}</p>
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <span class="fs-5 fw-bold text-accent">{{ Number(p.price).toLocaleString() }} RWF</span>
              <router-link :to="'/products/' + p.product_id" class="btn btn-sm btn-primary">View</router-link>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center w-100 py-5">
        <i class="bi bi-box-seam display-1 text-muted" style="display:block;"></i>
        <p class="text-muted mt-3">No products found.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const products = ref([])
const categories = ref([])
const categoryId = ref('')
const search = ref('')
const loading = ref(true)

let debounceTimer

function debouncedSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(loadProducts, 300)
}

async function loadProducts() {
  loading.value = true
  try {
    const params = {}
    if (categoryId.value) params.category_id = categoryId.value
    if (search.value) params.search = search.value
    const res = await api.get('/products', { params })
    products.value = res.data.products
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function syncQuery() {
  if (route.query.search) search.value = route.query.search
  if (route.query.category) categoryId.value = route.query.category
  loadProducts()
}

watch(() => route.query, syncQuery)

onMounted(async () => {
  try {
    const [catRes] = await Promise.all([
      api.get('/products/categories'),
    ])
    categories.value = catRes.data.categories
  } catch (e) { /* ignore */ }
  syncQuery()
})
</script>
