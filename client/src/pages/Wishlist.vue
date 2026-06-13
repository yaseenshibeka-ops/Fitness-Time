<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bold mb-0"><i class="bi bi-heart me-2"></i>My Wishlist</h5>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else-if="items.length" class="row g-3">
      <div v-for="item in items" :key="item.wishlist_id" class="col-md-4 col-lg-3">
        <div class="glass-card p-3 text-center h-100">
          <img :src="item.image_url || 'https://via.placeholder.com/150'" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px;">
          <h6 class="fw-bold mb-1">{{ item.name }}</h6>
          <div class="fw-bold text-accent mb-2">{{ Number(item.price).toLocaleString() }} RWF</div>
          <div class="d-flex gap-1">
            <button class="btn btn-primary btn-sm flex-grow-1" @click="move(item.wishlist_id)"><i class="bi bi-cart-plus"></i> Cart</button>
            <button class="btn btn-outline-danger btn-sm" @click="remove(item.wishlist_id)"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="glass-card p-5 text-center text-muted">
      <i class="bi bi-heart display-4 mb-3" style="display:block;"></i>
      <p>Your wishlist is empty. Browse products and save your favorites!</p>
      <router-link to="/products" class="btn btn-primary">Browse Products</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const items = ref([])
const loading = ref(true)

async function load() {
  loading.value = true
  try { const res = await api.get('/user/wishlist'); items.value = res.data.items || [] }
  catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function move(id) {
  await api.post(`/user/wishlist/${id}/move-to-cart`)
  await load()
}

async function remove(id) {
  await api.delete(`/user/wishlist/${id}`)
  await load()
}

onMounted(load)
</script>
