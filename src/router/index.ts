import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('@/views/auth/AuthCallback.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/students',
      name: 'student-list',
      component: () => import('@/views/students/StudentList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      redirect: '/dashboard'
    }
  ],
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // ถ้าหน้าที่จะไปต้องการ Auth แต่ยังไม่ได้ Login ให้ไปหน้า Login
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } 
  // ถ้าเข้าหน้า Login แต่ Login อยู่แล้ว ให้ไป Dashboard
  else if (to.path === '/login' && isAuthenticated) {
    next('/dashboard');
  } 
  else {
    next();
  }
});

export default router;
