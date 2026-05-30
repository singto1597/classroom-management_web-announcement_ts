<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const statusText = ref('กำลังยืนยันตัวตนกับ Discord...');

onMounted(async () => {
  const code = route.query.code as string;

  if (!code) {
    Swal.fire('ข้อผิดพลาด', 'ไม่พบรหัสยืนยันตัวตน', 'error');
    router.push('/login');
    return;
  }

  try {
    // 1. ส่ง Code ไปแลก Token จาก Backend
    const res: any = await api.post(`/api/auth/discord/login?code=${code}`);
    const token = res.access_token;

    // 2. บันทึก Token ลง Store
    authStore.setToken(token);

    // 3. 🚨 แกะกล่อง JWT Token เพื่อดึง discordId (จุดที่แก้บัค!)
    // Token จะมี 3 ส่วนคั่นด้วยจุด (.) ส่วนที่ 2 คือ Payload ที่เก็บข้อมูลไว้
    const payloadBase64 = token.split('.')[1];
    
    // แปลง Base64 ให้เป็น JSON String (รองรับ URL-safe base64)
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    // แปลงเป็น Object
    const decoded = JSON.parse(jsonPayload);

    // 4. ดึง discordId ออกมา (FastAPI ส่วนใหญ่จะใส่ไอดีไว้ในตัวแปร 'sub')
    // เผื่อ Backend ส่งมาตรงๆ นอก Token ด้วย เลยเขียนดักไว้ 2 ทาง
    const discordId = res.discord_id || decoded.sub || decoded.discord_id || decoded.id;
    
    if (discordId) {
      // 5. เซ็ตค่าลง Store ให้เรียบร้อย
      authStore.setDiscordId(discordId);
      
      // 6. พาไปหน้าเลือกห้อง
      router.push('/select-room'); 
    } else {
      throw new Error('ไม่พบข้อมูล Discord ID ใน Token');
    }

  } catch (error: any) {
    console.error('Login Error:', error);
    Swal.fire('เข้าสู่ระบบไม่สำเร็จ', 'การยืนยันตัวตนหมดอายุ หรือมีบางอย่างผิดพลาด', 'error');
    router.push('/login');
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
    <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-6 shadow-sm"></div>
    <h2 class="text-2xl font-bold text-slate-800 tracking-tight">{{ statusText }}</h2>
    <p class="text-slate-500 mt-2 font-medium">กรุณารอสักครู่ ระบบกำลังดึงข้อมูลห้องเรียนของคุณ...</p>
  </div>
</template>