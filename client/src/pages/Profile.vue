<template>
  <div>
    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else class="row g-4">
      <div class="col-md-4">
        <div class="glass-card p-4 text-center">
          <div style="width:100px;height:100px;border-radius:50%;background:var(--primary);margin:0 auto 1rem;display:flex;align-items:center;justify-content:center;font-size:2.5rem;font-weight:800;overflow:hidden;">
            <img v-if="form.avatarUrl" :src="form.avatarUrl" style="width:100%;height:100%;object-fit:cover;" />
            <span v-else>{{ form.fullName?.charAt(0) }}</span>
          </div>
          <div class="mb-3"><input class="form-control form-control-sm" v-model="form.avatarUrl" placeholder="Avatar URL"></div>
          <h5 class="fw-bold">{{ form.fullName }}</h5>
          <p class="text-muted mb-0">{{ form.email }}</p>
          <span class="badge bg-primary mt-2">{{ form.role }}</span>
        </div>
      </div>
      <div class="col-md-8">
        <div class="glass-card p-4">
          <h5 class="fw-bold mb-3">Account Details</h5>
          <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Full Name</label><input class="form-control" v-model="form.fullName"></div>
            <div class="col-md-6"><label class="form-label">Email</label><input class="form-control" v-model="form.email" disabled></div>
            <div class="col-md-6"><label class="form-label">Phone</label><input class="form-control" v-model="form.phone"></div>
            <div class="col-md-6"><label class="form-label">Date of Birth</label><input class="form-control" type="date" v-model="form.dateOfBirth"></div>
            <div class="col-md-4"><label class="form-label">Gender</label>
              <select class="form-select" v-model="form.gender"><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
            <div class="col-md-4"><label class="form-label">Height (cm)</label><input class="form-control" type="number" v-model.number="form.heightCm"></div>
            <div class="col-md-12"><label class="form-label">Address</label><textarea class="form-control" rows="2" v-model="form.address"></textarea></div>
          </div>
          <div v-if="msg" class="alert alert-success py-2 mt-3">{{ msg }}</div>
          <button class="btn btn-primary mt-3" @click="save" :disabled="saving">{{ saving ? 'Saving...' : 'Update Profile' }}</button>
        </div>

        <div class="glass-card p-4 mt-3">
          <h5 class="fw-bold mb-3">Change Password</h5>
          <div class="row g-3">
            <div class="col-md-4"><input class="form-control" type="password" v-model="pw.current" placeholder="Current password"></div>
            <div class="col-md-4"><input class="form-control" type="password" v-model="pw.newPassword" placeholder="New password (min 6 chars)"></div>
            <div class="col-md-4"><button class="btn btn-outline-light w-100" @click="changePw" :disabled="pwSaving">{{ pwSaving ? '...' : 'Change' }}</button></div>
          </div>
          <div v-if="pwMsg" class="small mt-2" :class="pwError ? 'text-danger' : 'text-success'">{{ pwMsg }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const loading = ref(true)
const saving = ref(false)
const msg = ref('')
const pw = ref({ current: '', newPassword: '' })
const pwSaving = ref(false)
const pwMsg = ref('')
const pwError = ref(false)
const form = ref({ fullName: '', email: '', phone: '', address: '', dateOfBirth: '', gender: '', heightCm: null, avatarUrl: '', role: '' })

onMounted(async () => {
  try {
    const res = await api.get('/auth/profile')
    const u = res.data.user
    form.value = { fullName: u.full_name, email: u.email, phone: u.phone || '', address: u.address || '', dateOfBirth: u.date_of_birth ? u.date_of_birth.split('T')[0] : '', gender: u.gender || '', heightCm: u.height_cm, avatarUrl: u.avatar_url || '', role: u.role }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})

async function save() {
  saving.value = true
  try {
    await api.put('/user/profile', form.value)
    msg.value = 'Profile updated!'; setTimeout(() => msg.value = '', 3000)
  } catch (e) { msg.value = 'Update failed' }
  finally { saving.value = false }
}

async function changePw() {
  if (pw.value.newPassword.length < 6) { pwMsg.value = 'Password must be at least 6 characters'; pwError.value = true; return }
  pwSaving.value = true
  try {
    await api.put('/user/change-password', { currentPassword: pw.value.current, newPassword: pw.value.newPassword })
    pwMsg.value = 'Password changed!'; pwError.value = false; pw.value = { current: '', newPassword: '' }
  } catch (e) { pwMsg.value = e?.message || 'Failed'; pwError.value = true }
  finally { pwSaving.value = false }
}
</script>
