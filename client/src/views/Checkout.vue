<template>
  <div class="pt-20">
    <div class="max-w-container-max mx-auto px-margin-mobile md:px-lg py-xl">
      <!-- Header -->
      <div class="mb-lg">
        <h1 class="font-headline-lg text-headline-lg">Checkout</h1>
        <p class="font-body-md text-body-md text-on-surface-variant">Complete your order with your preferred payment method.</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-xl">
        <div class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
        <p class="font-body-md text-body-md text-on-surface-variant mt-md">Loading your cart...</p>
      </div>

      <!-- Empty Cart -->
      <div v-else-if="!cart || !cart.items?.length" class="text-center py-xl">
        <span class="material-symbols-outlined text-6xl text-on-surface-variant">shopping_cart</span>
        <h2 class="font-headline-md text-headline-md mt-md">Your cart is empty</h2>
        <p class="font-body-md text-body-md text-on-surface-variant">Add some products before checking out.</p>
        <router-link to="/products" class="inline-block bg-primary text-on-primary px-lg py-sm rounded-2xl font-label-md text-label-md hover-lift mt-md">Browse Products</router-link>
      </div>

      <!-- Checkout Form -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-5 gap-lg">
        <!-- Left: Delivery + Payment -->
        <div class="lg:col-span-3 space-y-md">
          <!-- Step 1: Delivery Details -->
          <div class="bg-surface-container-lowest p-md md:p-lg rounded-2xl border border-outline-variant/20 space-y-md">
            <h2 class="font-headline-md text-headline-md flex items-center gap-sm">
              <span class="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">1</span>
              Delivery Details
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div class="space-y-xs">
                <label class="font-label-md text-label-md text-on-surface-variant">Full Name</label>
                <input v-model="form.fullName" type="text" class="w-full bg-surface-container-high border border-outline-variant/50 rounded-xl px-md py-sm font-body-md text-body-md outline-none focus:border-primary transition-colors" placeholder="Your full name" required/>
              </div>
              <div class="space-y-xs">
                <label class="font-label-md text-label-md text-on-surface-variant">Email</label>
                <input v-model="form.email" type="email" class="w-full bg-surface-container-high border border-outline-variant/50 rounded-xl px-md py-sm font-body-md text-body-md outline-none focus:border-primary transition-colors" placeholder="email@example.com" required/>
              </div>
              <div class="space-y-xs">
                <label class="font-label-md text-label-md text-on-surface-variant">Phone Number</label>
                <input v-model="form.phone" type="tel" class="w-full bg-surface-container-high border border-outline-variant/50 rounded-xl px-md py-sm font-body-md text-body-md outline-none focus:border-primary transition-colors" placeholder="+250 7XX XXX XXX" required/>
              </div>
              <div class="space-y-xs">
                <label class="font-label-md text-label-md text-on-surface-variant">Province</label>
                <select v-model="form.province" class="w-full bg-surface-container-high border border-outline-variant/50 rounded-xl px-md py-sm font-body-md text-body-md outline-none focus:border-primary transition-colors">
                  <option value="">Select province</option>
                  <option value="Kigali">Kigali City</option>
                  <option value="Eastern">Eastern Province</option>
                  <option value="Western">Western Province</option>
                  <option value="Northern">Northern Province</option>
                  <option value="Southern">Southern Province</option>
                </select>
              </div>
              <div class="sm:col-span-2 space-y-xs">
                <label class="font-label-md text-label-md text-on-surface-variant">Delivery Address</label>
                <textarea v-model="form.address" rows="2" class="w-full bg-surface-container-high border border-outline-variant/50 rounded-xl px-md py-sm font-body-md text-body-md outline-none focus:border-primary transition-colors resize-none" placeholder="Street, building, landmark..." required></textarea>
              </div>
            </div>
          </div>

          <!-- Step 2: Payment Method -->
          <div class="bg-surface-container-lowest p-md md:p-lg rounded-2xl border border-outline-variant/20 space-y-md">
            <h2 class="font-headline-md text-headline-md flex items-center gap-sm">
              <span class="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">2</span>
              Payment Method
            </h2>

            <!-- Phone input for mobile money -->
            <div v-if="selectedPayment === 'mtn_momo' || selectedPayment === 'airtel_money'" class="bg-surface-container-high p-md rounded-xl space-y-sm">
              <label class="font-label-md text-label-md text-on-surface-variant">MoMo Phone Number</label>
              <input v-model="paymentPhone" type="tel" class="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-md py-sm font-body-md text-body-md outline-none focus:border-primary transition-colors" placeholder="+250 7XX XXX XXX" required/>
              <p class="text-caption font-caption text-on-surface-variant">You will receive a payment request on your phone.</p>
            </div>

            <!-- Bank Transfer details -->
            <div v-if="selectedPayment === 'bank_transfer' && paymentResult" class="bg-surface-container-high p-md rounded-xl space-y-sm">
              <h3 class="font-label-md text-label-md text-primary">Bank Transfer Details</h3>
              <div class="space-y-xs font-body-md text-body-md">
                <p><span class="text-on-surface-variant">Bank:</span> <strong>{{ paymentResult.bankDetails?.bankName }}</strong></p>
                <p><span class="text-on-surface-variant">Account Name:</span> <strong>{{ paymentResult.bankDetails?.accountName }}</strong></p>
                <p><span class="text-on-surface-variant">Account Number:</span> <strong class="text-primary">{{ paymentResult.bankDetails?.accountNumber }}</strong></p>
                <p><span class="text-on-surface-variant">Reference:</span> <strong class="text-primary">{{ paymentResult.bankDetails?.reference }}</strong></p>
              </div>
              <div class="bg-primary/10 p-sm rounded-lg">
                <p class="text-caption font-caption text-primary flex items-center gap-xs">
                  <span class="material-symbols-outlined text-sm">info</span>
                  Use the reference number as payment description. Your order will be confirmed once the transfer is verified.
                </p>
              </div>
            </div>

            <!-- PayPal info -->
            <div v-if="selectedPayment === 'paypal' && paymentResult" class="bg-surface-container-high p-md rounded-xl space-y-sm">
              <p class="font-body-md text-body-md text-on-surface-variant">Click the button below to complete your payment via PayPal.</p>
              <a :href="paymentResult.paypalUrl" target="_blank" class="inline-flex items-center gap-sm bg-[#0070ba] text-white px-lg py-sm rounded-2xl font-label-md text-label-md hover-lift">
                <span class="text-lg font-bold">Pay</span><span class="text-lg font-bold text-[#c0e0ff]">Pal</span>
                <span class="material-symbols-outlined">open_in_new</span>
              </a>
            </div>

            <!-- Payment options grid -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-md">
              <button v-for="pm in paymentMethods" :key="pm.id" @click="selectPayment(pm.id)" class="relative p-md rounded-2xl border-2 text-center space-y-sm transition-all" :class="selectedPayment === pm.id ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:border-outline-variant/60 bg-surface-container-high'">
                <div class="w-10 h-10 mx-auto rounded-xl flex items-center justify-center" :class="pm.bg">
                  <span v-if="pm.icon.startsWith('http')" class="text-xs font-bold" :class="pm.textColor">{{ pm.iconText }}</span>
                  <span v-else class="material-symbols-outlined" :class="pm.textColor">{{ pm.icon }}</span>
                </div>
                <p class="font-label-md text-label-md">{{ pm.label }}</p>
                <p class="text-caption font-caption text-on-surface-variant">{{ pm.desc }}</p>
                <div v-if="selectedPayment === pm.id" class="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <span class="material-symbols-outlined text-on-primary text-xs">check</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Error -->
          <div v-if="error" class="bg-error-container/20 text-error px-md py-sm rounded-xl font-label-md text-label-md flex items-center gap-sm">
            <span class="material-symbols-outlined text-sm">error</span>
            {{ error }}
          </div>

          <!-- Place Order Button -->
          <button @click="placeOrder" :disabled="submitting || !selectedPayment" class="w-full bg-primary text-on-primary py-md rounded-2xl font-headline-md text-headline-md hover-lift flex items-center justify-center gap-sm" :class="{ 'opacity-60 cursor-not-allowed': submitting || !selectedPayment }">
            <span v-if="submitting" class="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
            <span v-else class="material-symbols-outlined">lock</span>
            {{ submitting ? 'Processing...' : `Place Order — ${total.toLocaleString()} RWF` }}
          </button>
        </div>

        <!-- Right: Order Summary -->
        <div class="lg:col-span-2">
          <div class="bg-surface-container-lowest p-md md:p-lg rounded-2xl border border-outline-variant/20 space-y-md sticky top-28">
            <h2 class="font-headline-md text-headline-md">Order Summary</h2>

            <!-- Items -->
            <div class="space-y-sm divide-y divide-outline-variant/10">
              <div v-for="item in cart.items" :key="item.product_id" class="flex items-center gap-sm pt-sm first:pt-0">
                <img :src="item.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=60&h=60&fit=crop'" :alt="item.name" class="w-14 h-14 rounded-xl object-cover shrink-0" loading="lazy"/>
                <div class="flex-1 min-w-0">
                  <p class="font-label-md text-label-md truncate">{{ item.name }}</p>
                  <p class="text-caption font-caption text-on-surface-variant">Qty: {{ item.quantity }}</p>
                </div>
                <p class="font-headline-md text-headline-md shrink-0">{{ Number(item.price * item.quantity).toLocaleString() }} RWF</p>
              </div>
            </div>

            <!-- Totals -->
            <div class="space-y-sm pt-sm border-t border-outline-variant/20">
              <div class="flex justify-between font-body-md text-body-md">
                <span class="text-on-surface-variant">Subtotal</span>
                <span>{{ subtotal.toLocaleString() }} RWF</span>
              </div>
              <div class="flex justify-between font-body-md text-body-md">
                <span class="text-on-surface-variant">Delivery Fee</span>
                <span>{{ deliveryFee > 0 ? deliveryFee.toLocaleString() + ' RWF' : 'FREE' }}</span>
              </div>
              <div v-if="discount > 0" class="flex justify-between font-body-md text-body-md text-primary">
                <span>Discount</span>
                <span>-{{ discount.toLocaleString() }} RWF</span>
              </div>
              <div class="flex justify-between font-headline-md text-headline-md pt-sm border-t border-outline-variant/20">
                <span>Total</span>
                <span class="text-primary">{{ total.toLocaleString() }} RWF</span>
              </div>
            </div>

            <!-- Trust -->
            <div class="space-y-sm bg-surface-container-high p-md rounded-xl">
              <div class="flex items-center gap-sm text-caption font-caption text-on-surface-variant">
                <span class="material-symbols-outlined text-sm text-primary">lock</span>
                Secure 256-bit SSL encrypted checkout
              </div>
              <div class="flex items-center gap-sm text-caption font-caption text-on-surface-variant">
                <span class="material-symbols-outlined text-sm text-primary">verified</span>
                100% authentic products guaranteed
              </div>
              <div class="flex items-center gap-sm text-caption font-caption text-on-surface-variant">
                <span class="material-symbols-outlined text-sm text-primary">autorenew</span>
                14-day hassle-free return policy
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Success Modal -->
      <Teleport to="body">
        <div v-if="showSuccess" class="fixed inset-0 z-50 bg-on-surface/60 flex items-center justify-center p-md" @click.self="closeSuccess">
          <div class="bg-surface rounded-2xl p-xl max-w-md w-full space-y-md text-center shadow-xl">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span class="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
            </div>
            <h2 class="font-headline-lg text-headline-lg">Order Placed!</h2>
            <p class="font-body-md text-body-md text-on-surface-variant">Your order <strong class="text-on-surface">#{{ orderRef }}</strong> has been placed successfully.</p>

            <!-- Payment-specific next steps -->
            <div class="bg-surface-container-high p-md rounded-xl text-left space-y-sm">
              <!-- MTN / Airtel Money -->
              <template v-if="selectedPayment === 'mtn_momo' || selectedPayment === 'airtel_money'">
                <div class="flex items-center gap-sm text-primary">
                  <span class="material-symbols-outlined">phone_android</span>
                  <span class="font-label-md text-label-md">Check Your Phone</span>
                </div>
                <p class="text-caption font-caption text-on-surface-variant">A payment request has been sent to <strong>{{ paymentPhone }}</strong>. Please approve the prompt on your phone to complete the payment.</p>
              </template>

              <!-- Bank Transfer -->
              <template v-if="selectedPayment === 'bank_transfer' && paymentResult">
                <div class="flex items-center gap-sm text-primary">
                  <span class="material-symbols-outlined">account_balance</span>
                  <span class="font-label-md text-label-md">Bank Transfer Details</span>
                </div>
                <div class="space-y-1 text-caption font-caption">
                  <p><span class="text-on-surface-variant">Bank:</span> <strong>{{ paymentResult.bankDetails?.bankName }}</strong></p>
                  <p><span class="text-on-surface-variant">Account:</span> <strong>{{ paymentResult.bankDetails?.accountName }}</strong></p>
                  <p><span class="text-on-surface-variant">Account No:</span> <strong class="text-primary">{{ paymentResult.bankDetails?.accountNumber }}</strong></p>
                  <p><span class="text-on-surface-variant">Reference:</span> <strong class="text-primary">{{ paymentResult.bankDetails?.reference }}</strong></p>
                </div>
                <div class="bg-primary/10 p-sm rounded-lg text-caption font-caption text-primary flex items-start gap-xs">
                  <span class="material-symbols-outlined text-sm">info</span>
                  Use the reference number as payment description. Your order will be processed once the transfer is confirmed.
                </div>
              </template>

              <!-- PayPal -->
              <template v-if="selectedPayment === 'paypal' && paymentResult">
                <div class="flex items-center gap-sm text-primary">
                  <span class="material-symbols-outlined">open_in_new</span>
                  <span class="font-label-md text-label-md">Complete via PayPal</span>
                </div>
                <p class="text-caption font-caption text-on-surface-variant">Click the button below to complete your payment through PayPal.</p>
                <a :href="paymentResult.paypalUrl" target="_blank" class="flex items-center justify-center gap-sm bg-[#0070ba] text-white px-md py-sm rounded-xl font-label-md text-label-md hover-lift">
                  <span class="text-lg font-bold">Pay</span><span class="text-lg font-bold text-[#c0e0ff]">Pal</span>
                  <span class="material-symbols-outlined">open_in_new</span>
                </a>
              </template>

              <!-- Cash on Delivery -->
              <template v-if="selectedPayment === 'cash_on_delivery'">
                <div class="flex items-center gap-sm text-primary">
                  <span class="material-symbols-outlined">payments</span>
                  <span class="font-label-md text-label-md">Pay on Delivery</span>
                </div>
                <p class="text-caption font-caption text-on-surface-variant">No payment needed now. Pay when your order arrives at your delivery address.</p>
              </template>
            </div>

            <div class="flex flex-col gap-sm pt-sm">
              <router-link to="/dashboard/orders" class="bg-primary text-on-primary px-lg py-sm rounded-2xl font-label-md text-label-md hover-lift">View Order Details</router-link>
              <router-link to="/products" class="border-2 border-primary text-primary px-lg py-sm rounded-2xl font-label-md text-label-md hover-lift">Continue Shopping</router-link>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import { auth } from '../stores/auth'

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
const paymentMsg = ref('')
const paymentResult = ref(null)

