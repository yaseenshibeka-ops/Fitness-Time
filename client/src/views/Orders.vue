<template>
  <div class="pt-20">
    <div class="max-w-container-max mx-auto px-margin-mobile md:px-lg py-xl">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-lg">
        <div>
          <h1 class="font-headline-lg text-headline-lg">My Orders</h1>
          <p class="font-body-md text-body-md text-on-surface-variant">Track and manage your purchases.</p>
        </div>
        <router-link to="/products" class="bg-primary text-on-primary px-md py-sm rounded-2xl font-label-md text-label-md hover-lift flex items-center gap-sm self-start">
          <span class="material-symbols-outlined">add</span>
          Shop Again
        </router-link>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-sm mb-lg">
        <div class="relative flex-1">
          <span class="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input v-model="search" type="text" placeholder="Search by order reference..." @input="debouncedLoad" class="w-full bg-surface-container-high border border-outline-variant/50 rounded-xl pl-lg pr-md py-sm font-body-md text-body-md outline-none focus:border-primary transition-colors"/>
        </div>
        <select v-model="statusFilter" @change="load" class="bg-surface-container-high border border-outline-variant/50 rounded-xl px-md py-sm font-body-md text-body-md outline-none focus:border-primary transition-colors">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-xl">
        <div class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
      </div>

      <!-- Orders List -->
      <div v-else-if="orders.length" class="space-y-md">
        <div v-for="o in orders" :key="o.order_id" class="bg-surface-container-lowest p-md md:p-lg rounded-2xl border border-outline-variant/20 hover-lift cursor-pointer" @click="viewDetails(o)">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
            <div class="flex items-center gap-sm">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="statusIconBg(o.status)">
                <span class="material-symbols-outlined text-sm" :class="statusIconColor(o.status)">{{ statusIcon(o.status) }}</span>
              </div>
              <div>
                <div class="flex items-center gap-sm">
                  <code class="font-label-md text-label-md">#{{ o.order_reference }}</code>
                  <span class="text-caption font-caption px-sm py-0.5 rounded-full border" :class="statusBadge(o.status)">{{ o.status }}</span>
                </div>
                <p class="text-caption font-caption text-on-surface-variant">{{ new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-lg">
              <div class="text-right">
                <p class="font-headline-md text-headline-md text-primary">{{ Number(o.grand_total).toLocaleString() }} RWF</p>
                <p v-if="o.payment" class="text-caption font-caption flex items-center gap-0.5 justify-end" :class="o.payment.payment_status === 'completed' ? 'text-green-600' : 'text-on-surface-variant'">
                  <span class="material-symbols-outlined text-xs">circle</span>
                  {{ o.payment.payment_method.replace(/_/g, ' ') }} — {{ o.payment.payment_status }}
                </p>
                <p v-else class="text-caption font-caption text-on-surface-variant">No payment yet</p>
              </div>
              <span class="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pages > 1" class="flex items-center justify-center gap-sm pt-md">
          <button :disabled="page <= 1" @click="page--; load()" class="w-9 h-9 rounded-xl flex items-center justify-center border border-outline-variant/30 hover:bg-surface-container-high transition-colors" :class="{ 'opacity-30 cursor-not-allowed': page <= 1 }">
            <span class="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <span class="font-label-md text-label-md px-sm">{{ page }} / {{ pages }}</span>
          <button :disabled="page >= pages" @click="page++; load()" class="w-9 h-9 rounded-xl flex items-center justify-center border border-outline-variant/30 hover:bg-surface-container-high transition-colors" :class="{ 'opacity-30 cursor-not-allowed': page >= pages }">
            <span class="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="text-center py-xl">
        <span class="material-symbols-outlined text-6xl text-on-surface-variant">inbox</span>
        <h2 class="font-headline-md text-headline-md mt-md">No orders yet</h2>
        <p class="font-body-md text-body-md text-on-surface-variant">Your orders will appear here after your first purchase.</p>
        <router-link to="/products" class="inline-block bg-primary text-on-primary px-lg py-sm rounded-2xl font-label-md text-label-md hover-lift mt-md">Start Shopping</router-link>
      </div>

      <!-- Order Detail Modal -->
      <Teleport to="body">
        <div v-if="detail" class="fixed inset-0 z-50 bg-on-surface/60 flex items-center justify-center p-md" @click.self="detail = null">
          <div class="bg-surface-container-lowest rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl">
            <!-- Modal Header -->
            <div class="sticky top-0 bg-surface-container-lowest z-10 flex items-center justify-between p-md md:p-lg border-b border-outline-variant/20">
              <div>
                <h2 class="font-headline-md text-headline-md">Order #{{ detail.order_reference }}</h2>
                <p class="text-caption font-caption text-on-surface-variant">Placed on {{ new Date(detail.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
              </div>
              <button @click="detail = null" class="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-surface-container-high transition-colors">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="p-md md:p-lg space-y-md">
              <!-- Status Timeline -->
              <div class="flex items-center gap-sm flex-wrap">
                <span class="font-label-md text-label-md">Status:</span>
                <span class="px-sm py-0.5 rounded-full font-label-md text-label-md border" :class="statusBadge(detail.status)">{{ detail.status }}</span>
              </div>

              <!-- Delivery Info -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-md bg-surface-container-high p-md rounded-xl">
                <div>
                  <p class="text-caption font-caption text-on-surface-variant">Full Name</p>
                  <p class="font-body-md text-body-md">{{ detail.full_name }}</p>
                </div>
                <div>
                  <p class="text-caption font-caption text-on-surface-variant">Email</p>
                  <p class="font-body-md text-body-md">{{ detail.email }}</p>
                </div>
                <div>
                  <p class="text-caption font-caption text-on-surface-variant">Phone</p>
                  <p class="font-body-md text-body-md">{{ detail.phone }}</p>
                </div>
                <div>
                  <p class="text-caption font-caption text-on-surface-variant">Delivery Address</p>
                  <p class="font-body-md text-body-md">{{ detail.delivery_address }}</p>
                </div>
              </div>

              <!-- Payment Info -->
              <div v-if="detail.payment" class="bg-surface-container-high p-md rounded-xl space-y-sm">
                <h3 class="font-label-md text-label-md flex items-center gap-sm">
                  <span class="material-symbols-outlined text-primary text-sm">payments</span>
                  Payment Information
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-sm text-caption font-caption">
                  <div>
                    <span class="text-on-surface-variant">Method:</span>
                    <span class="font-medium capitalize">{{ detail.payment.payment_method?.replace(/_/g, ' ') }}</span>
                  </div>
                  <div>
                    <span class="text-on-surface-variant">Status:</span>
                    <span :class="detail.payment.payment_status === 'completed' ? 'text-green-600' : detail.payment.payment_status === 'failed' ? 'text-error' : 'text-tertiary'">
                      {{ detail.payment.payment_status }}
                    </span>
                  </div>
                  <div>
                    <span class="text-on-surface-variant">Reference:</span>
                    <code>{{ detail.payment.transaction_reference }}</code>
                  </div>
                </div>
              </div>

              <!-- Order Items -->
              <div>
                <h3 class="font-label-md text-label-md mb-sm">Items ({{ detail.items?.length || 0 }})</h3>
                <div class="space-y-sm">
                  <div v-for="item in detail.items" :key="item.item_id" class="flex items-center gap-sm p-sm rounded-xl bg-surface-container-high">
                    <img :src="item.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=48&h=48&fit=crop'" :alt="item.name" class="w-12 h-12 rounded-lg object-cover shrink-0" loading="lazy"/>
                    <div class="flex-1 min-w-0">
                      <p class="font-label-md text-label-md truncate">{{ item.name }}</p>
                      <p class="text-caption font-caption text-on-surface-variant">Qty: {{ item.quantity }} × {{ Number(item.unit_price).toLocaleString() }} RWF</p>
                    </div>
                    <p class="font-headline-md text-headline-md shrink-0">{{ Number(item.total_price).toLocaleString() }} RWF</p>
                  </div>
                </div>
              </div>

              <!-- Totals -->
              <div class="border-t border-outline-variant/20 pt-md space-y-sm">
                <div class="flex justify-between font-body-md text-body-md">
                  <span class="text-on-surface-variant">Subtotal</span>
                  <span>{{ Number(detail.subtotal).toLocaleString() }} RWF</span>
                </div>
                <div class="flex justify-between font-body-md text-body-md">
                  <span class="text-on-surface-variant">Delivery Fee</span>
                  <span>{{ Number(detail.delivery_fee) > 0 ? Number(detail.delivery_fee).toLocaleString() + ' RWF' : 'FREE' }}</span>
                </div>
                <div class="flex justify-between font-headline-md text-headline-md pt-sm border-t border-outline-variant/20">
                  <span>Total</span>
                  <span class="text-primary">{{ Number(detail.grand_total).toLocaleString() }} RWF</span>
                </div>
              </div>
            </div>

            <div class="sticky bottom-0 bg-surface-container-lowest border-t border-outline-variant/20 p-md flex justify-end gap-sm">
              <button @click="detail = null" class="border-2 border-primary text-primary px-md py-sm rounded-2xl font-label-md text-label-md">Close</button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
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

function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; load() }, 300)
}

function statusIcon(s) {
  return ({ pending: 'schedule', confirmed: 'check_circle', processing: 'sync', shipped: 'local_shipping', delivered: 'check_circle', cancelled: 'cancel' })[s] || 'help'
}
function statusIconBg(s) {
  return ({ pending: 'bg-tertiary/20', confirmed: 'bg-primary/20', processing: 'bg-primary/20', shipped: 'bg-primary/20', delivered: 'bg-green-100', cancelled: 'bg-error/20' })[s] || 'bg-surface-container-high'
}
function statusIconColor(s) {
  return ({ pending: 'text-tertiary', confirmed: 'text-primary', processing: 'text-primary', shipped: 'text-primary', delivered: 'text-green-600', cancelled: 'text-error' })[s] || ''
}
function statusBadge(s) {
  return ({ pending: 'border-tertiary text-tertiary', confirmed: 'border-primary text-primary', processing: 'border-primary text-primary', shipped: 'border-primary text-primary', delivered: 'border-green-600 text-green-600', cancelled: 'border-error text-error' })[s] || 'border-outline-variant text-on-surface-variant'
}

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
.hover-lift {
  transition: all 0.2s ease-in-out;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0px 8px 30px rgba(0, 0, 0, 0.08);
}
</style>
