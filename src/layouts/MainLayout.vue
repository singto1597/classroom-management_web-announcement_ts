<script setup lang="ts">
import { ref } from 'vue';
import { RouterView, useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

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

const logout = () => {
  authStore.logout();
};
</script>

<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <!-- Sidebar for Desktop -->
    <aside class="hidden md:flex md:flex-shrink-0">
      <div class="flex flex-col w-64 bg-white border-r border-gray-200">
        <div class="flex items-center h-16 px-6 bg-blue-600">
          <span class="text-white text-xl font-bold tracking-wider">CLASSROOM SYNC</span>
        </div>
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
             <div class="flex items-center p-3 bg-gray-50 rounded-xl mb-4">
                <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  {{ authStore.currentUserName?.charAt(0).toUpperCase() || 'U' }}
                </div>
                <div class="ms-3 overflow-hidden">
                  <p class="text-sm font-bold text-gray-800 truncate">{{ authStore.currentUserName }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ authStore.currentRole }}</p>
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

    <!-- Mobile sidebar overlay -->
    <div 
      v-if="isSidebarOpen" 
      class="fixed inset-0 z-40 md:hidden bg-gray-600 bg-opacity-75 transition-opacity"
      @click="isSidebarOpen = false"
    ></div>

    <!-- Mobile sidebar content -->
    <div 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform md:hidden"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex items-center justify-between h-16 px-6 bg-blue-600">
        <span class="text-white text-xl font-bold tracking-wider">CLASSROOM SYNC</span>
        <button @click="isSidebarOpen = false" class="text-white">
          <i class="bi bi-x-lg text-xl"></i>
        </button>
      </div>
      <nav class="px-4 py-6 space-y-2">
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

    <!-- Main Content Area -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- Topbar -->
      <header class="flex-shrink-0 bg-white border-b border-gray-200">
        <div class="h-16 flex items-center justify-between px-4 md:px-8">
          <div class="flex items-center">
            <button 
              @click="isSidebarOpen = true" 
              class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <i class="bi bi-list text-2xl"></i>
            </button>
            <div class="ms-4 md:ms-0">
               <h2 class="text-lg font-bold text-gray-800">
                 <span v-if="authStore.currentRoomId" class="hidden sm:inline">ห้อง: </span>
                 {{ authStore.currentRoomId ? 'Room ' + authStore.currentRoomId : 'Dashboard' }}
               </h2>
            </div>
          </div>
          <div class="flex items-center">
             <div class="hidden sm:flex flex-col items-end me-4">
                <span class="text-sm font-bold text-gray-800">{{ authStore.currentUserName }}</span>
                <span class="text-xs text-gray-500 uppercase tracking-tighter">{{ authStore.currentRole }}</span>
             </div>
             <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {{ authStore.currentUserName?.charAt(0).toUpperCase() || 'U' }}
             </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto focus:outline-none">
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
/* Optional: เพิ่ม smooth transitions */
.router-link-active {
  @apply bg-blue-50 text-blue-600;
}
</style>
