<template>
  <div class="pt-20">
    <!-- Hero Section -->
    <section class="max-w-container-max mx-auto px-margin-mobile md:px-lg py-xl grid grid-cols-1 md:grid-cols-2 gap-lg items-center">
      <div class="space-y-md">
        <span class="bg-primary-container text-on-primary-container px-sm py-xs rounded-full font-label-md text-label-md uppercase tracking-wider">Performance Matters</span>
        <h1 class="font-display-lg text-display-lg text-[var(--text-light)]">Transform Your Fitness Journey with FitTrack Rwanda</h1>
        <p class="font-body-lg text-body-lg text-[var(--text-muted)]">Shop premium fitness products, track your progress, and achieve your goals with Rwanda's leading athletic platform.</p>
        <div class="flex flex-wrap gap-md pt-sm">
          <router-link to="/products" class="bg-primary text-white px-lg py-sm rounded-2xl font-headline-md text-headline-md hover-lift">Shop Now</router-link>
          <router-link to="/register" class="border-2 border-[var(--text-light)] text-[var(--text-light)] px-lg py-sm rounded-2xl font-headline-md text-headline-md hover-lift">Start Tracking</router-link>
        </div>
      </div>
      <div class="relative">
        <div class="absolute -z-10 inset-0 bg-primary-container rounded-2xl translate-x-4 translate-y-4"></div>
        <img alt="Athletes in Rwanda" class="w-full aspect-[4/3] object-cover rounded-2xl subtle-shadow border border-surface-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxDVh1qfjj4pV6hOp6GyzS80gj0-b5r3gAPx59M2QdrVhPaOrXIOZaAoWqKtlUKutG8kYwb4Vq8thZejsVcpJEpty6vN2X4BTDs_4PS8q3hoyo61SJUdSyNaxrAbFzf3q0nTLKSPDmOJQnh1fRQD-Mv9E00U96bhqLbLGmXnQ9kYo0sv9-mPuSw4L-Q6TdAkVcZCxm1Owebb0n73BzvTopcM_REVi2rWEZyNaJmzB07jB33cd_roFGKrqecv75hhVPtQ0D4dykeGrL"/>
      </div>
    </section>

    <!-- Featured Categories -->
    <section class="max-w-container-max mx-auto px-margin-mobile md:px-lg py-xl">
      <h2 class="font-headline-lg text-headline-lg text-center mb-lg">Browse Our Specialties</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        <div v-for="cat in categories" :key="cat.title" class="relative h-64 group overflow-hidden rounded-2xl cursor-pointer">
          <img :alt="cat.title" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" :src="cat.image"/>
          <div class="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent"></div>
          <div class="absolute bottom-md left-md">
            <h3 class="text-on-primary font-headline-md text-headline-md">{{ cat.title }}</h3>
          </div>
        </div>
      </div>
    </section>

    <!-- Best-Selling Products Grid -->
    <section class="bg-section-alt py-xl">
      <div class="max-w-container-max mx-auto px-margin-mobile md:px-lg">
        <div class="flex justify-between items-end mb-lg">
          <div>
            <h2 class="font-headline-lg text-headline-lg text-[var(--text-light)]">Best-Selling Gear</h2>
            <p class="text-[var(--text-muted)] font-body-md text-body-md">Top-rated items from our Rwanda community.</p>
          </div>
          <router-link class="text-primary font-label-md text-label-md flex items-center gap-xs" to="/products">View All Store <span class="material-symbols-outlined">arrow_forward</span></router-link>
        </div>
        <div v-if="loading" class="text-center py-5"><div class="spinner"></div></div>
        <div v-else-if="products.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-md">
          <div v-for="p in products" :key="p.product_id" class="bg-surface-container-lowest p-sm rounded-2xl hover-lift border border-outline-variant/20 cursor-pointer" @click="router.push('/products/' + p.product_id)">
            <img :alt="p.name" class="w-full aspect-square object-cover rounded-xl mb-sm" :src="p.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop'"/>
            <div class="space-y-xs">
              <h4 class="font-label-md text-label-md truncate">{{ p.name }}</h4>
              <div class="flex items-center gap-xs text-secondary">
                <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
                <span class="text-caption font-caption">{{ p.rating || 4.0 }} ({{ p.review_count || 0 }})</span>
              </div>
              <p class="font-headline-md text-headline-md text-primary">{{ Number(p.price).toLocaleString() }} RWF</p>
              <button class="w-full bg-primary text-white py-xs rounded-lg font-label-md text-label-md mt-sm hover:brightness-110 transition-all" @click.stop="addToCart(p)" :disabled="p.stock === 0">Add to Cart</button>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-5">
          <p class="text-[var(--text-muted)] font-body-md text-body-md">No products available yet. Check back soon!</p>
          <router-link to="/products" class="text-primary font-label-md text-label-md">Browse All</router-link>
        </div>
      </div>
    </section>

    <!-- Subscription Plans -->
    <section class="max-w-container-max mx-auto px-margin-mobile md:px-lg py-xl">
      <h2 class="font-headline-lg text-headline-lg text-center mb-lg text-[var(--text-light)]">Choose Your Path to Performance</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-lg max-w-4xl mx-auto">
        <div v-for="(plan, idx) in plans" :key="plan.name" class="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/30 subtle-shadow text-center space-y-md" :class="{ 'bg-on-surface text-surface border-2 border-primary-fixed scale-105 shadow-xl relative': idx === 1 }">
          <div v-if="idx === 1" class="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-sm py-1 rounded-full text-caption font-bold">RECOMMENDED</div>
          <h3 class="font-headline-md text-headline-md" :class="{ 'text-primary-fixed': idx === 1 }">{{ plan.name }}</h3>
          <p class="font-body-md text-body-md" :class="{ 'text-surface-variant': idx === 1, 'text-on-surface-variant': idx !== 1 }">{{ plan.desc }}</p>
          <div class="text-3xl font-bold">{{ plan.price }} <span class="text-caption font-caption font-normal">/{{ plan.period }}</span></div>
          <ul class="text-left space-y-sm font-label-md text-label-md pt-md">
            <li v-for="f in plan.features" :key="f.text" class="flex items-center gap-sm">
              <span v-if="f.included" class="material-symbols-outlined" :class="{ 'text-primary-fixed': idx === 1, 'text-primary': idx !== 1 }">check_circle</span>
              <span v-else class="material-symbols-outlined opacity-30">cancel</span>
              {{ f.text }}
            </li>
          </ul>
          <button class="w-full py-sm rounded-2xl font-label-md text-label-md" :class="idx === 1 ? 'bg-primary text-white hover-lift' : 'border-2 border-primary text-primary hover:bg-primary/5'">{{ plan.cta }}</button>
        </div>
      </div>
    </section>

    <!-- Fitness Tracking Features -->
    <section class="bg-surface-container py-xl">
      <div class="max-w-container-max mx-auto px-margin-mobile md:px-lg grid grid-cols-2 lg:grid-cols-5 gap-lg text-center">
        <div v-for="feat in trackFeatures" :key="feat.title" class="space-y-sm">
          <div class="w-16 h-16 bg-primary-container text-on-primary-container rounded-2xl flex items-center justify-center mx-auto mb-sm">
            <span class="material-symbols-outlined text-4xl">{{ feat.icon }}</span>
          </div>
          <h4 class="font-headline-md text-headline-md">{{ feat.title }}</h4>
          <p class="text-on-surface-variant text-caption font-caption">{{ feat.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Progress Dashboard Preview -->
    <section class="max-w-container-max mx-auto px-margin-mobile md:px-lg py-xl">
      <div class="bg-surface-container-lowest p-md md:p-xl rounded-2xl subtle-shadow border border-outline-variant/30 grid grid-cols-1 md:grid-cols-2 gap-lg items-center">
        <div class="space-y-md">
          <h2 class="font-headline-lg text-headline-lg">Your Progress, Visualized.</h2>
          <p class="font-body-lg text-body-lg text-on-surface-variant">Our intelligent dashboard gives you a real-time view of your fitness journey. Identify plateaus, celebrate wins, and adjust your plans on the fly.</p>
          <router-link to="/register" class="bg-primary text-white px-lg py-sm rounded-2xl font-label-md text-label-md hover-lift">Try Free Demo</router-link>
        </div>
        <div class="glass-card p-sm rounded-2xl border border-surface-variant shadow-inner relative overflow-hidden h-80">
          <div class="absolute inset-0 bg-gradient-to-br from-primary-container/20 to-transparent"></div>
          <div class="flex flex-col h-full gap-md">
            <div class="flex justify-between items-center">
              <span class="font-headline-md text-headline-md">Weekly Steps</span>
              <span class="bg-primary text-on-primary px-2 py-0.5 rounded text-caption font-bold">+12%</span>
            </div>
            <div class="flex-grow flex items-end justify-between gap-sm">
              <div v-for="bar in [40,60,85,50,70,90,65]" :key="bar" class="w-full rounded-t-lg" :class="bar === 85 ? 'bg-primary' : 'bg-primary-container/30'" :style="{ height: bar + '%' }"></div>
            </div>
            <div class="grid grid-cols-3 gap-sm">
              <div class="bg-surface-container-high p-sm rounded-xl text-center">
                <p class="text-caption font-caption opacity-60">Weight</p>
                <p class="font-bold">78.5kg</p>
              </div>
              <div class="bg-surface-container-high p-sm rounded-xl text-center">
                <p class="text-caption font-caption opacity-60">Avg HR</p>
                <p class="font-bold">62 bpm</p>
              </div>
              <div class="bg-surface-container-high p-sm rounded-xl text-center">
                <p class="text-caption font-caption opacity-60">Activity</p>
                <p class="font-bold">2.5 hrs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Customer Testimonials -->
    <section class="bg-surface py-xl">
      <div class="max-w-container-max mx-auto px-margin-mobile md:px-lg">
        <h2 class="font-headline-lg text-headline-lg text-center mb-lg">Trusted by the Community</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div v-for="t in testimonials" :key="t.name" class="bg-surface-container-lowest p-lg rounded-2xl subtle-shadow border border-outline-variant/10 space-y-sm italic text-on-surface-variant font-body-md text-body-md">
            "{{ t.review }}"
            <div class="flex items-center gap-sm pt-sm not-italic">
              <img :alt="t.name" class="w-12 h-12 rounded-full object-cover" :src="t.avatar"/>
              <div>
                <p class="font-label-md text-label-md text-on-surface">{{ t.name }}</p>
                <p class="text-caption font-caption">{{ t.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mobile Money Payment -->
    <section class="max-w-container-max mx-auto px-margin-mobile md:px-lg py-xl text-center border-t border-outline-variant/20">
      <h2 class="font-headline-md text-headline-md mb-md">Seamless Local Payments</h2>
      <div class="flex justify-center items-center gap-lg flex-wrap grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
        <div class="flex flex-col items-center gap-2">
          <div class="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center font-bold text-black shadow-sm">MTN</div>
          <span class="text-caption font-caption">MTN MoMo</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <div class="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center font-bold text-white shadow-sm">Airtel</div>
          <span class="text-caption font-caption">Airtel Money</span>
        </div>
      </div>
      <p class="mt-md text-on-surface-variant font-body-md text-body-md">Pay easily using Rwanda's trusted mobile payment methods.</p>
    </section>

    <!-- Final CTA -->
    <section class="relative h-96 flex items-center justify-center overflow-hidden">
      <img alt="Runners" class="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuARsP1zxj1XNDRgMbtw3zQ7VRFomtjQkcKkF9IpYG783wPFbfVh4TKNDiAxcktHSfMeE-PaFJU2dTQ2GGZoVUFeM-fzQsLcDHytl6AaKo2xPz9FgtrRwSj0IHUFRWvPDUnYYsQDPhdyOPGGDZhW31uC2YYMHVp2X_UK-qPtItvxte-t2oWl6Z1DGBIun60Cgh1-I45ZINN3A_TaX0vXu2CDbT-FYE9eqqHI2ikCONKhvOXsOKxQrQ9pdr2dvbzJjcLnQf19N4Dlrgwd"/>
      <div class="absolute inset-0 bg-on-surface/60 backdrop-blur-[2px]"></div>
      <div class="relative z-10 text-center space-y-md px-margin-mobile">
        <h2 class="font-display-lg text-display-lg text-surface text-shadow-lg">Ready to Achieve Your Fitness Goals?</h2>
        <p class="text-surface-variant font-body-lg text-body-lg max-w-2xl mx-auto">Join thousands of athletes in Rwanda who are tracking their journey to excellence with FitTrack.</p>
        <router-link to="/register" class="bg-primary text-white px-xl py-sm rounded-2xl font-headline-md text-headline-md hover-lift">Get Started Now</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'
import { cart } from '../stores/cart'

const router = useRouter()

const categories = [
  { title: 'Gym Equipment', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhRB1qzjQuyiyHLTR3ujQazFdIM-k0BlviEZ1v7VurqRVIKMrvM9jgo3dqB4wCuQL0--JK4IT07H5g8dqPVLi6DRGIj0btDvLkOgVW42c7oAql4WwTnxRXZf4h3LMYFXYh4GZ0To7pCW-woZqJGmwEu8f3u0dABXECFUdh5p0SSxo8pyD3eRgHTGJ1y1Ocx2R99xYvCJLAuxJbHR0R0bmyARepiS8aPwg7Yoo8MhlQeHElRRUtntGgtdg47QmxO451qNao_h_kDbB6' },
  { title: 'Supplements', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6ME52TAeKTZqA-jfmyE4yxR5aBW19CRWOaU--Gt5jb7VGKRACWA4rGbMOM2ZjgUuQn6CPkJvtOzqynxzFcTKMVfaL6C_6412gFHUpBioF_lPhGHxqBP71sZ562Kc2jC2KQlKturK_3JECGtKxnLLpwFNErI_6gbpkJs2-b8_6tqCB_9ys_ON5N19kvPydlHHToBZaRmMja7PHr-PIErxeK2vJTdIGl89qa63rCwi4V7otPUi6xXoYa0s5umA0jGy3yqnuX664Xxac' },
  { title: 'Sportswear', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAC6LZT9Kva6bakR1SkH6Hb0YNnmp37NKs4nBEbVMgJUAIuTcyZ76ziAT7Q9T6WJ8htZmLXFvrJZSsLOng0al0XmtAW1Sx4MH9R3vT_AYKP5s9XyS5nsfGHVaT_cypfAVQqLFqgmL8AEMoXJSs35kI1_beHHpyyubi1C9_mrbIARJ9w5MOPMptjPdemoL1GRbo94vWabg6Ithdi2cTecWdrySUKjquWnbe50YmSgGHSKtqB4H97FoeIAenLnivKC1rMaDvLC-qwgD0c' },
  { title: 'Fitness Accessories', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUJ27mjeWSpHuGQ2S4CWq4piHKkN3pQsn2TwGelDvQ0TrIx-vUO4kwJWG9TO1gWzL9fZsdROzeS2IzbBTdiYaqQLq6TZmTFXb8tmDVBLLLdRkKSeJKzSeJ_RSDvxFxphDE9jH6SjktgQbXkce6ssNRBmP-Xf9_icHAT8-bopjyLFKmeM_yXKo6oOp886hjnS71PTpKjMletJaiGgM1Lhjow6forDeUl44bqreUhcVmQdoRUXMZxYiIF0fxVpiRmaPLjf86XZlpLHsw' },
]

const trackFeatures = [
  { icon: 'scale', title: 'Weight Tracking', desc: 'Log your weight daily and monitor trends over time.' },
  { icon: 'history_edu', title: 'Workout Logs', desc: 'Keep track of sets, reps, and PRs in your training history.' },
  { icon: 'flag', title: 'Goal Monitoring', desc: 'Set specific targets and get reminders to stay focused.' },
  { icon: 'analytics', title: 'Progress Reports', desc: 'Weekly deep-dives into your performance metrics.' },
  { icon: 'local_fire_department', title: 'Calories Burned', desc: 'Estimate energy expenditure across all activities.' },
]

const plans = [
  {
    name: 'Basic', desc: 'Essential tracking for starters.', price: '5,000 RWF', period: 'mo',
    features: [
      { text: 'Weight Tracking', included: true },
      { text: 'Basic Workout Log', included: true },
      { text: 'Coaching Plans', included: false },
    ],
    cta: 'Select Basic',
  },
  {
    name: 'Premium', desc: 'Complete suite for athletes.', price: '12,000 RWF', period: 'mo',
    features: [
      { text: 'Detailed Goal Monitoring', included: true },
      { text: 'Progress Reports', included: true },
      { text: 'Personalized Coaching', included: true },
    ],
    cta: 'Go Premium',
  },
  {
    name: 'Annual', desc: 'Best value for committed goals.', price: '100,000 RWF', period: 'yr',
    features: [
      { text: 'Everything in Premium', included: true },
      { text: '20% Store Discount', included: true },
      { text: 'Exclusive Community Events', included: true },
    ],
    cta: 'Select Annual',
  },
]

const testimonials = [
  { name: 'Sarah Uwase', role: 'Marathon Runner', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTf2yyWmO8v33fWzpX7RFMsmhmzZO-3xVT2XSKB_70fKiG7Zl6YB5xpopAd-pGB5CiLjnMKubvRfwDqI0iBWcxICFeYZLlo24wM12ldKbsNJD9GmGjMZHfeLYnOmcm5uPyNxnfrvuiN5iZVBGJ4mtyjjjRFecHoK75hIVXnXeD2-cX9BxXsUGMfmPxfmMeIN4BcxI8Ka7c3qIOZAnWJrbDR4sfabIX4NsX1Ql4XQjUZnE6Issj9I_FUdUICXOhfeZGhyk-Ry24kmyl', review: 'FitTrack Rwanda changed the way I train. Getting quality supplements delivered in Kigali within hours is a game-changer!' },
  { name: 'David Mugisha', role: 'Bodybuilder', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDm_u-wcsBqzyBena1dgezFXVWmrN-kBxSpU8dMzwmHSnrWegj8NYTGxsHcC0sKqxBmpaQ59B-x1GyJ0qokD4y2u7JsPonMWkSj1kY5-Zuy6JrkZoj_2YUzcocAs08iIlWm_ucxls9pl4c1_FR2YpYTBT17bjxvHiHhHlSj-KeHj24J5S0iZBBZJ8qMhjyAtsFaw86qNVAVs8__sugPpZVivor25uHI91SJVMFVMDQtaeioGeWqYGmHoAfgMJew5eKU9Y0D9pun9-A_', review: 'The tracking dashboard helps me stay accountable. I\'ve lost 10kg in 3 months just by following the suggested plans.' },
  { name: 'Eric Gasana', role: 'CrossFit Enthusiast', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLmsF-8lxt7N3vM-68G27cqUyauTEiqQQoSKKnFZlTvgqrtKz0RtTZSAvgBXAVcpoJOxf4kOjo-cVpvtso7NWIyC5Tjfgtitou1hdbnyVRRFIjw1AXpJ80SEHMRGNPwwhGWdrDXg8gYPPbxQAbejuuS7FkANaON0xvM-5Y59FCI4XY0QhjI6KpYaIzVUFYXeZtxDJxhbsv4YEkKBT6eNVdyAYcErR0SOAteKLUp6tbkEnRaISK7EgOZsfqhaXwjZZp3pQ939-jLF84', review: 'Finally, a fitness platform that understands the local market and accepts MoMo. Highly recommend the annual plan!' },
]

const products = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api.get('/products/featured?limit=6')
    products.value = res.data?.products || []
  } catch {
    products.value = []
  } finally {
    loading.value = false
  }
})

async function addToCart(p) {
  if (!localStorage.getItem('token')) return router.push('/login')
  try {
    await api.post('/cart/items', { productId: p.product_id, quantity: 1 })
    cart.fetchCount()
  } catch { /* ignore */ }
}
</script>

<style>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  display: inline-block;
  vertical-align: middle;
}
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.subtle-shadow {
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.04);
}
.hover-lift {
  transition: all 0.2s ease-in-out;
}
.hover-lift:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0px 8px 30px rgba(0, 0, 0, 0.08);
}
.text-shadow-lg {
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}
</style>
