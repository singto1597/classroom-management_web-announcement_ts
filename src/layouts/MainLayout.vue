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
        <p class="text-sm text-gray-600"><b>Discord ID:</b> <span class="bg-gray-100 px-2 py-1 rounded font-mono text-xs">${authStore.discordId}</span></p>
        <p class="text-sm text-gray-600"><b>Room Role:</b> <span class="uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">${authStore.currentRole}</span></p>
      </div>
    `,
    icon: 'info',
    confirmButtonText: 'ปิด',
    confirmButtonColor: '#4f46e5'
  });
};

const logout = () => {
  authStore.logout();
};
</script>

<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased">
    
    <aside class="hidden md:flex md:flex-shrink-0">
      <div class="flex flex-col w-64 bg-white border-r border-slate-200/80 shadow-[1px_0_10px_rgba(0,0,0,0.01)]">
        
        <RouterLink 
          to="/dashboard" 
          active-class="none"
          exact-active-class="none"
          class="flex items-center h-16 px-6 border-b border-slate-100 hover:opacity-90 transition-opacity"
        >
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <i class="bi bi-layers-half text-white text-sm"></i>
            </div>
            <span class="bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent text-lg font-black tracking-wider uppercase">
              Classroom Sync
            </span>
          </div>
        </RouterLink>

        <div class="flex-1 flex flex-col overflow-y-auto justify-between">
          <nav class="px-3 py-6 space-y-1">
            <RouterLink 
              v-for="item in menuItems" 
              :key="item.path"
              :to="item.path"
              class="flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group relative"
              :class="route.path.startsWith(item.path) 
                ? 'bg-indigo-50/60 text-indigo-600 shadow-sm shadow-indigo-100/20' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'"
            >
              <div 
                v-if="route.path.startsWith(item.path)" 
                class="absolute left-0 top-3 bottom-3 w-1 bg-indigo-600 rounded-r-full"
              ></div>
              
              <i :class="['bi', item.icon, 'text-base me-4 transition-transform group-hover:scale-110', route.path.startsWith(item.path) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600']"></i>
              {{ item.name }}
            </RouterLink>
          </nav>

          <div class="p-4 border-t border-slate-100 bg-slate-50/50">
            <div class="flex items-center p-3 bg-white rounded-2xl mb-3 border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-indigo-200">
                {{ authStore.currentUserName?.charAt(0).toUpperCase() || 'U' }}
              </div>
              <div class="ms-3 overflow-hidden flex-1">
                <p class="text-xs font-bold text-slate-800 truncate">{{ authStore.currentUserName || 'ผู้ใช้งาน' }}</p>
                <p class="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-0.5">{{ authStore.currentRole || 'User' }}</p>
              </div>
            </div>
            <button 
              @click="logout"
              class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50/60 active:bg-rose-100 rounded-xl transition-all duration-200"
            >
              <i class="bi bi-box-arrow-right"></i>
              ออกจากระบบตัวจัดการ
            </button>
          </div>
        </div>
      </div>
    </aside>

    <div 
      v-if="isSidebarOpen" 
      class="fixed inset-0 z-40 md:hidden bg-slate-900/40 transition-opacity backdrop-blur-sm"
      @click="isSidebarOpen = false"
    ></div>

    <div 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex items-center justify-between h-16 px-6 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
            <i class="bi bi-layers-half text-white text-xs"></i>
          </div>
          <span class="bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent text-md font-black tracking-wider uppercase">CLASSROOM SYNC</span>
        </div>
        <button @click="isSidebarOpen = false" class="text-slate-400 p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
          <i class="bi bi-x-lg text-lg"></i>
        </button>
      </div>
      <nav class="px-3 py-6 space-y-1 overflow-y-auto h-[calc(100vh-4rem)] flex flex-col justify-between">
        <div class="space-y-1">
          <RouterLink 
            v-for="item in menuItems" 
            :key="item.path"
            :to="item.path"
            @click="isSidebarOpen = false"
            class="flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-colors"
            :class="route.path.startsWith(item.path) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'"
          >
            <i :class="['bi', item.icon, 'text-base me-4', route.path.startsWith(item.path) ? 'text-indigo-600' : 'text-slate-400']"></i>
            {{ item.name }}
          </RouterLink>
        </div>
        
        <div class="pt-4 border-t border-slate-100">
          <button 
            @click="logout"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-rose-600 bg-rose-50/40 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <i class="bi bi-box-arrow-right"></i>
            ออกจากระบบ
          </button>
        </div>
      </nav>
    </div>

    <div class="flex flex-col flex-1 overflow-hidden">
      <header class="flex-shrink-0 bg-white border-b border-slate-200/80 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <div class="h-16 flex items-center justify-between px-4 md:px-8">
          
          <div class="flex items-center">
            <button 
              @click="isSidebarOpen = true" 
              class="md:hidden p-2 me-3 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200 focus:outline-none transition-all"
            >
              <i class="bi bi-list text-xl"></i>
            </button>
            <div class="flex items-center">
              <div class="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 me-2.5">
                <i class="bi bi-door-open-fill text-xs"></i>
              </div>
              <h2 class="text-sm md:text-base font-bold text-slate-800 flex items-center gap-1.5">
                <span v-if="authStore.currentRoomId" class="hidden md:inline text-slate-400 font-medium">ห้องเรียน:</span>
                <span class="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60 text-slate-700 text-xs md:text-sm font-extrabold shadow-inner">
                  {{ authStore.currentRoomName || (authStore.currentRoomId ? authStore.currentRoomId : 'หน้าหลัก') }}
                </span>
              </h2>
            </div>
          </div>

          <button 
            @click="showAccountInfo"
            class="flex items-center p-1.5 pe-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-2xl transition-all group"
          >
            <div class="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
              {{ authStore.currentUserName?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <div class="ms-2.5 hidden sm:block text-left">
              <p class="text-xs font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{{ authStore.currentUserName || 'ผู้ใช้งาน' }}</p>
              <p class="text-[9px] font-bold text-slate-400 flex items-center gap-1 mt-0.5 tracking-wider uppercase">
                <i class="bi bi-discord text-[#5865F2] text-[9px]"></i> 
                {{ authStore.currentRole || 'Connected' }}
              </p>
            </div>
          </button>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto bg-slate-50/50 focus:outline-none">
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
/* ลบสไตล์ตัวเก่าออกเพื่อป้องกันมันดึงข้อมูลสุ่มสี่สุ่มห้า คุมพฤติกรรมผ่าน Tailwind ทั้งหมด */

/* ตกแต่ง scrollbar ให้พรีเมียมดูหรูหราแบบ Mac OS */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 100px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>