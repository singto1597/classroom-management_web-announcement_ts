<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ClassroomService } from '@/services/classroom';
import { StudentService } from '@/services/student';
import type { UserRoom } from '@/types/classroom';
import Swal from 'sweetalert2';

const authStore = useAuthStore();
const router = useRouter();

const isLoadingRooms = ref(true);
const rooms = ref<UserRoom[]>([]);
const searchQuery = ref('');

onMounted(async () => {
  if (authStore.userId) {
    await fetchRooms();
  }
});

const fetchRooms = async () => {
  isLoadingRooms.value = true;
  try {
    // จำลองดีเลย์นิดหน่อยให้เห็น Loading สวยๆ (ลบออกได้ถ้าระบบจริงเร็วอยู่แล้ว)
    // await new Promise(r => setTimeout(r, 600)); 
    rooms.value = await ClassroomService.getUserRooms(authStore.userId!);
  } catch (error: any) {
    console.error("Failed to load rooms:", error);
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลห้องเรียนได้', 'error');
  } finally {
    isLoadingRooms.value = false;
  }
};

const filteredRooms = computed(() => {
  if (!searchQuery.value) return rooms.value;
  const q = searchQuery.value.toLowerCase();
  return rooms.value.filter(r => 
    (r.room_name || '').toLowerCase().includes(q) || 
    (r.server_id || '').toLowerCase().includes(q)
  );
});

const enterRoom = async (room: UserRoom) => {
  const targetRoomId = room.room_id; 
  if (!targetRoomId) return;

  Swal.fire({ 
    title: 'กำลังเชื่อมต่อ...', 
    text: `เข้าสู่ห้อง ${room.room_name}`,
    allowOutsideClick: false, 
    didOpen: () => Swal.showLoading(),
    customClass: { popup: 'rounded-2xl' }
  });

  try {
    const myProfile: any = await StudentService.getMyProfile(targetRoomId);
    const fullName = `${myProfile.first_name} ${myProfile.last_name}`;
    authStore.setRoom(targetRoomId, room.room_name, room.role, fullName);
  } catch (error) {
    const fallbackName = room.role === 'admin' ? 'Administrator' : 'User';
    authStore.setRoom(targetRoomId, room.room_name, room.role, fallbackName);
  }

  Swal.close();
  router.push('/dashboard');
};

const handleCreateRoom = () => {
  Swal.fire({
    title: 'สร้างห้องเรียนใหม่',
    text: 'ฟังก์ชันนี้กำลังอยู่ในการพัฒนา',
    icon: 'info',
    confirmButtonText: 'รับทราบ',
    customClass: { confirmButton: 'bg-slate-900 text-white rounded-xl px-6' }
  });
};

const handleJoinRoom = () => {
  Swal.fire({
    title: 'เข้าร่วมด้วยรหัส',
    input: 'text',
    inputPlaceholder: 'กรอกรหัส Server ID (เช่น SV-XXXX)',
    showCancelButton: true,
    confirmButtonText: 'เข้าร่วม',
    cancelButtonText: 'ยกเลิก',
    customClass: { 
      confirmButton: 'bg-blue-600 text-white rounded-xl px-6',
      cancelButton: 'bg-slate-100 text-slate-600 rounded-xl px-6',
      input: 'rounded-xl border-slate-200'
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      Swal.fire('Coming Soon', `ระบบจะพาเข้าร่วมห้อง ${result.value} ในอนาคต`, 'success');
    }
  });
};
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
    
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-14">
      <div class="space-y-2">
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 tracking-tight">
          Workspaces
        </h1>
        <p class="text-slate-500 text-base md:text-lg font-medium">
          เลือกห้องเรียนที่คุณต้องการจัดการ หรือเข้าร่วมห้องใหม่
        </p>
      </div>
      
      <div class="flex items-center gap-3 w-full md:w-auto">
        <button @click="handleJoinRoom" class="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-slate-700 font-bold px-5 py-3 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all">
          <i class="bi bi-box-arrow-in-right text-lg"></i> เข้าร่วมห้อง
        </button>
        <button @click="handleCreateRoom" class="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all">
          <i class="bi bi-plus-lg text-lg"></i> สร้างห้องใหม่
        </button>
      </div>
    </div>

    <div v-if="rooms.length > 0 || isLoadingRooms" class="relative max-w-md mb-8">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <i class="bi bi-search text-slate-400"></i>
      </div>
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="ค้นหาชื่อห้อง หรือรหัส ID..." 
        class="w-full bg-white border border-slate-200 text-slate-800 text-sm font-medium rounded-2xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
      >
    </div>

    <div v-if="isLoadingRooms" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      <div v-for="i in 3" :key="i" class="bg-white rounded-3xl border border-slate-100 p-6 h-48 animate-pulse flex flex-col justify-between shadow-sm">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-slate-200 rounded-xl"></div>
          <div class="flex-1 space-y-2 py-1">
            <div class="h-4 bg-slate-200 rounded-md w-3/4"></div>
            <div class="h-3 bg-slate-100 rounded-md w-1/2"></div>
          </div>
        </div>
        <div class="h-8 bg-slate-100 rounded-lg w-1/3 mt-auto"></div>
      </div>
    </div>

    <div v-else-if="rooms.length === 0" class="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-dashed border-slate-300 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
      <div class="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-blue-100/50">
        <i class="bi bi-inboxes text-4xl text-blue-500"></i>
      </div>
      <h3 class="text-2xl font-black text-slate-800 mb-2">ยังไม่มี Workspace</h3>
      <p class="text-slate-500 font-medium max-w-sm mb-8 leading-relaxed">
        คุณยังไม่ได้เข้าร่วมหรือเป็นเจ้าของห้องเรียนใดๆ สร้างพื้นที่ใหม่เพื่อเริ่มต้นจัดการข้อมูลได้เลย
      </p>
      <div class="flex gap-4">
        <button @click="handleCreateRoom" class="bg-blue-600 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all">
          สร้างห้องเรียนแรก
        </button>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      <button 
        v-for="room in filteredRooms" 
        :key="room.room_id"
        @click="enterRoom(room)"
        class="group text-left bg-white rounded-3xl border border-slate-200/80 p-6 hover:border-blue-300 hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)] transition-all duration-300 relative overflow-hidden flex flex-col min-h-[180px]"
      >
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

        <div class="flex justify-between items-start mb-4 relative z-10">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-xl font-black shadow-sm group-hover:scale-105 group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
            {{ room.room_name.substring(0, 2).toUpperCase() }}
          </div>
          
          <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            <i class="bi bi-arrow-right text-lg -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
          </div>
        </div>

        <div class="mt-auto relative z-10">
          <h3 class="text-xl font-extrabold text-slate-800 mb-1 tracking-tight truncate">{{ room.room_name }}</h3>
          <div class="flex items-center gap-2.5 mt-3">
            <span 
              :class="room.role === 'admin' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-600'" 
              class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border"
            >
              {{ room.role === 'admin' ? 'Admin' : 'Member' }}
            </span>
            <span class="text-slate-300">•</span>
            <span class="text-xs font-bold text-slate-400 flex items-center gap-1">
              <i class="bi bi-hash"></i> {{ room.server_id }}
            </span>
          </div>
        </div>
      </button>

      <div v-if="filteredRooms.length === 0 && searchQuery" class="col-span-full py-12 text-center">
        <p class="text-slate-500 font-medium">ไม่พบห้องเรียนที่ค้นหา "{{ searchQuery }}"</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
* {
  -webkit-tap-highlight-color: transparent;
}
</style>