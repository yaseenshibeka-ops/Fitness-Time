<template>
  <div class="pt-20">
    <!-- Skeleton Loader -->
    <div v-if="loading" class="max-w-container-max mx-auto px-margin-mobile md:px-lg py-xl">
      <div class="animate-pulse space-y-md">
        <div class="h-4 bg-surface-container-high rounded w-64"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div class="aspect-[4/3] bg-surface-container-high rounded-2xl"></div>
          <div class="space-y-md">
            <div class="h-4 bg-surface-container-high rounded w-24"></div>
            <div class="h-8 bg-surface-container-high rounded w-3/4"></div>
            <div class="h-4 bg-surface-container-high rounded w-full"></div>
            <div class="h-4 bg-surface-container-high rounded w-2/3"></div>
            <div class="h-10 bg-surface-container-high rounded w-40"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-container-max mx-auto px-margin-mobile md:px-lg py-xl text-center">
      <span class="material-symbols-outlined text-6xl text-on-surface-variant mb-md">error_outline</span>
      <h2 class="font-headline-lg text-headline-lg mb-sm">Product Not Found</h2>
      <p class="text-on-surface-variant font-body-md text-body-md mb-lg">{{ error }}</p>
      <router-link to="/products" class="bg-primary text-on-primary px-lg py-sm rounded-2xl font-label-md text-label-md hover-lift">Back to Shop</router-link>
    </div>

    <!-- Product Detail -->
    <template v-else-if="product">
      <!-- 1. Breadcrumb -->
      <section class="max-w-container-max mx-auto px-margin-mobile md:px-lg pt-lg">
        <nav class="flex items-center gap-xs text-caption font-caption text-on-surface-variant flex-wrap">
          <router-link to="/" class="hover:text-primary transition-colors">Home</router-link>
          <span class="material-symbols-outlined text-sm">chevron_right</span>
          <router-link to="/products" class="hover:text-primary transition-colors">Shop</router-link>
          <span class="material-symbols-outlined text-sm">chevron_right</span>
          <span v-if="product.category_name" class="hover:text-primary transition-colors">{{ product.category_name }}</span>
          <span v-if="product.category_name" class="material-symbols-outlined text-sm">chevron_right</span>
          <span class="text-on-surface font-medium truncate max-w-[200px]">{{ product.name }}</span>
        </nav>
      </section>

      <!-- 2+3. Product Gallery + Info -->
      <section class="max-w-container-max mx-auto px-margin-mobile md:px-lg py-lg grid grid-cols-1 md:grid-cols-2 gap-lg">
        <!-- Gallery -->
        <div class="space-y-sm">
          <div class="relative rounded-2xl overflow-hidden bg-surface-container-high group cursor-crosshair" @mousemove="handleZoom" @mouseenter="zoomEnabled = true" @mouseleave="zoomEnabled = false" @click="openLightbox">
            <img :src="activeImage" :alt="product.name" class="w-full aspect-[4/3] object-cover transition-transform duration-300" loading="lazy" :style="zoomEnabled ? { transform: `scale(1.5)`, transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}"/>
            <button class="absolute top-sm right-sm bg-surface/80 backdrop-blur-sm w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface transition-colors" @click.stop="openLightbox">
              <span class="material-symbols-outlined text-on-surface-variant text-xl">fullscreen</span>
            </button>
          </div>
          <div class="flex gap-sm overflow-x-auto pb-xs">
            <button v-for="(img, i) in allImages" :key="i" class="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all" :class="activeImage === img ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'" @click="activeImage = img">
              <img :src="img" :alt="`${product.name} view ${i + 1}`" class="w-full h-full object-cover" loading="lazy"/>
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-md">
          <div class="flex items-center gap-sm flex-wrap">
            <span class="bg-primary-container/70 text-on-primary-container px-sm py-0.5 rounded-full text-caption font-caption font-medium">{{ product.category_name || 'General' }}</span>
            <span v-if="discountPercent" class="bg-error/10 text-error px-sm py-0.5 rounded-full text-caption font-caption font-bold">-{{ discountPercent }}% OFF</span>
          </div>

          <h1 class="font-headline-lg text-headline-lg text-on-surface">{{ product.name }}</h1>

          <!-- Rating -->
          <div class="flex items-center gap-sm">
            <div class="flex items-center">
              <span v-for="s in 5" :key="s" class="material-symbols-outlined text-sm" :class="s <= Math.round(averageRating) ? 'text-tertiary-container' : 'text-outline-variant'" style="font-variation-settings: 'FILL' 1;">star</span>
            </div>
            <span class="text-caption font-caption text-on-surface-variant">{{ averageRating.toFixed(1) }} ({{ reviews.length }} reviews)</span>
          </div>

          <!-- Price -->
          <div class="flex items-baseline gap-sm">
            <span v-if="discountPercent" class="text-3xl font-bold text-primary">{{ discountedPrice.toLocaleString() }} RWF</span>
            <span class="text-3xl font-bold" :class="discountPercent ? 'text-on-surface-variant' : 'text-primary'">{{ Number(product.price).toLocaleString() }} RWF</span>
            <span v-if="discountPercent" class="text-caption font-caption text-on-surface-variant line-through">{{ Number(product.price).toLocaleString() }} RWF</span>
          </div>

          <!-- Availability -->
          <div class="flex items-center gap-sm">
            <span class="w-2 h-2 rounded-full" :class="stockStatus.color"></span>
            <span class="font-label-md text-label-md" :class="stockStatus.textClass">{{ stockStatus.label }}</span>
            <span v-if="product.stock_quantity > 0 && product.stock_quantity <= 10" class="text-caption font-caption text-on-surface-variant">({{ product.stock_quantity }} left)</span>
          </div>

          <!-- Short Description -->
          <p class="font-body-md text-body-md text-on-surface-variant">{{ product.description }}</p>

          <!-- Quantity + Actions -->
          <div class="flex flex-wrap items-center gap-md pt-sm">
            <div class="flex items-center border border-outline-variant/50 rounded-xl overflow-hidden" v-if="product.stock_quantity > 0">
              <button class="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant" @click="qty = Math.max(1, qty - 1)" :disabled="qty <= 1">-</button>
              <input type="number" v-model.number="qty" min="1" :max="product.stock_quantity" class="w-14 h-10 text-center bg-transparent border-x border-outline-variant/50 font-label-md text-label-md outline-none" readonly/>
              <button class="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant" @click="qty = Math.min(product.stock_quantity, qty + 1)" :disabled="qty >= product.stock_quantity">+</button>
            </div>

            <button class="flex-1 min-w-[140px] bg-primary text-on-primary px-md py-sm rounded-2xl font-label-md text-label-md hover-lift flex items-center justify-center gap-sm" :disabled="product.stock_quantity < 1 || addingToCart" @click="addToCart">
              <span v-if="addingToCart" class="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
              <span v-else class="material-symbols-outlined">shopping_cart</span>
              {{ addingToCart ? 'Adding...' : 'Add to Cart' }}
            </button>

            <button class="bg-secondary-container text-on-secondary-container px-md py-sm rounded-2xl font-label-md text-label-md hover-lift flex items-center justify-center gap-sm" :disabled="product.stock_quantity < 1" @click="buyNow">Buy Now</button>

            <button class="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/50 hover:bg-primary-container/20 transition-colors" :class="{ 'text-error border-error/50': isWishlisted }" @click="toggleWishlist">
              <span class="material-symbols-outlined" :style="wishlistStyle">favorite</span>
            </button>
          </div>

          <!-- Cart Message -->
          <div v-if="cartMsg" class="flex items-center gap-sm px-md py-sm rounded-xl" :class="cartMsgType === 'success' ? 'bg-primary-container/20 text-primary' : 'bg-error-container/20 text-error'">
            <span class="material-symbols-outlined text-sm">{{ cartMsgType === 'success' ? 'check_circle' : 'error' }}</span>
            <span class="font-label-md text-label-md">{{ cartMsg }}</span>
          </div>
        </div>
      </section>

      <!-- 4. Full Description + 6. Specifications -->
      <section class="max-w-container-max mx-auto px-margin-mobile md:px-lg pb-xl grid grid-cols-1 md:grid-cols-2 gap-lg">
        <!-- Full Description -->
        <div class="space-y-md bg-surface-container-lowest p-md md:p-lg rounded-2xl border border-outline-variant/20">
          <h2 class="font-headline-md text-headline-md">Product Details</h2>
          <div class="space-y-sm">
            <p class="font-body-md text-body-md text-on-surface-variant">{{ product.description }}</p>
            <h3 class="font-label-md text-label-md text-primary mt-md">Key Features</h3>
            <ul class="space-y-sm">
              <li v-for="feat in features" :key="feat" class="flex items-start gap-sm font-body-md text-body-md text-on-surface-variant">
                <span class="material-symbols-outlined text-primary text-sm mt-0.5">check</span>
                {{ feat }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Specifications -->
        <div class="space-y-md bg-surface-container-lowest p-md md:p-lg rounded-2xl border border-outline-variant/20">
          <h2 class="font-headline-md text-headline-md">Specifications</h2>
          <div class="divide-y divide-outline-variant/20">
            <div v-for="spec in specifications" :key="spec.label" class="grid grid-cols-2 gap-md py-sm">
              <span class="font-label-md text-label-md text-on-surface-variant">{{ spec.label }}</span>
              <span class="font-body-md text-body-md text-on-surface">{{ spec.value }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. Delivery & Payment -->
      <section class="max-w-container-max mx-auto px-margin-mobile md:px-lg pb-xl">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <!-- Delivery -->
          <div class="bg-surface-container-lowest p-md md:p-lg rounded-2xl border border-outline-variant/20 space-y-md">
            <h2 class="font-headline-md text-headline-md flex items-center gap-sm">
              <span class="material-symbols-outlined text-primary">local_shipping</span>
              Delivery Information
            </h2>
            <div class="space-y-sm font-body-md text-body-md text-on-surface-variant">
              <div class="flex items-center gap-sm"><span class="material-symbols-outlined text-sm text-primary">schedule</span> Estimated delivery: 2–5 business days</div>
              <div class="flex items-center gap-sm"><span class="material-symbols-outlined text-sm text-primary">location_on</span> Available across all provinces of Rwanda</div>
              <div class="flex items-center gap-sm"><span class="material-symbols-outlined text-sm text-primary">payments</span> Free delivery on orders above 50,000 RWF</div>
              <div class="flex items-center gap-sm"><span class="material-symbols-outlined text-sm text-primary">info</span> Standard fee: 2,000 RWF</div>
            </div>
          </div>

          <!-- Payment -->
          <div class="bg-surface-container-lowest p-md md:p-lg rounded-2xl border border-outline-variant/20 space-y-md">
            <h2 class="font-headline-md text-headline-md flex items-center gap-sm">
              <span class="material-symbols-outlined text-primary">lock</span>
              Secure Payments
            </h2>
            <p class="font-body-md text-body-md text-on-surface-variant">Secure payments using Rwanda's trusted mobile payment solutions.</p>
            <div class="flex flex-wrap gap-md pt-sm">
              <div class="flex items-center gap-sm bg-surface-container-high px-md py-sm rounded-xl">
                <div class="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center font-bold text-black text-xs">MTN</div>
                <div><p class="font-label-md text-label-md">MTN MoMo</p><p class="text-caption font-caption text-on-surface-variant">Instant</p></div>
              </div>
              <div class="flex items-center gap-sm bg-surface-container-high px-md py-sm rounded-xl">
                <div class="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">AIRT</div>
                <div><p class="font-label-md text-label-md">Airtel Money</p><p class="text-caption font-caption text-on-surface-variant">Instant</p></div>
              </div>
              <div class="flex items-center gap-sm bg-surface-container-high px-md py-sm rounded-xl">
                <div class="w-8 h-8 bg-surface-variant rounded-lg flex items-center justify-center font-bold text-on-surface text-xs">COD</div>
                <div><p class="font-label-md text-label-md">Cash on Delivery</p><p class="text-caption font-caption text-on-surface-variant">Pay on arrival</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 11. Trust Indicators -->
      <section class="max-w-container-max mx-auto px-margin-mobile md:px-lg pb-xl">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-md">
          <div v-for="trust in trustIndicators" :key="trust.title" class="bg-surface-container-lowest p-md rounded-2xl border border-outline-variant/20 text-center space-y-sm hover-lift">
            <span class="material-symbols-outlined text-3xl text-primary">{{ trust.icon }}</span>
            <h4 class="font-label-md text-label-md">{{ trust.title }}</h4>
            <p class="text-caption font-caption text-on-surface-variant">{{ trust.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 8. Customer Reviews -->
      <section class="max-w-container-max mx-auto px-margin-mobile md:px-lg pb-xl">
        <div class="bg-surface-container-lowest p-md md:p-lg rounded-2xl border border-outline-variant/20">
          <div class="flex flex-col md:flex-row gap-lg items-start">
            <!-- Rating Summary -->
            <div class="w-full md:w-64 text-center space-y-sm shrink-0">
              <div class="text-5xl font-bold text-primary">{{ averageRating.toFixed(1) }}</div>
              <div class="flex justify-center items-center gap-0.5">
                <span v-for="s in 5" :key="s" class="material-symbols-outlined" :class="s <= Math.round(averageRating) ? 'text-tertiary-container' : 'text-outline-variant'" style="font-variation-settings: 'FILL' 1;">star</span>
              </div>
              <p class="text-caption font-caption text-on-surface-variant">{{ reviews.length }} reviews</p>
              <!-- Rating bars -->
              <div class="space-y-1 mt-sm">
                <div v-for="r in [5,4,3,2,1]" :key="r" class="flex items-center gap-sm">
                  <span class="text-caption font-caption text-on-surface-variant w-4">{{ r }}</span>
                  <div class="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div class="h-full bg-tertiary-container rounded-full transition-all" :style="{ width: ratingPercent(r) + '%' }"></div>
                  </div>
                </div>
              </div>
              <button v-if="auth.isLoggedIn" class="mt-sm text-primary font-label-md text-label-md flex items-center gap-xs justify-center w-full" @click="showReviewForm = !showReviewForm">
                <span class="material-symbols-outlined text-sm">rate_review</span>
                {{ showReviewForm ? 'Cancel' : 'Write a Review' }}
              </button>
            </div>

            <!-- Reviews list -->
            <div class="flex-1 min-w-0 w-full space-y-md">
              <!-- Sort -->
              <div class="flex items-center justify-between">
                <h2 class="font-headline-md text-headline-md">Customer Reviews</h2>
                <select v-model="sortBy" class="bg-surface-container-high border-none rounded-lg px-sm py-1 text-caption font-caption outline-none">
                  <option value="recent">Most Recent</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>

              <!-- Review Form -->
              <div v-if="showReviewForm" class="bg-surface-container-high p-md rounded-xl space-y-sm">
                <h3 class="font-label-md text-label-md">Write Your Review</h3>
                <div class="flex items-center gap-0.5">
                  <span v-for="s in 5" :key="s" class="material-symbols-outlined cursor-pointer text-lg transition-colors" :class="s <= newRating ? 'text-tertiary-container' : 'text-outline-variant'" style="font-variation-settings: 'FILL' 1;" @click="newRating = s">{{ s <= newRating ? 'star' : 'star' }}</span>
                </div>
                <textarea v-model="newReviewText" placeholder="Share your experience with this product..." class="w-full bg-surface-container border-none rounded-lg p-sm font-body-md text-body-md outline-none resize-none" rows="3"></textarea>
                <button class="bg-primary text-on-primary px-md py-sm rounded-xl font-label-md text-label-md hover-lift" :disabled="!newRating || !newReviewText.trim()" @click="submitReview">Submit Review</button>
              </div>

              <!-- Reviews -->
              <div v-if="sortedReviews.length" class="space-y-md">
                <div v-for="review in sortedReviews" :key="review.id" class="pb-md border-b border-outline-variant/20 last:border-0">
                  <div class="flex items-start justify-between">
                    <div class="flex items-center gap-sm">
                      <div class="w-9 h-9 rounded-full bg-primary-container/50 flex items-center justify-center font-bold text-primary text-sm">{{ review.name.charAt(0) }}</div>
                      <div>
                        <p class="font-label-md text-label-md">{{ review.name }}</p>
                        <div class="flex items-center gap-1">
                          <span v-for="s in 5" :key="s" class="material-symbols-outlined text-xs" :class="s <= review.rating ? 'text-tertiary-container' : 'text-outline-variant'" style="font-variation-settings: 'FILL' 1;">star</span>
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <span v-if="review.verified" class="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                        <span class="material-symbols-outlined text-xs">verified</span> Verified
                      </span>
                      <p class="text-caption font-caption text-on-surface-variant mt-0.5">{{ review.date }}</p>
                    </div>
                  </div>
                  <p class="font-body-md text-body-md text-on-surface-variant mt-sm">{{ review.text }}</p>
                </div>
              </div>
              <div v-else class="text-center py-md">
                <span class="material-symbols-outlined text-4xl text-on-surface-variant">reviews</span>
                <p class="font-body-md text-body-md text-on-surface-variant mt-sm">No reviews yet. Be the first to review!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 9. Related Products -->
      <section class="max-w-container-max mx-auto px-margin-mobile md:px-lg pb-xl" v-if="relatedProducts.length">
        <div class="flex items-center justify-between mb-md">
          <h2 class="font-headline-lg text-headline-lg">Related Products</h2>
          <router-link :to="'/products?category=' + product.category_id" class="text-primary font-label-md text-label-md flex items-center gap-xs">View All <span class="material-symbols-outlined">arrow_forward</span></router-link>
        </div>
        <div class="flex gap-md overflow-x-auto pb-sm scrollbar-hide snap-x snap-mandatory">
          <div v-for="rp in relatedProducts" :key="rp.product_id" class="min-w-[180px] md:min-w-[200px] snap-start bg-surface-container-lowest p-sm rounded-2xl border border-outline-variant/20 hover-lift space-y-xs">
            <router-link :to="'/products/' + rp.product_id">
              <img :src="rp.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop'" :alt="rp.name" class="w-full aspect-square object-cover rounded-xl mb-sm" loading="lazy"/>
            </router-link>
            <h4 class="font-label-md text-label-md truncate">{{ rp.name }}</h4>
            <div class="flex items-center gap-0.5">
              <span class="material-symbols-outlined text-xs text-tertiary-container" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="text-caption font-caption text-on-surface-variant">4.0</span>
            </div>
            <p class="font-headline-md text-headline-md text-primary">{{ Number(rp.price).toLocaleString() }} RWF</p>
            <button class="w-full bg-secondary-container text-on-secondary-container py-1 rounded-lg text-caption font-caption hover:bg-primary-container transition-colors" @click="quickAddToCart(rp)" :disabled="rp.stock_quantity < 1">Add to Cart</button>
          </div>
        </div>
      </section>

      <!-- 10. Recently Viewed -->
      <section class="max-w-container-max mx-auto px-margin-mobile md:px-lg pb-xl" v-if="recentlyViewed.length">
        <div class="flex items-center justify-between mb-md">
          <h2 class="font-headline-lg text-headline-lg">Recently Viewed</h2>
        </div>
        <div class="flex gap-md overflow-x-auto pb-sm scrollbar-hide snap-x snap-mandatory">
          <div v-for="rv in recentlyViewed" :key="rv.product_id" class="min-w-[140px] md:min-w-[160px] snap-start bg-surface-container-lowest p-sm rounded-2xl border border-outline-variant/20 hover-lift space-y-xs">
            <router-link :to="'/products/' + rv.product_id">
              <img :src="rv.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop'" :alt="rv.name" class="w-full aspect-square object-cover rounded-xl mb-sm" loading="lazy"/>
            </router-link>
            <h4 class="font-label-md text-label-md truncate">{{ rv.name }}</h4>
            <p class="font-headline-md text-headline-md text-primary">{{ Number(rv.price).toLocaleString() }} RWF</p>
          </div>
        </div>
      </section>
    </template>

    <!-- Image Lightbox Modal -->
    <Teleport to="body">
      <div v-if="lightboxOpen" class="fixed inset-0 z-50 bg-on-surface/90 flex items-center justify-center p-md" @click.self="closeLightbox">
        <button class="absolute top-md right-md w-10 h-10 flex items-center justify-center text-surface hover:text-surface-variant transition-colors" @click="closeLightbox">
          <span class="material-symbols-outlined text-3xl">close</span>
        </button>
        <button class="absolute left-md top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-surface hover:text-surface-variant transition-colors" @click="prevImage">
          <span class="material-symbols-outlined text-3xl">chevron_left</span>
        </button>
        <img :src="activeImage" :alt="product.name" class="max-w-full max-h-[85vh] object-contain rounded-2xl"/>
        <button class="absolute right-md top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-surface hover:text-surface-variant transition-colors" @click="nextImage">
          <span class="material-symbols-outlined text-3xl">chevron_right</span>
        </button>
      </div>
    </Teleport>

    <!-- Sticky Mobile Add-to-Cart -->
    <div class="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 p-sm md:hidden">
      <div class="flex items-center gap-sm max-w-container-max mx-auto">
        <div class="flex-1 min-w-0">
          <p class="font-headline-md text-headline-md text-primary">{{ Number(product?.price || 0).toLocaleString() }} RWF</p>
          <p class="text-caption font-caption text-on-surface-variant truncate">{{ product?.name }}</p>
        </div>
        <button class="bg-primary text-on-primary px-md py-sm rounded-2xl font-label-md text-label-md hover-lift flex items-center gap-sm whitespace-nowrap" :disabled="!product || product.stock_quantity < 1" @click="addToCart">
          <span class="material-symbols-outlined text-sm">shopping_cart</span>
          Add to Cart
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'
import { auth } from '../stores/auth'

const route = useRoute()
const router = useRouter()

// State
const product = ref(null)
const loading = ref(true)
const error = ref('')
const qty = ref(1)
const activeImage = ref('')
const allImages = ref([])
const zoomEnabled = ref(false)
const zoomPos = ref({ x: 50, y: 50 })
const lightboxOpen = ref(false)
const lightboxIdx = ref(0)
const addingToCart = ref(false)
const cartMsg = ref('')
const cartMsgType = ref('success')
const isWishlisted = ref(false)
const showReviewForm = ref(false)
const newRating = ref(0)
const newReviewText = ref('')
const sortBy = ref('recent')
const relatedProducts = ref([])
const recentlyViewed = ref([])

// Computed
const discountPercent = computed(() => {
  return product.value?.discount_percent || 0
})

const discountedPrice = computed(() => {
  if (!product.value) return 0
  return Math.round(product.value.price * (1 - discountPercent.value / 100))
})

const stockStatus = computed(() => {
  if (!product.value) return { label: '', color: '', textClass: '' }
  const q = product.value.stock_quantity
  if (q === 0) return { label: 'Out of Stock', color: 'bg-error', textClass: 'text-error' }
  if (q <= 10) return { label: 'Low Stock', color: 'bg-tertiary', textClass: 'text-tertiary' }
  return { label: 'In Stock', color: 'bg-green-500', textClass: 'text-green-600' }
})

const wishlistStyle = computed(() => ({
  fontVariationSettings: isWishlisted.value ? "'FILL' 1" : "'FILL' 0"
}))

const averageRating = computed(() => {
  if (!reviews.value.length) return 0
  return reviews.value.reduce((s, r) => s + r.rating, 0) / reviews.value.length
})

const sortedReviews = computed(() => {
  const r = [...reviews.value]
  if (sortBy.value === 'recent') r.sort((a, b) => new Date(b.date) - new Date(a.date))
  else if (sortBy.value === 'highest') r.sort((a, b) => b.rating - a.rating)
  else if (sortBy.value === 'lowest') r.sort((a, b) => a.rating - b.rating)
  return r
})

function ratingPercent(star) {
  const count = reviews.value.filter(r => r.rating === star).length
  return reviews.value.length ? (count / reviews.value.length) * 100 : 0
}

const reviews = ref([])

// Generate features based on product
const features = computed(() => {
  if (!product.value) return []
  const base = [
    'Premium quality materials for long-lasting durability',
    'Designed for professional and home use',
    'Ergonomic design for maximum comfort and safety',
    'Easy to clean and maintain',
  ]
  if (product.value.category_id === 2) base.push('Third-party lab tested for purity')
  if (product.value.category_id === 1) base.push('Supports up to 150 kg load capacity')
  if (product.value.stock_quantity > 50) base.push('High demand item — order now while stock lasts')
  return base
})

// Specifications
const specifications = computed(() => {
  if (!product.value) return []
  const specs = [
    { label: 'Brand', value: 'FitTrack Rwanda' },
    { label: 'Category', value: product.value.category_name || 'General' },
    { label: 'Weight', value: '2.5 kg' },
    { label: 'Dimensions', value: '35 × 25 × 15 cm' },
    { label: 'Material', value: 'Premium-grade materials' },
    { label: 'Warranty', value: '6 months' },
    { label: 'Origin', value: 'Imported — Quality assured' },
  ]
  if (product.value.category_name === 'Supplements') {
    specs[2] = { label: 'Net Weight', value: '500 g' }
    specs[3] = { label: 'Flavor', value: 'Unflavored / Natural' }
    specs[4] = { label: 'Servings', value: '30 servings' }
  }
  if (product.value.category_name === 'Sportswear') {
    specs[3] = { label: 'Size', value: 'S / M / L / XL' }
    specs[4] = { label: 'Material', value: 'Polyester / Spandex blend' }
    specs[5] = { label: 'Care', value: 'Machine washable' }
  }
  return specs
})

const trustIndicators = [
  { icon: 'lock', title: 'Secure Checkout', desc: '256-bit SSL encrypted transactions' },
  { icon: 'verified', title: 'Authentic Products', desc: '100% genuine and original items' },
  { icon: 'autorenew', title: 'Easy Returns', desc: '14-day hassle-free return policy' },
  { icon: 'headset_mic', title: '24/7 Support', desc: 'Dedicated customer service team' },
]

// Gallery helpers
function handleZoom(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  zoomPos.value = {
    x: ((e.clientX - rect.left) / rect.width) * 100,
    y: ((e.clientY - rect.top) / rect.height) * 100,
  }
}

function openLightbox() {
  lightboxIdx.value = allImages.value.indexOf(activeImage.value)
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  lightboxOpen.value = false
  document.body.style.overflow = ''
}

function nextImage() {
  lightboxIdx.value = (lightboxIdx.value + 1) % allImages.value.length
  activeImage.value = allImages.value[lightboxIdx.value]
}

function prevImage() {
  lightboxIdx.value = (lightboxIdx.value - 1 + allImages.value.length) % allImages.value.length
  activeImage.value = allImages.value[lightboxIdx.value]
}

// Keyboard nav for lightbox
function handleKeydown(e) {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'ArrowLeft') prevImage()
}

// Cart actions
async function addToCart() {
  if (!auth.isLoggedIn) return router.push('/login')
  if (!product.value || addingToCart.value) return
  addingToCart.value = true
  cartMsg.value = ''
  try {
    await api.post('/cart/items', { productId: product.value.product_id, quantity: qty.value })
    cartMsg.value = 'Added to cart successfully!'
    cartMsgType.value = 'success'
    updateCartBadge()
  } catch (e) {
    cartMsg.value = e?.message || 'Failed to add to cart'
    cartMsgType.value = 'error'
  } finally {
    addingToCart.value = false
    setTimeout(() => cartMsg.value = '', 3000)
  }
}

async function quickAddToCart(p) {
  if (!auth.isLoggedIn) return router.push('/login')
  try {
    await api.post('/cart/items', { productId: p.product_id, quantity: 1 })
    updateCartBadge()
  } catch { /* ignore */ }
}

function buyNow() {
  if (!auth.isLoggedIn) return router.push('/login')
  addToCart().then(() => {
    router.push('/checkout')
  })
}

// Wishlist
async function toggleWishlist() {
  if (!auth.isLoggedIn) return router.push('/login')
  try {
    if (isWishlisted.value) {
      await api.delete(`/user/wishlist/${product.value.product_id}`)
      isWishlisted.value = false
    } else {
      await api.post('/user/wishlist', { productId: product.value.product_id })
      isWishlisted.value = true
    }
  } catch { /* ignore */ }
}

// Reviews
async function submitReview() {
  if (!newRating.value || !newReviewText.value.trim()) return
  try {
    await api.post(`/products/${route.params.id}/reviews`, { rating: newRating.value, reviewText: newReviewText.value.trim() })
    // Refresh reviews
    const revRes = await api.get(`/products/${route.params.id}/reviews`, { params: { sort: sortBy.value } })
    reviews.value = (revRes.data.reviews || []).map(r => ({
      id: r.review_id,
      name: r.name,
      rating: r.rating,
      text: r.review_text,
      date: r.created_at?.split('T')[0],
      verified: r.is_verified_purchase,
    }))
    newRating.value = 0
    newReviewText.value = ''
    showReviewForm.value = false
  } catch (e) {
    cartMsg.value = e?.message || 'Failed to submit review'
    cartMsgType.value = 'error'
    setTimeout(() => cartMsg.value = '', 3000)
  }
}

// Cart badge update
function updateCartBadge() {
  const el = document.querySelector('.cart-badge')
  if (el) {
    const cur = parseInt(el.textContent) || 0
    el.textContent = cur + qty.value
  }
}

// Recently viewed
function saveToRecentlyViewed() {
  if (!product.value) return
  const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
  const filtered = stored.filter(r => r.product_id !== product.value.product_id)
  filtered.unshift({
    product_id: product.value.product_id,
    name: product.value.name,
    price: product.value.price,
    image_url: product.value.image_url,
  })
  localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 8)))
}

