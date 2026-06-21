<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { StudentService } from '@/services/student';
import Swal from 'sweetalert2';

const router = useRouter();
const authStore = useAuthStore();

// ดึงข้อมูลจาก Store
const userName = computed(() => authStore.currentUserName || 'User');
const role = computed(() => authStore.currentRole || 'Unknown');
const isAdmin = computed(() => authStore.isAdmin);

// หากต้องการให้ผู้ใช้สลับห้อง ให้กลับไปหน้า Select Room (สมมติว่าอยู่ที่ /lobby)
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
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถเข้าถึงโปรไฟล์ได้ (คุณอาจเป็น Admin ที่ไม่ได้อยู่ในรายชื่อนักเรียน)', 'warning');
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50/80 p-4 sm:p-6 md:p-8 pb-20">
    <div class="max-w-7xl mx-auto space-y-5 md:space-y-6">
      
      <!-- 1. HERO SECTION (Greeting Card) -->
      <div class="relative bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-700 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.4)] overflow-hidden group">
        <!-- Abstract Glow Effects -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 transition-transform duration-700 group-hover:scale-110"></div>
        <div class="absolute bottom-0 left-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl translate-y-1/2 transition-transform duration-700 group-hover:scale-110"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div class="text-white">
            <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-2 md:mb-3">สวัสดี, {{ userName }}! 👋</h1>
            <p class="text-blue-100 text-sm md:text-lg font-medium opacity-90">ยินดีต้อนรับสู่ระบบจัดการห้องเรียน</p>
          </div>
          
          <!-- Mobile layout adjustments for status & buttons -->
          <div class="flex items-center justify-between w-full md:w-auto gap-4">
            <div class="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 md:px-6 md:py-2.5 rounded-full flex items-center gap-2.5 shadow-lg">
              <span class="relative flex h-2.5 w-2.5">
                <span :class="isAdmin ? 'bg-emerald-400' : 'bg-blue-400'" class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"></span>
                <span :class="isAdmin ? 'bg-emerald-400' : 'bg-blue-400'" class="relative inline-flex rounded-full h-2.5 w-2.5"></span>
              </span>
              <span class="text-white font-bold text-xs md:text-sm tracking-wider uppercase">
                {{ role }}
              </span>
            </div>
            <button 
              @click="handleChangeRoom"
              class="w-10 h-10 md:w-11 md:h-11 bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-all shadow-lg"
              title="สลับห้องเรียน"
            >
              <i class="bi bi-arrow-left-right text-base md:text-lg"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 2. MAIN MODULES (Tasks & Students) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
        
        <!-- TASKS WIDGET -->
        <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col hover:shadow-xl transition-shadow duration-300">
          <div class="flex items-center gap-3.5 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-blue-100/50">
              <i class="bi bi-journal-check"></i>
            </div>
            <h2 class="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">งานและตารางเรียน</h2>
          </div>
          
          <!-- App-like List Menu -->
          <div class="flex flex-col gap-3 mb-6">
            <router-link to="/tasks" class="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 hover:border-blue-100 active:scale-[0.98] rounded-2xl transition-all border border-slate-100 group">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-lg border border-slate-100 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">📋</div>
                <span class="font-bold text-slate-700 group-hover:text-blue-700">ดูรายการงานทั้งหมด</span>
              </div>
              <i class="bi bi-chevron-right text-slate-400 group-hover:text-blue-500 transition-colors"></i>
            </router-link>
            
            <router-link v-if="isAdmin" to="/tasks/add" class="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 hover:border-blue-100 active:scale-[0.98] rounded-2xl transition-all border border-slate-100 group">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-lg border border-slate-100 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">➕</div>
                <span class="font-bold text-slate-700 group-hover:text-blue-700">เพิ่มงาน / โน้ตใหม่</span>
              </div>
              <i class="bi bi-chevron-right text-slate-400 group-hover:text-blue-500 transition-colors"></i>
            </router-link>
            
            <div v-else class="bg-slate-50/50 rounded-2xl p-4 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm font-medium">
              <i class="bi bi-lock-fill me-2"></i> เฉพาะแอดมินที่เพิ่มงานได้
            </div>
          </div>

          <div class="mt-auto pt-5 border-t border-slate-50">
            <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">การจัดการตาราง</h3>
            <div class="flex flex-wrap gap-2.5">
              <router-link to="/schedules" class="flex-1 md:flex-none text-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-colors active:scale-95">
                ตารางเรียนยืนพื้น
              </router-link>
              <router-link v-if="isAdmin" to="/schedules" class="flex-1 md:flex-none text-center px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm rounded-xl transition-colors border border-rose-100 active:scale-95">
                ข้อยกเว้นฉุกเฉิน
              </router-link>
            </div>
          </div>
        </div>

        <!-- STUDENTS WIDGET -->
        <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col hover:shadow-xl transition-shadow duration-300">
          <div class="flex items-center gap-3.5 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-emerald-100/50">
              <i class="bi bi-people-fill"></i>
            </div>
            <h2 class="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">ฐานข้อมูลนักเรียน</h2>
          </div>
          
          <div class="flex flex-col gap-3 flex-grow">
            <!-- App-like Highlight Card -->
            <router-link to="/students" class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold p-4 rounded-2xl shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-between group">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-lg backdrop-blur-sm">📑</div>
                <span class="text-base">ดูรายชื่อเพื่อนทั้งห้อง</span>
              </div>
              <i class="bi bi-chevron-right opacity-70 group-hover:opacity-100 transition-opacity"></i>
            </router-link>
            
            <button 
              @click="goToMyProfile"
              class="w-full bg-slate-50 hover:bg-blue-50 active:scale-[0.98] text-slate-700 font-bold p-4 rounded-2xl border border-slate-100 hover:border-blue-100 transition-all flex items-center justify-between group text-left"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-lg border border-slate-100 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">🪪</div>
                <span class="group-hover:text-blue-700 transition-colors">ข้อมูลโปรไฟล์ของฉัน</span>
              </div>
              <i class="bi bi-person-badge text-slate-400 group-hover:text-blue-500 transition-colors"></i>
            </button>
            
            <template v-if="isAdmin">
              <router-link to="/students/add" class="w-full bg-slate-50 hover:bg-slate-100 active:scale-[0.98] text-slate-700 font-bold p-4 rounded-2xl border border-slate-100 transition-all flex items-center justify-between group">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-lg border border-slate-100">➕</div>
                  <span>เพิ่มนักเรียนใหม่</span>
                </div>
                <i class="bi bi-person-plus text-slate-400"></i>
              </router-link>
              <button class="text-xs font-bold text-slate-400 hover:text-slate-600 mt-2 transition-colors flex items-center justify-center gap-1.5 py-2 active:scale-95">
                <i class="bi bi-file-earmark-excel"></i> Export เป็น Excel
              </button>
            </template>
          </div>
        </div>

        <!-- 3. FINANCE WIDGET (Digital Wallet Style) -->
        <div class="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 rounded-[2rem] shadow-lg shadow-orange-500/20 hover:shadow-xl transition-shadow group">
          <!-- Glassmorphism overlay -->
          <div class="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
          
          <div class="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div class="flex items-center gap-4 md:gap-6 w-full md:w-auto">
              <div class="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-[1.25rem] flex items-center justify-center text-3xl md:text-4xl shadow-inner border border-white/30 shrink-0">
                💰
              </div>
              <div>
                <h2 class="text-xl md:text-3xl font-black text-amber-950 mb-1 tracking-tight">ระบบการเงินห้อง</h2>
                <p class="text-amber-900/80 font-medium text-xs md:text-sm">จัดการรายรับ-จ่าย, โปรเจกต์เก็บเงิน, และติดตามบิล</p>
              </div>
            </div>
            
            <!-- Mobile 2x2 Grid / Desktop Row -->
            <div class="grid grid-cols-2 md:flex md:flex-wrap md:justify-end gap-2.5 md:gap-3 w-full md:w-auto">
              <router-link to="/finance" class="flex items-center justify-center gap-1.5 px-4 py-3 md:py-3 md:px-6 bg-amber-950 hover:bg-amber-900 active:scale-95 text-amber-100 text-sm md:text-base font-bold rounded-2xl transition-all shadow-sm">
                <i class="bi bi-bar-chart-fill"></i> สรุปยอด
              </router-link>
              <router-link to="/finance/transactions" class="flex items-center justify-center gap-1.5 px-4 py-3 md:py-3 md:px-6 bg-white/90 hover:bg-white active:scale-95 text-amber-950 text-sm md:text-base font-bold rounded-2xl transition-all shadow-sm backdrop-blur-sm">
                <i class="bi bi-receipt-cutoff"></i> ประวัติ
              </router-link>
              <router-link to="/finance/collections" class="flex items-center justify-center gap-1.5 px-4 py-3 md:py-3 md:px-6 bg-white/90 hover:bg-white active:scale-95 text-amber-950 text-sm md:text-base font-bold rounded-2xl transition-all shadow-sm backdrop-blur-sm">
                <i class="bi bi-box-seam-fill"></i> โปรเจกต์
              </router-link>
              <router-link v-if="isAdmin" to="/finance/debtors" class="flex items-center justify-center gap-1.5 px-4 py-3 md:py-3 md:px-6 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-sm md:text-base font-bold rounded-2xl transition-all shadow-md border border-rose-500">
                <i class="bi bi-exclamation-triangle-fill"></i> ทวงหนี้
              </router-link>
            </div>
          </div>
        </div>

        <!-- 4. ROADMAP WIDGET -->
        <div class="lg:col-span-2 group">
          <div class="bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-4 md:gap-6">
              <div class="w-14 h-14 md:w-16 md:h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-inner border border-slate-700 shrink-0">
                🗺️
              </div>
              <div>
                <h2 class="text-lg md:text-2xl font-bold text-white mb-1">Class Roadmap & Committee</h2>
                <p class="text-slate-400 font-medium text-xs md:text-sm">แผนการดำเนินงานของคณะกรรมการห้อง</p>
              </div>
            </div>
            <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-800 flex items-center justify-center text-white group-hover:bg-blue-600 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all shrink-0">
              <i class="bi bi-chevron-right text-lg md:text-xl"></i>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* ลดความแข็งของเส้นขอบ ทำให้ดูคลีนขึ้น */
* {
  -webkit-tap-highlight-color: transparent;
}
</style>