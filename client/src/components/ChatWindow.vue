<template>
  <div class="chat-window" :class="{ embedded }">
    <div class="chat-header">
      <div class="d-flex align-items-center gap-2">
        <div class="chat-avatar">
          <i class="bi bi-robot"></i>
        </div>
        <div>
          <h6 class="mb-0 fw-bold">FitBot</h6>
          <small class="text-muted">AI Fitness Assistant</small>
        </div>
      </div>
      <div class="d-flex gap-1">
        <button v-if="embedded" class="btn btn-sm btn-outline-secondary px-2" @click="$router.push('/chat')" title="Open full screen">
          <i class="bi bi-arrows-angle-expand"></i>
        </button>
        <button class="btn btn-sm btn-outline-secondary px-2" @click="chat.toggleWidget()" title="Close">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div v-if="chat.loading" class="text-center py-4">
        <div class="spinner"></div>
      </div>

      <template v-else>
        <div v-for="(msg, i) in chat.messages" :key="i" class="message-row" :class="msg.sender">
          <div class="message-bubble" :class="{ 'error-msg': msg.isError }">
            <div class="message-text">{{ msg.message }}</div>
            <div class="message-time">{{ formatTime(msg.created_at) }}</div>
          </div>
        </div>

        <div v-if="chat.sending" class="message-row bot">
          <div class="message-bubble typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </template>

      <div v-if="!chat.loading && chat.messages.length === 0" class="empty-chat">
        <i class="bi bi-chat-dots" style="font-size:3rem;color:var(--text-muted);"></i>
        <p class="text-muted mt-2">Ask me anything about fitness, workouts, or nutrition!</p>
        <div class="quick-actions">
          <button v-for="action in quickActions" :key="action.label" class="btn btn-sm btn-outline-primary quick-btn" @click="handleQuickAction(action)">
            <i :class="action.icon"></i> {{ action.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <div class="input-group">
        <input
          v-model="inputText"
          @keydown.enter="send"
          placeholder="Ask FitBot anything..."
          class="form-control"
          :disabled="chat.sending"
          maxlength="2000"
        />
        <button class="btn btn-primary send-btn" @click="send" :disabled="!inputText.trim() || chat.sending">
          <i class="bi bi-send-fill"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { chat } from '../stores/chat'

const props = defineProps({
  embedded: { type: Boolean, default: false }
})

const inputText = ref('')
const messagesContainer = ref(null)

const quickActions = [
  { label: 'Generate Workout', icon: 'bi bi-activity', action: 'workout' },
  { label: 'Progress Summary', icon: 'bi bi-graph-up', action: 'progress' },
  { label: 'Recommend Products', icon: 'bi bi-cart', action: 'products' },
  { label: 'Nutrition Tips', icon: 'bi bi-cup-hot', action: 'nutrition' },
  { label: 'Renew Subscription', icon: 'bi bi-star', action: 'renew' },
]

watch(() => chat.messages.length, async () => {
  await nextTick()
  scrollToBottom()
})

watch(() => chat.sending, async (val) => {
  if (val) {
    await nextTick()
    scrollToBottom()
  }
})

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function send() {
  if (!inputText.value.trim() || chat.sending) return
  chat.sendMessage(inputText.value)
  inputText.value = ''
}

function handleQuickAction(action) {
  const prompts = {
    workout: 'Create a personalized workout plan for me based on my fitness goals.',
    progress: 'Give me a summary of my recent fitness progress and insights.',
    products: 'What fitness products do you recommend from the FitTrack store for my goals?',
    nutrition: 'Give me some nutrition tips to support my fitness journey.',
    renew: 'Tell me about the subscription plans and how to renew.',
  }
  chat.sendMessage(prompts[action.action] || prompts.workout)
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--dark);
}

.chat-window.embedded {
  height: 100%;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--glass-border);
  background: var(--surface);
  flex-shrink: 0;
}

.chat-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--accent-purple));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-row {
  display: flex;
  max-width: 85%;
}

.message-row.user {
  align-self: flex-end;
}

.message-row.bot {
  align-self: flex-start;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 0.9rem;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-row.user .message-bubble {
  background: linear-gradient(135deg, var(--primary), var(--accent-purple));
  color: white;
  border-bottom-right-radius: 4px;
}

.message-row.bot .message-bubble {
  background: var(--surface);
  border: 1px solid var(--glass-border);
  color: var(--text-light);
  border-bottom-left-radius: 4px;
}

.message-bubble.error-msg {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--danger);
  color: var(--danger);
}

.message-time {
  font-size: 0.65rem;
  opacity: 0.6;
  margin-top: 4px;
  text-align: right;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  padding: 20px;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-top: 12px;
}

.quick-btn {
  font-size: 0.75rem;
  border-radius: 20px;
  padding: 4px 12px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 12px 16px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-4px); }
}

.chat-input-area {
  padding: 12px 16px;
  border-top: 1px solid var(--glass-border);
  background: var(--surface);
  flex-shrink: 0;
}

.subscription-indicator {
  margin-bottom: 8px;
}

.send-btn {
  border-radius: 0 10px 10px 0;
  padding: 8px 16px;
}

.send-btn:disabled {
  opacity: 0.5;
}

.form-control {
  border-radius: 10px 0 0 10px;
}
</style>
