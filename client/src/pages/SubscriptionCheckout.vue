<template>
  <div class="container py-5" style="padding-top: 100px;">
    <div class="row justify-content-center">
      <div class="col-lg-6">
        <router-link to="/subscriptions" class="text-muted text-decoration-none small mb-3 d-inline-block">&larr; Back to Plans</router-link>
        <h2 class="fw-bold mb-1">Subscription Checkout</h2>
        <p class="text-muted mb-4">Complete your subscription purchase</p>

        <div v-if="result" class="glass-card p-4 text-center">
          <div class="mb-3">
            <span class="material-symbols-outlined" style="font-size:48px;color:var(--success)">check_circle</span>
          </div>
          <h4 class="fw-bold">Subscription Active!</h4>
          <p class="text-muted small">Your <strong class="text-accent text-uppercase">{{ plan.name }}</strong> plan is now active.</p>

          <div v-if="selectedPayment === 'bank_transfer' && paymentResult" class="bg-dark rounded p-3 mb-3 text-start small">
            <div class="fw-bold mb-2">
              <span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">account_balance</span>
              Bank Transfer Details
            </div>
            <div class="text-muted">
              <div>Bank: <strong class="text-light">{{ paymentResult.bankDetails?.bankName }}</strong></div>
              <div>Account: <strong class="text-light">{{ paymentResult.bankDetails?.accountName }}</strong></div>
              <div>Account No: <strong class="text-accent">{{ paymentResult.bankDetails?.accountNumber }}</strong></div>
              <div>Reference: <strong class="text-accent">{{ paymentResult.bankDetails?.reference }}</strong></div>
            </div>
          </div>

          <router-link to="/dashboard/subscription" class="btn btn-primary w-100">Go to My Subscription</router-link>
        </div>

        <div v-else class="glass-card p-4">
          <div class="d-flex align-items-center gap-3 mb-4 pb-3" style="border-bottom:1px solid var(--glass-border)">
            <div style="width:56px;height:56px;border-radius:12px;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:1.5rem;">
              <i class="bi bi-star-fill"></i>
            </div>
            <div>
              <h4 class="fw-bold mb-0 text-accent text-uppercase">{{ plan.name }}</h4>
              <span class="text-muted small">{{ plan.description }}</span>
            </div>
            <div class="ms-auto text-end">
              <div class="display-6 fw-bold text-light">{{ plan.price.toLocaleString() }}</div>
              <div class="text-muted small">RWF</div>
            </div>
          </div>

          <ul class="list-unstyled mb-4">
            <li v-for="f in plan.features" :key="f" class="mb-2 small">
              <i class="bi bi-check-circle-fill text-success me-2"></i>{{ f }}
            </li>
          </ul>

          <h6 class="fw-bold mb-3">Payment Method</h6>
          <div class="row g-2 mb-4">
            <div v-for="pm in paymentMethods" :key="pm.id" class="col-6">
              <button
                class="btn w-100 text-start d-flex align-items-center gap-2"
                :class="selectedPayment === pm.id ? 'btn-primary' : 'btn-outline-light'"
                @click="selectedPayment = pm.id"
                style="padding:0.75rem;border-radius:12px;"
              >
                <i :class="pm.icon" class="fs-5"></i>
                <div>
                  <div class="fw-bold small">{{ pm.label }}</div>
                  <div class="small opacity-75">{{ pm.desc }}</div>
                </div>
              </button>
            </div>
          </div>

          <div v-if="selectedPayment === 'mtn_momo' || selectedPayment === 'airtel_money'" class="mb-3">
            <label class="form-label small fw-bold">Phone Number</label>
            <input v-model="paymentPhone" type="tel" class="form-control bg-dark text-light border-0" placeholder="+250 7XX XXX XXX" />
            <div class="text-muted small mt-1">You will receive a payment request on your phone.</div>
          </div>

          <div v-if="error" class="alert alert-danger py-2 small">{{ error }}</div>

          <button
            class="btn btn-primary w-100 py-3 fw-bold"
            @click="confirmPayment"
            :disabled="submitting || !selectedPayment"
          >
            {{ submitting ? 'Processing...' : `Subscribe Now — ${plan.price.toLocaleString()} RWF` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()

const plans = [
  { name: 'Basic', slug: 'basic', price: 10000, description: 'Monthly progress tracking', features: ['Monthly progress tracking', 'Basic reports', 'Goal monitoring'] },
  { name: 'Premium', slug: 'premium', price: 25000, description: 'Advanced tracking & recommendations', features: ['Advanced progress tracking', 'Detailed reports', 'Personalized recommendations', 'Priority support'] },
  { name: 'Annual', slug: 'annual', price: 250000, description: 'All Premium features, best value', features: ['All Premium features', 'Best value', 'Year-long commitment', 'Exclusive content'] },
]

const paymentMethods = [
  { id: 'mtn_momo', label: 'MTN MoMo', desc: 'Instant payment', icon: 'bi bi-phone' },
  { id: 'airtel_money', label: 'Airtel Money', desc: 'Instant payment', icon: 'bi bi-phone' },
  { id: 'bank_transfer', label: 'Bank Transfer', desc: 'Manual transfer', icon: 'bi bi-bank' },
  { id: 'cash_on_delivery', label: 'Cash on Delivery', desc: 'Pay on arrival', icon: 'bi bi-cash' },
  { id: 'paypal', label: 'PayPal', desc: 'International', icon: 'bi bi-paypal' },
]

const plan = computed(() => plans.find(p => p.slug === route.params.planType) || plans[0])

const selectedPayment = ref('')
const paymentPhone = ref('')
const submitting = ref(false)
const error = ref('')
const result = ref(false)
const paymentResult = ref(null)

async function confirmPayment() {
  submitting.value = true
  error.value = ''
  try {
    const subRes = await api.post('/subscriptions', { planType: plan.value.slug })
    const subscriptionId = subRes.subscriptionId || subRes.data?.subscriptionId || subRes.data?.data?.subscriptionId

    if (!subscriptionId) {
      throw new Error('Failed to create subscription. Please try again.')
    }

    const paymentPayload = {
      subscriptionId,
      paymentMethod: selectedPayment.value,
      amount: plan.value.price,
    }
    if (selectedPayment.value === 'mtn_momo' || selectedPayment.value === 'airtel_money') {
      paymentPayload.phoneNumber = paymentPhone.value
    }

    const payRes = await api.post('/payments/initiate', paymentPayload)
    paymentResult.value = payRes.data
    const transactionRef = payRes.transactionRef || payRes.data?.transactionRef

    await api.post('/payments/webhook', { transactionRef, status: 'SUCCESS' })
    result.value = true
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Payment failed. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>
