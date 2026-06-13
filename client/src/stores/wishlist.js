import { ref } from 'vue'
import api from '../services/api'

export function useWishlistStore() {
  const items = ref([])
  const loading = ref(false)

  async function fetchWishlist() {
    loading.value = true
    try {
      const res = await api.get('/user/wishlist')
      items.value = res.data.items || []
    } catch (e) { console.error(e) }
    finally { loading.value = false }
    return items.value
  }

  async function add(productId) {
    await api.post('/user/wishlist', { productId })
    await fetchWishlist()
  }

  async function remove(id) {
    await api.delete(`/user/wishlist/${id}`)
    await fetchWishlist()
  }

  async function moveToCart(id) {
    await api.post(`/user/wishlist/${id}/move-to-cart`)
    await fetchWishlist()
  }

  return { items, loading, fetchWishlist, add, remove, moveToCart }
}
