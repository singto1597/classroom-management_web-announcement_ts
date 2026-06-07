<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { loginWithGoogle, processAuthSuccess } from '@/services/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const errorMsg = ref<string | null>(null);

onMounted(async () => {
  const code = route.query.code as string;
  
  if (!code) {
    errorMsg.value = 'ไม่พบรหัสยืนยันตัวตนจาก Google';
    return;
  }

  try {
    const response = await loginWithGoogle(code);
    processAuthSuccess(response.access_token, authStore, router);
  } catch (err: any) {
    console.error('Google Auth failed:', err);
    errorMsg.value = err.response?.data?.detail || err.message || 'การยืนยันตัวตนกับ Google ล้มเหลว';
  }
});

const goBackToLogin = () => router.push('/login');
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-10 text-center">
      
      <div v-if="!errorMsg">
        <div class="relative w-20 h-20 mx-auto mb-6">
          <div class="absolute inset-0 rounded-full border-4 border-slate-100"></div>
          <div class="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          <i class="bi bi-google absolute inset-0 flex items-center justify-center text-2xl text-blue-500"></i>
        </div>
        <h2 class="text-2xl font-bold text-slate-800 mb-2">กำลังยืนยันตัวตนกับ Google...</h2>
        <p class="text-slate-500 font-medium">กรุณารอสักครู่ ระบบกำลังเข้าสู่ระบบอย่างปลอดภัย</p>
      </div>

      <div v-else class="animate-in fade-in zoom-in duration-300">
        <div class="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <i class="bi bi-exclamation-triangle-fill text-3xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-slate-800 mb-2">เข้าสู่ระบบไม่สำเร็จ</h2>
        <p class="text-rose-600 font-medium mb-8 bg-rose-50 p-4 rounded-xl border border-rose-100 text-sm break-words">
          {{ errorMsg }}
        </p>
        <button @click="goBackToLogin" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2">
          <i class="bi bi-arrow-left"></i> กลับไปหน้าเข้าสู่ระบบ
        </button>
      </div>

    </div>
  </div>
</template>