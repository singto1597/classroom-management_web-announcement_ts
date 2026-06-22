<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RouterView, useRouter, useRoute, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Swal from 'sweetalert2';
import { StudentService } from '@/services/student'; 

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isSidebarOpen = ref(false);
const activeDropdown = ref<string | null>(null);

// ✨ โหลดข้อมูลโปรไฟล์ (และสถานะการผูกบัญชี) ถ้ายังไม่มี
onMounted(async () => {
  if (authStore.isAuthenticated && (!authStore.firstName || authStore.firstName === '')) {
    await authStore.fetchProfile();
  }
});

// ✨ ผสมชื่อและนามสกุลให้สวยงาม
const displayName = computed(() => {
  const first = authStore.firstName || '';
  const last = authStore.lastName || '';
  const full = `${first} ${last}`.trim();
  return full || 'ผู้ใช้งานระบบ';
});

// ✨ ดึงตัวอักษรตัวแรกของชื่อมาทำเป็นรูปโปรไฟล์
const avatarChar = computed(() => {
  return authStore.firstName ? authStore.firstName.charAt(0).toUpperCase() : 'U';
});

const toggleDropdown = (dropdownName: string) => {
  activeDropdown.value = activeDropdown.value === dropdownName ? null : dropdownName;
};

const closeDropdowns = () => {
  activeDropdown.value = null;
};

const menuItems = [
  { name: 'หน้าหลัก (เลือกห้อง)', path: '/dashboard', icon: 'bi-grid-fill' },
  { name: 'นักเรียน', path: '/students', icon: 'bi-people-fill' },
  { name: 'งานและโน้ต', path: '/tasks', icon: 'bi-clipboard-check-fill' },
  { name: 'ตารางเรียน', path: '/schedules', icon: 'bi-calendar-event-fill' },
  { name: 'การเงิน', path: '/finance', icon: 'bi-wallet2' },
];

const handleChangeRoom = () => {
  closeDropdowns();
  authStore.clearRoom(); 
  router.push('/lobby'); 
};

const currentSubMenuName = computed(() => {
  if (route.path === '/dashboard' || route.path === '/') return null;
  const matchedMenu = menuItems.find(item => 
    item.path !== '/dashboard' && route.path.startsWith(item.path)
  );
  return matchedMenu ? matchedMenu.name : null;
});

