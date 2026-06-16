import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../stores/auth'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/Register.vue') },
  { path: '/products', name: 'Products', component: () => import('../views/Products.vue') },
  { path: '/products/:id', name: 'ProductDetail', component: () => import('../views/ProductDetail.vue') },
  { path: '/cart', name: 'Cart', component: () => import('../views/Cart.vue') },
  { path: '/checkout', name: 'Checkout', component: () => import('../views/Checkout.vue'), meta: { requiresAuth: true } },
  { path: '/checkout/subscription/:planType', name: 'SubscriptionCheckout', component: () => import('../pages/SubscriptionCheckout.vue'), meta: { requiresAuth: true } },
  { path: '/subscriptions', name: 'Subscriptions', component: () => import('../views/Subscriptions.vue') },
  { path: '/about', name: 'About', component: () => import('../views/About.vue') },
  { path: '/contact', name: 'Contact', component: () => import('../views/Contact.vue') },
  { path: '/chat', name: 'Chat', component: () => import('../views/ChatPage.vue'), meta: { requiresAuth: true } },

  // Old standalone user pages (redirect /orders, /fitness, /profile to dashboard)
  { path: '/orders', redirect: '/dashboard/orders' },
  { path: '/fitness', redirect: '/dashboard/fitness' },
  { path: '/profile', redirect: '/dashboard/profile' },

  // User Dashboard (protected)
  {
    path: '/dashboard',
    component: () => import('../layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('../pages/Dashboard.vue') },
      { path: 'profile', name: 'DashProfile', component: () => import('../pages/Profile.vue') },
      { path: 'fitness', name: 'DashFitness', component: () => import('../pages/FitnessProgress.vue') },
      { path: 'workouts', name: 'DashWorkouts', component: () => import('../pages/WorkoutHistory.vue') },
      { path: 'goals', name: 'DashGoals', component: () => import('../pages/Goals.vue') },
      { path: 'subscription', name: 'DashSubscription', component: () => import('../pages/Subscription.vue') },
      { path: 'orders', name: 'DashOrders', component: () => import('../pages/Orders.vue') },
      { path: 'wishlist', name: 'DashWishlist', component: () => import('../pages/Wishlist.vue') },
      { path: 'payments', name: 'DashPayments', component: () => import('../pages/Payments.vue') },
      { path: 'notifications', name: 'DashNotifications', component: () => import('../pages/Notifications.vue') },
      { path: 'reports', name: 'DashReports', component: () => import('../pages/Reports.vue') },
      { path: 'settings', name: 'DashSettings', component: () => import('../pages/Settings.vue') },
    ],
  },

  // Admin Dashboard (protected + admin)
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', name: 'AdminDashboard', component: () => import('../views/admin/Dashboard.vue') },
      { path: 'products', name: 'AdminProducts', component: () => import('../views/admin/Products.vue') },
      { path: 'orders', name: 'AdminOrders', component: () => import('../views/admin/Orders.vue') },
      { path: 'orders/:id', name: 'AdminOrderDetail', component: () => import('../views/admin/OrderDetail.vue') },
      { path: 'users', name: 'AdminUsers', component: () => import('../views/admin/Users.vue') },
      { path: 'categories', name: 'AdminCategories', component: () => import('../views/admin/Categories.vue') },
      { path: 'payments', name: 'AdminPayments', component: () => import('../views/admin/Payments.vue') },
      { path: 'subscriptions', name: 'AdminSubscriptions', component: () => import('../views/admin/Subscriptions.vue') },
      { path: 'fitness', name: 'AdminFitness', component: () => import('../views/admin/FitnessManagement.vue') },
      { path: 'ai-assistant', name: 'AdminAiAssistant', component: () => import('../views/admin/AiAssistant.vue') },
      { path: 'reports', name: 'AdminReports', component: () => import('../views/admin/Reports.vue') },
      { path: 'notifications', name: 'AdminNotifications', component: () => import('../views/admin/Notifications.vue') },
      { path: 'settings', name: 'AdminSettings', component: () => import('../views/admin/Settings.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !auth.isLoggedIn) return next('/login')
  if (to.meta.requiresAdmin && !auth.isAdmin) return next('/')
  next()
})

export default router
