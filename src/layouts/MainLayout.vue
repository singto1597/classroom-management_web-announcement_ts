<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterView, useRouter, useRoute, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Swal from 'sweetalert2';
import { StudentService } from '@/services/student'; // 🚨 นำเข้า Service เพื่อใช้ดึงโปรไฟล์ตัวเอง

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isSidebarOpen = ref(false);
const activeDropdown = ref<string | null>(null);

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

const showAccountInfo = () => {
  closeDropdowns();
  Swal.fire({
    title: 'ข้อมูลบัญชีระบบ',
    html: `
      <div class="text-left mt-5 space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-inner border border-blue-400 shrink-0">
                ${avatarChar.value}
            </div>
            <div class="overflow-hidden">
                <p class="font-bold text-slate-800 text-lg leading-tight truncate">${displayName.value}</p>
                <p class="text-xs font-semibold text-slate-400 tracking-wider">USER ID: ${authStore.userId}</p>
            </div>
        </div>
        <div class="h-px bg-slate-200/60 my-2"></div>
        <div class="space-y-2.5">
          <p class="text-sm text-slate-600 flex justify-between items-center"><b>ห้องเรียนปัจจุบัน:</b> <span class="font-bold text-slate-800 text-right truncate max-w-[150px]">${authStore.currentRoomName || '-'}</span></p>
          <p class="text-sm text-slate-600 flex justify-between items-center"><b>รหัสเข้าห้อง:</b> <span class="font-mono bg-slate-200/70 px-2 py-1 rounded-md text-slate-700 font-bold text-xs">${authStore.currentRoomCode || '-'}</span></p>
          <p class="text-sm text-slate-600 flex justify-between items-center"><b>บทบาท (Role):</b> <span class="uppercase font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs tracking-wider">${authStore.currentRole || '-'}</span></p>
        </div>
      </div>
    `,
    icon: 'info',
    confirmButtonText: 'ปิดหน้าต่าง',
    confirmButtonColor: '#3b82f6',
    customClass: {
      popup: 'rounded-[2rem] shadow-2xl border border-slate-100',
      confirmButton: 'rounded-xl px-6 py-2.5 font-bold tracking-wide transition-transform active:scale-95'
    }
  });
};

const logout = () => {
  closeDropdowns();
  authStore.logout();
};

