<template>
  <div>
    <router-link to="/admin/orders" class="btn btn-sm btn-outline-light mb-3"><i class="bi bi-arrow-left"></i> Back to Orders</router-link>
    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else-if="order" class="row g-3">
      <div class="col-md-6">
        <div class="glass-card p-3">
          <h6 class="fw-bold mb-3">Order #{{ order.order_reference }}</h6>
          <table class="table table-dark table-sm">
            <tr><td>Status</td><td>
              <select class="form-select form-select-sm" :value="order.status" @change="e => updateStatus(e.target.value)">
                <option v-for="s in ['pending','confirmed','processing','shipped','delivered','cancelled']" :key="s" :value="s">{{ s }}</option>
              </select>
            </td></tr>
            <tr><td>Total</td><td>{{ Number(order.total_amount).toLocaleString() }} RWF</td></tr>
            <tr><td>Customer</td><td>{{ order.full_name }}<br><small class="text-muted">{{ order.email }}</small></td></tr>
            <tr><td>Phone</td><td>{{ order.phone || '-' }}</td></tr>
            <tr><td>Address</td><td>{{ order.delivery_address || '-' }}</td></tr>
            <tr><td>Date</td><td>{{ new Date(order.created_at).toLocaleString() }}</td></tr>
            <tr><td>Payment</td><td><span class="badge" :class="order.payment_status === 'paid' ? 'bg-success' : 'bg-warning text-dark'">{{ order.payment_status || 'unpaid' }}</span></td></tr>
          </table>
        </div>
      </div>
      <div class="col-md-6">
        <div class="glass-card p-3">
          <h6 class="fw-bold mb-3">Items</h6>
          <table class="table table-dark table-sm mb-0">
            <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>
              <tr v-for="item in items" :key="item.item_id">
                <td>{{ item.name }}</td><td>{{ item.quantity }}</td>
                <td>{{ Number(item.price).toLocaleString() }}</td>
                <td>{{ Number(item.total_price).toLocaleString() }} RWF</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-5 text-muted">Order not found</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const order = ref(null)
const items = ref([])

async function load() {
  try {
    const res = await api.get(`/admin/orders/${route.params.id}`)
    order.value = res.data.order
    items.value = res.data.order.items || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function updateStatus(status) {
  await api.put(`/admin/orders/${route.params.id}/status`, { status })
  await load()
}

onMounted(load)
</script>
