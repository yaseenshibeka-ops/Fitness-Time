import { ref } from 'vue'
import api from '../services/api'

export function useWorkoutStore() {
  const workouts = ref([])
  const loading = ref(false)

  async function fetchWorkouts(params = {}) {
    loading.value = true
    try {
      const res = await api.get('/user/workouts', { params })
      workouts.value = res.data.workouts || []
    } catch (e) { console.error(e) }
    finally { loading.value = false }
    return workouts.value
  }

  async function addWorkout(data) {
    await api.post('/user/workouts', data)
    await fetchWorkouts()
  }

  async function updateWorkout(id, data) {
    await api.put(`/user/workouts/${id}`, data)
    await fetchWorkouts()
  }

  async function deleteWorkout(id) {
    await api.delete(`/user/workouts/${id}`)
    await fetchWorkouts()
  }

  return { workouts, loading, fetchWorkouts, addWorkout, updateWorkout, deleteWorkout }
}
