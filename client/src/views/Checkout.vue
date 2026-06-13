<template>
  <div class="checkout-page pt-20">
    <div class="checkout-container">
      <!-- Header -->
      <div class="checkout-header">
        <router-link to="/cart" class="back-to-cart">
          <span class="material-symbols-outlined">arrow_back</span>
          Back to Cart
        </router-link>
        <h1>Checkout</h1>
        <p class="checkout-subtitle">Complete your order securely</p>
      </div>

      <!-- Progress Steps -->
      <div class="progress-steps" v-if="!loading && cart?.items?.length">
        <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <div class="step-circle">
            <span class="material-symbols-outlined" v-if="currentStep > 1">check</span>
            <span v-else>1</span>
          </div>
          <span class="step-label">Delivery</span>
        </div>
        <div class="step-line" :class="{ filled: currentStep > 1 }"></div>
        <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
          <div class="step-circle">
            <span class="material-symbols-outlined" v-if="currentStep > 2">check</span>
            <span v-else>2</span>
          </div>
          <span class="step-label">Payment</span>
        </div>
        <div class="step-line" :class="{ filled: currentStep > 2 }"></div>
        <div class="step" :class="{ active: currentStep >= 3 }">
          <div class="step-circle">3</div>
          <span class="step-label">Confirm</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="checkout-loading">
        <div class="spinner-ring"></div>
        <p>Loading your cart...</p>
      </div>

      <!-- Empty Cart -->
      <div v-else-if="!cart || !cart.items?.length" class="empty-state">
        <div class="empty-icon">
          <span class="material-symbols-outlined">shopping_cart</span>
        </div>
        <h2>Your cart is empty</h2>
        <p>Add some products before checking out.</p>
        <router-link to="/products" class="primary-btn">Browse Products</router-link>
      </div>

      <!-- Checkout Form -->
      <div v-else class="checkout-grid">
        <!-- Left Column: Forms -->
        <div class="checkout-forms">
          <!-- Step 1: Delivery Details -->
          <div class="form-card" :class="{ collapsed: currentStep > 1 }">
            <div class="form-card-header" @click="currentStep > 1 && (currentStep = 1)">
              <div class="form-card-title">
                <span class="step-badge" :class="{ completed: currentStep > 1 }">
                  <span class="material-symbols-outlined" v-if="currentStep > 1">check</span>
                  <span v-else>1</span>
                </span>
                <h2>Delivery Details</h2>
              </div>
              <span v-if="currentStep > 1" class="edit-link">Edit</span>
            </div>

            <div v-if="currentStep === 1" class="form-card-body">
              <div class="form-grid">
                <div class="form-group">
                  <label>Full Name <span class="required">*</span></label>
                  <input
                    v-model="form.fullName"
                    type="text"
                    placeholder="Your full name"
                    :class="{ 'input-error': errors.fullName }"
                    @blur="validateField('fullName')"
                  />
                  <span v-if="errors.fullName" class="field-error">{{ errors.fullName }}</span>
                </div>
                <div class="form-group">
                  <label>Email <span class="required">*</span></label>
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="email@example.com"
                    :class="{ 'input-error': errors.email }"
                    @blur="validateField('email')"
                  />
                  <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
                </div>
                <div class="form-group">
                  <label>Phone Number <span class="required">*</span></label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    placeholder="+250 7XX XXX XXX"
                    :class="{ 'input-error': errors.phone }"
                    @blur="validateField('phone')"
                  />
                  <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
                </div>
                <div class="form-group">
                  <label>Province <span class="required">*</span></label>
                  <select
                    v-model="form.province"
                    :class="{ 'input-error': errors.province }"
                    @blur="validateField('province')"
                  >
                    <option value="">Select province</option>
                    <option value="Kigali">Kigali City</option>
                    <option value="Eastern">Eastern Province</option>
                    <option value="Western">Western Province</option>
                    <option value="Northern">Northern Province</option>
                    <option value="Southern">Southern Province</option>
                  </select>
                </div>
                <div class="form-group full-width">
                  <label>Delivery Address <span class="required">*</span></label>
                  <textarea
                    v-model="form.address"
                    rows="2"
                    placeholder="Street, building, landmark..."
                    :class="{ 'input-error': errors.address }"
                    @blur="validateField('address')"
                  ></textarea>
                  <span v-if="errors.address" class="field-error">{{ errors.address }}</span>
                </div>
              </div>
              <button class="next-step-btn" @click="goToStep2">
                Continue to Payment
                <span class="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

            <!-- Collapsed Summary -->
            <div v-if="currentStep > 1" class="collapsed-summary">
              <p>{{ form.fullName }} آ· {{ form.phone }}</p>
              <p>{{ form.address }}, {{ form.province }}</p>
            </div>
          </div>

          <!-- Step 2: Payment Method -->
          <div class="form-card" :class="{ collapsed: currentStep > 2, disabled: currentStep < 2 }">
            <div class="form-card-header">
              <div class="form-card-title">
                <span class="step-badge" :class="{ completed: currentStep > 2 }">
                  <span class="material-symbols-outlined" v-if="currentStep > 2">check</span>
                  <span v-else>2</span>
                </span>
                <h2>Payment Method</h2>
              </div>
            </div>

            <div v-if="currentStep === 2" class="form-card-body">
              <!-- Payment Options Grid -->
              <div class="payment-grid">
                <button
                  v-for="pm in paymentMethods"
                  :key="pm.id"
                  @click="selectPayment(pm.id)"
                  class="payment-option"
                  :class="{ selected: selectedPayment === pm.id }"
                >
                  <div class="payment-icon" :style="{ background: pm.bgColor }">
                    <span v-if="pm.iconText" class="payment-icon-text" :style="{ color: pm.textColor }">{{ pm.iconText }}</span>
                    <span v-else class="material-symbols-outlined" :style="{ color: pm.textColor }">{{ pm.icon }}</span>
                  </div>
                  <p class="payment-label">{{ pm.label }}</p>
                  <p class="payment-desc">{{ pm.desc }}</p>
                  <div v-if="selectedPayment === pm.id" class="selected-check">
                    <span class="material-symbols-outlined">check</span>
                  </div>
                </button>
              </div>

              <!-- MoMo Phone Input -->
              <div v-if="selectedPayment === 'mtn_momo' || selectedPayment === 'airtel_money'" class="payment-extra-card">
                <label>MoMo Phone Number</label>
                <input v-model="paymentPhone" type="tel" placeholder="+250 7XX XXX XXX" />
                <p class="hint">You will receive a payment request on your phone.</p>
              </div>

              <!-- Error -->
              <div v-if="error" class="error-banner">
                <span class="material-symbols-outlined">error</span>
                {{ error }}
              </div>

              <!-- Place Order Button -->
              <button
                @click="placeOrder"
                :disabled="submitting || !selectedPayment"
                class="place-order-btn"
              >
                <span v-if="submitting" class="btn-spinner"></span>
                <span v-else class="material-symbols-outlined">lock</span>
                {{ submitting ? 'Processing...' : `Place Order — ${total.toLocaleString()} RWF` }}
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column: Order Summary -->
        <div class="order-summary-card">
          <h2>Order Summary</h2>

          <div class="summary-items">
            <div v-for="item in cart.items" :key="item.product_id" class="summary-item">
              <img
                :src="item.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=60&h=60&fit=crop'"
                :alt="item.name"
                class="summary-item-img"
                loading="lazy"
              />
              <div class="summary-item-info">
                <p class="summary-item-name">{{ item.name }}</p>
                <p class="summary-item-qty">Qty: {{ item.quantity }}</p>
              </div>
              <p class="summary-item-price">{{ Number(item.price * item.quantity).toLocaleString() }} RWF</p>
            </div>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-row">
            <span>Subtotal</span>
            <span>{{ subtotal.toLocaleString() }} RWF</span>
          </div>
          <div class="summary-row">
            <span>Delivery Fee</span>
            <span :class="{ 'text-green': deliveryFee === 0 }">{{ deliveryFee > 0 ? deliveryFee.toLocaleString() + ' RWF' : 'FREE' }}</span>
          </div>
          <div v-if="discount > 0" class="summary-row text-accent">
            <span>Discount</span>
            <span>-{{ discount.toLocaleString() }} RWF</span>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-row summary-total-row">
            <span>Total</span>
            <span>{{ total.toLocaleString() }} RWF</span>
          </div>

          <!-- Trust Signals -->
          <div class="trust-signals">
            <div class="trust-signal">
              <span class="material-symbols-outlined">lock</span>
              <span>Secure 256-bit SSL encrypted</span>
            </div>
            <div class="trust-signal">
              <span class="material-symbols-outlined">verified</span>
              <span>100% authentic products</span>
            </div>
            <div class="trust-signal">
              <span class="material-symbols-outlined">autorenew</span>
              <span>14-day return policy</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Success Modal -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="showSuccess" class="modal-overlay" @click.self="closeSuccess">
            <div class="success-modal">
              <div class="success-icon-wrap">
                <span class="material-symbols-outlined">check_circle</span>
              </div>
              <h2>Order Placed!</h2>
              <p>Your order <strong>#{{ orderRef }}</strong> has been placed successfully.</p>

              <!-- Payment-specific info -->
              <div class="success-details">
                <template v-if="selectedPayment === 'mtn_momo' || selectedPayment === 'airtel_money'">
                  <div class="detail-header">
                    <span class="material-symbols-outlined">phone_android</span>
                    <span>Check Your Phone</span>
                  </div>
                  <p class="detail-text">A payment request has been sent to <strong>{{ paymentPhone }}</strong>. Please approve the prompt.</p>
                </template>

                <template v-if="selectedPayment === 'bank_transfer' && paymentResult">
                  <div class="detail-header">
                    <span class="material-symbols-outlined">account_balance</span>
                    <span>Bank Transfer Details</span>
                  </div>
                  <div class="bank-details">
                    <p><span>Bank:</span> <strong>{{ paymentResult.bankDetails?.bankName }}</strong></p>
                    <p><span>Account:</span> <strong>{{ paymentResult.bankDetails?.accountName }}</strong></p>
                    <p><span>Account No:</span> <strong class="text-accent">{{ paymentResult.bankDetails?.accountNumber }}</strong></p>
                    <p><span>Reference:</span> <strong class="text-accent">{{ paymentResult.bankDetails?.reference }}</strong></p>
                  </div>
                </template>

                <template v-if="selectedPayment === 'paypal' && paymentResult">
                  <div class="detail-header">
                    <span class="material-symbols-outlined">open_in_new</span>
                    <span>Complete via PayPal</span>
                  </div>
                  <a :href="paymentResult.paypalUrl" target="_blank" class="paypal-btn">
                    <span>Pay</span><span class="paypal-pal">Pal</span>
                    <span class="material-symbols-outlined">open_in_new</span>
                  </a>
                </template>

                <template v-if="selectedPayment === 'cash_on_delivery'">
                  <div class="detail-header">
                    <span class="material-symbols-outlined">payments</span>
                    <span>Pay on Delivery</span>
                  </div>
                  <p class="detail-text">No payment needed now. Pay when your order arrives.</p>
                </template>
              </div>

              <div class="success-actions">
                <router-link to="/dashboard/orders" class="primary-btn">View Order Details</router-link>
                <router-link to="/products" class="secondary-btn">Continue Shopping</router-link>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import { auth } from '../stores/auth'