const form = ref({
  fullName: auth.fullName || '',
  email: auth.email || '',
  phone: '',
  province: '',
  address: '',
})

// Payment methods
const paymentMethods = [
  { id: 'mtn_momo', label: 'MTN MoMo', desc: 'Instant payment', bg: 'bg-yellow-100', textColor: 'text-yellow-700', icon: '', iconText: 'MTN' },
  { id: 'airtel_money', label: 'Airtel Money', desc: 'Instant payment', bg: 'bg-red-100', textColor: 'text-red-700', icon: '', iconText: 'AIRT' },
  { id: 'cash_on_delivery', label: 'Cash on Delivery', desc: 'Pay on arrival', bg: 'bg-surface-container-high', textColor: 'text-on-surface-variant', icon: 'payments' },
  { id: 'bank_transfer', label: 'Bank Transfer', desc: 'Manual transfer', bg: 'bg-surface-container-high', textColor: 'text-on-surface-variant', icon: 'account_balance' },
  { id: 'paypal', label: 'PayPal', desc: 'International', bg: 'bg-blue-100', textColor: 'text-blue-700', icon: '', iconText: 'Pay' },
]

// Computed
const subtotal = computed(() => cart.value?.summary?.subtotal || 0)
const deliveryFee = computed(() => subtotal.value >= 50000 ? 0 : 2000)
const discount = computed(() => 0)
const total = computed(() => subtotal.value + deliveryFee.value - discount.value)

