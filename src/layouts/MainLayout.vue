import { ref, computed } from 'vue'; // อย่าลืม import computed
import { RouterView, useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Swal from 'sweetalert2';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isSidebarOpen = ref(false);

const menuItems = [
  { name: 'หน้าหลัก (เลือกห้อง)', path: '/dashboard', icon: 'bi-grid-fill' },
  { name: 'นักเรียน', path: '/students', icon: 'bi-people-fill' },
  { name: 'งานและโน้ต', path: '/tasks', icon: 'bi-clipboard-check-fill' },
  { name: 'ตารางเรียน', path: '/schedules', icon: 'bi-calendar-event-fill' },
  { name: 'การเงิน', path: '/finance', icon: 'bi-wallet2' },
];

// 🪄 เพิ่มฟังก์ชันเปลี่ยนห้อง (เหมือนใน Dashboard)
const handleChangeRoom = () => {
  authStore.clearRoom(); 
  router.push('/select-room'); // หรือ path ที่คุณใช้เลือกห้อง
};

// 🪄 สร้าง Computed เพื่อหาชื่อเมนูย่อยปัจจุบัน
const currentSubMenuName = computed(() => {
  // ถ้าอยู่หน้า dashboard ไม่ต้องแสดงอะไรต่อท้าย
  if (route.path === '/dashboard' || route.path === '/') return null;
  
  // หาเมนูที่ตรงกับ path ปัจจุบันมากที่สุด (ใช้ startsWith เผื่อมีซับรูทย่อยๆ)
  const matchedMenu = menuItems.find(item => 
    item.path !== '/dashboard' && route.path.startsWith(item.path)
  );
  
  return matchedMenu ? matchedMenu.name : null;
});

const showAccountInfo = () => {
  Swal.fire({
    title: 'ข้อมูลบัญชีระบบ',
    html: `
      <div class="text-left mt-4 space-y-3">
        <p class="text-sm text-gray-600"><b>Discord ID:</b> <span class="bg-gray-100 px-2 py-1 rounded font-mono">${authStore.discordId}</span></p>
        <p class="text-sm text-gray-600"><b>Room Role:</b> <span class="uppercase font-bold text-blue-600">${authStore.currentRole}</span></p>
      </div>
    `,
    icon: 'info',
    confirmButtonText: 'ปิด',
    confirmButtonColor: '#3b82f6',
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-gray-100',
      confirmButton: 'rounded-xl px-6'
    }
  });
};