import { cart as cartStore } from '../stores/cart'

const router = useRouter()

// State
const cart = ref(null)
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const selectedPayment = ref('')
const paymentPhone = ref('')
const showSuccess = ref(false)
const orderRef = ref('')
const paymentResult = ref(null)
const currentStep = ref(1)

const form = ref({
  fullName: auth.fullName || '',
  email: auth.email || '',
  phone: '',
  province: '',
  address: '',
})

const errors = ref({
  fullName: '',
  email: '',
  phone: '',
  province: '',
  address: '',
})

// Payment methods
const paymentMethods = [
  { id: 'mtn_momo', label: 'MTN MoMo', desc: 'Instant payment', bgColor: '#fef3c7', textColor: '#b45309', icon: '', iconText: 'MTN' },
  { id: 'airtel_money', label: 'Airtel Money', desc: 'Instant payment', bgColor: '#fee2e2', textColor: '#dc2626', icon: '', iconText: 'AIRT' },
  { id: 'cash_on_delivery', label: 'Cash on Delivery', desc: 'Pay on arrival', bgColor: 'var(--glass)', textColor: 'var(--text-muted)', icon: 'payments', iconText: '' },
  { id: 'bank_transfer', label: 'Bank Transfer', desc: 'Manual transfer', bgColor: 'var(--glass)', textColor: 'var(--text-muted)', icon: 'account_balance', iconText: '' },
  { id: 'paypal', label: 'PayPal', desc: 'International', bgColor: '#dbeafe', textColor: '#2563eb', icon: '', iconText: 'Pay' },
]

