<template>
  <div class="admin-layout d-flex" style="padding-top: 60px; min-height: 100vh;">
    <aside class="admin-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="p-3 border-bottom" style="border-color: var(--glass-border) !important;">
        <h6 class="fw-bold mb-0 text-accent">Admin Panel</h6>
      </div>
      <nav class="nav flex-column p-2">
        <router-link v-for="item in menuItems" :key="item.path" :to="item.path"
          class="nav-link d-flex align-items-center gap-2 px-3 py-2 rounded mb-1"
          active-class="active" :class="isActive(item.path) ? 'active' : ''">
          <i :class="item.icon" style="width: 20px;"></i>
          <span v-show="!sidebarCollapsed">{{ item.label }}</span>
        </router-link>
      </nav>
    </aside>

    <div class="admin-content flex-grow-1 p-4" style="background: var(--dark); min-height: 100vh;">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="fw-bold mb-0">{{ pageTitle }}</h4>
        <div class="d-flex align-items-center gap-3">
          <router-link to="/admin/notifications" class="position-relative" style="font-size: 1.2rem;">
            <i class="bi bi-bell"></i>
            <span v-if="unreadCount" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.6rem;">{{ unreadCount }}</span>
          </router-link>
          <button class="btn btn-sm btn-outline-primary" @click="toggleSidebar">
            <i class="bi bi-list"></i>
          </button>
        </div>
      </div>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../services/api'
import { auth } from '../../stores/auth'

const route = useRoute()
const sidebarCollapsed = ref(false)
const unreadCount = ref(0)

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: 'bi bi-speedometer2' },
  { path: '/admin/users', label: 'Users', icon: 'bi bi-people' },
  { path: '/admin/products', label: 'Products', icon: 'bi bi-box-seam' },
  { path: '/admin/categories', label: 'Categories', icon: 'bi bi-tags' },
  { path: '/admin/orders', label: 'Orders', icon: 'bi bi-cart-check' },
  { path: '/admin/payments', label: 'Payments', icon: 'bi bi-credit-card' },
  { path: '/admin/subscriptions', label: 'Subscriptions', icon: 'bi bi-star' },
  { path: '/admin/fitness', label: 'Fitness', icon: 'bi bi-activity' },
  { path: '/admin/reports', label: 'Reports', icon: 'bi bi-file-earmark-bar-graph' },
  { path: '/admin/settings', label: 'Settings', icon: 'bi bi-gear' },
]

const pageTitle = computed(() => {
  const item = menuItems.find(m => route.path === m.path || route.path.startsWith(m.path + '/'))
  return item?.label || 'Dashboard'
})

function isActive(path) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}

function toggleSidebar() { sidebarCollapsed.value = !sidebarCollapsed.value }

async function loadUnread() {
  try {
    const res = await api.get('/admin/notifications?unreadOnly=true&limit=1')
    unreadCount.value = res.data.total
  } catch (e) { /* ignore */ }
}

onMounted(loadUnread)
watch(() => route.path, loadUnread)
</script>

<style scoped>
.admin-sidebar {
  width: 220px;
  background: var(--surface);
  border-right: 1px solid var(--glass-border);
  transition: width 0.3s ease;
  flex-shrink: 0;
  overflow: hidden;
}
.admin-sidebar.collapsed { width: 60px; }
.admin-sidebar .nav-link { color: var(--text-muted); transition: all 0.2s; }
.admin-sidebar .nav-link:hover { background: var(--glass); color: var(--text-light); }
.admin-sidebar .nav-link.active { background: var(--primary); color: white; }
</style>
