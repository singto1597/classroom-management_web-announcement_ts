<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ClassroomService } from '@/services/classroom';
import type { UserRoom } from '@/types/classroom';
import Swal from 'sweetalert2';

const authStore = useAuthStore();
const router = useRouter();

const isLoadingRooms = ref(true);
const rooms = ref<UserRoom[]>([]);
const searchQuery = ref('');

onMounted(async () => {
  if (!authStore.userId) {
    isLoadingRooms.value = false; return;
  }
  if (!authStore.firstName) await authStore.fetchProfile();
  await fetchRooms();
});

const fetchRooms = async () => {
  isLoadingRooms.value = true;
  try {
    rooms.value = await ClassroomService.getUserRooms(authStore.userId!);
  } catch (error: any) {
    console.error("Failed to load rooms:", error);
  } finally {
    isLoadingRooms.value = false;
  }
};

const filteredRooms = computed(() => {
  if (!searchQuery.value) return rooms.value;
  const q = searchQuery.value.toLowerCase();
  return rooms.value.filter(r => 
    (r.room_name && r.room_name.toLowerCase().includes(q)) ||
    (r.room_code && r.room_code.toLowerCase().includes(q))
  );
});

const selectRoom = (room: UserRoom) => {
  authStore.setRoom(room.room_id, room.room_name, room.room_code, room.role, authStore.currentUserName);
  router.push('/dashboard');
};
</script>

<template>
  <div class="max-w-6xl mx-auto pt-4 md:pt-10 pb-20 relative z-10">
    
    <div class="text-center mb-12 md:mb-16">
      <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl shadow-blue-500/10 border border-slate-100 mb-6">
        <i class="bi bi-grid-fill text-4xl text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600"></i>
      </div>
      <h1 class="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mb-4">ยินดีต้อนรับ, <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{{ authStore.firstName || 'ผู้ใช้งาน' }}</span> 👋</h1>
      <p class="text-slate-500 text-base md:text-lg font-medium max-w-2xl mx-auto">เลือกห้องเรียนของคุณเพื่อเริ่มต้นการจัดการ หรือเข้าร่วมห้องเรียนใหม่ผ่านรหัสห้อง</p>
    </div>

    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
      <div class="relative w-full sm:w-96 group">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <i class="bi bi-search text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
        </div>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="ค้นหาชื่อห้อง หรือ รหัส..." 
          class="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-[1.25rem] text-sm font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
        >
      </div>
      
      <div class="flex gap-3 w-full sm:w-auto">
        <button class="flex-1 sm:flex-none px-6 py-3.5 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md hover:text-blue-600 text-slate-600 font-bold rounded-[1.25rem] transition-all active:scale-95 flex items-center justify-center gap-2">
          <i class="bi bi-door-open-fill"></i> เข้าห้องเรียน
        </button>
        <button class="flex-1 sm:flex-none px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-[1.25rem] shadow-lg shadow-slate-900/20 transition-all active:scale-95 flex items-center justify-center gap-2">
          <i class="bi bi-plus-lg"></i> สร้างห้อง
        </button>
      </div>
    </div>

    <div v-if="isLoadingRooms" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
    </div>
    
    <div v-else-if="filteredRooms.length === 0" class="text-center py-20 bg-white rounded-[2rem] border border-slate-100 border-dashed">
      <div class="text-slate-300 mb-4"><i class="bi bi-inbox-fill text-6xl"></i></div>
      <h3 class="text-xl font-bold text-slate-600 mb-2">ยังไม่มีห้องเรียน</h3>
      <p class="text-slate-400">คุณสามารถสร้างห้องใหม่ หรือขอรหัสเพื่อเข้าร่วมห้องได้เลย</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="room in filteredRooms" :key="room.room_id"
        @click="selectRoom(room)"
        class="group bg-white rounded-[2rem] p-6 border border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] hover:border-blue-200 cursor-pointer transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
      >
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div class="flex justify-between items-start mb-6 relative z-10">
          <div class="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-center text-slate-400 text-2xl group-hover:from-blue-50 group-hover:to-indigo-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all duration-500 shadow-inner">
            <i class="bi bi-buildings-fill"></i>
          </div>
          <span class="px-3 py-1 bg-slate-50 border border-slate-100 text-[10px] font-black tracking-widest uppercase text-slate-500 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
            {{ room.role }}
          </span>
        </div>
        
        <div class="relative z-10">
          <h3 class="text-xl font-black text-slate-800 mb-1 line-clamp-1 group-hover:text-blue-700 transition-colors">{{ room.room_name }}</h3>
          <p class="text-sm font-bold text-slate-400 font-mono tracking-wide flex items-center gap-2">
            <i class="bi bi-key text-slate-300"></i> {{ room.room_code || 'ไม่มีรหัส' }}
          </p>
        </div>

        <div class="mt-6 pt-5 border-t border-slate-100 flex justify-between items-center relative z-10">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ room.status }}</span>
          </div>
          <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
            <i class="bi bi-arrow-right"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>