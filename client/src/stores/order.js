import { ref } from 'vue'
import api from '../services/api'

export function useOrderStore() {
  const orders = ref([])
  const loading = ref(false)

  async function fetchOrders() {
    loading.value = true
    try {
      const res = await api.get('/orders')
      orders.value = res.data.orders || []
    } catch (e) { console.error(e) }
    finally { loading.value = false }
    return orders.value
  }

  async function getOrderDetail(id) {
    const res = await api.get(`/orders/${id}`)
    return res.data
  }

  return { orders, loading, fetchOrders, getOrderDetail }
}
