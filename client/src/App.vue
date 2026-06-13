<template>
  <div id="app-root">
    <AppNavbar />
    <main>
      <router-view />
    </main>
    <AppFooter v-if="showMainNav" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'

const router = useRouter()
const showMainNav = computed(() => {
  const path = router.currentRoute.value?.path || ''
  return !path.startsWith('/dashboard') && !path.startsWith('/admin')
})
</script>