// Computed
const subtotal = computed(() => cart.value?.summary?.subtotal || 0)
const deliveryFee = computed(() => subtotal.value >= 50000 ? 0 : 2000)
const discount = computed(() => 0)
const total = computed(() => subtotal.value + deliveryFee.value - discount.value)

// Validation
function validateField(field) {
  errors.value[field] = ''
  const v = form.value[field]?.trim()

  switch (field) {
    case 'fullName':
      if (!v) errors.value.fullName = 'Full name is required'
      else if (v.length < 2) errors.value.fullName = 'Name must be at least 2 characters'
      break
    case 'email':
      if (!v) errors.value.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) errors.value.email = 'Please enter a valid email'
      break
    case 'phone':
      if (!v) errors.value.phone = 'Phone number is required'
      else if (!/^[\+]?[0-9\s\-]{8,15}$/.test(v.replace(/\s/g, ''))) errors.value.phone = 'Please enter a valid phone number'
      break
    case 'province':
      if (!v) errors.value.province = 'Please select a province'
      break
    case 'address':
      if (!v) errors.value.address = 'Delivery address is required'
      else if (v.length < 5) errors.value.address = 'Please provide a more detailed address'
      break
  }
  return !errors.value[field]
}

function validateAllFields() {
  const fields = ['fullName', 'email', 'phone', 'province', 'address']
  return fields.every(f => validateField(f))
}

