<template>
  <div>
    <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
    <div v-else>
      <div class="row g-3 mb-4">
        <div v-for="stat in stats" :key="stat.label" class="col-md-3 col-6">
          <div class="glass-card p-3 text-center h-100">
            <div class="text-muted small">{{ stat.label }}</div>
            <div class="fs-4 fw-bold text-accent">{{ stat.value }}</div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <div class="glass-card p-3">
            <h6 class="fw-bold mb-3">Monthly Sales</h6>
            <div style="height:250px;">
              <canvas ref="salesChart"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="glass-card p-3">
            <h6 class="fw-bold mb-3">Orders</h6>
            <div style="height:250px;">
              <canvas ref="ordersChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-md-6">
          <div class="glass-card p-3">
            <h6 class="fw-bold mb-3">Subscription Growth</h6>
            <div style="height:200px;">
              <canvas ref="subChart"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="glass-card p-3">
            <h6 class="fw-bold mb-3">Recent Orders</h6>
            <div v-if="data.recentOrders?.length">
              <div v-for="o in data.recentOrders" :key="o.order_id" class="d-flex justify-content-between align-items-center py-2 border-bottom" style="border-color:var(--glass-border)!important;">
                <div>
                  <small class="text-muted d-block">#{{ o.order_reference }}</small>
                  <span>{{ o.full_name }}</span>
                </div>
                <span :class="'badge bg-' + statusBadge(o.status)">{{ o.status }}</span>
              </div>
            </div>
            <div v-else class="text-muted text-center py-3">No recent orders</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import api from '../../services/api'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const loading = ref(true)
const data = ref({})
const salesChart = ref(null)
const ordersChart = ref(null)
const subChart = ref(null)

const stats = ref([])

function statusBadge(s) {
  return ({ pending: 'warning', confirmed: 'info', processing: 'primary', shipped: 'accent', delivered: 'success', cancelled: 'danger' })[s] || 'secondary'
}

onMounted(async () => {
  try {
    const res = await api.get('/admin/stats')
    data.value = res.data.stats
    const s = res.data.stats
    stats.value = [
      { label: 'Users', value: s.totalUsers },
      { label: 'Products', value: s.totalProducts },
      { label: 'Orders', value: s.totalOrders },
      { label: 'Revenue', value: Number(s.totalRevenue).toLocaleString() + ' RWF' },
      { label: 'Active Subs', value: s.activeSubscriptions },
      { label: 'Pending Orders', value: s.pendingOrders },
      { label: 'Low Stock', value: s.lowStockProducts },
      { label: 'Fitness Records', value: s.totalFitnessRecords },
    ]

    await nextTick()
    if (s.monthlySales?.length) {
      new Chart(salesChart.value, {
        type: 'line',
        data: { labels: s.monthlySales.map(m => m.month), datasets: [{ label: 'Revenue', data: s.monthlySales.map(m => m.total), borderColor: '#00B4D8', tension: 0.3, fill: false }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#ADB5BD' } }, y: { ticks: { color: '#ADB5BD' } } } }
      })
    }
    if (s.orderChart?.length) {
      new Chart(ordersChart.value, {
        type: 'bar',
        data: { labels: s.orderChart.map(m => m.month), datasets: [{ label: 'Orders', data: s.orderChart.map(m => m.total), backgroundColor: '#0066FF' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#ADB5BD' } }, y: { ticks: { color: '#ADB5BD' } } } }
      })
    }
    if (s.subscriptionChart?.length) {
      new Chart(subChart.value, {
        type: 'line',
        data: { labels: s.subscriptionChart.map(m => m.month), datasets: [{ label: 'Subscriptions', data: s.subscriptionChart.map(m => m.total), borderColor: '#00C853', tension: 0.3, fill: false }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#ADB5BD' } }, y: { ticks: { color: '#ADB5BD' } } } }
      })
    }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})
</script>
