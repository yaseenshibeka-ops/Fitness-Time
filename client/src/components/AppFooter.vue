<template>
  <footer class="pt-5 pb-4" style="background:var(--surface);border-top:1px solid var(--glass-border);">
    <div class="container">
      <div class="row g-4">
        <div class="col-lg-4">
          <router-link to="/" class="navbar-brand d-flex align-items-center gap-2 mb-3" style="font-size:1.25rem;">
            <i class="bi bi-heart-pulse-fill text-accent"></i>
            <span>FitTrack Rwanda</span>
          </router-link>
          <p class="text-muted small mb-3" style="max-width:300px;">Rwanda's premium fitness platform. Shop equipment, track progress, and achieve your goals with subscription-based fitness tools.</p>
          <div class="d-flex gap-3">
            <a href="#" class="text-muted fs-5" title="Facebook"><i class="bi bi-facebook"></i></a>
            <a href="#" class="text-muted fs-5" title="Instagram"><i class="bi bi-instagram"></i></a>
            <a href="#" class="text-muted fs-5" title="Twitter"><i class="bi bi-twitter-x"></i></a>
            <a href="#" class="text-muted fs-5" title="YouTube"><i class="bi bi-youtube"></i></a>
          </div>
        </div>
        <div class="col-6 col-lg-2">
          <h6 class="fw-bold mb-3">Quick Links</h6>
          <ul class="list-unstyled small">
            <li class="mb-2"><router-link to="/" class="text-muted text-decoration-none">Home</router-link></li>
            <li class="mb-2"><router-link to="/products" class="text-muted text-decoration-none">Shop</router-link></li>
            <li class="mb-2"><router-link to="/subscriptions" class="text-muted text-decoration-none">Plans</router-link></li>
            <li class="mb-2"><router-link to="/about" class="text-muted text-decoration-none">About Us</router-link></li>
            <li class="mb-2"><router-link to="/contact" class="text-muted text-decoration-none">Contact</router-link></li>
          </ul>
        </div>
        <div class="col-6 col-lg-2">
          <h6 class="fw-bold mb-3">Categories</h6>
          <ul class="list-unstyled small">
            <li class="mb-2"><router-link to="/products" class="text-muted text-decoration-none">Gym Equipment</router-link></li>
            <li class="mb-2"><router-link to="/products" class="text-muted text-decoration-none">Supplements</router-link></li>
            <li class="mb-2"><router-link to="/products" class="text-muted text-decoration-none">Sportswear</router-link></li>
            <li class="mb-2"><router-link to="/products" class="text-muted text-decoration-none">Accessories</router-link></li>
          </ul>
        </div>
        <div class="col-6 col-lg-2">
          <h6 class="fw-bold mb-3">Subscription</h6>
          <ul class="list-unstyled small">
            <li class="mb-2"><router-link to="/subscriptions" class="text-muted text-decoration-none">Basic Plan</router-link></li>
            <li class="mb-2"><router-link to="/subscriptions" class="text-muted text-decoration-none">Premium Plan</router-link></li>
            <li class="mb-2"><router-link to="/subscriptions" class="text-muted text-decoration-none">Annual Plan</router-link></li>
            <li class="mb-2"><router-link to="/register" class="text-muted text-decoration-none">Sign Up</router-link></li>
          </ul>
        </div>
        <div class="col-6 col-lg-2">
          <h6 class="fw-bold mb-3">Contact</h6>
          <ul class="list-unstyled small">
            <li class="mb-2 text-muted"><i class="bi bi-geo-alt me-1"></i>Kigali, Rwanda</li>
            <li class="mb-2 text-muted"><i class="bi bi-telephone me-1"></i>+250 788 000 000</li>
            <li class="mb-2 text-muted"><i class="bi bi-envelope me-1"></i>info@fittrack.rw</li>
            <li class="mb-2 text-muted"><i class="bi bi-clock me-1"></i>Mon–Sat, 7AM–9PM</li>
          </ul>
        </div>
      </div>
      <hr class="my-4" style="border-color:var(--glass-border);">
      <div class="text-center text-muted small">&copy; 2026 FitTrack Rwanda. All rights reserved.</div>
    </div>
  </footer>
</template>
