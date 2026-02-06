import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => import('../views/EditorView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/editor/:id',
      name: 'editor-edit',
      component: () => import('../views/EditorView.vue'),
      props: true,
      meta: { requiresAuth: true },
    },
  ],
})

// 路由守卫 - 检查登录状态
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 初始化用户状态
  authStore.initUser()
  
  // 需要登录但未登录
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // 已登录但访问登录页
  if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
    return
  }
  
  next()
})

export default router
