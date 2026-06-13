<template>
  <div>
    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else class="row g-3">
      <div class="col-md-6">
        <div class="glass-card p-3">
          <h6 class="fw-bold mb-3"><i class="bi bi-palette me-2"></i>Appearance</h6>
          <div class="mb-2">
            <div class="form-check"><input class="form-check-input" type="radio" name="theme" value="dark" id="td" v-model="settings.theme" @change="save"><label class="form-check-label" for="td">Dark Mode</label></div>
            <div class="form-check"><input class="form-check-input" type="radio" name="theme" value="light" id="tl" v-model="settings.theme" @change="save"><label class="form-check-label" for="tl">Light Mode</label></div>
            <div class="form-check"><input class="form-check-input" type="radio" name="theme" value="system" id="ts" v-model="settings.theme" @change="save"><label class="form-check-label" for="ts">System Theme</label></div>
          </div>
        </div>
        <div class="glass-card p-3">
          <h6 class="fw-bold mb-3"><i class="bi bi-bell me-2"></i>Notification Preferences</h6>
          <div class="form-check form-switch mb-2"><input class="form-check-input" type="checkbox" id="em" v-model="settings.emailNotifications" @change="save"><label class="form-check-label" for="em">Email Notifications</label></div>
          <div class="form-check form-switch mb-2"><input class="form-check-input" type="checkbox" id="pn" v-model="settings.pushNotifications" @change="save"><label class="form-check-label" for="pn">Push Notifications</label></div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="glass-card p-3">
          <h6 class="fw-bold mb-3"><i class="bi bi-shield-lock me-2"></i>Privacy</h6>
          <div class="form-check form-switch"><input class="form-check-input" type="checkbox" id="ps" v-model="settings.privacyShareProgress" @change="save"><label class="form-check-label" for="ps">Share progress with community</label></div>
        </div>
        <div class="glass-card p-3">
          <h6 class="fw-bold mb-3 text-danger"><i class="bi bi-exclamation-triangle me-2"></i>Danger Zone</h6>
          <p class="small text-muted">Request account deletion. This action cannot be undone.</p>
          <button class="btn btn-outline-danger btn-sm" @click="requestDelete" :disabled="deleting">{{ deleting ? 'Processing...' : 'Delete My Account' }}</button>
          <div v-if="delMsg" class="small mt-2" :class="delError ? 'text-danger' : 'text-success'">{{ delMsg }}</div>
        </div>
        <div v-if="saved" class="alert alert-success py-2 mt-2">Settings saved!</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { auth } from '../stores/auth'

const loading = ref(true)
const saved = ref(false)
const deleting = ref(false)
const delMsg = ref('')
const delError = ref(false)
const settings = ref({ theme: 'dark', emailNotifications: true, pushNotifications: true, privacyShareProgress: false })

async function loadSettings() {
  try {
    const res = await api.get('/user/settings')
    const s = res.data.settings
    settings.value = { theme: s.theme || 'dark', emailNotifications: s.email_notifications ?? true, pushNotifications: s.push_notifications ?? true, privacyShareProgress: s.privacy_share_progress ?? false }
  } catch (e) { }
  finally { loading.value = false }
}

async function save() {
  try {
    await api.put('/user/settings', {
      theme: settings.value.theme,
      emailNotifications: settings.value.emailNotifications,
      pushNotifications: settings.value.pushNotifications,
      privacyShareProgress: settings.value.privacyShareProgress
    })
    saved.value = true; setTimeout(() => saved.value = false, 2000)
  } catch (e) { }
}

async function requestDelete() {
  if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return
  deleting.value = true
  try {
    await api.delete('/auth/profile')
    delMsg.value = 'Account deletion requested. You will be contacted shortly.'
    delError.value = false
  } catch (e) { delMsg.value = 'Failed to process request'; delError.value = true }
  finally { deleting.value = false }
}

onMounted(loadSettings)
</script>
