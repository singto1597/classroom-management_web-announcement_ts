<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { StudentService } from '@/services/student';
import api from '@/services/api'; // สำหรับยิงดึงข้อมูลห้อง
import Swal from 'sweetalert2';

const router = useRouter();
const authStore = useAuthStore();

// ดึงข้อมูลจาก Store
const userName = computed(() => authStore.currentUserName || 'User');
const role = computed(() => authStore.currentRole || 'Unknown');
const isAdmin = computed(() => authStore.isAdmin);

const roomCode = ref<string | null>(null);

onMounted(async () => {
  // พยายามดึง Room Code มาแสดง
  if (authStore.currentRoomId) {
    try {
      // ✨ เติม : any ตรงนี้เพื่อบอก TypeScript ว่าไม่ต้องตรวจ Type อย่างเข้มงวด
      const res: any = await api.get(`/api/classroom/${authStore.currentRoomId}`);
      
      // หาก Backend ส่ง room_code กลับมาในนี้ด้วย จะดึงมาแสดงทันที
      if (res && res.room_code) {
        roomCode.value = res.room_code;
      } else {
        // Fallback หาใน localRooms ถ้ามี
        roomCode.value = 'N/A';
      }
    } catch (error) {
      console.error("Failed to load room details", error);
      roomCode.value = 'N/A';
    }
  }
});

const handleChangeRoom = () => {
  authStore.clearRoom();
  router.push('/lobby'); 
};

