<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center" style="padding-top: 80px;">
    <div class="glass-card p-5" style="width: 100%; max-width: 420px;">
      <div class="text-center mb-4">
        <router-link to="/" class="text-decoration-none"><h3 class="fw-bold text-accent mb-1">FitTrack Rwanda</h3></router-link>
        <p class="text-muted mb-0">Welcome back! Log in to your account.</p>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" v-model="email" placeholder="you@example.com" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <div class="input-group">
            <input :type="showPw ? 'text' : 'password'" class="form-control" v-model="password" placeholder="Enter password" required>
            <button class="btn btn-outline-secondary" type="button" @click="showPw = !showPw" style="border-color:var(--glass-border);color:var(--text-muted);">
              <i :class="showPw ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>
        <div v-if="error" class="alert alert-danger py-2 small">{{ error }}</div>
        <button type="submit" class="btn btn-primary w-100 py-2" :disabled="submitting">
          <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
          {{ submitting ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      <div class="d-flex justify-content-between mt-3">
        <router-link to="/register" class="text-accent small">Create account</router-link>
      </div>
      <div class="text-center mt-3">
        <router-link to="/" class="text-muted small"><i class="bi bi-arrow-left me-1"></i>Back to home</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { auth } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)
const showPw = ref(false)

async function handleLogin() {
  error.value = ''
  submitting.value = true
  try {
    const user = await auth.login(email.value, password.value)
    const redirect = route.query.redirect || (user.role === 'admin' ? '/admin' : '/dashboard')
    router.push(redirect)
  } catch (e) {
    error.value = e?.message || 'Invalid credentials'
  } finally {
    submitting.value = false
  }
}
</script>
