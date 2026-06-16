<template>
  <div class="chat-widget-container">
    <button class="chat-toggle-btn" @click="chat.toggleWidget()" :title="chat.widgetOpen ? 'Close chat' : 'Open AI Assistant'">
      <i v-if="!chat.widgetOpen" class="bi bi-chat-dots-fill"></i>
      <i v-else class="bi bi-x-lg"></i>
    </button>
    <transition name="chat-slide">
      <div v-if="chat.widgetOpen" class="chat-widget">
        <ChatWindow :embedded="true" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { chat } from '../stores/chat'
import ChatWindow from './ChatWindow.vue'
</script>

<style scoped>
.chat-widget-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.chat-toggle-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--accent-purple));
  border: none;
  color: white;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: 1051;
}

.chat-toggle-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(99, 102, 241, 0.6);
}

.chat-widget {
  position: absolute;
  bottom: 68px;
  right: 0;
  width: 380px;
  height: 600px;
  max-height: 80vh;
  background: var(--surface);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

@media (max-width: 480px) {
  .chat-widget {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    max-height: 100vh;
    border-radius: 0;
    bottom: 0;
  }
  .chat-widget-container {
    bottom: 16px;
    right: 16px;
  }
}
</style>
