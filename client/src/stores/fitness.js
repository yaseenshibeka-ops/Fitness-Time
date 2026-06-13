import { ref } from 'vue'
import api from '../services/api'

export function useFitnessStore() {
  const stats = ref(null)
  const progress = ref([])
  const goals = ref([])
  const loading = ref(false)

  async function fetchStats() {
    const res = await api.get('/fitness/dashboard-stats')
    stats.value = res.data.stats
    return stats.value
  }

  async function fetchProgress(params = {}) {
    loading.value = true
    try {
      const res = await api.get('/fitness/progress', { params })
      progress.value = res.data.history || []
    } catch (e) { console.error(e) }
    finally { loading.value = false }
    return progress.value
  }

  async function addRecord(data) {
    await api.post('/fitness/progress', data)
    await fetchProgress()
  }

  async function fetchGoals() {
    const res = await api.get('/user/goals')
    goals.value = res.data.goals || []
    return goals.value
  }

  async function createGoal(data) {
    await api.post('/fitness/goals', data)
    await fetchGoals()
  }

  async function updateGoal(id, data) {
    await api.put(`/user/goals/${id}`, data)
    await fetchGoals()
  }

  async function deleteGoal(id) {
    await api.delete(`/user/goals/${id}`)
    await fetchGoals()
  }

  return { stats, progress, goals, loading, fetchStats, fetchProgress, addRecord, fetchGoals, createGoal, updateGoal, deleteGoal }
}