function goToStep2() {
  if (validateAllFields()) {
    currentStep.value = 2
  }
}

function selectPayment(id) {
  selectedPayment.value = id
  paymentResult.value = null
  error.value = ''
  if (id === 'mtn_momo' || id === 'airtel_money') {
    paymentPhone.value = form.value.phone || ''
  }
}

async function placeOrder() {
  if (!selectedPayment.value) {
    error.value = 'Please select a payment method'
    return
  }
  if ((selectedPayment.value === 'mtn_momo' || selectedPayment.value === 'airtel_money') && !paymentPhone.value.trim()) {
    error.value = 'Please enter your MoMo phone number'
    return
  }

  error.value = ''
  submitting.value = true

  try {
    // Step 1: Create Order
    const orderRes = await api.post('/orders/checkout', {
      fullName: form.value.fullName,
      email: form.value.email,
      phone: form.value.phone,
      deliveryAddress: `${form.value.address}, ${form.value.province || 'Rwanda'}`,
    })

    const order = orderRes.data?.order || orderRes.data?.data?.order || orderRes.order
    if (!order) throw new Error('Invalid order response from server')
    orderRef.value = order.orderReference

    // Step 2: Initiate Payment
    const payRes = await api.post('/payments/initiate', {
      paymentMethod: selectedPayment.value,
      amount: total.value,
      orderId: order.orderId,
      phoneNumber: (selectedPayment.value === 'mtn_momo' || selectedPayment.value === 'airtel_money') ? paymentPhone.value : null,
    })

    paymentResult.value = payRes.data?.data || payRes.data || payRes
    const transactionRef = payRes.transactionRef || payRes.data?.transactionRef
    
    // Await webhook simulation so the backend updates the order status before we show the success modal
    try {
      await api.post('/payments/webhook', { transactionRef, status: 'SUCCESS' })
    } catch (webhookErr) {
      console.error('Webhook confirmation failed:', webhookErr)
    }

    cart.value = null
    cartStore.fetchCount()
    currentStep.value = 3
    showSuccess.value = true
  } catch (e) {
    console.error('Checkout error:', e)
    const msg = typeof e === 'string' ? e : e?.response?.data?.message || e?.message || e?.data?.message || (e?.response?.data ? JSON.stringify(e.response.data) : '')
    if (e?.code === 'ECONNABORTED' || msg.includes('timeout') || msg.includes('timed out')) {
      error.value = 'Request timed out. The server may be starting up, please try again in a moment.'
    } else if (msg.includes('stock')) {
      error.value = 'Some items in your cart are out of stock. Please update your cart.'
    } else if (msg.includes('Cart is empty')) {
      error.value = 'Your cart is empty. Please add items first.'
    } else if (msg.includes('connect ECONNREFUSED') || msg.includes('ENOTFOUND')) {
      error.value = 'Cannot reach the server. Make sure the backend is running.'
    } else if (msg) {
      error.value = msg
    } else {
      error.value = 'Failed to place order. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}

function closeSuccess() {
  showSuccess.value = false
  router.push('/dashboard/orders')
}

onMounted(async () => {
  try {
    const res = await api.get('/cart')
    cart.value = res.data?.cart || res.data?.data?.cart || res.cart
    if (!cart.value?.items?.length) {
      loading.value = false
      return
    }
    form.value.phone = auth.user?.phone || ''
  } catch {
    router.push('/cart')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  padding-bottom: 4rem;
}
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* Header */
.checkout-header {
  margin-bottom: 2rem;
}
.back-to-cart {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  transition: color 0.2s;
}
.back-to-cart:hover {
  color: var(--primary);
}
.back-to-cart .material-symbols-outlined {
  font-size: 18px;
}
.checkout-header h1 {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-light);
  margin: 0;
}
.checkout-subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0.25rem 0 0;
}

/* Progress Steps */
.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 2.5rem;
  padding: 1.25rem;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
}
.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.4;
  transition: all 0.3s ease;
}
.step.active { opacity: 1; }
.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--glass-border);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  transition: all 0.3s ease;
}
.step.active .step-circle {
  background: var(--primary);
  color: white;
}
.step.completed .step-circle {
  background: #10b981;
  color: white;
}
.step-circle .material-symbols-outlined {
  font-size: 18px;
}
.step-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
}
.step.active .step-label { color: var(--text-light); }
.step-line {
  width: 60px;
  height: 2px;
  background: var(--glass-border);
  margin: 0 0.75rem;
  transition: background 0.3s ease;
}
.step-line.filled { background: #10b981; }

/* Loading */
.checkout-loading {
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
.checkout-loading p {
  color: var(--text-muted);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
}
.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--accent-primary-light, rgba(124,58,237,0.08));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
}
.empty-icon .material-symbols-outlined {
  font-size: 36px;
  color: var(--primary);
}
.empty-state h2 {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-light);
  margin: 0 0 0.5rem;
}
.empty-state p {
  color: var(--text-muted);
  margin: 0 0 1.25rem;
}