const goToMyProfile = async () => {
  try {
    Swal.fire({ title: 'กำลังดึงข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const myProfile: any = await StudentService.getMyProfile(authStore.currentRoomId!);
    Swal.close();
    router.push(`/students/${myProfile.student_no}`);
  } catch (error) {
    Swal.fire({
      icon: 'warning',
      title: 'ข้อผิดพลาด',
      text: 'ไม่สามารถเข้าถึงโปรไฟล์ได้ (คุณอาจเป็น Admin ที่ไม่ได้อยู่ในรายชื่อนักเรียน)',
      customClass: { popup: 'rounded-3xl' }
    });
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] p-4 sm:p-6 md:p-8 pb-24 relative overflow-hidden">
    
    <!-- Subtle Background Elements -->
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

    <div class="max-w-7xl mx-auto space-y-6 md:space-y-8 relative z-10">
      
      <!-- 1. HERO SECTION (Premium Card) -->
      <div class="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-14 shadow-2xl shadow-blue-900/20 overflow-hidden group">
        <!-- Abstract Glow Effects -->
        <div class="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 transition-transform duration-1000 group-hover:scale-110"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 transition-transform duration-1000 group-hover:scale-110"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div class="text-white">
            <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-3 md:mb-4">สวัสดี, {{ userName }}! 👋</h1>
            <p class="text-blue-200 text-base md:text-xl font-medium opacity-90 tracking-wide">ภาพรวมและแดชบอร์ดของห้องเรียน</p>
          </div>
          
          <div class="flex flex-wrap items-center w-full md:w-auto gap-3 md:gap-4">
            
            <!-- ✨ Premium Room Code Badge -->
            <div class="bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2.5 md:py-3 rounded-full flex items-center gap-3 shadow-xl">
              <i class="bi bi-key-fill text-white/70 text-sm"></i>
              <div class="flex flex-col">
                <span class="text-[9px] font-bold text-white/50 uppercase tracking-widest leading-none mb-0.5">Room Code</span>
                <span class="text-white font-black text-sm md:text-base tracking-widest uppercase leading-none">
                  {{ roomCode || 'กำลังโหลด...' }}
                </span>
              </div>
            </div>

            <div class="bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2.5 md:py-3 rounded-full flex items-center gap-3 shadow-xl h-full">
              <span class="relative flex h-2.5 w-2.5">
                <span :class="isAdmin ? 'bg-emerald-400' : 'bg-blue-400'" class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"></span>
                <span :class="isAdmin ? 'bg-emerald-400' : 'bg-blue-400'" class="relative inline-flex rounded-full h-2.5 w-2.5"></span>
              </span>
              <span class="text-white font-black text-xs md:text-sm tracking-widest uppercase leading-none mt-0.5">
                {{ role }}
              </span>
            </div>

            <button 
              @click="handleChangeRoom"
              class="w-11 h-11 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-xl group/btn"
              title="สลับห้องเรียน"
            >
              <i class="bi bi-arrow-left-right text-base md:text-lg group-hover/btn:rotate-180 transition-transform duration-500"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 2. MAIN MODULES (Tasks & Students) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        <!-- TASKS WIDGET -->
        <div class="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 p-7 md:p-10 flex flex-col hover:shadow-xl hover:border-blue-200/60 transition-all duration-500">
          <div class="flex items-center gap-4 mb-8">
            <div class="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-[1.25rem] flex items-center justify-center text-2xl shadow-inner border border-blue-100/50">
              <i class="bi bi-journal-check"></i>
            </div>
            <h2 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">งานและตารางเรียน</h2>
          </div>
          
          <div class="flex flex-col gap-3.5 mb-8">
            <router-link to="/tasks" class="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200/60 active:scale-[0.98] rounded-2xl transition-all border border-slate-100 group">
              <div class="flex items-center gap-4">
                <div class="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center text-lg border border-slate-100 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">📋</div>
                <span class="font-bold text-slate-700 group-hover:text-blue-700 text-base">ดูรายการงานทั้งหมด</span>
              </div>
              <i class="bi bi-chevron-right text-slate-300 group-hover:text-blue-500 transition-colors"></i>
            </router-link>
            
            <router-link v-if="isAdmin" to="/tasks/add" class="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200/60 active:scale-[0.98] rounded-2xl transition-all border border-slate-100 group">
              <div class="flex items-center gap-4">
                <div class="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center text-lg border border-slate-100 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">➕</div>
                <span class="font-bold text-slate-700 group-hover:text-blue-700 text-base">เพิ่มงาน / โน้ตใหม่</span>
              </div>
              <i class="bi bi-chevron-right text-slate-300 group-hover:text-blue-500 transition-colors"></i>
            </router-link>
            
            <div v-else class="bg-slate-50/50 rounded-2xl p-5 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm font-bold">
              <i class="bi bi-lock-fill me-2 text-slate-300"></i> เฉพาะแอดมินที่เพิ่มงานได้
            </div>
          </div>

          <div class="mt-auto pt-6 border-t border-slate-100">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">การจัดการตาราง</h3>
            <div class="flex flex-wrap gap-3">
              <router-link to="/schedules" class="flex-1 md:flex-none text-center px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-colors active:scale-95">
                ตารางเรียนยืนพื้น
              </router-link>
              <router-link v-if="isAdmin" to="/schedules" class="flex-1 md:flex-none text-center px-5 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm rounded-xl transition-colors border border-rose-100 active:scale-95">
                ข้อยกเว้นฉุกเฉิน
              </router-link>
            </div>
          </div>
        </div>

        <!-- STUDENTS WIDGET -->
        <div class="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 p-7 md:p-10 flex flex-col hover:shadow-xl hover:border-emerald-200/60 transition-all duration-500">
          <div class="flex items-center gap-4 mb-8">
            <div class="w-14 h-14 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 rounded-[1.25rem] flex items-center justify-center text-2xl shadow-inner border border-emerald-100/50">
              <i class="bi bi-people-fill"></i>
            </div>
            <h2 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">ฐานข้อมูลนักเรียน</h2>
          </div>
          
          <div class="flex flex-col gap-3.5 flex-grow">
            <!-- App-like Highlight Card -->
            <router-link to="/students" class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold p-4 rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all duration-300 flex items-center justify-between group border border-emerald-400/30">
              <div class="flex items-center gap-4">
                <div class="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-lg backdrop-blur-md border border-white/20">📑</div>
                <span class="text-base tracking-wide">ดูรายชื่อเพื่อนทั้งห้อง</span>
              </div>
              <i class="bi bi-chevron-right opacity-70 group-hover:opacity-100 transition-opacity"></i>
            </router-link>
            
            <button 
              @click="goToMyProfile"
              class="w-full bg-slate-50 hover:bg-blue-50/50 active:scale-[0.98] text-slate-700 font-bold p-4 rounded-2xl border border-slate-100 hover:border-blue-200/60 transition-all duration-300 flex items-center justify-between group text-left"
            >
              <div class="flex items-center gap-4">
                <div class="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center text-lg border border-slate-100 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">🪪</div>
                <span class="group-hover:text-blue-700 transition-colors text-base">ข้อมูลโปรไฟล์ของฉัน</span>
              </div>
              <i class="bi bi-person-badge text-slate-300 group-hover:text-blue-500 transition-colors text-lg"></i>
            </button>
            
            <template v-if="isAdmin">
              <router-link to="/students/add" class="w-full bg-slate-50 hover:bg-slate-100 active:scale-[0.98] text-slate-700 font-bold p-4 rounded-2xl border border-slate-100 transition-all flex items-center justify-between group">
                <div class="flex items-center gap-4">
                  <div class="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center text-lg border border-slate-100">➕</div>
                  <span class="text-base">เพิ่มนักเรียนใหม่</span>
                </div>
                <i class="bi bi-person-plus text-slate-400"></i>
              </router-link>
              <button class="text-[11px] font-black text-slate-400 hover:text-slate-600 mt-3 transition-colors flex items-center justify-center gap-2 py-2 active:scale-95 uppercase tracking-widest">
                <i class="bi bi-file-earmark-excel text-sm"></i> Export Data
              </button>
            </template>
          </div>
        </div>

        <!-- 3. FINANCE WIDGET (Luxury Glassmorphism Style) -->
        <div class="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 rounded-[2.5rem] shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-500 group border border-orange-300/50">
          <div class="absolute inset-0 bg-white/5 backdrop-blur-[2px]"></div>
          <!-- Shine Effect -->
          <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
          
          <div class="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div class="flex items-center gap-5 md:gap-8 w-full md:w-auto">
              <div class="w-20 h-20 md:w-24 md:h-24 bg-white/20 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center text-4xl shadow-inner border border-white/40 shrink-0 group-hover:scale-105 transition-transform duration-500">
                💰
              </div>
              <div>
                <h2 class="text-2xl md:text-4xl font-black text-amber-950 mb-2 tracking-tight">ระบบการเงินห้อง</h2>
                <p class="text-amber-900/80 font-bold text-sm md:text-base">จัดการรายรับ-จ่าย, โปรเจกต์เก็บเงิน, และติดตามบิล</p>
              </div>
            </div>
            
            <div class="grid grid-cols-2 md:flex md:flex-wrap md:justify-end gap-3 md:gap-4 w-full md:w-auto">
              <router-link to="/finance" class="flex items-center justify-center gap-2 px-5 py-4 bg-amber-950 hover:bg-amber-900 active:scale-95 text-amber-100 text-sm md:text-base font-bold rounded-2xl transition-all shadow-lg border border-amber-900/50">
                <i class="bi bi-bar-chart-fill"></i> สรุปยอด
              </router-link>
              <router-link to="/finance/transactions" class="flex items-center justify-center gap-2 px-5 py-4 bg-white/90 hover:bg-white active:scale-95 text-amber-950 text-sm md:text-base font-bold rounded-2xl transition-all shadow-lg backdrop-blur-md">
                <i class="bi bi-receipt-cutoff"></i> ประวัติ
              </router-link>
              <router-link to="/finance/collections" class="flex items-center justify-center gap-2 px-5 py-4 bg-white/90 hover:bg-white active:scale-95 text-amber-950 text-sm md:text-base font-bold rounded-2xl transition-all shadow-lg backdrop-blur-md">
                <i class="bi bi-box-seam-fill"></i> โปรเจกต์
              </router-link>
              <router-link v-if="isAdmin" to="/finance/debtors" class="flex items-center justify-center gap-2 px-5 py-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-sm md:text-base font-bold rounded-2xl transition-all shadow-lg border border-rose-500/50 shadow-rose-900/20">
                <i class="bi bi-exclamation-triangle-fill"></i> ทวงหนี้
              </router-link>
            </div>
          </div>
        </div>

        <!-- 4. ROADMAP WIDGET -->
        <div class="lg:col-span-2 group/roadmap">
          <div class="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer border border-slate-800 flex items-center justify-between relative overflow-hidden">
            <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover/roadmap:scale-150 transition-transform duration-700"></div>
            
            <div class="flex items-center gap-5 md:gap-8 relative z-10">
              <div class="w-16 h-16 md:w-20 md:h-20 bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner border border-slate-700 shrink-0 group-hover/roadmap:scale-105 transition-transform duration-300">
                🗺️
              </div>
              <div>
                <h2 class="text-xl md:text-3xl font-black text-white mb-2 tracking-tight">Class Roadmap & Committee</h2>
                <p class="text-slate-400 font-bold text-sm md:text-base">แผนการดำเนินงานของคณะกรรมการห้อง</p>
              </div>
            </div>
            <div class="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-800 flex items-center justify-center text-white group-hover/roadmap:bg-blue-600 group-hover/roadmap:shadow-lg group-hover/roadmap:shadow-blue-500/40 transition-all duration-300 shrink-0 border border-slate-700 relative z-10">
              <i class="bi bi-arrow-right text-xl md:text-2xl -rotate-45 group-hover/roadmap:rotate-0 transition-transform duration-500"></i>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  -webkit-tap-highlight-color: transparent;
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}
</style>