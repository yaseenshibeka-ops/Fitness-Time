<template>
  <div>
    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else>
      <div class="row g-3">
        <div class="col-md-6">
          <div class="glass-card p-3 mb-3">
            <h6 class="fw-bold mb-3">General Settings</h6>
            <div class="mb-3">
              <label class="form-label small text-muted">Site Name</label>
              <input class="form-control" v-model="settings.site_name">
            </div>
            <div class="mb-3">
              <label class="form-label small text-muted">Site Description</label>
              <textarea class="form-control" v-model="settings.site_description" rows="2"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label small text-muted">Contact Email</label>
              <input class="form-control" v-model="settings.contact_email" type="email">
            </div>
            <div class="mb-3">
              <label class="form-label small text-muted">Phone</label>
              <input class="form-control" v-model="settings.contact_phone">
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="glass-card p-3 mb-3">
            <h6 class="fw-bold mb-3">Currency & Shipping</h6>
            <div class="mb-3">
              <label class="form-label small text-muted">Currency</label>
              <input class="form-control" v-model="settings.currency">
            </div>
            <div class="mb-3">
              <label class="form-label small text-muted">Delivery Fee</label>
              <input class="form-control" v-model.number="settings.delivery_fee" type="number">
            </div>
            <div class="mb-3">
              <label class="form-label small text-muted">Free Delivery Threshold</label>
              <input class="form-control" v-model.number="settings.free_delivery_threshold" type="number">
            </div>
          </div>
          <div class="glass-card p-3">
            <h6 class="fw-bold mb-3">Payment & Maintenance</h6>
            <div class="mb-3">
              <label class="form-label small text-muted">Mobile Money Fee (%)</label>
              <input class="form-control" v-model.number="settings.mobile_money_fee" type="number" step="0.1">
            </div>
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" id="maintenance" v-model="settings.maintenance_mode">
              <label class="form-check-label" for="maintenance">Maintenance Mode</label>
            </div>
          </div>
        </div>
      </div>
      <div class="text-end mt-3">
        <button class="btn btn-primary" @click="saveSettings" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const loading = ref(true)
const saving = ref(false)
const settings = ref({
  site_name: '', site_description: '', contact_email: '', contact_phone: '',
  currency: 'RWF', delivery_fee: 0, free_delivery_threshold: 0,
  mobile_money_fee: 0, maintenance_mode: false
})

async function loadSettings() {
  try {
    const res = await api.get('/admin/settings')
    if (res.data.settings) Object.assign(settings.value, res.data.settings)
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function saveSettings() {
  saving.value = true
  try {
    await api.put('/admin/settings', settings.value)
    alert('Settings saved!')
  } catch (e) { alert('Failed to save settings'); console.error(e) }
  finally { saving.value = false }
}

onMounted(loadSettings)
</script>
