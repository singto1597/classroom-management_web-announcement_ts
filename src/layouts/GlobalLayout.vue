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
  <div class="min-h-screen bg-[#f8fafc] font-sans flex flex-col relative overflow-hidden">
    
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
    <div class="absolute top-40 left-0 w-[400px] h-[400px] bg-indigo-400/5 rounded-full blur-[80px] pointer-events-none -translate-x-1/2"></div>

    <div v-if="activeDropdown" class="fixed inset-0 z-40" @click="closeDropdown"></div>

    <header class="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 supports-[backdrop-filter]:bg-white/40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <div class="flex items-center gap-3 cursor-pointer group" @click="router.push('/lobby')">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <i class="bi bi-layers-fill text-white text-xl"></i>
          </div>
          <span class="text-xl font-black text-slate-800 tracking-tight">SYNC<span class="font-light text-slate-500">PLATFORM</span></span>
        </div>

        <div class="relative">
          <button 
            @click.stop="toggleDropdown"
            class="flex items-center gap-2.5 p-1.5 pe-4 bg-white/50 hover:bg-white border border-slate-200/80 rounded-full transition-all shadow-sm hover:shadow focus:outline-none ring-2 ring-transparent focus:ring-blue-500/20"
          >
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm shadow-inner">
              <i class="bi bi-person-fill"></i>
            </div>
            <span class="text-sm font-bold text-slate-700 hidden sm:block tracking-wide">
              {{ authStore.firstName }}
            </span>
            <i class="bi bi-chevron-down text-[10px] text-slate-400 ms-1 transition-transform duration-300" :class="{ 'rotate-180': activeDropdown }"></i>
          </button>

          <transition 
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-2 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-2 scale-95"
          >
            <div v-if="activeDropdown" class="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 py-2 z-50 origin-top-right">
              <div class="px-5 py-4 border-b border-slate-50 mb-1 bg-slate-50/50 rounded-t-2xl mt(-2)">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Platform ID</p>
                <p class="text-sm font-bold text-slate-800 truncate">{{ authStore.userId }}</p>
              </div>
              <div class="p-1">
                <button @click="goToProfileSettings" class="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors flex items-center gap-3">
                  <i class="bi bi-gear-fill text-slate-400"></i> ตั้งค่าบัญชีกลาง
                </button>
                <div class="h-px bg-slate-100 my-1 mx-4"></div>
                <button @click="logout" class="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-3">
                  <i class="bi bi-box-arrow-right text-rose-400"></i> ออกจากระบบ
                </button>
              </div>
            </div>
          </transition>
        </div>

      </div>
    </header>

    <main class="flex-1 w-full mx-auto relative z-10">
      <RouterView v-slot="{ Component }">
        <transition 
          name="fade-slide" 
          mode="out-in"
          enter-active-class="transition-all duration-500 cubic-bezier(0.2, 0.8, 0.2, 1)"
          leave-active-class="transition-all duration-300 cubic-bezier(0.2, 0.8, 0.2, 1)"
        >
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

  </div>
</template>

<style scoped>
.fade-slide-enter-from { opacity: 0; transform: translateY(20px) scale(0.99); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-20px) scale(0.99); }
</style>