import { reactive, ref } from 'vue'
import api from '../services/api'

const messages = ref([])
const loading = ref(false)
const sending = ref(false)
const widgetOpen = ref(false)

export const chat = reactive({
  get messages() { return messages.value },
  set messages(v) { messages.value = v },
  get loading() { return loading.value },
  set loading(v) { loading.value = v },
  get sending() { return sending.value },
  set sending(v) { sending.value = v },
  get widgetOpen() { return widgetOpen.value },
  set widgetOpen(v) { widgetOpen.value = v },

  async fetchHistory() {
    loading.value = true
    try {
      const res = await api.get('/chat/history', { params: { limit: 50 } })
      messages.value = res.data.messages || []
    } catch (e) {
      console.error('Failed to load chat history:', e)
    } finally {
      loading.value = false
    }
  },

  async sendMessage(text) {
    if (!text.trim()) return
    const userMsg = { message: text.trim(), sender: 'user', temp: true, created_at: new Date().toISOString() }
    messages.value.push(userMsg)
    sending.value = true
    try {
      const res = await api.post('/chat/message', { message: text.trim() })
      const lastMsg = messages.value[messages.value.length - 1]
      if (lastMsg?.temp) {
        messages.value[messages.value.length - 1] = res.data.userMessage
      }
      messages.value.push(res.data.botMessage)
    } catch (e) {
      messages.value.push({
        message: e?.message || 'Sorry, something went wrong. Please try again.',
        sender: 'bot',
        isError: true,
        created_at: new Date().toISOString()
      })
    } finally {
      sending.value = false
    }
  },

  toggleWidget() {
    widgetOpen.value = !widgetOpen.value
    if (widgetOpen.value && messages.value.length === 0) {
      this.fetchHistory()
    }
  }
})
