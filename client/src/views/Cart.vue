<template>
  <div class="checkout-page pt-20">
    <div class="cart-container">
      <!-- Header -->
      <div class="cart-header">
        <div class="cart-header-text">
          <h1>Shopping Cart</h1>
          <p v-if="cart && cart.items?.length" class="cart-subtitle">
            {{ cart.summary?.totalItems || 0 }} item{{ (cart.summary?.totalItems || 0) !== 1 ? 's' : '' }} in your cart
          </p>
        </div>
        <router-link to="/products" class="continue-shopping-btn">
          <span class="material-symbols-outlined">arrow_back</span>
          Continue Shopping
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="cart-loading">
        <div class="spinner-ring"></div>
        <p>Loading your cart...</p>
      </div>

      <!-- Cart Items -->
      <div v-else-if="cart && cart.items && cart.items.length" class="cart-layout">
        <!-- Items List -->
        <div class="cart-items-list">
          <TransitionGroup name="cart-item" tag="div">
            <div v-for="item in cart.items" :key="item.cart_item_id" class="cart-item-card">
              <img
                :src="item.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=120&h=120&fit=crop'"
                :alt="item.name"
                class="cart-item-img"
                loading="lazy"
              />
              <div class="cart-item-info">
                <h3 class="cart-item-name">{{ item.name }}</h3>
                <span class="cart-item-price">{{ Number(item.price).toLocaleString() }} RWF</span>
              </div>
              <div class="cart-item-controls">
                <div class="qty-control">
                  <button
                    class="qty-btn"
                    :disabled="busyItems[item.cart_item_id]"
                    @click="changeQty(item, -1)"
                  >
                    <span class="material-symbols-outlined">remove</span>
                  </button>
                  <span class="qty-value" :class="{ 'qty-updating': busyItems[item.cart_item_id] }">
                    {{ item.quantity }}
                  </span>
                  <button
                    class="qty-btn"
                    :disabled="busyItems[item.cart_item_id]"
                    @click="changeQty(item, 1)"
                  >
                    <span class="material-symbols-outlined">add</span>
                  </button>
                </div>
                <span class="cart-item-total">{{ Number(item.price * item.quantity).toLocaleString() }} RWF</span>
                <button
                  class="remove-btn"
                  :disabled="busyItems[item.cart_item_id]"
                  @click="removeItem(item)"
                  title="Remove item"
                >
                  <span class="material-symbols-outlined">delete_outline</span>
                </button>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="cart-summary-card">
          <h2>Order Summary</h2>
          <div class="summary-row">
            <span>Subtotal</span>
            <span>{{ Number(cart.summary?.subtotal).toLocaleString() }} RWF</span>
          </div>
          <div class="summary-row">
            <span>Delivery</span>
            <span :class="{ 'free-delivery': cart.summary?.subtotal >= 50000 }">
              {{ cart.summary?.subtotal >= 50000 ? 'FREE' : '2,000 RWF' }}
            </span>
          </div>
          <div v-if="cart.summary?.subtotal < 50000" class="free-delivery-hint">
            <span class="material-symbols-outlined">local_shipping</span>
            Add {{ (50000 - cart.summary?.subtotal).toLocaleString() }} RWF more for free delivery!
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row summary-total">
            <span>Total</span>
            <span>{{ Number((cart.summary?.subtotal || 0) + (cart.summary?.subtotal >= 50000 ? 0 : 2000)).toLocaleString() }} RWF</span>
          </div>
          <router-link to="/checkout" class="checkout-btn">
            <span class="material-symbols-outlined">lock</span>
            Proceed to Checkout
          </router-link>
          <div class="trust-badges">
            <div class="trust-badge">
              <span class="material-symbols-outlined">verified</span>
              <span>100% Authentic</span>
            </div>
            <div class="trust-badge">
              <span class="material-symbols-outlined">autorenew</span>
              <span>14-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Cart -->
      <div v-else class="empty-cart">
        <div class="empty-cart-icon">
          <span class="material-symbols-outlined">shopping_cart</span>
        </div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <router-link to="/products" class="browse-btn">
          <span class="material-symbols-outlined">storefront</span>
          Browse Products
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { cart as cartStore } from '../stores/cart'

const cart = ref(null)
const loading = ref(true)
const busyItems = ref({}) // Track loading state per item

// Debounce timers per item
const debounceTimers = {}

async function loadCart() {
  try {
    const res = await api.get('/cart')
    cart.value = res.data.cart
  } catch (e) {
    console.error('Failed to load cart:', e)
    cartStore.fetchCount()
  } finally {
    loading.value = false
  }
}

function recalcSummary() {
  if (!cart.value?.items) return
  let subtotal = 0
  let totalItems = 0
  cart.value.items.forEach(item => {
    subtotal += Number(item.price) * item.quantity
    totalItems += item.quantity
  })
  cart.value.summary = { subtotal, totalItems }
}

function changeQty(item, delta) {
  const newQty = item.quantity + delta
  if (newQty < 1) return removeItem(item)

  // Optimistic update
  item.quantity = newQty
  recalcSummary()

  // Debounce the API call (300ms)
  if (debounceTimers[item.cart_item_id]) {
    clearTimeout(debounceTimers[item.cart_item_id])
  }

  debounceTimers[item.cart_item_id] = setTimeout(async () => {
    busyItems.value[item.cart_item_id] = true
    try {
      await api.put(`/cart/items/${item.cart_item_id}`, { quantity: newQty })
      cartStore.fetchCount()
    } catch (e) {
      // Rollback on error â€” reload actual state
      await loadCart()
    } finally {
      busyItems.value[item.cart_item_id] = false
    }
  }, 300)
}

