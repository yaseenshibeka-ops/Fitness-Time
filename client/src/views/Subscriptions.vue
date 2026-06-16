<template>
  <div class="container py-5" style="padding-top: 100px;">
    <h2 class="fw-bold text-center mb-2">Tracking Plans</h2>
    <p class="text-muted text-center mb-5">Choose a plan that fits your fitness journey.</p>
    <div class="row g-4 justify-content-center">
      <div class="col-md-4">
        <div class="glass-card plan-card p-5 h-100 text-center">
          <h3 class="fw-bold">Basic</h3>
          <div class="display-5 fw-bold my-4">10k <span class="fs-5 text-muted">RWF/mo</span></div>
          <ul class="list-unstyled text-start mb-4">
            <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Monthly progress tracking</li>
            <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Goal monitoring</li>
            <li class="mb-2"><i class="bi bi-x-circle text-muted me-2"></i> Personalized recommendations</li>
          </ul>
          <router-link v-if="auth.isLoggedIn" :to="`/checkout/subscription/basic`" class="btn btn-outline-primary w-100">Get Started</router-link>
          <router-link v-else to="/register" class="btn btn-outline-primary w-100">Get Started</router-link>
        </div>
      </div>
      <div class="col-md-4">
        <div class="glass-card plan-card premium p-5 h-100 text-center position-relative">
          <span class="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-accent text-dark px-3 py-2">RECOMMENDED</span>
          <h3 class="fw-bold text-accent mt-2">Premium</h3>
          <div class="display-5 fw-bold my-4">25k <span class="fs-5 text-muted">RWF/mo</span></div>
          <ul class="list-unstyled text-start mb-4">
            <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Advanced progress tracking</li>
            <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Goal monitoring</li>
            <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Personalized recommendations</li>
            <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Advanced reports</li>
          </ul>
          <router-link v-if="auth.isLoggedIn" :to="`/checkout/subscription/premium`" class="btn btn-primary w-100">Upgrade to Premium</router-link>
          <router-link v-else to="/register" class="btn btn-primary w-100">Upgrade to Premium</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { auth } from '../stores/auth'
</script>
