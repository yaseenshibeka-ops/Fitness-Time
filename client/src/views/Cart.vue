<template>
  <div class="container py-5" style="padding-top: 100px;">
    <h2 class="fw-bold mb-4">Shopping Cart</h2>
    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else-if="cart && cart.items && cart.items.length">
      <div v-for="item in cart.items" :key="item.product_id" class="glass-card p-3 mb-3 d-flex align-items-center gap-3">
        <img :src="item.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop'" style="width:80px;height:80px;object-fit:cover;border-radius:8px;">
        <div class="flex-grow-1">
          <h6 class="fw-bold mb-1">{{ item.name }}</h6>
          <span class="text-accent">{{ Number(item.price).toLocaleString() }} RWF</span>
        </div>
        <div class="input-group" style="width:110px;">
          <button class="btn btn-outline-light btn-sm" @click="updateQty(item.product_id, item.quantity - 1)">-</button>
          <input type="text" class="form-control text-center" :value="item.quantity" readonly>
          <button class="btn btn-outline-light btn-sm" @click="updateQty(item.product_id, item.quantity + 1)">+</button>
        </div>
        <span class="fw-bold" style="width:100px;text-align:right;">{{ Number(item.price * item.quantity).toLocaleString() }} RWF</span>
        <button class="btn btn-outline-danger btn-sm" @click="removeItem(item.product_id)"><i class="bi bi-trash"></i></button>
      </div>
      <div class="d-flex justify-content-between align-items-center mt-4">
        <h4 class="fw-bold">Total: <span class="text-accent">{{ Number(cart.summary?.subtotal).toLocaleString() }} RWF</span></h4>
        <router-link to="/checkout" class="btn btn-primary btn-lg">Proceed to Checkout</router-link>
      </div>
    </div>
    <div v-else class="text-center py-5">
      <i class="bi bi-cart display-1 text-muted" style="display:block;"></i>
      <p class="text-muted mt-3">Your cart is empty.</p>
      <router-link to="/products" class="btn btn-primary">Browse Products</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const cart = ref(null)
const loading = ref(true)

let cartItemsCache = []

async function loadCart() {
  try {
    const res = await api.get('/cart')
    cart.value = res.data.cart
    cartItemsCache = cart.value?.items || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function findItemId(productId) {
  const item = cartItemsCache.find(i => i.product_id === productId)
  return item?.cart_item_id
}

async function updateQty(productId, qty) {
  if (qty < 1) return removeItem(productId)
  const itemId = findItemId(productId)
  if (!itemId) return
  await api.put(`/cart/items/${itemId}`, { quantity: qty })
  await loadCart()
}

async function removeItem(productId) {
  const itemId = findItemId(productId)
  if (!itemId) return
  await api.delete(`/cart/items/${itemId}`)
  await loadCart()
}

onMounted(loadCart)
</script>
