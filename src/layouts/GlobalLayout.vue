<script setup lang="ts">
import { ref } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Swal from 'sweetalert2';

const authStore = useAuthStore();
const router = useRouter();
const activeDropdown = ref(false);

const toggleDropdown = () => {
  activeDropdown.value = !activeDropdown.value;
};

const closeDropdown = () => {
  activeDropdown.value = false;
};

const logout = () => {
  closeDropdown();
  authStore.logout();
};

const goToProfileSettings = () => {
  closeDropdown();
  Swal.fire('ฟีเจอร์กำลังพัฒนา', 'ตั้งค่าบัญชีแพลตฟอร์มส่วนกลาง', 'info');
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans flex flex-col relative">
    
    <div v-if="activeDropdown" class="fixed inset-0 z-40" @click="closeDropdown"></div>

    <header class="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200/60 supports-[backdrop-filter]:bg-white/40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/lobby')">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <i class="bi bi-layers-fill text-white text-xl"></i>
          </div>
          <span class="text-xl font-black text-slate-800 tracking-tight">SYNC<span class="font-light text-slate-500">PLATFORM</span></span>
        </div>

        <div class="relative">
          <button 
            @click.stop="toggleDropdown"
            class="flex items-center gap-3 p-1.5 pe-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <div class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
              <i class="bi bi-person-fill"></i>
            </div>
            <span class="text-sm font-bold text-slate-700 hidden sm:block">
              {{ authStore.userId || 'User' }}
            </span>
            <i class="bi bi-chevron-down text-[10px] text-slate-400"></i>
          </button>

          <transition 
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-1 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-1 scale-95"
          >
            <div v-if="activeDropdown" class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 origin-top-right">
              <div class="px-4 py-3 border-b border-slate-50 mb-1">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Platform ID</p>
                <p class="text-sm font-bold text-slate-800 truncate">{{ authStore.userId }}</p>
              </div>
              <button @click="goToProfileSettings" class="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-3">
                <i class="bi bi-gear"></i> ตั้งค่าบัญชี
              </button>
              <div class="h-px bg-slate-100 my-1"></div>
              <button @click="logout" class="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-3">
                <i class="bi bi-box-arrow-right"></i> ออกจากระบบ
              </button>
            </div>
          </transition>
        </div>

      </div>
    </header>

    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <RouterView v-slot="{ Component }">
        <transition 
          name="fade-slide" 
          mode="out-in"
          enter-active-class="transition-all duration-400 cubic-bezier(0.2, 0.8, 0.2, 1)"
          leave-active-class="transition-all duration-300 cubic-bezier(0.2, 0.8, 0.2, 1)"
        >
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

  </div>
</template>

<style scoped>
.fade-slide-enter-from { opacity: 0; transform: translateY(15px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-15px); }
</style>