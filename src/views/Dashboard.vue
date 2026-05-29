<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
</script>

<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Dashboard</h1>
      <button 
        @click="authStore.logout()"
        class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition"
      >
        Logout
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 class="text-xl font-semibold mb-4">Welcome to Classroom Sync</h2>
      <p class="text-gray-600">You are successfully logged in.</p>
      
      <div class="mt-6 p-4 bg-gray-50 rounded-lg">
        <p class="text-sm text-gray-500 font-mono">Discord ID: {{ authStore.discordId || 'N/A' }}</p>
      </div>

      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <RouterLink 
          to="/students" 
          class="flex flex-col p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
        >
          <div class="flex items-center mb-4">
            <div class="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <i class="bi bi-people-fill text-2xl"></i>
            </div>
            <h3 class="ms-4 text-lg font-bold text-gray-800">จัดการนักเรียน</h3>
          </div>
          <p class="text-gray-500 text-sm">ดูรายชื่อนักเรียน, แก้ไขข้อมูล และจัดการสถานะ</p>
        </RouterLink>

        <RouterLink 
          to="/tasks" 
          class="flex flex-col p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
        >
          <div class="flex items-center mb-4">
            <div class="p-3 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
              <i class="bi bi-clipboard-check text-2xl"></i>
            </div>
            <h3 class="ms-4 text-lg font-bold text-gray-800">ระบบสั่งงาน & โน้ต</h3>
          </div>
          <p class="text-gray-500 text-sm">จัดการการบ้าน, งานค้าง และประกาศโน้ตรายวันสำหรับนักเรียน</p>
        </RouterLink>

        <RouterLink 
          to="/schedules" 
          class="flex flex-col p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
        >
          <div class="flex items-center mb-4">
            <div class="p-3 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
              <i class="bi bi-calendar-event-fill text-2xl"></i>
            </div>
            <h3 class="ms-4 text-lg font-bold text-gray-800">จัดการตารางเรียน</h3>
          </div>
          <p class="text-gray-500 text-sm">ตั้งตารางเรียนปกติ, การแต่งกาย และข้อยกเว้นพิเศษ/วันหยุด</p>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
