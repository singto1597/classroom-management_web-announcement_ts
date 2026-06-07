import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import MainLayout from '@/layouts/MainLayout.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { requiresAuth: false }
    },
    // ใส่ 2 ก้อนนี้เข้าไปแทนที่ครับ
    {
      path: '/auth/google/callback',
      name: 'google-callback',
      // ชี้ไปที่ไฟล์ใหม่ที่เราสร้างไว้สำหรับ Google โดยเฉพาะ
      component: () => import('@/views/auth/GoogleCallback.vue'), 
      meta: { requiresAuth: false }
    },
    {
      path: '/auth/discord/callback',
      name: 'discord-callback',
      // ชี้ไปที่ไฟล์ใหม่ที่เราสร้างไว้สำหรับ Discord โดยเฉพาะ
      component: () => import('@/views/auth/DiscordCallback.vue'), 
      meta: { requiresAuth: false }
    },
    {
      // 🛑 ย้ายมาอยู่ตรงนี้! ให้อยู่ระดับนอกสุด จะได้ไม่โดน MainLayout คลุม
      path: '/select-room',
      name: 'select-room',
      component: () => import('@/views/auth/SelectRoom.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/Dashboard.vue'),
        },
        {
          path: 'students',
          name: 'student-list',
          component: () => import('@/views/students/StudentList.vue'),
        },
        {
          path: 'students/add',
          name: 'student-add',
          component: () => import('@/views/students/AddStudent.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'students/:no',
          name: 'student-profile',
          component: () => import('@/views/students/StudentProfile.vue'),
        },
        {
          path: 'students/:no/edit',
          name: 'student-edit',
          component: () => import('@/views/students/EditStudent.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'tasks',
          name: 'task-list',
          component: () => import('@/views/tasks/TaskList.vue'),
        },
        {
          path: 'tasks/add',
          name: 'task-add',
          component: () => import('@/views/tasks/AddTask.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'tasks/:id/edit',
          name: 'task-edit',
          component: () => import('@/views/tasks/EditTask.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'schedules',
          name: 'schedule-manager',
          component: () => import('@/views/schedules/ScheduleManager.vue'),
        },
        // --- Finance Module ---
        {
          path: 'finance',
          name: 'finance-dashboard',
          component: () => import('@/views/finance/FinanceDashboard.vue'),
        },
        {
          path: 'finance/settings',
          name: 'finance-settings',
          component: () => import('@/views/finance/FinanceSettings.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'finance/transactions',
          name: 'finance-transactions',
          component: () => import('@/views/finance/TransactionHistory.vue'),
        },
        {
          path: 'finance/transactions/add',
          name: 'finance-transactions-add',
          component: () => import('@/views/finance/AddTransaction.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'finance/collections',
          name: 'finance-collections',
          component: () => import('@/views/finance/CollectionList.vue'),
        },
        {
          path: 'finance/collections/:id',
          name: 'finance-collection-detail',
          component: () => import('@/views/finance/CollectionDetail.vue'),
        },
        {
          path: 'finance/debtors',
          name: 'finance-debtors',
          component: () => import('@/views/finance/DebtorList.vue'),
        }
      ]
    }
  ],
});

// Navigation Guard
router.beforeEach((to, from) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const currentRoomId = authStore.currentRoomId;
  const currentRole = authStore.currentRole; // ดึง Role มาเช็คด้วย
  const isAdmin = authStore.isAdmin;

  // 1. ตรวจสอบการล็อกอิน
  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/login';
  } 
  
  if (to.path === '/login' && isAuthenticated) {
    return '/select-room';
  }

  // 2. ถ้าล็อกอินแล้วแต่ยังไม่ได้เลือกห้อง (หรือข้อมูลห้องพัง/Role หาย) ให้บังคับไปหน้า Select Room เสมอ
  if (isAuthenticated && (!currentRoomId || !currentRole) && to.path !== '/select-room') {
    return '/select-room';
  }

  // 3. ตรวจสอบสิทธิ์ Admin (RBAC)
  if (to.meta.requiresAdmin && !isAdmin) {
    return '/dashboard'; // โดนเตะกลับแบบเงียบๆ ถ้าไม่ใช่แอดมิน
  }
});

export default router;