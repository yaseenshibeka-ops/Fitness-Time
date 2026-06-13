<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-sm mb-md">
      <h5 class="font-headline-md text-headline-md flex items-center gap-sm">
        <span class="material-symbols-outlined text-primary">inventory_2</span>
        My Orders
      </h5>
      <div class="flex gap-sm">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input v-model="search" type="text" placeholder="Search..." @input="debouncedLoad" class="bg-surface-container-high border border-outline-variant/30 rounded-lg pl-lg pr-sm py-1.5 text-caption font-caption outline-none focus:border-primary transition-colors w-[140px]"/>
        </div>
        <select v-model="statusFilter" @change="load" class="bg-surface-container-high border border-outline-variant/30 rounded-lg px-sm py-1.5 text-caption font-caption outline-none focus:border-primary transition-colors">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
    </div>

    <!-- Orders -->
    <div v-else-if="orders.length" class="space-y-sm">
      <div v-for="o in orders" :key="o.order_id" class="bg-surface-container-lowest p-sm md:p-md rounded-xl border border-outline-variant/20 hover-lift cursor-pointer" @click="viewDetails(o)">
        <div class="flex items-center justify-between gap-sm">
          <div class="flex items-center gap-sm min-w-0">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" :class="statusIconBg(o.status)">
              <span class="material-symbols-outlined text-sm" :class="statusIconColor(o.status)">{{ statusIcon(o.status) }}</span>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1 flex-wrap">
                <code class="text-caption font-caption">#{{ o.order_reference }}</code>
                <span class="text-[10px] px-1.5 py-0.5 rounded border font-medium" :class="statusBadge(o.status)">{{ o.status }}</span>
              </div>
              <p class="text-caption font-caption text-on-surface-variant">{{ new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) }}</p>
            </div>
          </div>
          <div class="text-right shrink-0">
            <p class="font-label-md text-label-md text-primary">{{ Number(o.grand_total).toLocaleString() }} RWF</p>
            <p v-if="o.payment" class="text-caption font-caption text-on-surface-variant">{{ o.payment.payment_method?.replace(/_/g, ' ') }}</p>
          </div>
        </div>
      </div>
      <div v-if="pages > 1" class="flex justify-center items-center gap-sm pt-sm">
        <button :disabled="page <= 1" @click="page--; load()" class="w-7 h-7 rounded-lg flex items-center justify-center border border-outline-variant/30 hover:bg-surface-container-high transition-colors text-caption" :class="{ 'opacity-30': page <= 1 }">
          <span class="material-symbols-outlined text-xs">chevron_left</span>
        </button>
        <span class="text-caption font-caption">{{ page }}/{{ pages }}</span>
        <button :disabled="page >= pages" @click="page++; load()" class="w-7 h-7 rounded-lg flex items-center justify-center border border-outline-variant/30 hover:bg-surface-container-high transition-colors text-caption" :class="{ 'opacity-30': page >= pages }">
          <span class="material-symbols-outlined text-xs">chevron_right</span>
        </button>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="bg-surface-container-lowest p-xl rounded-xl text-center border border-outline-variant/20">
      <span class="material-symbols-outlined text-4xl text-on-surface-variant">inbox</span>
      <p class="font-body-md text-body-md text-on-surface-variant mt-sm">No orders yet.</p>
      <router-link to="/products" class="text-primary font-label-md text-label-md mt-sm inline-block">Start Shopping</router-link>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div v-if="detail" class="fixed inset-0 z-50 bg-on-surface/60 flex items-center justify-center p-md" @click.self="detail = null">
        <div class="bg-surface-container-lowest rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl">
          <div class="sticky top-0 bg-surface-container-lowest z-10 flex items-center justify-between p-md border-b border-outline-variant/20">
            <h6 class="font-label-md text-label-md">Order #{{ detail.order_reference }}</h6>
            <button @click="detail = null" class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-container-high"><span class="material-symbols-outlined text-sm">close</span></button>
          </div>
          <div class="p-md space-y-md">
            <div class="flex items-center gap-sm">
              <span class="text-caption font-caption text-on-surface-variant">Status:</span>
              <span class="text-caption font-caption px-sm py-0.5 rounded border" :class="statusBadge(detail.status)">{{ detail.status }}</span>
            </div>
            <div class="grid grid-cols-2 gap-sm text-caption font-caption bg-surface-container-high p-sm rounded-lg">
              <div><span class="text-on-surface-variant">Name:</span> {{ detail.full_name }}</div>
              <div><span class="text-on-surface-variant">Phone:</span> {{ detail.phone }}</div>
              <div class="col-span-2"><span class="text-on-surface-variant">Address:</span> {{ detail.delivery_address }}</div>
            </div>
            <div v-if="detail.payment" class="text-caption font-caption bg-surface-container-high p-sm rounded-lg space-y-0.5">
              <div><span class="text-on-surface-variant">Payment:</span> {{ detail.payment.payment_method?.replace(/_/g, ' ') }}</div>
              <div><span class="text-on-surface-variant">Status:</span> {{ detail.payment.payment_status }}</div>
              <div><span class="text-on-surface-variant">Ref:</span> <code>{{ detail.payment.transaction_reference }}</code></div>
            </div>
            <div>
              <h6 class="text-caption font-caption mb-sm text-on-surface-variant uppercase tracking-wider">Items</h6>
              <div v-for="item in detail.items" :key="item.item_id" class="flex items-center gap-sm py-1">
                <img :src="item.image_url || ''" class="w-8 h-8 rounded object-cover" loading="lazy"/>
                <div class="flex-1 min-w-0"><p class="text-caption font-caption truncate">{{ item.name }}</p></div>
                <p class="text-caption font-caption">{{ Number(item.total_price).toLocaleString() }} RWF</p>
              </div>
            </div>
            <div class="border-t border-outline-variant/20 pt-sm flex justify-between font-label-md text-label-md">
              <span>Total</span>
              <span class="text-primary">{{ Number(detail.grand_total).toLocaleString() }} RWF</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const orders = ref([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref('')
const page = ref(1)
const pages = ref(1)
const detail = ref(null)

let debounceTimer

function debouncedLoad() { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => { page.value = 1; load() }, 300) }
function statusIcon(s) { return ({ pending: 'schedule', confirmed: 'check_circle', processing: 'sync', shipped: 'local_shipping', delivered: 'check_circle', cancelled: 'cancel' })[s] || 'help' }
function statusIconBg(s) { return ({ pending: 'bg-tertiary/20', confirmed: 'bg-primary/20', processing: 'bg-primary/20', shipped: 'bg-primary/20', delivered: 'bg-green-100', cancelled: 'bg-error/20' })[s] || 'bg-surface-container-high' }
function statusIconColor(s) { return ({ pending: 'text-tertiary', confirmed: 'text-primary', processing: 'text-primary', shipped: 'text-primary', delivered: 'text-green-600', cancelled: 'text-error' })[s] || '' }
function statusBadge(s) { return ({ pending: 'border-tertiary text-tertiary', confirmed: 'border-primary text-primary', processing: 'border-primary text-primary', shipped: 'border-primary text-primary', delivered: 'border-green-600 text-green-600', cancelled: 'border-error text-error' })[s] || 'border-outline-variant text-on-surface-variant' }

async function load() {
  loading.value = true
  try {
    const params = { page: page.value, limit: 10 }
    if (search.value) params.search = search.value
    if (statusFilter.value) params.status = statusFilter.value
    const res = await api.get('/orders', { params })
    orders.value = res.data.orders || []
    pages.value = res.data.pages || 1
  } catch { /* ignore */ }
  finally { loading.value = false }
}

async function viewDetails(o) {
  try {
    const res = await api.get(`/orders/${o.order_id}`)
    detail.value = res.data.order
  } catch { /* ignore */ }
}

onMounted(load)
</script>

<style scoped>
.hover-lift { transition: all 0.2s ease-in-out; }
.hover-lift:hover { transform: translateY(-1px); box-shadow: 0px 4px 20px rgba(0,0,0,0.06); }
</style>
