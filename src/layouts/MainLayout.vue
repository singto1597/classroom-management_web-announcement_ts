<script setup lang="ts">
import { ref } from 'vue';
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
    confirmButtonColor: '#3b82f6'
  });
};

const logout = () => {
  authStore.logout();
};
</script>

<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <aside class="hidden md:flex md:flex-shrink-0">
      <div class="flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm">
        <RouterLink 
          to="/dashboard" 
          active-class="_no_effects_"
          exact-active-class="_no_effects_"
          class="flex items-center h-16 px-6 bg-blue-600 hover:bg-blue-700 transition cursor-pointer"
        >
          <span class="text-white text-xl font-bold tracking-wider">CLASSROOM SYNC</span>
        </RouterLink>

        <div class="flex-1 flex flex-col overflow-y-auto">
          <nav class="flex-1 px-4 py-6 space-y-2">
            <RouterLink 
              v-for="item in menuItems" 
              :key="item.path"
              :to="item.path"
              class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors"
              :class="route.path.startsWith(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            >
              <i :class="['bi', item.icon, 'text-lg me-4']"></i>
              {{ item.name }}
            </RouterLink>
          </nav>

          <div class="p-4 border-t border-gray-100">
            <div class="flex items-center p-3 bg-gray-50 rounded-xl mb-4 border border-gray-100">
              <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {{ authStore.currentUserName?.charAt(0).toUpperCase() || 'U' }}
              </div>
              <div class="ms-3 overflow-hidden">
                <p class="text-sm font-bold text-gray-800 truncate">{{ authStore.currentUserName || 'ผู้ใช้งาน' }}</p>
                <p class="text-xs text-blue-600 font-semibold uppercase truncate">{{ authStore.currentRole || 'User' }}</p>
              </div>
            </div>
            <button 
              @click="logout"
              class="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <i class="bi bi-box-arrow-right me-3"></i>
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </aside>

    <div 
      v-if="isSidebarOpen" 
      class="fixed inset-0 z-40 md:hidden bg-gray-900 bg-opacity-50 transition-opacity backdrop-blur-sm"
      @click="isSidebarOpen = false"
    ></div>

    <div 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out md:hidden shadow-xl"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex items-center justify-between h-16 px-6 bg-blue-600">
        <RouterLink 
          to="/dashboard" 
          active-class="_no_effects_"
          exact-active-class="_no_effects_"
          @click="isSidebarOpen = false" 
          class="flex items-center h-16 hover:bg-blue-700 transition cursor-pointer"
        >
          <span class="text-white text-xl font-bold tracking-wider">CLASSROOM SYNC</span>
        </RouterLink>
        <button @click="isSidebarOpen = false" class="text-white p-1 hover:bg-blue-700 rounded-lg">
          <i class="bi bi-x-lg text-xl"></i>
        </button>
      </div>
      <nav class="px-4 py-6 space-y-2 overflow-y-auto h-[calc(100vh-4rem)]">
        <RouterLink 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          @click="isSidebarOpen = false"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors"
          :class="route.path.startsWith(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          <i :class="['bi', item.icon, 'text-lg me-4']"></i>
          {{ item.name }}
        </RouterLink>
        
        <div class="pt-4 mt-4 border-t border-gray-100">
          <button 
            @click="logout"
            class="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <i class="bi bi-box-arrow-right me-3"></i>
            ออกจากระบบ
          </button>
        </div>
      </nav>
    </div>

    <div class="flex flex-col flex-1 overflow-hidden">
      <header class="flex-shrink-0 bg-white border-b border-gray-200 z-10">
        <div class="h-16 flex items-center justify-between px-4 md:px-8">
          <div class="flex items-center">
            <button 
              @click="isSidebarOpen = true" 
              class="md:hidden p-2 me-3 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors"
            >
              <i class="bi bi-list text-2xl"></i>
            </button>
            <div class="flex items-center">
              <h2 class="text-lg font-bold text-gray-800">
                <span v-if="authStore.currentRoomId" class="hidden sm:inline text-gray-500 font-medium">ห้อง: </span>
                {{ authStore.currentRoomName || (authStore.currentRoomId ? authStore.currentRoomId : 'หน้าหลัก') }}
              </h2>
            </div>
          </div>

          <button 
            @click="showAccountInfo"
            class="flex items-center p-1.5 pe-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-all group"
          >
            <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              {{ authStore.currentUserName?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <div class="ms-3 hidden sm:block text-left">
              <p class="text-sm font-bold text-gray-800 leading-tight">{{ authStore.currentUserName || 'ผู้ใช้งาน' }}</p>
              <p class="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <i class="bi bi-discord text-[#5865F2] text-[10px]"></i> 
                {{ authStore.currentRole || 'Connected' }}
              </p>
            </div>
          </button>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto bg-gray-50 focus:outline-none">
        <div class="py-6">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <RouterView />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* 🛠️ ลบตัวการร้าย .router-link-active ออกเรียบร้อยแล้วครับ เพราะไม่มีความจำเป็นต้องใช้ */

/* ทำให้ scrollbar สวยงามขึ้นบน Desktop */
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