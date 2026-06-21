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
    (r.room_code || '').toLowerCase().includes(q)
  );
});

const enterRoom = async (room: UserRoom) => {
  if (room.role === 'pending') {
    Swal.fire({
      title: 'รอการอนุมัติ',
      text: 'คุณส่งคำขอเข้าร่วมห้องนี้ไปแล้ว กรุณารอครูผู้สอนอนุมัติ',
      icon: 'info',
      customClass: { popup: 'rounded-3xl', confirmButton: 'bg-blue-600 rounded-xl px-6' }
    });
    return;
  }

  const targetRoomId = room.room_id; 
  if (!targetRoomId) return;

  Swal.fire({ 
    title: 'กำลังเข้าสู่ห้องเรียน...', 
    allowOutsideClick: false, 
    didOpen: () => Swal.showLoading(),
    customClass: { popup: 'rounded-3xl' }
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

const submitCreateRoom = async () => {
  if (!createForm.value.room_name) return;
  try {
    Swal.fire({ title: 'กำลังสร้าง...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const res = await ClassroomService.createRoom({ room_name: createForm.value.room_name });
    
    showCreateModal.value = false;
    createForm.value.room_name = '';
    await fetchRooms();
    
    Swal.fire({
      title: 'สร้างห้องสำเร็จ!',
      html: `
        <div class="space-y-4 pt-4">
          <p class="text-sm text-slate-500 font-medium">รหัสสำหรับเข้าห้องเรียนของคุณคือ</p>
          <div class="text-4xl font-black tracking-[0.25em] text-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 py-5 rounded-2xl border border-blue-100 shadow-inner select-all uppercase">
            ${res.room_code}
          </div>
          <p class="text-xs text-slate-400">แชร์รหัสนี้ให้นักเรียนเพื่อกดเข้าร่วมห้องได้เลย</p>
        </div>
      `,
      icon: 'success',
      confirmButtonText: 'เข้าสู่ Workspace',
      customClass: { popup: 'rounded-[2rem]', confirmButton: 'bg-blue-600 hover:bg-blue-700 rounded-xl px-8 py-3 font-bold transition-all' }
    });

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
    Swal.fire({
      title: 'ส่งคำขอสำเร็จ!',
      text: 'กรุณารอครูผู้สอนอนุมัติการเข้าห้อง',
      icon: 'success',
      customClass: { popup: 'rounded-3xl', confirmButton: 'bg-emerald-600 rounded-xl px-6' }
    });
  } catch (error: any) {
    Swal.fire('ข้อผิดพลาด', error.response?.data?.detail || 'ไม่สามารถเข้าร่วมห้องได้', 'error');
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 relative min-h-[80vh]">
    
    <!-- Premium Ambient Background -->
    <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/4 translate-x-1/4"></div>
    <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none translate-y-1/4 -translate-x-1/4"></div>

    <!-- Hero Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-20 relative z-10">
      <div class="space-y-3">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight">
          Workspaces<span class="text-blue-600">.</span>
        </h1>
        <p class="text-slate-500 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
          เลือกพื้นที่ทำงานของคุณ หรือเริ่มต้นสร้างห้องเรียนใหม่ด้วยรหัสที่ปลอดภัย
        </p>
      </div>
      
      <div class="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
        <button @click="showJoinModal = true" class="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white text-slate-700 font-bold px-6 py-3.5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 active:scale-95 transition-all duration-300">
          <i class="bi bi-box-arrow-in-right text-lg text-slate-400"></i> เข้าร่วมห้อง
        </button>
        <button @click="showCreateModal = true" class="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-slate-900 text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:shadow-slate-900/30 active:scale-95 transition-all duration-300">
          <i class="bi bi-plus-lg text-lg text-slate-300"></i> สร้างห้องใหม่
        </button>
      </div>
    </div>

    <!-- Search & Filters -->
    <div v-if="rooms.length > 0 || isLoadingRooms" class="relative max-w-md mb-10 z-10">
      <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
        <i class="bi bi-search text-slate-400 text-lg"></i>
      </div>
      <input v-model="searchQuery" type="text" placeholder="ค้นหาชื่อห้อง หรือรหัสห้อง..." class="w-full bg-white/80 backdrop-blur-md border border-slate-200/80 text-slate-800 text-sm font-bold rounded-2xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm placeholder:font-medium placeholder:text-slate-400">
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoadingRooms" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 z-10 relative">
      <div v-for="i in 3" :key="i" class="bg-white/60 backdrop-blur-sm rounded-[2rem] border border-slate-100 p-8 h-56 animate-pulse flex flex-col justify-between shadow-sm">
        <div class="flex items-start gap-5">
          <div class="w-14 h-14 bg-slate-200/50 rounded-2xl"></div>
          <div class="flex-1 space-y-3 py-1.5"><div class="h-4 bg-slate-200/50 rounded-md w-3/4"></div><div class="h-3 bg-slate-100/50 rounded-md w-1/2"></div></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="rooms.length === 0" class="bg-white/40 backdrop-blur-xl rounded-[3rem] border border-slate-200/50 p-16 text-center flex flex-col items-center justify-center min-h-[450px] shadow-sm relative z-10">
      <div class="w-28 h-28 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner border border-white">
        <i class="bi bi-inboxes text-5xl text-blue-500/80"></i>
      </div>
      <h3 class="text-3xl font-black text-slate-800 mb-3 tracking-tight">ยังไม่มี Workspace</h3>
      <p class="text-slate-500 font-medium max-w-md mb-10 leading-relaxed text-lg">
        ดูเหมือนว่าคุณจะยังไม่ได้เข้าร่วมห้องเรียนใดๆ สร้างห้องของคุณเอง หรือกรอกรหัสเพื่อเข้าร่วมได้เลย
      </p>
      <button @click="showCreateModal = true" class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-1 active:scale-95 transition-all duration-300">
        เริ่มต้นใช้งานทันที
      </button>
    </div>

    <!-- Room Cards Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 z-10 relative">
      <button 
        v-for="room in filteredRooms" :key="room.room_id" @click="enterRoom(room)"
        class="group text-left bg-white rounded-[2rem] border border-slate-200/60 p-7 sm:p-8 hover:border-blue-300/80 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] transition-all duration-500 relative overflow-hidden flex flex-col min-h-[200px]"
      >
        <div v-if="room.role !== 'pending'" class="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-400/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
        
        <div class="flex justify-between items-start mb-6 relative z-10">
          <div class="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center text-2xl font-black shadow-sm group-hover:scale-110 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:shadow-blue-500/20 transition-all duration-300">
            {{ room.room_name.substring(0, 2).toUpperCase() }}
          </div>
          
          <div v-if="room.role === 'pending'" class="bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-200/60 flex items-center gap-1.5 shadow-sm">
            <i class="bi bi-hourglass-split animate-pulse"></i> รออนุมัติ
          </div>
          <div v-else class="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
            <i class="bi bi-arrow-right text-xl -rotate-45 group-hover:rotate-0 transition-transform duration-500"></i>
          </div>
        </div>

        <div class="mt-auto relative z-10">
          <h3 class="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight truncate group-hover:text-blue-900 transition-colors">{{ room.room_name }}</h3>
          <div class="flex items-center gap-3 mt-4">
            <span :class="room.role === 'admin' || room.role === 'teacher' ? 'bg-indigo-50/80 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'" class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm">
              {{ room.role }}
            </span>
            
            <div class="h-4 w-px bg-slate-200"></div>
            
            <!-- ✨ Premium Room Code Badge -->
            <span class="text-xs font-bold text-slate-500 flex items-center gap-2 bg-slate-50/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm uppercase tracking-widest group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">
              <i class="bi bi-key-fill text-slate-400 group-hover:text-blue-500 transition-colors"></i> 
              {{ room.room_code || room.server_id || 'N/A' }}
            </span>
          </div>
        </div>
      </button>
    </div>

    <!-- MODAL: Create Room (Luxurious Version) -->
    <div v-if="showCreateModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" @click="showCreateModal = false"></div>
      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden transform transition-all animate-[modalPop_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        <div class="p-8 md:p-10">
          <div class="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner border border-blue-100/50">
            <i class="bi bi-plus-circle-fill"></i>
          </div>
          <h2 class="text-3xl font-black text-slate-800 mb-2 tracking-tight">สร้าง Workspace</h2>
          <p class="text-sm text-slate-500 mb-8 font-medium leading-relaxed">ตั้งชื่อห้องเรียนของคุณ ระบบจะสร้างรหัสเข้าห้องที่ปลอดภัยให้โดยอัตโนมัติ</p>
          
          <form @submit.prevent="submitCreateRoom" class="space-y-5">
            <div>
              <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">ชื่อห้องเรียน <span class="text-rose-500">*</span></label>
              <input v-model="createForm.room_name" type="text" required class="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-base font-bold rounded-2xl px-5 py-4 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm" placeholder="เช่น ม.4/1 ห้องเรียนพิเศษ">
            </div>
            <div class="flex gap-4 mt-10">
              <button type="button" @click="showCreateModal = false" class="flex-1 px-4 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all">ยกเลิก</button>
              <button type="submit" :disabled="!createForm.room_name" class="flex-1 px-4 py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 transition-all">ยืนยันสร้างห้อง</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL: Join Room (Luxurious Version) -->
    <div v-if="showJoinModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" @click="showJoinModal = false"></div>
      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-[500px] relative z-10 overflow-hidden transform transition-all animate-[modalPop_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        <div class="p-8 md:p-10">
          <div class="w-14 h-14 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner border border-emerald-100/50">
            <i class="bi bi-box-arrow-in-right"></i>
          </div>
          <h2 class="text-3xl font-black text-slate-800 mb-2 tracking-tight">เข้าร่วมห้อง</h2>
          <p class="text-sm text-slate-500 mb-8 font-medium leading-relaxed">กรอกรหัส 6 หลักที่ได้รับจากแอดมิน พร้อมระบุข้อมูลประจำตัวของคุณ</p>
          
          <form @submit.prevent="submitJoinRoom" class="space-y-5">
            <div class="grid grid-cols-2 gap-5">
              <div class="col-span-2 relative">
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">รหัสห้องเรียน 6 หลัก <span class="text-rose-500">*</span></label>
                <div class="absolute right-4 top-[38px] text-slate-300"><i class="bi bi-key-fill text-xl"></i></div>
                <input v-model="joinForm.room_code" type="text" maxlength="6" required class="w-full bg-slate-50/50 border border-slate-200 text-slate-800 font-black tracking-[0.3em] uppercase rounded-2xl px-5 py-4 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm text-center placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-400" placeholder="เช่น AB12CD">
              </div>
              <div class="col-span-2">
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">เลขที่ <span class="text-rose-500">*</span></label>
                <input v-model="joinForm.student_no" type="number" min="1" required class="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-base font-bold rounded-2xl px-5 py-4 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm" placeholder="ระบุเลขที่ของคุณ">
              </div>
              <div>
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">ชื่อจริง <span class="text-rose-500">*</span></label>
                <input v-model="joinForm.first_name" type="text" required class="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-base font-bold rounded-2xl px-5 py-4 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm">
              </div>
              <div>
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">นามสกุล <span class="text-rose-500">*</span></label>
                <input v-model="joinForm.last_name" type="text" required class="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-base font-bold rounded-2xl px-5 py-4 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm">
              </div>
            </div>
            <div class="flex gap-4 mt-10 pt-2">
              <button type="button" @click="showJoinModal = false" class="flex-1 px-4 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all">ยกเลิก</button>
              <button type="submit" class="flex-1 px-4 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/30 transition-all">ส่งคำขอเข้าร่วม</button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@keyframes modalPop {
  0% { opacity: 0; transform: scale(0.95) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
</style>