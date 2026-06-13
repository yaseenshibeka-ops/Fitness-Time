<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center" style="padding-top: 80px;">
    <div class="glass-card p-5" style="width: 100%; max-width: 460px;">
      <div class="text-center mb-4">
        <router-link to="/" class="text-decoration-none"><h3 class="fw-bold text-accent mb-1">FitTrack Rwanda</h3></router-link>
        <p class="text-muted mb-0">Create your account and start your fitness journey.</p>
      </div>
      <form @submit.prevent="handleRegister">
        <div class="mb-3">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-control" v-model="fullName" placeholder="John Doe" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" v-model="email" placeholder="you@example.com" required>
        </div>
        <div class="row g-2 mb-3">
          <div class="col">
            <label class="form-label">Phone</label>
            <input type="tel" class="form-control" v-model="phone" placeholder="+250 7XX XXX XXX">
          </div>
          <div class="col">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" v-model="password" placeholder="Min 6 characters" required minlength="6">
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Address (optional)</label>
          <input type="text" class="form-control" v-model="address" placeholder="Kigali, Rwanda">
        </div>
        <div v-if="error" class="alert alert-danger py-2 small">{{ error }}</div>
        <button type="submit" class="btn btn-primary w-100 py-2" :disabled="submitting">
          <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
          {{ submitting ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>
      <p class="text-center text-muted mt-3 mb-0 small">
        Already have an account? <router-link to="/login" class="text-accent">Log in</router-link>
      </p>
      <div class="text-center mt-2">
        <router-link to="/" class="text-muted small"><i class="bi bi-arrow-left me-1"></i>Back to home</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { auth } from '../stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const fullName = ref('')
const email = ref('')
const phone = ref('')
const address = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function handleRegister() {
  error.value = ''
  submitting.value = true
  try {
    await auth.register({ fullName: fullName.value, email: email.value, password: password.value, phone: phone.value, address: address.value })
    router.push('/dashboard')
  } catch (e) {
    error.value = e?.message || 'Registration failed'
  } finally {
    submitting.value = false
  }
}
</script>
