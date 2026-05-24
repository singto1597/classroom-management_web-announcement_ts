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
      path: '/students/add',
      name: 'student-add',
      component: () => import('@/views/students/AddStudent.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/students/:no',
      name: 'student-profile',
      component: () => import('@/views/students/StudentProfile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/students/:no/edit',
      name: 'student-edit',
      component: () => import('@/views/students/EditStudent.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      redirect: '/dashboard'
    }
  ],
});

// Navigation Guard
router.beforeEach((to, from) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/login';
  } 
  else if (to.path === '/login' && isAuthenticated) {
    return '/dashboard';
  }
  // ถ้าผ่านหมด ไม่ต้อง return อะไรเลย มันจะไปหน้าเดิมต่อเอง
});

export default router;