function selectPayment(id) {
  selectedPayment.value = id
  paymentResult.value = null
  if (id === 'mtn_momo' || id === 'airtel_money') {
    paymentPhone.value = form.value.phone || ''
  }
}

async function placeOrder() {
  if (!selectedPayment.value) {
    error.value = 'Please select a payment method'
    return
  }
  if (!form.value.fullName || !form.value.email || !form.value.phone || !form.value.address) {
    error.value = 'Please fill in all delivery details'
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

    const order = orderRes.data.order
    orderRef.value = order.orderReference

    // Step 2: Initiate Payment
    const payRes = await api.post('/payments/initiate', {
      paymentMethod: selectedPayment.value,
      amount: total.value,
      orderId: order.orderId,
      phoneNumber: selectedPayment.value === 'mtn_momo' || selectedPayment.value === 'airtel_money' ? paymentPhone.value : null,
    })

    const payData = payRes.data
    paymentResult.value = payData

    if (selectedPayment.value === 'bank_transfer') {
      paymentMsg.value = payData.message
    } else if (selectedPayment.value === 'paypal') {
      paymentMsg.value = 'Redirecting to PayPal...'
    } else if (selectedPayment.value === 'cash_on_delivery') {
      paymentMsg.value = 'Pay when you receive your order.'
    } else {
      paymentMsg.value = payData.message || 'Payment initiated successfully!'
    }

    cart.value = null
    showSuccess.value = true
  } catch (e) {
    error.value = e?.message || 'Failed to place order. Please try again.'
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
    cart.value = res.data.cart
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
/* Override Bootstrap interference */
:deep(input), :deep(select), :deep(textarea), :deep(button) {
  font-family: inherit;
  line-height: inherit;
}
.hover-lift {
  transition: all 0.2s ease-in-out;
}
.hover-lift:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0px 8px 30px rgba(0, 0, 0, 0.08);
}
</style>
