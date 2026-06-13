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
import { useRoute } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'

const route = useRoute()
const showMainNav = computed(() => !route.path.startsWith('/dashboard') && !route.path.startsWith('/admin'))
</script>
