import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  // State: โหลดค่าตั้งต้นจาก localStorage พร้อมตรวจสอบความปลอดภัย
  const token = ref<string | null>(localStorage.getItem('access_token'));
  const discordId = ref<string | null>(localStorage.getItem('discord_id_str'));
  const currentRoomId = ref<string | null>(localStorage.getItem('current_room_id'));
  const currentRoomName = ref<string | null>(localStorage.getItem('current_room_name')); // ✨ เพิ่มประสิทธิภาพการจำชื่อห้อง
  const currentRole = ref<string | null>(localStorage.getItem('current_role'));
  const currentUserName = ref<string | null>(localStorage.getItem('current_user_name'));

  // Getters: ประมวลผลสถานะแบบ Reactive
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => currentRole.value !== 'student' && currentRole.value !== null);

  // Actions: จัดการแก้ไขและบันทึกข้อมูลลง Cache
  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('access_token', newToken);
  };

  const setDiscordId = (id: string | number | null | undefined) => {
    if (id === null || id === undefined) {
      discordId.value = null;
      localStorage.removeItem('discord_id_str');
    } else {
      const idStr = String(id); // แปลงเป็น string เพื่อความชัวร์และเสถียรของข้อมูล
      discordId.value = idStr;
      localStorage.setItem('discord_id_str', idStr);
    }
  };

  // ✨ ปรับปรุงให้รับ roomName และรองรับการตั้งค่า UserName ตั้งแต่ช่วง Login หรือสลับห้อง
  const setRoom = (roomId: string, roomName: string, role: string, userName: string) => {
    currentRoomId.value = roomId;
    currentRoomName.value = roomName;
    currentRole.value = role;
    currentUserName.value = userName;

    localStorage.setItem('current_room_id', roomId);
    localStorage.setItem('current_room_name', roomName);
    localStorage.setItem('current_role', role);
    localStorage.setItem('current_user_name', userName);
  };

  // ✨ อัปเดตฟังก์ชันล้างข้อมูลห้องเรียนให้สะอาดหมดจดเมื่อสลับหน้า
  const clearRoom = () => {
    currentRoomId.value = null;
    currentRoomName.value = null;
    currentRole.value = null;
    currentUserName.value = null;

    localStorage.removeItem('current_room_id');
    localStorage.removeItem('current_room_name');
    localStorage.removeItem('current_role');
    localStorage.removeItem('current_user_name');
  };

  const logout = () => {
    token.value = null;
    discordId.value = null;
    clearRoom();
    localStorage.removeItem('access_token');
    localStorage.removeItem('discord_id_str');
    router.push('/login');
  };

  return {
    token,
    discordId,
    currentRoomId,
    currentRoomName, // ✨ ส่งออกชื่อห้องไปให้ UI เรียกใช้งาน
    currentRole,
    currentUserName,
    isAuthenticated,
    isAdmin,
    setToken,
    setDiscordId,
    setRoom,
    clearRoom,
    logout,
  };
});