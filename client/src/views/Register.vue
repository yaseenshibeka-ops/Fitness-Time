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
          <h1 class="branding-title">Start your journey</h1>
          <p class="branding-subtitle">Join thousands of fitness enthusiasts in Rwanda. Track workouts, shop gear, and crush your goals.</p>
          <div class="branding-stats">
            <div class="stat-item">
              <span class="stat-value">5K+</span>
              <span class="stat-label">Active Members</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">200+</span>
              <span class="stat-label">Products</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">4.9★</span>
              <span class="stat-label">User Rating</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Register Form -->
      <div class="auth-form-panel">
        <div class="auth-form-inner">
          <!-- Mobile brand -->
          <router-link to="/" class="mobile-brand">
            <span class="brand-icon">⚡</span>
            FitTrack Rwanda
          </router-link>

          <div class="form-header">
            <h2>Create your account</h2>
            <p>Fill in your details to get started</p>
          </div>

          <form @submit.prevent="handleRegister" class="auth-form">
            <div class="form-field">
              <label for="reg-name">Full Name</label>
              <div class="input-wrapper">
                <span class="material-symbols-outlined input-icon">person</span>
                <input id="reg-name" type="text" v-model="fullName" placeholder="John Doe" required autocomplete="name" />
              </div>
            </div>

            <div class="form-field">
              <label for="reg-email">Email address</label>
              <div class="input-wrapper">
                <span class="material-symbols-outlined input-icon">mail</span>
                <input id="reg-email" type="email" v-model="email" placeholder="you@example.com" required autocomplete="email" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label for="reg-phone">Phone</label>
                <div class="input-wrapper">
                  <span class="material-symbols-outlined input-icon">phone</span>
                  <input id="reg-phone" type="tel" v-model="phone" placeholder="+250 7XX" autocomplete="tel" />
                </div>
              </div>
              <div class="form-field">
                <label for="reg-password">Password</label>
                <div class="input-wrapper">
                  <span class="material-symbols-outlined input-icon">lock</span>
                  <input id="reg-password" type="password" v-model="password" placeholder="Min 6 chars" required minlength="6" autocomplete="new-password" />
                </div>
              </div>
            </div>

            <div class="form-field">
              <label for="reg-address">Address <span class="optional">(optional)</span></label>
              <div class="input-wrapper">
                <span class="material-symbols-outlined input-icon">location_on</span>
                <input id="reg-address" type="text" v-model="address" placeholder="Kigali, Rwanda" autocomplete="street-address" />
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
              <span v-else class="material-symbols-outlined">person_add</span>
              {{ submitting ? 'Creating account...' : 'Create Account' }}
            </button>
          </form>

          <div class="auth-footer">
            <p>Already have an account? <router-link to="/login">Sign in</router-link></p>
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
    error.value = e?.message || 'Registration failed. Please try again.'
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

/* Background */
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
  background: var(--accent-purple);
  top: -150px;
  right: -100px;
  animation: float-orb 15s ease-in-out infinite;
}
.orb-2 {
  width: 400px;
  height: 400px;
  background: var(--primary);
  bottom: -100px;
  left: -100px;
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
  min-height: 620px;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
}

/* Branding Panel */
.auth-branding {
  background: linear-gradient(135deg, var(--accent-purple), var(--primary));
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
.branding-stats {
  display: flex;
  gap: 1.5rem;
}
.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.stat-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: white;
}
.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 500;
}

/* Form Panel */
.auth-form-panel {
  background: var(--surface);
  padding: 2.5rem 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.auth-form-inner {
  width: 100%;
  max-width: 380px;
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
  margin-bottom: 1.75rem;
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

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.form-field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.02em;
}
.optional {
  font-weight: 400;
  opacity: 0.6;
}
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute;
  left: 12px;
  font-size: 19px;
  color: var(--text-muted);
  pointer-events: none;
  transition: color 0.2s;
}
.input-wrapper input {
  width: 100%;
  padding: 0.75rem 0.9rem 0.75rem 2.6rem;
  border: 1.5px solid var(--glass-border);
  border-radius: 12px;
  background: var(--glass);
  color: var(--text-light);
  font-size: 0.88rem;
  font-family: inherit;
  outline: none;
  transition: all 0.25s ease;
}
.input-wrapper input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}
.input-wrapper:focus-within .input-icon {
  color: var(--primary);
}
.input-wrapper input::placeholder {
  color: var(--text-muted);
  opacity: 0.6;
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

/* Submit */
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
  margin-top: 1.5rem;
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

/* Shake animation */
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
    border: none;
    box-shadow: none;
  }
  .auth-branding {
    display: none;
  }
  .mobile-brand {
    display: inline-flex;
  }
  .auth-form-panel {
    padding: 2rem 1.5rem;
    background: var(--glass);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