const goToMyProfile = async () => {
  closeDropdowns();
  try {
    Swal.fire({ title: 'กำลังโหลดข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const myProfile: any = await StudentService.getMyProfile(authStore.currentRoomId!);
    Swal.close();
    router.push(`/students/${myProfile.student_no}`);
  } catch (error) {
    Swal.fire({
      icon: 'warning',
      title: 'ไม่สามารถเข้าถึงได้',
      text: 'คุณอาจเป็นผู้ดูแลระบบ (Admin) ที่ไม่มีข้อมูลในรายชื่อนักเรียนห้องนี้',
      customClass: { popup: 'rounded-3xl' }
    });
  }
};

const logout = () => {
  closeDropdowns();
  authStore.logout();
};

// 🌟 ระบบจัดการบัญชี (Smart Link Accounts)
const goToProfileSettings = async () => {
  closeDropdowns();
  
  // โหลดสถานะล่าสุดจาก Backend ก่อนเปิดหน้าต่าง
  Swal.fire({ title: 'กำลังโหลดข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  await authStore.fetchProfile();
  Swal.close();

  const isDiscordLinked = !!authStore.discordId;
  const isGoogleLinked = !!authStore.googleId;

  Swal.fire({
    title: '<i class="bi bi-shield-lock-fill text-3xl text-slate-800"></i><br>จัดการบัญชีและการเชื่อมต่อ',
    html: `
      <div class="text-left mt-4 space-y-4">
        <p class="text-sm text-slate-500 font-medium">เชื่อมต่อแพลตฟอร์มต่างๆ เพื่อรวมข้อมูลของคุณให้เป็นหนึ่งเดียว ป้องกันการสูญหาย</p>
        
        <div class="p-4 rounded-[1.5rem] border ${isGoogleLinked ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-200'} flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-slate-100">
              <i class="bi bi-google text-rose-500 text-lg"></i>
            </div>
            <div>
              <p class="font-bold text-slate-800 leading-tight">Google Account</p>
              <p class="text-[11px] font-bold mt-0.5 ${isGoogleLinked ? 'text-emerald-600' : 'text-slate-400'}">
                ${isGoogleLinked ? '<i class="bi bi-check-circle-fill"></i> เชื่อมต่อแล้ว' : 'ยังไม่ได้เชื่อมต่อ'}
              </p>
            </div>
          </div>
          ${!isGoogleLinked ? `<a href="${import.meta.env.VITE_GOOGLE_AUTH_URL || '#'}" class="px-4 py-2 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-xs font-bold rounded-xl transition-all shadow-sm">ผูกบัญชี</a>` : ''}
        </div>

        <div class="p-4 rounded-[1.5rem] border ${isDiscordLinked ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-200'} flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-slate-100">
              <i class="bi bi-discord text-[#5865F2] text-xl"></i>
            </div>
            <div>
              <p class="font-bold text-slate-800 leading-tight">Discord Account</p>
              <p class="text-[11px] font-bold mt-0.5 ${isDiscordLinked ? 'text-emerald-600' : 'text-slate-400'}">
                ${isDiscordLinked ? '<i class="bi bi-check-circle-fill"></i> เชื่อมต่อแล้ว' : 'ยังไม่ได้เชื่อมต่อ'}
              </p>
            </div>
          </div>
          ${!isDiscordLinked ? `<a href="${import.meta.env.VITE_DISCORD_AUTH_URL || '#'}" class="px-4 py-2 bg-white border border-slate-200 hover:border-[#5865F2] hover:text-[#5865F2] text-xs font-bold rounded-xl transition-all shadow-sm">ผูกบัญชี</a>` : ''}
        </div>
      </div>
    `,
    showConfirmButton: true,
    confirmButtonText: 'ปิดหน้าต่าง',
    confirmButtonColor: '#0f172a',
    customClass: {
      popup: 'rounded-[2.5rem] shadow-2xl border border-slate-100 p-6',
      confirmButton: 'rounded-xl px-8 py-3 font-bold tracking-wide'
    }
  });
};
</script>

<template>
  <div class="flex h-screen bg-[#f1f5f9] overflow-hidden font-sans relative">
    
    <div 
      v-if="activeDropdown" 
      class="fixed inset-0 z-20" 
      @click="closeDropdowns"
    ></div>

    <aside class="hidden md:flex md:flex-shrink-0 relative z-50 m-4 me-0">
      <div class="flex flex-col w-[260px] bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/50 h-full overflow-hidden">
        
        <RouterLink 
          to="/dashboard" 
          class="flex items-center h-24 px-8 bg-slate-900 transition-all duration-300 cursor-pointer shrink-0 group relative overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center me-4 group-hover:scale-110 transition-transform duration-500 border border-white/10 backdrop-blur-md">
            <i class="bi bi-box-fill text-white text-xl"></i>
          </div>
          <span class="text-white text-xl font-black tracking-widest relative z-10">SYNC<span class="font-light opacity-70">ROOM</span></span>
        </RouterLink>

        <div class="flex-1 flex flex-col overflow-y-auto px-4 py-6 space-y-2">
          <RouterLink 
            v-for="item in menuItems" 
            :key="item.path"
            :to="item.path"
            class="flex items-center px-5 py-4 text-sm font-bold rounded-2xl transition-all duration-300 group relative overflow-hidden"
            :class="route.path.startsWith(item.path) && item.path !== '/dashboard' || (route.path === '/dashboard' && item.path === '/dashboard') ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'"
          >
            <i :class="['bi', item.icon, 'text-xl me-4 transition-transform duration-500 group-hover:scale-125', route.path.startsWith(item.path) && item.path !== '/dashboard' || (route.path === '/dashboard' && item.path === '/dashboard') ? 'text-blue-400 scale-110' : 'text-slate-400']"></i>
            <span class="tracking-wide">{{ item.name }}</span>
          </RouterLink>
        </div>

        <div class="p-4 border-t border-slate-100 bg-slate-50/50">
          <div class="flex items-center justify-between p-3 rounded-[1.25rem] hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-md transition-all duration-300 group cursor-pointer relative" @click.stop="toggleDropdown('sidebarSettings')">
            <div class="flex items-center overflow-hidden flex-1">
              <div class="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-black text-sm shrink-0 group-hover:bg-slate-800 group-hover:text-white transition-colors duration-300">
                {{ avatarChar }}
              </div>
              <div class="ms-3 overflow-hidden">
                <p class="text-sm font-bold text-slate-800 truncate leading-none mb-1.5">{{ authStore.firstName || 'User' }}</p>
                <p class="text-[9px] tracking-widest text-slate-400 font-black uppercase truncate leading-none">{{ authStore.currentRole || 'User' }}</p>
              </div>
            </div>
            <i class="bi bi-three-dots-vertical text-slate-400"></i>
            
            <transition name="fade-scale">
              <div v-if="activeDropdown === 'sidebarSettings'" class="absolute bottom-full left-0 mb-4 w-[240px] bg-white rounded-[1.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 py-3 z-50 origin-bottom-left cursor-default" @click.stop>
                <div class="px-5 py-2 mb-2 border-b border-slate-50">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">การจัดการ</p>
                </div>
                <div class="px-2 space-y-1">
                  <button @click="goToMyProfile" class="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"><i class="bi bi-person-badge"></i></div> โปรไฟล์ของฉัน
                  </button>
                  <button @click="goToProfileSettings" class="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"><i class="bi bi-link-45deg"></i></div> จัดการผูกบัญชี
                  </button>
                  <button @click="handleChangeRoom" class="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"><i class="bi bi-arrow-left-right"></i></div> สลับห้องเรียน
                  </button>
                  <div class="h-px bg-slate-100 my-2 mx-2"></div>
                  <button @click="logout" class="w-full text-left px-4 py-3 text-sm font-black text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-400"><i class="bi bi-power"></i></div> ออกจากระบบ
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </aside>

    <Transition name="fade">
      <div 
        v-if="isSidebarOpen" 
        class="fixed inset-0 z-40 md:hidden bg-slate-900/40 backdrop-blur-sm transition-opacity"
        @click="isSidebarOpen = false"
      ></div>
    </Transition>

    <div 
      class="fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) md:hidden shadow-2xl flex flex-col rounded-r-[2rem] overflow-hidden"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex items-center justify-between h-20 px-6 bg-slate-900 shrink-0">
        <RouterLink 
          to="/dashboard" 
          @click="isSidebarOpen = false" 
          class="flex items-center h-16 hover:opacity-80 transition cursor-pointer"
        >
          <span class="text-white text-xl font-black tracking-widest">SYNC<span class="font-light opacity-90">ROOM</span></span>
        </RouterLink>
        <button @click="isSidebarOpen = false" class="w-8 h-8 flex items-center justify-center bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors active:scale-95">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      
      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <RouterLink 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          @click="isSidebarOpen = false"
          class="flex items-center px-4 py-4 text-sm font-bold rounded-2xl transition-all"
          :class="route.path.startsWith(item.path) && item.path !== '/dashboard' || (route.path === '/dashboard' && item.path === '/dashboard') ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-500 hover:bg-slate-50'"
        >
          <i :class="['bi', item.icon, 'text-xl me-4']"></i>
          {{ item.name }}
        </RouterLink>
      </nav>

      <div class="p-5 border-t border-slate-100 shrink-0 space-y-3 bg-slate-50/50">
        <button @click="handleChangeRoom" class="w-full flex items-center justify-center px-4 py-3.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all shadow-sm active:scale-95">
          <i class="bi bi-arrow-left-right me-2 text-slate-400"></i> สลับห้องเรียน
        </button>
        <button @click="logout" class="w-full flex items-center justify-center px-4 py-3.5 text-sm font-black text-white bg-rose-500 hover:bg-rose-600 rounded-2xl transition-all shadow-md shadow-rose-500/30 active:scale-95">
          <i class="bi bi-power me-2"></i> ออกจากระบบ
        </button>
      </div>
    </div>

    <div class="flex flex-col flex-1 overflow-hidden relative z-10">
      
      <header class="flex-shrink-0 bg-transparent z-30 pt-4 px-4 md:px-8">
        <div class="h-16 flex items-center justify-between bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-[1.5rem] px-5">
          
          <div class="flex items-center gap-3">
            <button 
              @click="isSidebarOpen = true" 
              class="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors active:scale-95"
            >
              <i class="bi bi-list text-2xl"></i>
            </button>
            <div class="hidden md:flex items-center bg-slate-100/80 px-4 py-2 rounded-xl border border-slate-200/50 text-sm font-bold text-slate-600 tracking-wide">
              <i class="bi bi-door-open-fill me-2 text-slate-400"></i> {{ authStore.currentRoomName || authStore.currentRoomId }}
            </div>
          </div>

          <div class="flex items-center gap-4">
             <button @click="handleChangeRoom" class="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm rounded-xl text-sm font-bold text-slate-600 transition-all active:scale-95">
               <i class="bi bi-arrow-left-right text-slate-400"></i> สลับห้อง
             </button>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto focus:outline-none scroll-smooth relative z-0">
        <div class="p-4 md:p-8 pt-6">
          <div class="max-w-7xl mx-auto">
            <RouterView v-slot="{ Component, route }">
              <transition name="fade-slide" mode="out-in">
                <div :key="route.path">
                  <component :is="Component" />
                </div>
              </transition>
            </RouterView>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.99);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.99);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>