async function removeItem(item) {
  // Optimistic removal
  const removedIndex = cart.value.items.findIndex(i => i.cart_item_id === item.cart_item_id)
  const removedItem = cart.value.items[removedIndex]
  cart.value.items.splice(removedIndex, 1)
  recalcSummary()

    try {
      await api.delete(`/cart/items/${item.cart_item_id}`)
      cartStore.fetchCount()
    } catch (e) {
    // Rollback on error
    cart.value.items.splice(removedIndex, 0, removedItem)
    recalcSummary()
  }
}

onMounted(loadCart)
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  padding-bottom: 4rem;
}

.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* Header */
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.cart-header h1 {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-light);
  margin: 0;
}
.cart-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0.25rem 0 0;
}
.continue-shopping-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  border: 1.5px solid var(--glass-border);
  background: var(--glass);
  color: var(--text-light);
  font-weight: 600;
  font-size: 0.85rem;
  text-decoration: none;
  transition: all 0.2s ease;
}
.continue-shopping-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-1px);
}
.continue-shopping-btn .material-symbols-outlined {
  font-size: 18px;
}

/* Loading */
.cart-loading {
  text-align: center;
  padding: 4rem 0;
}
.spinner-ring {
  width: 40px;
  height: 40px;
  border: 3px solid var(--glass-border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
.cart-loading p {
  color: var(--text-muted);
  font-size: 0.95rem;
}

/* Layout */
.cart-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  align-items: flex-start;
}

/* Cart Items */
.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.cart-item-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  transition: all 0.3s ease;
}
.cart-item-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}
.cart-item-img {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
}
.cart-item-info {
  flex: 1;
  min-width: 0;
}
.cart-item-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-light);
  margin: 0 0 0.3rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cart-item-price {
  font-size: 0.9rem;
  color: var(--primary);
  font-weight: 600;
}
.cart-item-controls {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-shrink: 0;
}

/* Quantity Controls */
.qty-control {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1.5px solid var(--glass-border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--dark);
}
.qty-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.15s ease;
}
.qty-btn:hover:not(:disabled) {
  background: var(--primary);
  color: white;
}
.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.qty-btn .material-symbols-outlined {
  font-size: 18px;
}
.qty-value {
  width: 36px;
  text-align: center;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-light);
  transition: opacity 0.2s;
}
.qty-updating {
  opacity: 0.5;
}

.cart-item-total {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-light);
  min-width: 100px;
  text-align: right;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}
.remove-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.remove-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.remove-btn .material-symbols-outlined {
  font-size: 20px;
}

/* Summary Card */
.cart-summary-card {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 1.75rem;
  position: sticky;
  top: 100px;
}
.cart-summary-card h2 {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-light);
  margin: 0 0 1.25rem;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  color: var(--text-muted);
  padding: 0.5rem 0;
}
.summary-total {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-light);
  padding: 0.75rem 0;
}
.summary-total span:last-child {
  color: var(--primary);
}
.free-delivery {
  color: #10b981;
  font-weight: 600;
}
.free-delivery-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--primary);
  background: var(--accent-primary-light, rgba(124,58,237,0.06));
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  margin-top: 0.5rem;
}
.free-delivery-hint .material-symbols-outlined {
  font-size: 18px;
}
.summary-divider {
  height: 1px;
  background: var(--glass-border);
  margin: 0.75rem 0;
}

.checkout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.9rem;
  border-radius: 14px;
  background: var(--primary);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.2s ease;
  margin-top: 1rem;
}
.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(124,58,237,0.3);
}
.checkout-btn .material-symbols-outlined {
  font-size: 20px;
}

.trust-badges {
  display: flex;
  gap: 1rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--glass-border);
}
.trust-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}
.trust-badge .material-symbols-outlined {
  font-size: 16px;
  color: var(--primary);
}

/* Empty Cart */
.empty-cart {
  text-align: center;
  padding: 5rem 2rem;
}
.empty-cart-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--accent-primary-light, rgba(124,58,237,0.08));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  animation: pulse-icon 2s ease-in-out infinite;
}
.empty-cart-icon .material-symbols-outlined {
  font-size: 48px;
  color: var(--primary);
}
@keyframes pulse-icon {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
}
.empty-cart h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-light);
  margin: 0 0 0.5rem;
}
.empty-cart p {
  color: var(--text-muted);
  margin: 0 0 1.5rem;
}
.browse-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border-radius: 14px;
  background: var(--primary);
  color: white;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}
.browse-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(124,58,237,0.3);
}

/* Transitions */
.cart-item-enter-active,
.cart-item-leave-active {
  transition: all 0.35s ease;
}
.cart-item-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.cart-item-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}
.cart-item-move {
  transition: transform 0.35s ease;
}

/* Responsive */
@media (max-width: 900px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
  .cart-summary-card {
    position: static;
  }
}
@media (max-width: 640px) {
  .cart-item-card {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .cart-item-controls {
    width: 100%;
    justify-content: space-between;
  }
  .cart-header h1 {
    font-size: 1.5rem;
  }
}
</style>