/* Grid */
.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  align-items: flex-start;
}

/* Form Cards */
.checkout-forms {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-card {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
}
.form-card.disabled {
  opacity: 0.4;
  pointer-events: none;
}
.form-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  cursor: default;
}
.form-card.collapsed .form-card-header {
  cursor: pointer;
}
.form-card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.form-card-title h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-light);
  margin: 0;
}
.step-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}
.step-badge.completed {
  background: #10b981;
}
.step-badge .material-symbols-outlined {
  font-size: 16px;
}
.edit-link {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
}
.form-card-body {
  padding: 0 1.5rem 1.5rem;
}
.collapsed-summary {
  padding: 0 1.5rem 1.25rem;
}
.collapsed-summary p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}

/* Form Elements */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.form-group.full-width {
  grid-column: 1 / -1;
}
.form-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
}
.required { color: #ef4444; }
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1.5px solid var(--glass-border);
  border-radius: 12px;
  background: var(--dark);
  color: var(--text-light);
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--primary);
}
.input-error {
  border-color: #ef4444 !important;
}
.field-error {
  font-size: 0.75rem;
  color: #ef4444;
  font-weight: 500;
}
.form-group textarea {
  resize: none;
}

.next-step-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: 14px;
  background: var(--primary);
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  margin-top: 1.25rem;
  transition: all 0.2s ease;
}
.next-step-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(124,58,237,0.25);
}
.next-step-btn .material-symbols-outlined {
  font-size: 20px;
}

