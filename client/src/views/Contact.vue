<template>
  <div class="pt-5" style="margin-top: 60px;">
    <section class="section-padding">
      <div class="container">
        <div class="row justify-content-center text-center mb-5">
          <div class="col-md-8">
            <h1 class="fw-bold display-5 mb-3">Contact Us</h1>
            <p class="text-muted lead">Have a question or need help? We'd love to hear from you.</p>
          </div>
        </div>
        <div class="row g-5">
          <div class="col-md-5">
            <div class="d-flex align-items-start gap-3 mb-4">
              <i class="bi bi-geo-alt fs-4 text-accent"></i>
              <div><h6 class="fw-bold">Address</h6><p class="text-muted mb-0">KG 123 St, Kigali Heights<br>Kigali, Rwanda</p></div>
            </div>
            <div class="d-flex align-items-start gap-3 mb-4">
              <i class="bi bi-telephone fs-4 text-accent"></i>
              <div><h6 class="fw-bold">Phone</h6><p class="text-muted mb-0">+250 788 000 000<br>+250 722 000 000</p></div>
            </div>
            <div class="d-flex align-items-start gap-3 mb-4">
              <i class="bi bi-envelope fs-4 text-accent"></i>
              <div><h6 class="fw-bold">Email</h6><p class="text-muted mb-0">info@fittrack.rw<br>support@fittrack.rw</p></div>
            </div>
            <div class="d-flex align-items-start gap-3">
              <i class="bi bi-clock fs-4 text-accent"></i>
              <div><h6 class="fw-bold">Hours</h6><p class="text-muted mb-0">Monday–Saturday: 7AM–9PM<br>Sunday: 9AM–5PM</p></div>
            </div>
          </div>
          <div class="col-md-7">
            <div class="glass-card p-4">
              <h5 class="fw-bold mb-3">Send a Message</h5>
              <form @submit.prevent="submitForm">
                <div class="row g-3">
                  <div class="col-6"><input type="text" class="form-control" placeholder="Your Name" required v-model="form.name"></div>
                  <div class="col-6"><input type="email" class="form-control" placeholder="Your Email" required v-model="form.email"></div>
                  <div class="col-12"><input type="text" class="form-control" placeholder="Subject" required v-model="form.subject"></div>
                  <div class="col-12"><textarea class="form-control" rows="4" placeholder="Your Message" required v-model="form.message"></textarea></div>
                  <div class="col-12"><button type="submit" class="btn btn-primary" :disabled="sending">{{ sending ? 'Sending...' : 'Send Message' }}</button></div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const form = reactive({ name: '', email: '', subject: '', message: '' })
const sending = ref(false)

async function submitForm() {
  sending.value = true
  await new Promise(r => setTimeout(r, 1000))
  sending.value = false
  form.name = ''; form.email = ''; form.subject = ''; form.message = ''
}
</script>
