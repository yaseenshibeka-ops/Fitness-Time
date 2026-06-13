<template>
  <div class="d-flex" style="min-height: 100vh; padding-top: 60px;">
    <!-- Backdrop overlay for mobile screen sidebar -->
    <div v-if="mobileOpen" class="sidebar-backdrop" @click="mobileOpen = false"></div>

    <aside class="dashboard-sidebar" :class="{ collapsed: collapsed, 'mobile-open': mobileOpen }">
      <div class="p-3 border-bottom text-center" style="border-color:var(--glass-border)!important;">
        <div v-if="!collapsed || mobileOpen">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;margin:0 auto 4px;font-weight:800;">{{ auth.fullName.charAt(0) }}</div>
          <div class="small fw-bold text-light">{{ auth.fullName }}</div>
          <span class="badge bg-accent text-dark" style="font-size:0.6rem;">{{ auth.user?.role }}</span>
        </div>
        <button class="btn btn-sm btn-outline-light d-none d-md-inline-block mt-2" @click="collapsed = !collapsed" style="font-size:0.8rem;"><i class="bi bi-list"></i></button>
      </div>
      <nav class="nav flex-column p-2">
        <router-link v-for="item in menu" :key="item.path" :to="item.path"
          class="nav-link d-flex align-items-center gap-2 px-3 py-2 rounded mb-1"
          :class="route.path === item.path || (item.children && route.path.startsWith(item.path)) ? 'active' : ''">
          <i :class="item.icon" style="width:20px;"></i>
          <span class="menu-text" v-show="!collapsed || mobileOpen">{{ item.label }}</span>
        </router-link>
      </nav>
    </aside>
    <div class="flex-grow-1 dashboard-content" style="background:var(--dark);min-height:100vh;overflow-y:auto;">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <!-- Mobile menu toggle button -->
          <button class="btn btn-outline-light d-md-none px-2 py-1" @click="mobileOpen = !mobileOpen" aria-label="Toggle Navigation">
            <i class="bi bi-list" style="font-size: 1.25rem; line-height: 1;"></i>
          </button>
          <div>
            <h4 class="fw-bold mb-0 text-light">{{ pageTitle }}</h4>
            <small class="text-muted">{{ greeting }}, {{ auth.fullName }}</small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-3">
          <router-link to="/dashboard/notifications" class="position-relative text-light animate-bell" style="font-size:1.2rem;">
            <i class="bi bi-bell"></i>
            <span v-if="notifStore.unreadCount" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger animate-pulse" style="font-size:0.55rem;">{{ notifStore.unreadCount }}</span>
          </router-link>
        </div>
      </div>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { auth } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'

const route = useRoute()
const collapsed = ref(false)
const mobileOpen = ref(false)
const notifStore = useNotificationStore()

const menu = [
  { path: '/dashboard', label: 'Dashboard', icon: 'bi bi-speedometer2' },
  { path: '/dashboard/profile', label: 'My Profile', icon: 'bi bi-person' },
  { path: '/dashboard/fitness', label: 'Fitness Progress', icon: 'bi bi-graph-up' },
  { path: '/dashboard/workouts', label: 'Workout History', icon: 'bi bi-activity' },
  { path: '/dashboard/goals', label: 'Goals', icon: 'bi bi-bullseye' },
  { path: '/dashboard/subscription', label: 'Subscription', icon: 'bi bi-star' },
  { path: '/dashboard/orders', label: 'Orders', icon: 'bi bi-cart-check' },
  { path: '/dashboard/wishlist', label: 'Wishlist', icon: 'bi bi-heart' },
  { path: '/dashboard/payments', label: 'Payments', icon: 'bi bi-credit-card' },
  { path: '/dashboard/notifications', label: 'Notifications', icon: 'bi bi-bell' },
  { path: '/dashboard/reports', label: 'Reports', icon: 'bi bi-file-earmark-bar-graph' },
  { path: '/dashboard/settings', label: 'Settings', icon: 'bi bi-gear' },
]

const menuMap = { '/dashboard': 'Overview', '/dashboard/profile': 'Profile', '/dashboard/fitness': 'Fitness Progress', '/dashboard/workouts': 'Workout History', '/dashboard/goals': 'Goals', '/dashboard/subscription': 'Subscription', '/dashboard/orders': 'Orders', '/dashboard/wishlist': 'Wishlist', '/dashboard/payments': 'Payments', '/dashboard/notifications': 'Notifications', '/dashboard/reports': 'Reports', '/dashboard/settings': 'Settings' }
const pageTitle = computed(() => menuMap[route.path] || 'Dashboard')
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
})

onMounted(() => notifStore.fetchUnreadCount())
watch(() => route.path, () => {
  notifStore.fetchUnreadCount()
  mobileOpen.value = false
})
</script>

<style scoped>
.dashboard-sidebar {
  width: 220px;
  background: var(--surface);
  border-right: 1px solid var(--glass-border);
  transition: width 0.3s, transform 0.3s ease-in-out;
  flex-shrink: 0;
  overflow: hidden;
}
.dashboard-sidebar.collapsed { width: 60px; }
.dashboard-sidebar .nav-link { color: var(--text-muted); transition: all .2s; }
.dashboard-sidebar .nav-link:hover { background: var(--glass); color: var(--text-light); }
.dashboard-sidebar .nav-link.active { background: var(--primary); color: white; }

.dashboard-content {
  padding: 1.75rem;
  transition: padding 0.3s;
}

@media (max-width: 767.98px) {
  .dashboard-sidebar {
    position: fixed;
    top: 60px;
    left: 0;
    bottom: 0;
    width: 240px;
    z-index: 1040;
    transform: translateX(-100%);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
  }
  .dashboard-sidebar.mobile-open {
    transform: translateX(0);
  }
  .dashboard-sidebar.collapsed {
    width: 240px; /* Force full sidebar width on mobile screen */
  }
  .dashboard-sidebar .menu-text {
    display: inline !important;
  }
  .sidebar-backdrop {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 1030;
  }
  .dashboard-content {
    padding: 1.25rem;
  }
}

@media (max-width: 575.98px) {
  .dashboard-content {
    padding: 0.75rem;
  }
}

/* Bell Animation */
.animate-bell:hover i {
  animation: ring 0.5s ease-in-out;
}
@keyframes ring {
  0% { transform: rotate(0); }
  20% { transform: rotate(15deg); }
  40% { transform: rotate(-15deg); }
  60% { transform: rotate(10deg); }
  80% { transform: rotate(-10deg); }
  100% { transform: rotate(0); }
}
</style>
