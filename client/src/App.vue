<template>
  <div id="app-root">
    <AppNavbar />
    <main>
      <router-view />
    </main>
    <AppFooter v-if="showMainNav" />
    <ChatWidget v-if="showChatWidget" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from './stores/auth'
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
import ChatWidget from './components/ChatWidget.vue'

const router = useRouter()
const showMainNav = computed(() => {
  const path = router.currentRoute.value?.path || ''
  return !path.startsWith('/dashboard') && !path.startsWith('/admin')
})
const showChatWidget = computed(() => {
  return auth.isLoggedIn
})
</script>
