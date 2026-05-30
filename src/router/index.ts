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
      path: '/tasks',
      name: 'task-list',
      component: () => import('@/views/tasks/TaskList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tasks/add',
      name: 'task-add',
      component: () => import('@/views/tasks/AddTask.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tasks/:id/edit',
      name: 'task-edit',
      component: () => import('@/views/tasks/EditTask.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/schedules',
      name: 'schedule-manager',
      component: () => import('@/views/schedules/ScheduleManager.vue'),
      meta: { requiresAuth: true }
    },
    // --- Finance Module ---
    {
      path: '/finance',
      name: 'finance-dashboard',
      component: () => import('@/views/finance/FinanceDashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/finance/settings',
      name: 'finance-settings',
      component: () => import('@/views/finance/FinanceSettings.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/finance/transactions',
      name: 'finance-transactions',
      component: () => import('@/views/finance/TransactionList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/finance/transactions/add',
      name: 'finance-transactions-add',
      component: () => import('@/views/finance/AddTransaction.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/finance/collections',
      name: 'finance-collections',
      component: () => import('@/views/finance/CollectionList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/finance/collections/:id',
      name: 'finance-collection-detail',
      component: () => import('@/views/finance/CollectionDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/finance/debtors',
      name: 'finance-debtors',
      component: () => import('@/views/finance/DebtorList.vue'),
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
