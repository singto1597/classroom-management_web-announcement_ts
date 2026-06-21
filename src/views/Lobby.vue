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

// --- Modal States ---
const showCreateModal = ref(false);
const showJoinModal = ref(false);

const createForm = ref({ room_name: '' });
const joinForm = ref({ room_code: '', student_no: null as number | null, first_name: '', last_name: '' });

onMounted(async () => {
  if (!authStore.userId) {
    isLoadingRooms.value = false;
    return;
  }
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
    (r.room_name || '').toLowerCase().includes(q) || 
    (r.server_id || '').toLowerCase().includes(q)
  );
});

const enterRoom = async (room: UserRoom) => {
  // เช็กสิทธิ์ ถ้าเป็น pending ไม่ให้เข้า
  if (room.role === 'pending') {
    Swal.fire('รอการอนุมัติ', 'คุณส่งคำขอเข้าร่วมห้องนี้ไปแล้ว กรุณารอครูผู้สอนอนุมัติ', 'info');
    return;
  }

  const targetRoomId = room.room_id; 
  if (!targetRoomId) return;

  Swal.fire({ 
    title: 'กำลังเข้าสู่ห้องเรียน...', 
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

// --- Submit Handlers ---
const submitCreateRoom = async () => {
  if (!createForm.value.room_name) return;
  try {
    Swal.fire({ title: 'กำลังสร้างห้อง...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    await ClassroomService.createRoom({ room_name: createForm.value.room_name });
    showCreateModal.value = false;
    createForm.value.room_name = '';
    await fetchRooms();
    Swal.fire('สำเร็จ!', 'สร้างห้องเรียนเรียบร้อยแล้ว', 'success');
  } catch (error: any) {
    Swal.fire('ข้อผิดพลาด', error.response?.data?.detail || 'ไม่สามารถสร้างห้องได้', 'error');
  }
};

const submitJoinRoom = async () => {
  if (!joinForm.value.room_code || !joinForm.value.student_no || !joinForm.value.first_name || !joinForm.value.last_name) return;
  try {
    Swal.fire({ title: 'กำลังส่งคำขอ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    await ClassroomService.joinRoom({
      room_code: joinForm.value.room_code.toUpperCase(),
      student_no: Number(joinForm.value.student_no),
      first_name: joinForm.value.first_name,
      last_name: joinForm.value.last_name
    });
    showJoinModal.value = false;
    joinForm.value = { room_code: '', student_no: null, first_name: '', last_name: '' };
    await fetchRooms();
    Swal.fire('ส่งคำขอสำเร็จ!', 'กรุณารอครูผู้สอนอนุมัติการเข้าห้อง', 'success');
  } catch (error: any) {
    Swal.fire('ข้อผิดพลาด', error.response?.data?.detail || 'ไม่สามารถเข้าร่วมห้องได้', 'error');
  }
};
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative">
    
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-14">
      <div class="space-y-2">
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 tracking-tight">Workspaces</h1>
        <p class="text-slate-500 text-base md:text-lg font-medium">เลือกห้องเรียนที่คุณต้องการจัดการ หรือเข้าร่วมห้องใหม่</p>
      </div>
      
      <div class="flex items-center gap-3 w-full md:w-auto">
        <button @click="showJoinModal = true" class="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-slate-700 font-bold px-5 py-3 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all">
          <i class="bi bi-box-arrow-in-right text-lg"></i> เข้าร่วมห้อง
        </button>
        <button @click="showCreateModal = true" class="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all">
          <i class="bi bi-plus-lg text-lg"></i> สร้างห้องใหม่
        </button>
      </div>
    </div>

    <div v-if="rooms.length > 0 || isLoadingRooms" class="relative max-w-md mb-8">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <i class="bi bi-search text-slate-400"></i>
      </div>
      <input v-model="searchQuery" type="text" placeholder="ค้นหาชื่อห้อง หรือรหัส ID..." class="w-full bg-white border border-slate-200 text-slate-800 text-sm font-medium rounded-2xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm">
    </div>

    <div v-if="isLoadingRooms" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      <div v-for="i in 3" :key="i" class="bg-white rounded-3xl border border-slate-100 p-6 h-48 animate-pulse flex flex-col justify-between shadow-sm">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-slate-200 rounded-xl"></div>
          <div class="flex-1 space-y-2 py-1"><div class="h-4 bg-slate-200 rounded-md w-3/4"></div><div class="h-3 bg-slate-100 rounded-md w-1/2"></div></div>
        </div>
      </div>
    </div>

    <div v-else-if="rooms.length === 0" class="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-dashed border-slate-300 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
      <div class="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-blue-100/50">
        <i class="bi bi-inboxes text-4xl text-blue-500"></i>
      </div>
      <h3 class="text-2xl font-black text-slate-800 mb-2">ยังไม่มี Workspace</h3>
      <p class="text-slate-500 font-medium max-w-sm mb-8 leading-relaxed">บัญชีของคุณยังไม่ได้เชื่อมต่อกับห้องเรียนใดๆ โปรดติดต่อแอดมินหรือสร้างห้องใหม่</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      <button 
        v-for="room in filteredRooms" :key="room.room_id" @click="enterRoom(room)"
        class="group text-left bg-white rounded-3xl border border-slate-200/80 p-6 hover:border-blue-300 hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)] transition-all duration-300 relative overflow-hidden flex flex-col min-h-[180px]"
      >
        <div v-if="room.role !== 'pending'" class="absolute -top-24 -right-24 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        <div class="flex justify-between items-start mb-4 relative z-10">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-xl font-black shadow-sm group-hover:scale-105 group-hover:text-blue-600 transition-all">
            {{ room.room_name.substring(0, 2).toUpperCase() }}
          </div>
          <div v-if="room.role === 'pending'" class="bg-amber-100 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-200">
            รออนุมัติ <i class="bi bi-hourglass-split"></i>
          </div>
          <div v-else class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            <i class="bi bi-arrow-right text-lg -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
          </div>
        </div>
        <div class="mt-auto relative z-10">
          <h3 class="text-xl font-extrabold text-slate-800 mb-1 tracking-tight truncate">{{ room.room_name }}</h3>
          <div class="flex items-center gap-2.5 mt-3">
            <span :class="room.role === 'admin' || room.role === 'teacher' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-500'" class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border">
              {{ room.role }}
            </span>
            <span class="text-slate-300">•</span>
            <span class="text-xs font-bold text-slate-400 flex items-center gap-1">
              <i class="bi bi-hash"></i> {{ room.server_id || 'N/A' }}
            </span>
          </div>
        </div>
      </button>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showCreateModal = false"></div>
      <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-[fadeInUp_0.2s_ease-out]">
        <div class="p-6 md:p-8">
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4">
            <i class="bi bi-plus-circle-fill"></i>
          </div>
          <h2 class="text-2xl font-black text-slate-800 mb-2">สร้างห้องเรียนใหม่</h2>
          <p class="text-sm text-slate-500 mb-6">ระบุชื่อห้องเรียนของคุณ เพื่อให้นักเรียนเข้าร่วมผ่านรหัสห้อง</p>
          
          <form @submit.prevent="submitCreateRoom" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ชื่อห้องเรียน <span class="text-red-500">*</span></label>
              <input v-model="createForm.room_name" type="text" required class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="เช่น ม.4/1 ห้องเรียนพิเศษ">
            </div>
            <div class="flex gap-3 mt-8">
              <button type="button" @click="showCreateModal = false" class="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors">ยกเลิก</button>
              <button type="submit" :disabled="!createForm.room_name" class="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all">สร้างห้อง</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showJoinModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showJoinModal = false"></div>
      <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-[fadeInUp_0.2s_ease-out]">
        <div class="p-6 md:p-8">
          <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-2xl mb-4">
            <i class="bi bi-box-arrow-in-right"></i>
          </div>
          <h2 class="text-2xl font-black text-slate-800 mb-2">เข้าร่วมห้องเรียน</h2>
          <p class="text-sm text-slate-500 mb-6">กรอกรหัส 6 หลักที่ได้รับจากครูผู้สอน พร้อมระบุข้อมูลของคุณ</p>
          
          <form @submit.prevent="submitJoinRoom" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">รหัสห้องเรียน 6 หลัก <span class="text-red-500">*</span></label>
                <input v-model="joinForm.room_code" type="text" maxlength="6" required class="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold tracking-[0.2em] uppercase rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-center placeholder:tracking-normal placeholder:font-normal" placeholder="เช่น AB12CD">
              </div>
              <div class="col-span-2">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">เลขที่ <span class="text-red-500">*</span></label>
                <input v-model="joinForm.student_no" type="number" min="1" required class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="เช่น 15">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ชื่อจริง <span class="text-red-500">*</span></label>
                <input v-model="joinForm.first_name" type="text" required class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">นามสกุล <span class="text-red-500">*</span></label>
                <input v-model="joinForm.last_name" type="text" required class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
              </div>
            </div>
            <div class="flex gap-3 mt-8 pt-4">
              <button type="button" @click="showJoinModal = false" class="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors">ยกเลิก</button>
              <button type="submit" class="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all">ส่งคำขอ</button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>