function loadRecentlyViewed() {
  recentlyViewed.value = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
    .filter(r => r.product_id !== Number(route.params.id))
}

// Image generation
function generateImages(url) {
  if (!url) {
    return ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=450&fit=crop']
  }
  const base = url.split('?')[0]
  return [
    url,
    `${base}?w=600&h=450&fit=crop&sat=-20`,
    `${base}?w=600&h=450&fit=crop&bright=-10`,
    `${base}?w=600&h=450&fit=crop&contrast=10`,
  ]
}

// Touch swipe for gallery
let touchStartX = 0
let touchEndX = 0

function handleTouchStart(e) {
  touchStartX = e.changedTouches[0].screenX
}
function handleTouchEnd(e) {
  touchEndX = e.changedTouches[0].screenX
  handleSwipe()
}
function handleSwipe() {
  const diff = touchStartX - touchEndX
  if (Math.abs(diff) > 50) {
    if (diff > 0) nextImage()
    else prevImage()
  }
}

// Load product
async function loadProduct() {
  loading.value = true
  error.value = ''
  try {
    const [prodRes, revRes] = await Promise.all([
      api.get(`/products/${route.params.id}`),
      api.get(`/products/${route.params.id}/reviews`, { params: { sort: sortBy.value } }),
    ])
    product.value = prodRes.data.product
    reviews.value = (revRes.data.reviews || []).map(r => ({
      id: r.review_id,
      name: r.name,
      rating: r.rating,
      text: r.review_text,
      date: r.created_at?.split('T')[0],
      verified: r.is_verified_purchase,
    }))
    allImages.value = generateImages(product.value.image_url)
    activeImage.value = allImages.value[0]
    qty.value = 1
    cartMsg.value = ''
    saveToRecentlyViewed()
    loadRecentlyViewed()
    // Load related
    if (product.value.category_id) {
      const relRes = await api.get('/products', { params: { category_id: product.value.category_id, limit: 6 } })
      relatedProducts.value = (relRes.data.products || []).filter(p => p.product_id !== product.value.product_id).slice(0, 5)
    }
  } catch (e) {
    error.value = e?.message || 'Failed to load product'
  } finally {
    loading.value = false
  }
}

// Load reviews on sort change
watch(sortBy, () => {
  if (product.value) {
    api.get(`/products/${route.params.id}/reviews`, { params: { sort: sortBy.value } }).then(res => {
      reviews.value = (res.data.reviews || []).map(r => ({
        id: r.review_id,
        name: r.name,
        rating: r.rating,
        text: r.review_text,
        date: r.created_at?.split('T')[0],
        verified: r.is_verified_purchase,
      }))
    }).catch(() => {})
  }
})

// Watch route changes
watch(() => route.params.id, () => {
  loadProduct()
})

onMounted(() => {
  loadProduct()
  document.addEventListener('keydown', handleKeydown)
})

// Cleanup
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hover-lift {
  transition: all 0.2s ease-in-out;
}
.hover-lift:hover:not(:disabled) {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0px 8px 30px rgba(0, 0, 0, 0.08);
}
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
