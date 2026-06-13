<template>
  <div class="pt-5" style="margin-top: 60px;">
    <section class="section-padding">
      <div class="container">
        <div class="row justify-content-center text-center mb-5">
          <div class="col-md-8">
            <h1 class="fw-bold display-5 mb-3">About FitTrack Rwanda</h1>
            <p class="text-muted lead">Empowering Rwandans to achieve their fitness goals through premium products and intelligent tracking tools.</p>
          </div>
        </div>
        <div class="row g-4 align-items-center">
          <div class="col-md-6">
            <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop" alt="About us" class="img-fluid rounded-4" loading="lazy">
          </div>
          <div class="col-md-6">
            <h3 class="fw-bold mb-3">Our Mission</h3>
            <p class="text-muted">We believe fitness should be accessible to everyone in Rwanda. That's why we combine a premium fitness equipment shop with a comprehensive digital tracking platform — all in one place.</p>
            <p class="text-muted">From Kigali to Musanze, we deliver quality gym equipment and provide the tools you need to track your progress, set goals, and stay motivated.</p>
            <router-link to="/products" class="btn btn-primary mt-3">Explore Products</router-link>
          </div>
        </div>
      </div>
    </section>
    <section class="section-padding" style="background:var(--surface);">
      <div class="container text-center">
        <h3 class="fw-bold mb-5">Why Choose FitTrack Rwanda?</h3>
        <div class="row g-4">
          <div class="col-md-4" v-for="item in reasons" :key="item.title">
            <div class="glass-card p-4 h-100">
              <i :class="item.icon" class="fs-1 text-accent mb-3" style="display:block;"></i>
              <h5 class="fw-bold">{{ item.title }}</h5>
              <p class="text-muted small mb-0">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const reasons = [
  { icon: 'bi bi-truck', title: 'Fast Delivery', desc: 'Free delivery across Rwanda on orders above 50,000 RWF.' },
  { icon: 'bi bi-shield-check', title: 'Quality Guaranteed', desc: 'All products sourced from trusted international brands.' },
  { icon: 'bi bi-phone', title: 'MoMo Payments', desc: 'Pay securely with MTN MoMo and Airtel Money.' },
]
</script>
