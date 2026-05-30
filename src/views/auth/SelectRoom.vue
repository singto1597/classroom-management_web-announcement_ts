<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ClassroomService } from '@/services/classroom';
import type { UserRoom } from '@/types/classroom';
import Swal from 'sweetalert2';
import { StudentService } from '@/services/student';

const authStore = useAuthStore();
const router = useRouter();
const rooms = ref<UserRoom[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  if (!authStore.discordId) {
    isLoading.value = false;
    return;
  }

  try {
    rooms.value = await ClassroomService.getUserRooms(authStore.discordId);
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'โหลดข้อมูลห้องเรียนไม่สำเร็จ',
      text: error.message
    });
  } finally {
    isLoading.value = false;
  }
});

const selectRoom = async (room: UserRoom) => {
  const safeServerId = room.server_id_str || String(room.server_id);
  
  // เปลี่ยนปุ่มเป็นสถานะโหลด (ถ้าอยากทำ) หรือใช้ Swal โหลด
  Swal.fire({ title: 'กำลังเข้าสู่ห้องเรียน...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  try {
    // 🚀 แอบไปดึงข้อมูลโปรไฟล์ของตัวเองมาก่อน!
    const myProfile: any = await StudentService.getMyProfile(safeServerId);
    // เอาชื่อจริง+นามสกุล มารวมกัน
    const fullName = `${myProfile.first_name} ${myProfile.last_name}`;
    
    authStore.setRoom(safeServerId, room.role, fullName);
  } catch (error) {
    // ถ้าดึงไม่ได้ (เช่น เป็น Super Admin ที่ไม่ได้อยู่ในตารางนักเรียน) ให้ใช้ชื่อตาม Role ไปก่อน
    const fallbackName = room.role === 'admin' ? 'Administrator' : 'User';
    authStore.setRoom(safeServerId, room.role, fallbackName);
  }

  Swal.close();
  router.push('/dashboard');
};
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 p-4 md:p-8 flex items-center justify-center">
    <div class="max-w-4xl w-full mx-auto">
      
      <div class="text-center mb-10">
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">เลือกห้องเรียน 🏫</h1>
        <p class="text-slate-500">ยินดีต้อนรับกลับมา! กรุณาเลือกห้องเรียนที่คุณต้องการจัดการ</p>
      </div>

      <div v-if="isLoading" class="flex flex-col justify-center items-center py-12 gap-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="text-slate-500 font-medium animate-pulse">กำลังค้นหาห้องเรียนของคุณ...</p>
      </div>

      <div v-else-if="rooms.length === 0" class="bg-white rounded-[2rem] shadow-sm p-12 text-center border border-slate-100">
        <div class="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <i class="bi bi-exclamation-triangle-fill text-3xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-slate-800 mb-2">ไม่พบห้องเรียน</h2>
        <p class="text-slate-500 mb-8">บัญชี Discord ของคุณยังไม่ได้เชื่อมต่อกับห้องเรียนใดๆ โปรดติดต่อแอดมิน</p>
        <button @click="authStore.logout()" class="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">
          <i class="bi bi-box-arrow-left me-2"></i>ออกจากระบบ
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          v-for="room in rooms" 
          :key="room.server_id"
          @click="selectRoom(room)"
          class="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[160px]"
        >
          <div class="absolute top-0 right-0 p-5">
            <span 
              class="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm"
              :class="room.role === 'student' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-600'"
            >
              {{ room.role }}
            </span>
          </div>
          
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-2xl transition-all shadow-sm">
              <i class="bi bi-door-open-fill"></i>
            </div>
            <div class="pt-1 pr-16">
              <h3 class="text-xl font-bold text-slate-800 leading-tight mb-1">{{ room.room_name }}</h3>
              <p class="text-xs text-slate-400 font-mono">ID: {{ room.server_id }}</p>
            </div>
          </div>
          
          <div class="flex items-center justify-between text-blue-600 font-bold mt-6 pt-4 border-t border-slate-50">
            <span class="text-sm">เข้าสู่ห้องเรียน</span>
            <div class="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all">
              <i class="bi bi-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div class="text-center mt-8">
        <button @click="authStore.logout()" class="text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors">
          <i class="bi bi-box-arrow-left me-1"></i> ล็อกเอาท์
        </button>
      </div>

    </div>
  </div>
</template>