const goToMyProfile = async () => {
  closeDropdowns();
  try {
    Swal.fire({ title: 'กำลังโหลดข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    // ใช้ getMyProfile เพื่อหา student_no ของตัวเอง แล้วพาไปหน้าแก้ข้อมูล
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

const goToProfileSettings = () => {
  closeDropdowns(); // 🚨 แก้ตรงนี้แล้วครับ เติม 's' ให้ตรงกับไฟล์นี้
  Swal.fire({
    title: 'ตั้งค่าการผูกบัญชีกลาง',
    html: `
      <div class="text-left mt-4 space-y-4">
        <p class="text-sm text-slate-600 font-medium">จัดการการเชื่อมต่อแพลตฟอร์มต่างๆ เพื่อรวมข้อมูลห้องเรียนของคุณให้เป็นหนึ่งเดียว</p>
        
        <div class="bg-[#5865F2]/5 border border-[#5865F2]/20 p-5 rounded-[1.5rem] relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-[#5865F2]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
          <h4 class="font-black text-[#5865F2] flex items-center gap-2 mb-3 text-lg">
            <i class="bi bi-discord text-2xl"></i> เชื่อมต่อ Discord
          </h4>
          <p class="text-sm text-slate-700 font-medium mb-4 leading-relaxed">
            เข้าไปที่เซิร์ฟเวอร์ Discord ของห้องเรียน<br>
            เลือกช่องแชท <b class="text-slate-900">#bot-commands</b><br>
            พิมพ์คำสั่ง <span class="bg-white px-2.5 py-1 rounded-lg text-[#5865F2] font-mono font-bold shadow-sm border border-slate-100">/sync_me</span> แล้วระบุเลขที่ของคุณ
          </p>
          <div class="text-xs text-emerald-700 font-bold bg-emerald-100/50 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200/50">
            <i class="bi bi-check-circle-fill"></i> ระบบจะดึงข้อมูลมารวมร่างกันอัตโนมัติ!
          </div>
        </div>

        <div class="bg-rose-50/50 border border-rose-100 p-5 rounded-[1.5rem]">
          <h4 class="font-black text-rose-600 flex items-center gap-2 mb-2 text-lg">
            <i class="bi bi-google text-xl"></i> เชื่อมต่อ Google
          </h4>
          <p class="text-sm text-slate-600 font-medium leading-relaxed">
            ระบบทำการ <b class="text-slate-800">ผสานบัญชีอัตโนมัติ (Auto-Merge)</b> ให้เรียบร้อยแล้ว หากคุณใช้อีเมล Google ตรงกับอีเมลในระบบ
          </p>
        </div>
      </div>
    `,
    icon: 'info',
    confirmButtonText: 'รับทราบ',
    confirmButtonColor: '#0f172a',
    customClass: {
      popup: 'rounded-[2.5rem] shadow-2xl border border-slate-100 p-6',
      confirmButton: 'rounded-2xl px-8 py-3.5 font-black tracking-wide transition-all active:scale-95 shadow-lg shadow-slate-900/20'
    }
  });
};
</script>

<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
    
    <div 
      v-if="activeDropdown" 
      class="fixed inset-0 z-20" 
      @click="closeDropdowns"
    ></div>

    <aside class="hidden md:flex md:flex-shrink-0 relative z-50">
      <div class="flex flex-col w-64 bg-white border-r border-slate-200/60 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] h-full">
        <RouterLink 
          to="/dashboard" 
          active-class="_no_effects_"
          exact-active-class="_no_effects_"
          class="flex items-center h-16 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 cursor-pointer shrink-0 shadow-inner group"
        >
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center me-3 group-hover:scale-110 transition-transform duration-300">
            <i class="bi bi-box-fill text-white text-lg drop-shadow-md"></i>
          </div>
          <span class="text-white text-lg font-black tracking-widest drop-shadow-md">SYNC<span class="font-light opacity-90">ROOM</span></span>
        </RouterLink>

        <div class="flex-1 flex flex-col overflow-y-auto">
          <nav class="flex-1 px-4 py-6 space-y-2">
            <RouterLink 
              v-for="item in menuItems" 
              :key="item.path"
              :to="item.path"
              class="flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 group relative overflow-hidden"
              :class="route.path.startsWith(item.path) && item.path !== '/dashboard' || (route.path === '/dashboard' && item.path === '/dashboard') ? 'bg-blue-50/80 text-blue-700 shadow-[0_2px_10px_-4px_rgba(59,130,246,0.5)] border border-blue-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'"
            >
              <div v-if="route.path.startsWith(item.path) && item.path !== '/dashboard' || (route.path === '/dashboard' && item.path === '/dashboard')" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full"></div>
              <i :class="['bi', item.icon, 'text-lg me-4 transition-transform duration-300 group-hover:scale-125', route.path.startsWith(item.path) && item.path !== '/dashboard' || (route.path === '/dashboard' && item.path === '/dashboard') ? 'scale-110 text-blue-600' : 'text-slate-400 group-hover:text-slate-600']"></i>
              {{ item.name }}
            </RouterLink>
          </nav>

          <div class="p-4 border-t border-slate-100 bg-slate-50/50 relative">
            <div class="flex items-center justify-between p-2 rounded-2xl hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-md transition-all duration-300 group">
              <div class="flex items-center overflow-hidden flex-1 cursor-pointer" @click="showAccountInfo">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-black shadow-inner border border-blue-200 shrink-0 group-hover:scale-105 transition-transform duration-300">
                  {{ avatarChar }}
                </div>
                <div class="ms-3 overflow-hidden">
                  <p class="text-sm font-bold text-slate-800 truncate leading-none mb-1.5">{{ displayName }}</p>
                  <p class="text-[10px] tracking-widest text-emerald-600 font-black uppercase truncate leading-none bg-emerald-100/50 inline-block px-1.5 py-0.5 rounded">{{ authStore.currentRole || 'User' }}</p>
                </div>
              </div>
              
              <button 
                @click.stop="toggleDropdown('sidebarSettings')"
                class="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 ms-1"
                :class="{'bg-slate-200 text-slate-800': activeDropdown === 'sidebarSettings'}"
              >
                <i class="bi bi-gear-fill text-lg transition-transform duration-300" :class="{'rotate-90': activeDropdown === 'sidebarSettings'}"></i>
              </button>
            </div>

            <transition name="fade-up">
              <div v-if="activeDropdown === 'sidebarSettings'" class="absolute bottom-full left-4 mb-3 w-56 bg-white rounded-[1.5rem] shadow-xl border border-slate-100 py-2 z-50 transform origin-bottom-left">
                <div class="px-4 py-2 mb-1 border-b border-slate-50">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">จัดการบัญชี</p>
                </div>
                <button @click.stop="goToMyProfile" class="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3">
                  <div class="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><i class="bi bi-person-badge"></i></div> โปรไฟล์ของฉัน
                </button>
                <button @click.stop="goToProfileSettings" class="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"><i class="bi bi-link-45deg text-lg"></i></div> ผูกบัญชีระบบ
                </button>
                <button @click.stop="showAccountInfo" class="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3">
                  <div class="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><i class="bi bi-info-circle"></i></div> ข้อมูลระบบ
                </button>
                <button @click.stop="handleChangeRoom" class="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3">
                  <div class="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><i class="bi bi-arrow-left-right"></i></div> สลับห้องเรียน
                </button>
                <div class="h-px bg-slate-100 my-1"></div>
                <button @click.stop="logout" class="w-full text-left px-4 py-2.5 text-sm font-black text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center gap-3">
                  <div class="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-400"><i class="bi bi-power"></i></div> ออกจากระบบ
                </button>
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
      <div class="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 shrink-0">
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
        <button @click="logout" class="w-full flex items-center justify-center px-4 py-3.5 text-sm font-black text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 rounded-2xl transition-all shadow-md shadow-rose-500/30 active:scale-95">
          <i class="bi bi-power me-2"></i> ออกจากระบบ
        </button>
      </div>
    </div>

    <div class="flex flex-col flex-1 overflow-hidden relative z-10">
      
      <header class="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 z-30 sticky top-0">
        <div class="h-16 md:h-20 flex items-center justify-between px-4 md:px-8">
          
          <div class="flex items-center">
            <button 
              @click="isSidebarOpen = true" 
              class="md:hidden w-10 h-10 me-3 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 active:scale-95"
            >
              <i class="bi bi-list text-2xl"></i>
            </button>
            
            <div class="flex items-center text-sm font-bold text-slate-700 tracking-tight gap-1.5 md:gap-2">
              <template v-if="authStore.currentRoomId">
                <button 
                  @click="handleChangeRoom" 
                  class="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer active:scale-95"
                  title="กลับหน้าเลือกห้อง"
                >
                  <i class="bi bi-house-door-fill text-lg"></i>
                </button>
                
                <div class="relative flex items-center">
                  <button 
                    @click.stop="toggleDropdown('breadcrumbMenu')" 
                    class="flex items-center justify-center w-6 h-6 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer relative z-40"
                  >
                    <i class="bi bi-chevron-right text-[10px] font-black"></i>
                  </button>

                  <transition name="fade-scale">
                    <div v-if="activeDropdown === 'breadcrumbMenu'" class="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 z-50">
                      <p class="px-4 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">นำทางด่วน</p>
                      <RouterLink 
                        v-for="item in menuItems" 
                        :key="item.path"
                        :to="item.path"
                        @click="closeDropdowns"
                        class="flex items-center px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <div class="w-6 flex justify-center"><i :class="['bi', item.icon, 'text-base text-slate-400']"></i></div>
                        <span class="ms-2">{{ item.name }}</span>
                      </RouterLink>
                    </div>
                  </transition>
                </div>
                
                <router-link 
                  to="/dashboard" 
                  class="px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer truncate max-w-[120px] sm:max-w-[200px]"
                  title="หน้าหลักห้องเรียน"
                >
                  {{ authStore.currentRoomName || authStore.currentRoomId }}
                </router-link>
                
                <template v-if="currentSubMenuName">
                  <i class="bi bi-chevron-right text-[10px] font-black text-slate-300 mx-0.5"></i>
                  <span class="text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{{ currentSubMenuName }}</span>
                </template>
              </template>

              <template v-else>
                <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                  <i class="bi bi-house-door-fill text-lg"></i>
                </div>
                <i class="bi bi-chevron-right text-[10px] font-black text-slate-300 mx-2"></i>
                <span>ระบบจัดการห้องเรียน</span>
              </template>
            </div>
          </div>

          <div class="relative">
            <button 
              @click.stop="toggleDropdown('headerSettings')"
              class="flex items-center p-1.5 sm:pe-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-full transition-all duration-300 shadow-sm hover:shadow-md group cursor-pointer focus:outline-none relative z-40 active:scale-95"
              :class="{'ring-4 ring-blue-500/20 border-blue-300': activeDropdown === 'headerSettings'}"
            >
              <div class="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm md:text-base shadow-inner group-hover:scale-105 transition-transform duration-300">
                {{ avatarChar }}
              </div>
              <div class="ms-3 hidden sm:block text-left me-1">
                <p class="text-sm font-bold text-slate-800 leading-none truncate max-w-[120px]">{{ displayName }}</p>
                <p class="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
                  Online
                </p>
              </div>
            </button>

            <transition name="fade-scale">
              <div v-if="activeDropdown === 'headerSettings'" class="absolute top-full right-0 mt-3 w-60 bg-white rounded-[1.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 py-2 z-50 origin-top-right">
                <div class="px-5 py-4 mb-2 border-b border-slate-100 bg-slate-50/50 m-1 rounded-xl">
                  <p class="text-sm font-black text-slate-800 truncate">{{ displayName }}</p>
                  <p class="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1"><i class="bi bi-shield-lock-fill"></i> {{ authStore.currentRole || 'USER' }}</p>
                </div>
                <button @click.stop="goToMyProfile" class="w-full text-left px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3">
                  <div class="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center"><i class="bi bi-person-vcard-fill"></i></div> โปรไฟล์ของฉัน
                </button>
                <button @click.stop="handleChangeRoom" class="w-full text-left px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3">
                  <div class="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center"><i class="bi bi-arrow-left-right"></i></div> สลับห้องเรียน
                </button>
                <div class="h-px bg-slate-100 my-2"></div>
                <button @click.stop="logout" class="w-full text-left px-5 py-2.5 text-sm font-black text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center gap-3">
                  <div class="w-7 h-7 rounded-lg bg-rose-50 text-rose-400 flex items-center justify-center"><i class="bi bi-power"></i></div> ออกจากระบบ
                </button>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto bg-[#f8fafc] focus:outline-none scroll-smooth relative z-0">
        <div class="py-6 md:py-8">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
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
/* 🪄 แอนิเมชันสำหรับ Router View */
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

/* 🪄 แอนิเมชันทั่วไป */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* แอนิเมชันสำหรับเมนู Dropdown แถบ Sidebar ล่าง */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

/* แอนิเมชันสำหรับเมนู Dropdown มุมขวาบน / Breadcrumb */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

/* Custom Scrollbar */
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