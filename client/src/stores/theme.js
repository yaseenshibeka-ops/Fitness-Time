import { reactive } from 'vue'
import api from '../services/api'

export const theme = reactive({
  mode: localStorage.getItem('theme') || 'dark',
  setMode(m) {
    this.mode = m
    localStorage.setItem('theme', m)
    document.documentElement.setAttribute('data-theme', m)
  },
  toggle() {
    this.setMode(this.mode === 'dark' ? 'light' : 'dark')
  },
})
