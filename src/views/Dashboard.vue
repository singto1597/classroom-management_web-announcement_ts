<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// ดึงข้อมูลจาก Store
const userName = computed(() => authStore.currentUserName || 'User');
const role = computed(() => authStore.currentRole || 'Unknown');
const isAdmin = computed(() => authStore.isAdmin);

// หากต้องการให้ผู้ใช้สลับห้อง ให้กลับไปหน้า Select Room (สมมติว่าอยู่ที่ /select-room)
const handleChangeRoom = () => {
  authStore.clearRoom();
  router.push('/select-room'); 
};
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 p-4 md:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      
      <div class="relative bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div class="absolute bottom-0 left-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl translate-y-1/2"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div class="text-white">
            <h1 class="text-3xl md:text-5xl font-black tracking-tight mb-3">สวัสดี, {{ userName }}! 👋</h1>
            <p class="text-blue-100 text-lg font-medium opacity-90">ยินดีต้อนรับสู่ระบบจัดการห้องเรียน</p>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg">
              <span class="w-2 h-2 rounded-full" :class="isAdmin ? 'bg-emerald-400' : 'bg-blue-400'"></span>
              <span class="text-white font-bold text-sm tracking-wider uppercase">
                สถานะ: {{ role }}
              </span>
            </div>
            <button 
              @click="handleChangeRoom"
              class="w-11 h-11 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-all shadow-lg"
              title="สลับห้องเรียน"
            >
              <i class="bi bi-arrow-left-right text-lg"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        <div class="md:col-span-7 bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 flex flex-col hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 mb-8">
            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl">
              <i class="bi bi-journal-check"></i>
            </div>
            <h2 class="text-2xl font-bold text-slate-800">งานและตารางเรียน</h2>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <router-link to="/tasks" class="group relative overflow-hidden bg-slate-50 hover:bg-blue-600 rounded-2xl p-5 transition-all duration-300 flex items-center justify-between border border-slate-100">
              <span class="font-bold text-slate-700 group-hover:text-white z-10 transition-colors">📋 ดูรายการงานทั้งหมด</span>
              <i class="bi bi-arrow-right text-slate-400 group-hover:text-white/80 group-hover:translate-x-1 transition-all z-10"></i>
            </router-link>
            
            <router-link v-if="isAdmin" to="/tasks/add" class="group relative overflow-hidden bg-slate-50 hover:bg-blue-600 rounded-2xl p-5 transition-all duration-300 flex items-center justify-between border border-slate-100">
              <span class="font-bold text-slate-700 group-hover:text-white z-10 transition-colors">➕ เพิ่มงาน / โน้ตใหม่</span>
              <i class="bi bi-arrow-right text-slate-400 group-hover:text-white/80 group-hover:translate-x-1 transition-all z-10"></i>
            </router-link>
            
            <div v-else class="bg-slate-50/50 rounded-2xl p-5 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm font-medium">
              เฉพาะแอดมินที่เพิ่มงานได้
            </div>
          </div>

          <div class="mt-auto pt-6 border-t border-slate-100">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">การจัดการตาราง</h3>
            <div class="flex flex-wrap gap-3">
              <router-link to="/schedules" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-colors">
                ตารางเรียนยืนพื้น
              </router-link>
              <router-link v-if="isAdmin" to="/schedules" class="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm rounded-xl transition-colors">
                ตั้งข้อยกเว้นฉุกเฉิน
              </router-link>
            </div>
          </div>
        </div>

        <div class="md:col-span-5 bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 flex flex-col hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 mb-8">
            <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">
              <i class="bi bi-people-fill"></i>
            </div>
            <h2 class="text-2xl font-bold text-slate-800">ฐานข้อมูลนักเรียน</h2>
          </div>
          
          <div class="flex flex-col gap-4 flex-grow">
            <router-link to="/students" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-between group">
              <span>📑 ดูรายชื่อเพื่อนทั้งห้อง</span>
              <i class="bi bi-arrow-right group-hover:translate-x-1 transition-transform"></i>
            </router-link>
            
            <button class="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-4 px-6 rounded-2xl border border-slate-200 transition-all flex items-center justify-between group text-left">
              <span>🪪 ข้อมูลโปรไฟล์ของฉัน</span>
              <i class="bi bi-person-badge text-slate-400"></i>
            </button>
            
            <template v-if="isAdmin">
              <router-link to="/students/add" class="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-4 px-6 rounded-2xl border border-slate-200 transition-all flex items-center justify-between group">
                <span>➕ เพิ่มนักเรียนใหม่</span>
                <i class="bi bi-person-plus text-slate-400"></i>
              </router-link>
              <button class="text-sm font-bold text-slate-400 hover:text-slate-600 mt-2 transition-colors flex items-center justify-center gap-2">
                <i class="bi bi-file-earmark-excel"></i> Export เป็น Excel
              </button>
            </template>
          </div>
        </div>

        <div class="md:col-span-12 relative overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] shadow-md hover:shadow-lg transition-all group">
          <div class="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
          
          <div class="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div class="flex items-center gap-6">
              <div class="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-white/30">
                💰
              </div>
              <div>
                <h2 class="text-2xl md:text-3xl font-black text-amber-950 mb-1">ระบบการเงินห้อง (Finance)</h2>
                <p class="text-amber-900/80 font-medium text-sm md:text-base">จัดการรายรับ-จ่าย, โปรเจกต์เก็บเงิน, และติดตามสถานะบิล</p>
              </div>
            </div>
            
            <div class="flex flex-wrap justify-center md:justify-end gap-3 w-full md:w-auto">
              <router-link to="/finance" class="px-6 py-3 bg-amber-950 hover:bg-amber-900 text-amber-100 font-bold rounded-xl transition-colors shadow-sm">
                📊 สรุปยอดเงิน
              </router-link>
              <router-link to="/finance/transactions" class="px-6 py-3 bg-white/90 hover:bg-white text-amber-950 font-bold rounded-xl transition-colors shadow-sm backdrop-blur-sm">
                📜 ประวัติ
              </router-link>
              <router-link to="/finance/collections" class="px-6 py-3 bg-white/90 hover:bg-white text-amber-950 font-bold rounded-xl transition-colors shadow-sm backdrop-blur-sm">
                📦 โปรเจกต์
              </router-link>
              <router-link v-if="isAdmin" to="/finance/debtors" class="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors shadow-md border border-rose-500">
                🤬 ทวงหนี้
              </router-link>
            </div>
          </div>
        </div>

        <div class="md:col-span-12 group">
          <div class="bg-slate-900 rounded-[2rem] p-8 md:p-10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-6">
              <div class="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-slate-700">
                🗺️
              </div>
              <div>
                <h2 class="text-2xl font-bold text-white mb-1">Class Roadmap & Committee</h2>
                <p class="text-slate-400 font-medium text-sm md:text-base">ดูแผนการดำเนินงานของคณะกรรมการห้อง</p>
              </div>
            </div>
            <div class="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white group-hover:bg-blue-600 group-hover:scale-110 transition-all">
              <i class="bi bi-arrow-right text-xl"></i>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>