import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('access_token'));
  // ✨ เปลี่ยนจาก discord_id_str เป็น user_id_str เพื่อความกว้างขวาง
  const userId = ref<string | null>(localStorage.getItem('user_id_str'));
  
  const storedRoomId = localStorage.getItem('current_room_id');
  const currentRoomId = ref<number | null>(storedRoomId ? Number(storedRoomId) : null);
  
  const currentRoomName = ref<string | null>(localStorage.getItem('current_room_name'));
  const currentRole = ref<string | null>(localStorage.getItem('current_role'));
  const currentUserName = ref<string | null>(localStorage.getItem('current_user_name'));

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => currentRole.value !== 'student' && currentRole.value !== null);

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('access_token', newToken);
  };

  // ✨ เปลี่ยนชื่อเป็น setUserId
  const setUserId = (id: string | number | null | undefined) => {
    if (id === null || id === undefined) {
      userId.value = null;
      localStorage.removeItem('user_id_str');
    } else {
      const idStr = String(id);
      userId.value = idStr;
      localStorage.setItem('user_id_str', idStr);
    }
  };

  const setRoom = (roomId: number, roomName: string, role: string, userName: string) => {
    currentRoomId.value = roomId;
    currentRoomName.value = roomName;
    currentRole.value = role;
    currentUserName.value = userName;

    localStorage.setItem('current_room_id', String(roomId));
    localStorage.setItem('current_room_name', roomName);
    localStorage.setItem('current_role', role);
    localStorage.setItem('current_user_name', userName);
  };

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
    userId.value = null;
    clearRoom();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id_str');
    router.push('/login');
  };

  return {
    token,
    userId, // ✨ Export ค่า userId ออกไปใช้แทน discordId
    currentRoomId,
    currentRoomName,
    currentRole,
    currentUserName,
    isAuthenticated,
    isAdmin,
    setToken,
    setUserId, // ✨ Export ฟังก์ชันใหม่
    setRoom,
    clearRoom,
    logout,
  };
});