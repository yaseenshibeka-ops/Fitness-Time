<template>
  <div class="auth-page">
    <!-- Background decoration -->
    <div class="auth-bg">
      <div class="auth-bg-orb orb-1"></div>
      <div class="auth-bg-orb orb-2"></div>
      <div class="auth-bg-grid"></div>
    </div>

    <div class="auth-container">
      <!-- Left: Branding Panel -->
      <div class="auth-branding">
        <div class="branding-content">
          <router-link to="/" class="brand-logo">
            <span class="brand-icon">⚡</span>
            FitTrack Rwanda
          </router-link>
          <h1 class="branding-title">Welcome back</h1>
          <p class="branding-subtitle">Log in to track your fitness journey, manage your orders, and access exclusive content.</p>
          <div class="branding-features">
            <div class="feature-item">
              <span class="feature-dot"></span>
              <span>Track workouts & set goals</span>
            </div>
            <div class="feature-item">
              <span class="feature-dot"></span>
              <span>Shop premium fitness gear</span>
            </div>
            <div class="feature-item">
              <span class="feature-dot"></span>
              <span>Monitor your progress daily</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Login Form -->
      <div class="auth-form-panel">
        <div class="auth-form-inner">
          <!-- Mobile brand (visible on small screens) -->
          <router-link to="/" class="mobile-brand">
            <span class="brand-icon">⚡</span>
            FitTrack Rwanda
          </router-link>

          <div class="form-header">
            <h2>Log in to your account</h2>
            <p>Enter your credentials to continue</p>
          </div>

          <form @submit.prevent="handleLogin" class="auth-form">
            <div class="form-field">
              <label for="login-email">Email address</label>
              <div class="input-wrapper">
                <span class="material-symbols-outlined input-icon">mail</span>
                <input
                  id="login-email"
                  type="email"
                  v-model="email"
                  placeholder="you@example.com"
                  required
                  autocomplete="email"
                />
              </div>
            </div>

            <div class="form-field">
              <label for="login-password">Password</label>
              <div class="input-wrapper">
                <span class="material-symbols-outlined input-icon">lock</span>
                <input
                  id="login-password"
                  :type="showPw ? 'text' : 'password'"
                  v-model="password"
                  placeholder="Enter your password"
                  required
                  autocomplete="current-password"
                />
                <button type="button" class="toggle-pw" @click="showPw = !showPw" tabindex="-1">
                  <span class="material-symbols-outlined">{{ showPw ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <!-- Error -->
            <Transition name="shake">
              <div v-if="error" class="auth-error">
                <span class="material-symbols-outlined">error</span>
                {{ error }}
              </div>
            </Transition>

            <button type="submit" class="auth-submit-btn" :disabled="submitting">
              <span v-if="submitting" class="btn-spinner"></span>
              <span v-else class="material-symbols-outlined">login</span>
              {{ submitting ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <div class="auth-footer">
            <p>Don't have an account? <router-link to="/register">Create one</router-link></p>
            <router-link to="/" class="back-home">
              <span class="material-symbols-outlined">arrow_back</span>
              Back to home
            </router-link>
          </div>
        </div>
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
    error.value = e?.message || 'Invalid email or password'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

/* Background Effects */
.auth-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.auth-bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
}
.orb-1 {
  width: 500px;
  height: 500px;
  background: var(--primary);
  top: -150px;
  left: -100px;
  animation: float-orb 15s ease-in-out infinite;
}
.orb-2 {
  width: 400px;
  height: 400px;
  background: var(--accent-purple);
  bottom: -100px;
  right: -100px;
  animation: float-orb 18s ease-in-out infinite reverse;
}
.auth-bg-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(var(--glass-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--glass-border) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.3;
}
@keyframes float-orb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-20px, 15px) scale(0.95); }
}

/* Container */
.auth-container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 960px;
  width: 100%;
  min-height: 580px;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
}

/* Branding Panel */
.auth-branding {
  background: linear-gradient(135deg, var(--primary), var(--accent-purple));
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.auth-branding::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
.branding-content {
  position: relative;
  z-index: 1;
}
.brand-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 800;
  color: white;
  text-decoration: none;
  margin-bottom: 2rem;
}
.brand-icon {
  font-size: 1.3rem;
}
.branding-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.75rem;
  line-height: 1.2;
}
.branding-subtitle {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0 0 2rem;
}
.branding-features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}
.feature-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

/* Form Panel */
.auth-form-panel {
  background: var(--surface);
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.auth-form-inner {
  width: 100%;
  max-width: 360px;
}
.mobile-brand {
  display: none;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 800;
  text-decoration: none;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--primary), var(--accent-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.form-header {
  margin-bottom: 2rem;
}
.form-header h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-light);
  margin: 0 0 0.4rem;
}
.form-header p {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0;
}

/* Form Fields */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.form-field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.02em;
}
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute;
  left: 14px;
  font-size: 20px;
  color: var(--text-muted);
  pointer-events: none;
  transition: color 0.2s;
}
.input-wrapper input {
  width: 100%;
  padding: 0.8rem 0.9rem 0.8rem 2.8rem;
  border: 1.5px solid var(--glass-border);
  border-radius: 12px;
  background: var(--glass);
  color: var(--text-light);
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: all 0.25s ease;
}
.input-wrapper input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}
.input-wrapper input:focus ~ .input-icon,
.input-wrapper input:focus + .input-icon {
  color: var(--primary);
}
.input-wrapper:focus-within .input-icon {
  color: var(--primary);
}
.input-wrapper input::placeholder {
  color: var(--text-muted);
  opacity: 0.6;
}
.toggle-pw {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  color: var(--text-muted);
  transition: color 0.2s;
}
.toggle-pw:hover {
  color: var(--primary);
}
.toggle-pw .material-symbols-outlined {
  font-size: 20px;
}

/* Error */
.auth-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  color: var(--danger);
  font-size: 0.85rem;
  font-weight: 600;
}
.auth-error .material-symbols-outlined {
  font-size: 18px;
  flex-shrink: 0;
}

/* Submit Button */
.auth-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary), var(--accent-purple));
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.25);
  margin-top: 0.25rem;
}
.auth-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}
.auth-submit-btn:active:not(:disabled) {
  transform: translateY(0);
}
.auth-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.auth-submit-btn .material-symbols-outlined {
  font-size: 20px;
}
.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Footer */
.auth-footer {
  margin-top: 1.75rem;
  text-align: center;
}
.auth-footer p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0 0 0.75rem;
}
.auth-footer a {
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}
.auth-footer a:hover {
  color: var(--accent-purple);
}
.back-home {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: var(--text-muted) !important;
  font-weight: 500 !important;
}
.back-home:hover {
  color: var(--primary) !important;
}
.back-home .material-symbols-outlined {
  font-size: 16px;
}

/* Shake animation for errors */
.shake-enter-active {
  animation: shake 0.4s ease;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

/* Responsive */
@media (max-width: 768px) {
  .auth-container {
    grid-template-columns: 1fr;
    max-width: 440px;
  }
  .auth-branding {
    display: none;
  }
  .mobile-brand {
    display: inline-flex;
  }
  .auth-form-panel {
    padding: 2rem 1.5rem;
    border-radius: 24px;
  }
  .auth-container {
    border: none;
    box-shadow: none;
    background: transparent;
  }
  .auth-form-panel {
    background: var(--glass);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
  }
}
</style>