const logout = () => {
  authStore.logout();
};
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden font-sans">
    <aside class="hidden md:flex md:flex-shrink-0">
      <div class="flex flex-col w-64 bg-white border-r border-gray-100 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] z-20">
        <RouterLink 
          to="/dashboard" 
          active-class="_no_effects_"
          exact-active-class="_no_effects_"
          class="flex items-center h-16 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 cursor-pointer"
        >
          <i class="bi bi-box-fill text-white text-xl me-3 opacity-90"></i>
          <span class="text-white text-lg font-black tracking-widest">SYNC<span class="font-light opacity-80">ROOM</span></span>
        </RouterLink>

        <div class="flex-1 flex flex-col overflow-y-auto">
          <nav class="flex-1 px-4 py-6 space-y-1.5">
            <RouterLink 
              v-for="item in menuItems" 
              :key="item.path"
              :to="item.path"
              class="flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-200 group"
              :class="route.path.startsWith(item.path) ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100/50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'"
            >
              <i :class="['bi', item.icon, 'text-lg me-4 transition-transform duration-200', route.path.startsWith(item.path) ? 'scale-110' : 'group-hover:scale-110']"></i>
              {{ item.name }}
            </RouterLink>
          </nav>

          <div class="p-4 border-t border-gray-50 bg-white">
            <div class="flex items-center p-3 bg-white rounded-2xl mb-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-inner border border-blue-100">
                {{ authStore.currentUserName?.charAt(0).toUpperCase() || 'U' }}
              </div>
              <div class="ms-3 overflow-hidden">
                <p class="text-sm font-bold text-gray-800 truncate">{{ authStore.currentUserName || 'ผู้ใช้งาน' }}</p>
                <p class="text-[10px] tracking-wider text-blue-500 font-bold uppercase truncate">{{ authStore.currentRole || 'User' }}</p>
              </div>
            </div>
            <button 
              @click="logout"
              class="w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
            >
              <i class="bi bi-power me-2"></i>
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </aside>

    <Transition name="fade">
      <div 
        v-if="isSidebarOpen" 
        class="fixed inset-0 z-40 md:hidden bg-gray-900/40 backdrop-blur-sm transition-opacity"
        @click="isSidebarOpen = false"
      ></div>
    </Transition>

    <div 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) md:hidden shadow-2xl"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 to-blue-700">
        <RouterLink 
          to="/dashboard" 
          active-class="_no_effects_"
          exact-active-class="_no_effects_"
          @click="isSidebarOpen = false" 
          class="flex items-center h-16 hover:opacity-80 transition cursor-pointer"
        >
          <span class="text-white text-lg font-black tracking-widest">SYNC<span class="font-light opacity-80">ROOM</span></span>
        </RouterLink>
        <button @click="isSidebarOpen = false" class="text-white/80 hover:text-white p-1 rounded-lg transition-colors">
          <i class="bi bi-x-lg text-xl"></i>
        </button>
      </div>
      <nav class="px-4 py-6 space-y-1.5 overflow-y-auto h-[calc(100vh-4rem)]">
        <RouterLink 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          @click="isSidebarOpen = false"
          class="flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all"
          :class="route.path.startsWith(item.path) ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100/50' : 'text-gray-500 hover:bg-gray-50'"
        >
          <i :class="['bi', item.icon, 'text-lg me-4']"></i>
          {{ item.name }}
        </RouterLink>
      </nav>
    </div>

    <div class="flex flex-col flex-1 overflow-hidden relative">
      <header class="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10 sticky top-0 supports-[backdrop-filter]:bg-white/60">
        <div class="h-16 flex items-center justify-between px-4 md:px-8">
          <div class="flex items-center">
            <button 
              @click="isSidebarOpen = true" 
              class="md:hidden p-2 me-3 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              <i class="bi bi-list text-2xl"></i>
            </button>
            <div class="flex items-center">
              <h2 class="text-lg font-black text-gray-800 tracking-tight flex items-center flex-wrap gap-1.5">
                
                <template v-if="authStore.currentRoomId">
                  
                  <button 
                    @click="handleChangeRoom" 
                    class="hidden sm:flex items-center text-gray-400 hover:text-blue-600 transition-colors cursor-pointer group"
                  >
                    <span class="group-hover:-translate-x-1 transition-transform inline-block me-1">‹</span> ROOM
                  </button>
                  <span class="hidden sm:inline text-gray-300">/</span>
                  
                  <router-link 
                    to="/dashboard" 
                    class="hover:text-blue-600 transition-colors cursor-pointer"
                    title="กลับหน้าหลักห้องเรียน"
                  >
                    {{ authStore.currentRoomName || authStore.currentRoomId }}
                  </router-link>
                  
                </template>

                <template v-else>
                  <span>Dashboard</span>
                </template>

                <template v-if="currentSubMenuName && authStore.currentRoomId">
                  <span class="text-gray-300">/</span>
                  <span class="text-blue-600 font-bold opacity-90">{{ currentSubMenuName }}</span>
                </template>
              </h2>
            </div>
          </div>

          <button 
            @click="showAccountInfo"
            class="flex items-center p-1.5 pe-4 bg-white hover:bg-gray-50 border border-gray-100 rounded-full transition-all duration-300 shadow-sm hover:shadow group cursor-pointer"
          >
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-inner group-hover:scale-105 transition-transform duration-300">
              {{ authStore.currentUserName?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <div class="ms-3 hidden sm:block text-left">
              <p class="text-sm font-bold text-gray-800 leading-none">{{ authStore.currentUserName || 'ผู้ใช้งาน' }}</p>
              <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                Online
              </p>
            </div>
          </button>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto bg-[#f8fafc] focus:outline-none scroll-smooth">
        <div class="py-8">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <RouterView v-slot="{ Component, route }">
              <transition name="fade-slide" mode="out-in">
                <div :key="route.path">
                  <component :is="Component" />
                </div>
              </transition>
            </RouterView>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* 🪄 แอนิเมชันสำหรับ Router View (เปลี่ยนหน้า) */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.99);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.99);
}

/* 🪄 แอนิเมชันสำหรับ Overlay พื้นหลังดำของมือถือ */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* แต่ง Scrollbar ให้ดูมินิมอล */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>