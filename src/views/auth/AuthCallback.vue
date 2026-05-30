<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api'; // เราใช้ axios instance ที่ตั้งค่าไว้แล้วเรียกตรงๆ เลยชัวร์กว่า

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
    // 1. 🚀 ยิง API ไปหา Backend โดยส่งเป็น JSON Body (แก้บัค 422)
    const response: any = await api.post('/api/auth/discord/login', { 
      code: code 
    });
    
    const token = response.access_token;

    // 2. บันทึก Token ลง Store
    authStore.setToken(token);
    
    // 3. 📦 ถอดรหัส JWT Token เพื่อเอา discord_id ที่ Backend ซ่อนไว้
    const payloadBase64 = token.split('.')[1];
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);

    // 4. ดึง discord_id ออกมา (ตามที่ auth_service.py สร้างไว้)
    const discordId = decoded.discord_id;

    if (!discordId) {
      throw new Error('โครงสร้าง Token ไม่ถูกต้อง ไม่พบ Discord ID');
    }

    // 5. บันทึก Discord ID ลง Store
    authStore.setDiscordId(discordId);

    // 6. 🎉 ยืนยันตัวตนสำเร็จ! พาไปหน้า "เลือกห้องเรียน"
    router.push('/select-room');

  } catch (err: any) {
    console.error('Auth failed:', err);
    errorMsg.value = err.response?.data?.detail || err.message || 'การยืนยันตัวตนล้มเหลว กรุณาลองใหม่อีกครั้ง';
  }
});

const goBackToLogin = () => {
  router.push('/login');
};
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
        <h2 class="text-2xl font-bold text-slate-800 mb-2">กำลังยืนยันตัวตน...</h2>
        <p class="text-slate-500 font-medium">กรุณารอสักครู่ ระบบกำลังเชื่อมต่อกับ Discord</p>
      </div>

      <div v-else class="animate-in fade-in zoom-in duration-300">
        <div class="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <i class="bi bi-exclamation-triangle-fill text-3xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-slate-800 mb-2">เข้าสู่ระบบไม่สำเร็จ</h2>
        <p class="text-rose-600 font-medium mb-8 bg-rose-50 p-4 rounded-xl border border-rose-100 text-sm">
          {{ errorMsg }}
        </p>
        
        <button 
          @click="goBackToLogin"
          class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
        >
          <i class="bi bi-arrow-left"></i> กลับไปหน้าเข้าสู่ระบบ
        </button>
      </div>

    </div>
  </div>
</template>