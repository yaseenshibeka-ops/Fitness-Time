<template>
  <nav class="navbar navbar-expand-lg navbar-dark fixed-top">
    <div class="container">
      <router-link class="navbar-brand d-flex align-items-center gap-2" to="/">
        <i class="bi bi-heart-pulse-fill text-accent" style="font-size:1.4rem;"></i>
        <span>FitTrack Rwanda</span>
      </router-link>

      <button class="navbar-toggler" type="button" @click="mobileOpen = !mobileOpen" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" :class="{ show: mobileOpen }">
        <ul class="navbar-nav mx-auto">
          <li class="nav-item"><router-link class="nav-link" to="/" @click="mobileOpen = false">Home</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/products" @click="mobileOpen = false">Shop</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/subscriptions" @click="mobileOpen = false">Fitness Plans</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/dashboard/fitness" @click="mobileOpen = false">Progress Tracking</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/about" @click="mobileOpen = false">About Us</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/contact" @click="mobileOpen = false">Contact</router-link></li>
        </ul>

        <ul class="navbar-nav align-items-lg-center gap-1">
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="searchOpen = !searchOpen" title="Search">
              <i class="bi bi-search"></i>
            </a>
          </li>
          <li class="nav-item">
            <router-link class="nav-link position-relative" to="/cart" title="Cart">
              <i class="bi bi-cart3"></i>
              <span v-if="cartCount > 0" class="cart-badge">{{ cartCount > 99 ? '99+' : cartCount }}</span>
            </router-link>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="toggleTheme" title="Toggle Theme">
              <i class="bi" :class="isDark ? 'bi-sun' : 'bi-moon'"></i>
            </a>
          </li>
          <template v-if="auth.isLoggedIn">
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle d-flex align-items-center gap-2" href="#" role="button" data-bs-toggle="dropdown">
                <span class="avatar-circle">{{ auth.fullName?.charAt(0) || 'U' }}</span>
                <span class="d-none d-lg-inline">{{ auth.fullName?.split(' ')[0] || 'User' }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-dark">
                <li><a class="dropdown-item" href="#" @click.prevent="go('/dashboard')"><i class="bi bi-speedometer2 me-2"></i>Dashboard</a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="go('/dashboard/profile')"><i class="bi bi-person me-2"></i>Profile</a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="go('/dashboard/orders')"><i class="bi bi-cart-check me-2"></i>Orders</a></li>
                <li v-if="auth.isAdmin"><hr class="dropdown-divider"></li>
                <li v-if="auth.isAdmin"><a class="dropdown-item text-accent" href="#" @click.prevent="go('/admin')"><i class="bi bi-shield-lock me-2"></i>Admin Panel</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" href="#" @click.prevent="logout"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
              </ul>
            </li>
          </template>
          <template v-else>
            <li class="nav-item">
              <router-link class="btn btn-primary btn-sm px-3" to="/login" @click="mobileOpen = false">Sign In</router-link>
            </li>
          </template>
        </ul>
      </div>
    </div>

    <div v-if="searchOpen" class="search-overlay" @click.self="searchOpen = false">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="input-group input-group-lg mt-5">
              <input type="text" class="form-control" ref="searchInput" v-model="query" placeholder="Search products..." @keyup.enter="doSearch">
              <button class="btn btn-primary" @click="doSearch"><i class="bi bi-search"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { auth } from '../stores/auth'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const mobileOpen = ref(false)
const searchOpen = ref(false)
const query = ref('')
const searchInput = ref(null)
const cartCount = ref(0)

watch(searchOpen, async (val) => {
  if (val) {
    await nextTick()
    searchInput.value?.focus()
  }
})

async function fetchCartCount() {
  if (!auth.isLoggedIn) return
  try {
    const res = await api.get('/cart')
    const items = res.data?.cart?.items || []
    cartCount.value = items.reduce((sum, it) => sum + (it.quantity || 0), 0)
  } catch { cartCount.value = 0 }
}

const isDark = ref(true)

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'light') {
    isDark.value = false
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
  } else {
    isDark.value = true
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')
  }

  if (auth.isLoggedIn) fetchCartCount()
})

function toggleTheme() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
    localStorage.setItem('theme', 'light')
  }
}

function closeDropdown() {
  const el = document.querySelector('.dropdown-menu')?.parentElement
  if (el && typeof bootstrap !== 'undefined') {
    bootstrap.Dropdown.getInstance(el)?.hide()
  }
}

function go(path) {
  closeDropdown()
  mobileOpen.value = false
  router.push(path)
}

function logout() {
  closeDropdown()
  auth.logout()
  router.push('/login')
}

function doSearch() {
  if (query.value.trim()) {
    router.push('/products?search=' + encodeURIComponent(query.value.trim()))
    searchOpen.value = false
    query.value = ''
  }
}
</script>
