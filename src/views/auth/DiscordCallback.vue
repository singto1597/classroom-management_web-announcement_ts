<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { loginWithDiscord, processAuthSuccess } from '@/services/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const errorMsg = ref<string | null>(null);

onMounted(async () => {
  const code = route.query.code as string;
  
  if (!code) {
    errorMsg.value = 'ไม่พบรหัสยืนยันตัวตนจาก Discord';
    return;
  }

  try {
    const response = await loginWithDiscord(code);
    processAuthSuccess(response.access_token, authStore, router);
  } catch (err: any) {
    console.error('Discord Auth failed:', err);
    errorMsg.value = err.response?.data?.detail || err.message || 'การยืนยันตัวตนกับ Discord ล้มเหลว';
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
          <div class="absolute inset-0 rounded-full border-4 border-[#5865F2] border-t-transparent animate-spin"></div>
          <i class="bi bi-discord absolute inset-0 flex items-center justify-center text-2xl text-[#5865F2]"></i>
        </div>
        <h2 class="text-2xl font-bold text-slate-800 mb-2">กำลังยืนยันตัวตนกับ Discord...</h2>
        <p class="text-slate-500 font-medium">กรุณารอสักครู่ ระบบกำลังเข้าสู่ระบบอย่างปลอดภัย</p>
      </div>

      <div v-else class="animate-in fade-in zoom-in duration-300">
        </div>

    </div>
  </div>
</template>