import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import MainLayout from '@/layouts/MainLayout.vue';
// ✨ Import Global Layout สำหรับหน้า Lobby
import GlobalLayout from '@/layouts/GlobalLayout.vue';

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
      path: '/auth/google/callback',
      name: 'google-callback',
      component: () => import('@/views/auth/GoogleCallback.vue'), 
      meta: { requiresAuth: false }
    },
    {
      path: '/auth/discord/callback',
      name: 'discord-callback',
      component: () => import('@/views/auth/DiscordCallback.vue'), 
      meta: { requiresAuth: false }
    },
    // ✨ แทนที่ /lobby ด้วย /lobby พร้อมใช้ GlobalLayout
    {
      path: '/lobby',
      component: GlobalLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'lobby',
          component: () => import('@/views/Lobby.vue'),
        }
      ]
    },
    // --- 📚 ระบบ Classroom (ใช้ MainLayout) ---
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
        // --- 💰 Finance Module ---
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
  const currentRole = authStore.currentRole; 
  const isAdmin = authStore.isAdmin;

  // 1. ตรวจสอบการล็อกอิน
  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/login';
  } 
  
  // ✨ ล็อกอินแล้วเข้าหน้า login ให้เด้งมาที่ Lobby แทน (เปลี่ยนจาก /lobby)
  if (to.path === '/login' && isAuthenticated) {
    return '/lobby';
  }

  // 2. ป้องกันการเข้าหน้าของ Classroom ถ้ายังไม่ได้เลือกห้อง
  // อนุญาตให้เข้า Global Routes ได้โดยไม่ต้องมีข้อมูลห้อง
  const isGlobalRoute = to.path.startsWith('/lobby') || to.path === '/login';
  
  // ✨ ถ้าล็อกอินแล้ว พยายามเข้าหน้าอื่น (เช่น /dashboard) แต่ไม่มีห้อง/role ให้เด้งกลับมา Lobby
  if (isAuthenticated && (!currentRoomId || !currentRole) && !isGlobalRoute) {
    return '/lobby';
  }

  // 3. ตรวจสอบสิทธิ์ Admin (RBAC) ภายใน Classroom
  if (to.meta.requiresAdmin && !isAdmin) {
    return '/dashboard'; // โดนเตะกลับแบบเงียบๆ ถ้าไม่ใช่แอดมิน
  }
});

export default router;