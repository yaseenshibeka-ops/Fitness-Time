<template>
  <div class="container py-5" style="padding-top: 100px;">
    <h2 class="fw-bold mb-4">My Profile</h2>
    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else class="row g-4">
      <div class="col-md-4">
        <div class="glass-card p-4 text-center">
          <div style="width:100px;height:100px;border-radius:50%;background:var(--primary);margin:0 auto 1rem;display:flex;align-items:center;justify-content:center;font-size:2.5rem;font-weight:800;">
            {{ profile.fullName?.charAt(0) }}
          </div>
          <h5 class="fw-bold">{{ profile.fullName }}</h5>
          <p class="text-muted mb-0">{{ profile.email }}</p>
          <span class="badge bg-primary mt-2">{{ profile.role }}</span>
        </div>
      </div>
      <div class="col-md-8">
        <div class="glass-card p-4">
          <h5 class="fw-bold mb-3">Account Details</h5>
          <div class="mb-3">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-control" v-model="profile.fullName">
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" v-model="profile.email">
          </div>
          <div class="mb-3">
            <label class="form-label">Phone</label>
            <input type="tel" class="form-control" v-model="profile.phone">
          </div>
          <div class="mb-3">
            <label class="form-label">Address</label>
            <textarea class="form-control" rows="2" v-model="profile.address"></textarea>
          </div>
          <div v-if="updateMsg" class="alert alert-success py-2">{{ updateMsg }}</div>
          <button class="btn btn-primary" @click="updateProfile">Update Profile</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { auth } from '../stores/auth'

const profile = ref({})
const loading = ref(true)
const updateMsg = ref('')

onMounted(async () => {
  try {
    const res = await api.get('/auth/profile')
    profile.value = res.data.user
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

async function updateProfile() {
  try {
    await api.put('/auth/profile', profile.value)
    updateMsg.value = 'Profile updated!'
    setTimeout(() => updateMsg.value = '', 3000)
  } catch (e) {
    updateMsg.value = e?.message || 'Update failed'
  }
}
</script>