/* Payment Grid */
.payment-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.payment-option {
  position: relative;
  padding: 1rem;
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  background: var(--dark);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}
.payment-option:hover {
  border-color: var(--primary);
}
.payment-option.selected {
  border-color: var(--primary);
  background: var(--accent-primary-light, rgba(124,58,237,0.04));
}
.payment-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.5rem;
}
.payment-icon-text {
  font-size: 0.75rem;
  font-weight: 800;
}
.payment-icon .material-symbols-outlined {
  font-size: 22px;
}
.payment-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-light);
  margin: 0 0 0.15rem;
}
.payment-desc {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin: 0;
}
.selected-check {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
.selected-check .material-symbols-outlined {
  font-size: 14px;
}

.payment-extra-card {
  padding: 1rem;
  background: var(--dark);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  margin-bottom: 1rem;
}
.payment-extra-card label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  display: block;
  margin-bottom: 0.35rem;
}
.payment-extra-card input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid var(--glass-border);
  border-radius: 10px;
  background: var(--glass);
  color: var(--text-light);
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
}
.payment-extra-card input:focus {
  border-color: var(--primary);
}
.hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0.4rem 0 0;
}

/* Error */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  color: var(--danger);
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.error-banner .material-symbols-outlined {
  font-size: 18px;
  flex-shrink: 0;
}

/* Place Order */
.place-order-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 16px;
  background: var(--primary);
  color: white;
  font-weight: 800;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.place-order-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(124,58,237,0.3);
}
.place-order-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.place-order-btn .material-symbols-outlined {
  font-size: 20px;
}
.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* Order Summary */
.order-summary-card {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 1.5rem;
  position: sticky;
  top: 100px;
}
.order-summary-card h2 {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-light);
  margin: 0 0 1rem;
}
.summary-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
}
.summary-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.summary-item-img {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}
.summary-item-info {
  flex: 1;
  min-width: 0;
}
.summary-item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-light);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.summary-item-qty {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}
.summary-item-price {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-light);
  margin: 0;
  flex-shrink: 0;
}
.summary-divider {
  height: 1px;
  background: var(--glass-border);
  margin: 1rem 0;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}
.summary-total-row {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-light);
  margin-bottom: 0;
}
.summary-total-row span:last-child {
  color: var(--primary);
}
.text-green { color: #10b981; font-weight: 600; }
.text-accent { color: var(--primary); }

/* Trust Signals */
.trust-signals {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.trust-signal {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}
.trust-signal .material-symbols-outlined {
  font-size: 16px;
  color: var(--primary);
}

/* Buttons */
.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.5rem;
  background: var(--primary);
  color: white;
  border-radius: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}
.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(124,58,237,0.3);
}
.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.5rem;
  border: 2px solid var(--primary);
  color: var(--primary);
  border-radius: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}
.secondary-btn:hover {
  background: var(--primary);
  color: white;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.success-modal {
  background: var(--surface);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 2.5rem;
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 60px rgba(0,0,0,0.3);
}
.success-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  animation: success-pop 0.5s ease;
}
.success-icon-wrap .material-symbols-outlined {
  font-size: 40px;
  color: var(--success);
}
@keyframes success-pop {
  0% { transform: scale(0); }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
.success-modal h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-light);
  margin: 0 0 0.5rem;
}
.success-modal > p {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0 0 1.25rem;
}

.success-details {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.25rem;
  text-align: left;
  margin-bottom: 1.5rem;
}
.detail-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary);
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}
.detail-header .material-symbols-outlined {
  font-size: 20px;
}
.detail-text {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}
.bank-details p {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0.25rem 0;
}

.paypal-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: #0070ba;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.2s;
  margin-top: 0.5rem;
}
.paypal-btn:hover { transform: translateY(-1px); }
.paypal-pal { color: #c0e0ff; }

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-active .success-modal,
.modal-leave-active .success-modal {
  transition: transform 0.3s ease;
}
.modal-enter-from {
  opacity: 0;
}
.modal-enter-from .success-modal {
  transform: scale(0.9) translateY(20px);
}
.modal-leave-to {
  opacity: 0;
}
.modal-leave-to .success-modal {
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 900px) {
  .checkout-grid { grid-template-columns: 1fr; }
  .order-summary-card { position: static; }
  .payment-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .payment-grid { grid-template-columns: 1fr 1fr; }
  .checkout-header h1 { font-size: 1.5rem; }
  .progress-steps { gap: 0; }
  .step-line { width: 30px; }
}
</style>

