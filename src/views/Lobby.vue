<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ClassroomService } from '@/services/classroom';
import { StudentService } from '@/services/student';
import type { UserRoom } from '@/types/classroom';
import Swal from 'sweetalert2';

const authStore = useAuthStore();
const router = useRouter();

// State สำหรับ Service Classroom
const isClassroomExpanded = ref(true); // เปิดค้างไว้เป็น Default สำหรับ Phase 1
const isLoadingRooms = ref(false);
const rooms = ref<UserRoom[]>([]);

onMounted(async () => {
  if (authStore.userId) {
    await fetchRooms();
  }
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

const enterRoom = async (room: UserRoom) => {
  const targetRoomId = room.room_id; 
  if (!targetRoomId) return;

  Swal.fire({ title: 'กำลังเข้าสู่บริการ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

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
  Swal.fire('Coming Soon', 'ฟังก์ชันสร้างห้องเรียนใหม่ (อ้างอิง API POST /api/classrooms/create)', 'info');
};

const handleJoinRoom = () => {
  Swal.fire('Coming Soon', 'ฟังก์ชันเข้าร่วมห้องด้วยรหัส (อ้างอิง API POST /api/classrooms/join)', 'info');
};
</script>

<template>
  <div class="space-y-8 md:space-y-12">
    
    <div class="text-left space-y-3">
      <h1 class="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
        สวัสดี, <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{{ authStore.userId || 'ผู้ใช้งาน' }}</span> 👋
      </h1>
      <p class="text-slate-500 text-lg font-medium max-w-2xl">
        ยินดีต้อนรับสู่ส่วนกลางของระบบ เลือกบริการที่คุณต้องการใช้งานด้านล่างนี้ได้เลย
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <div 
        class="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden transition-all duration-300"
        :class="isClassroomExpanded ? 'ring-2 ring-blue-500/20 shadow-xl' : 'hover:shadow-md cursor-pointer'"
      >
        <div class="p-6 sm:p-8 flex items-start justify-between bg-gradient-to-br from-white to-slate-50">
          <div class="flex gap-5">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30 shrink-0">
              <i class="bi bi-book-half"></i>
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight mb-1">Classroom</h2>
              <p class="text-sm text-slate-500 font-medium">ระบบจัดการห้องเรียน ตาราง และการเงิน</p>
            </div>
          </div>
          <span class="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100">Active</span>
        </div>

        <div v-if="isClassroomExpanded" class="border-t border-slate-100 bg-slate-50/50 p-6 sm:p-8">
          
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-sm font-bold text-slate-600 uppercase tracking-widest">ห้องเรียนของคุณ</h3>
            <div class="flex gap-2">
              <button @click="handleJoinRoom" class="text-sm font-semibold text-slate-500 hover:text-blue-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors shadow-sm">
                <i class="bi bi-box-arrow-in-right"></i> เข้าร่วม
              </button>
              <button @click="handleCreateRoom" class="text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                <i class="bi bi-plus-lg"></i> สร้างห้อง
              </button>
            </div>
          </div>

          <div v-if="isLoadingRooms" class="py-8 flex justify-center">
            <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>

          <div v-else-if="rooms.length === 0" class="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
            <div class="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <i class="bi bi-inboxes text-xl"></i>
            </div>
            <p class="text-slate-500 font-medium mb-1">ยังไม่มีห้องเรียน</p>
            <p class="text-xs text-slate-400">สร้างห้องใหม่หรือขอรหัสเข้าร่วมจากแอดมิน</p>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              v-for="room in rooms" 
              :key="room.room_id"
              @click="enterRoom(room)"
              class="text-left bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div class="absolute top-0 right-0 p-3">
                <i class="bi bi-arrow-right text-slate-300 group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1"></i>
              </div>
              <div class="flex items-center gap-3 mb-2">
                <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {{ room.room_name.charAt(0) }}
                </div>
                <h4 class="font-bold text-slate-800 truncate pr-8">{{ room.room_name }}</h4>
              </div>
              <div class="flex items-center gap-2 text-xs font-medium">
                <span :class="room.role === 'admin' ? 'text-indigo-500' : 'text-slate-400'" class="uppercase tracking-wider">
                  {{ room.role }}
                </span>
                <span class="text-slate-300">•</span>
                <span class="text-slate-400">ID: {{ room.server_id }}</span>
              </div>
            </button>
          </div>

        </div>
      </div>

      <div class="bg-white/50 backdrop-blur-sm rounded-[2rem] border border-dashed border-slate-300 flex flex-col items-center justify-center p-10 text-center relative overflow-hidden min-h-[300px]">
        <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 text-3xl mb-4">
          <i class="bi bi-grid-1x2-fill"></i>
        </div>
        <h3 class="text-lg font-bold text-slate-600 mb-2">More Services Coming Soon</h3>
        <p class="text-slate-400 text-sm max-w-xs">ระบบอื่นๆ จะถูกเพิ่มเข้ามาในพื้นที่นี้ในอนาคต เตรียมพบกับการอัปเดตใหม่ๆ ได้เลย</p>
      </div>

    </div>
  </div>
</template>