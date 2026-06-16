<template>
  <div class="recommendations-section">
    <div v-if="title" class="d-flex align-items-center justify-content-between mb-3">
      <h5 class="fw-bold mb-0">{{ title }}</h5>
      <button v-if="onRefresh" class="btn btn-sm btn-outline-secondary" @click="onRefresh" :disabled="loading">
        <i class="bi bi-arrow-clockwise" :class="{ 'spin': loading }"></i> Refresh
      </button>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner"></div>
    </div>

    <div v-else-if="items.length === 0" class="text-center py-4 text-muted">
      <i class="bi bi-info-circle" style="font-size:2rem;"></i>
      <p class="mt-2">No recommendations available yet. Start chatting with FitBot!</p>
    </div>

    <div v-else class="row g-3">
      <div v-for="(item, i) in items" :key="i" class="col-md-6" :class="{ 'col-lg-4': items.length > 2 }">
        <div class="rec-card glass-card p-3 h-100">
          <div class="d-flex align-items-start gap-3">
            <div class="rec-icon" :class="item.type">
              <i :class="iconFor(item.type)"></i>
            </div>
            <div class="flex-grow-1 min-w-0">
              <h6 class="fw-bold mb-1">{{ item.title }}</h6>
              <p class="small text-muted mb-2">{{ item.description }}</p>

              <div v-if="item.action === 'upgrade'" class="mt-2">
                <router-link to="/subscriptions" class="btn btn-sm btn-primary">
                  <i class="bi bi-star me-1"></i> Upgrade Now
                </router-link>
              </div>

              <div v-if="item.action === 'generate'" class="mt-2">
                <button class="btn btn-sm btn-outline-primary" @click="onGenerateWorkout">
                  <i class="bi bi-magic me-1"></i> Generate Plan
                </button>
              </div>

              <div v-if="item.products && item.products.length" class="product-list mt-2">
                <div v-for="p in item.products" :key="p.product_id" class="product-item d-flex align-items-center gap-2 py-1">
                  <img v-if="p.image_url" :src="p.image_url" :alt="p.name" class="product-thumb" />
                  <div class="flex-grow-1 min-w-0">
                    <div class="small fw-medium text-truncate">{{ p.name }}</div>
                    <small class="text-muted">{{ Number(p.price).toLocaleString() }} RWF</small>
                  </div>
                  <router-link :to="`/products/${p.product_id}`" class="btn btn-sm btn-outline-primary px-2">
                    <i class="bi bi-eye"></i>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  onRefresh: { type: Function, default: null },
  onGenerateWorkout: { type: Function, default: () => {} }
})

function iconFor(type) {
  const icons = {
    workout: 'bi bi-activity',
    nutrition: 'bi bi-cup-hot',
    product: 'bi bi-box-seam',
    progress: 'bi bi-graph-up-arrow',
    upgrade: 'bi bi-star',
    general: 'bi bi-lightbulb'
  }
  return icons[type] || 'bi bi-lightbulb'
}
</script>

<style scoped>
.rec-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.1rem;
}

.rec-icon.workout { background: rgba(99, 102, 241, 0.15); color: var(--primary); }
.rec-icon.nutrition { background: rgba(16, 185, 129, 0.15); color: var(--success); }
.rec-icon.product { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
.rec-icon.progress { background: rgba(6, 182, 212, 0.15); color: var(--accent); }
.rec-icon.upgrade { background: rgba(139, 92, 246, 0.15); color: var(--accent-purple); }

.product-thumb {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
}

.product-list {
  max-height: 160px;
  overflow-y: auto;
}

.product-item {
  border-bottom: 1px solid var(--glass-border);
}

.product-item:last-child {
  border-bottom: none;
}

.spin {
  animation: spin 1s linear infinite;
}
</style>
