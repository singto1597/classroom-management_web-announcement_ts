import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('access_token'));
  const userId = ref<string | null>(localStorage.getItem('user_id_str'));
  
  const storedRoomId = localStorage.getItem('current_room_id');
  const currentRoomId = ref<number | null>(storedRoomId ? Number(storedRoomId) : null);
  
  const currentRoomName = ref<string | null>(localStorage.getItem('current_room_name'));
  // ✨ เพิ่มตัวแปรเก็บ Room Code
  const currentRoomCode = ref<string | null>(localStorage.getItem('current_room_code')); 
  const currentRole = ref<string | null>(localStorage.getItem('current_role'));
  const currentUserName = ref<string | null>(localStorage.getItem('current_user_name'));

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => currentRole.value !== 'student' && currentRole.value !== null);

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('access_token', newToken);
  };

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

  // ✨ แก้ให้รับพารามิเตอร์ 5 ตัวให้ตรงกับที่ Lobby.vue ส่งมา
  const setRoom = (roomId: number, roomName: string, roomCode: string | null | undefined, role: string, userName: string) => {
    currentRoomId.value = roomId;
    currentRoomName.value = roomName;
    currentRoomCode.value = roomCode || 'N/A';
    currentRole.value = role;
    currentUserName.value = userName;

    localStorage.setItem('current_room_id', String(roomId));
    localStorage.setItem('current_room_name', roomName);
    localStorage.setItem('current_room_code', roomCode || 'N/A');
    localStorage.setItem('current_role', role);
    localStorage.setItem('current_user_name', userName);
  };

  const clearRoom = () => {
    currentRoomId.value = null;
    currentRoomName.value = null;
    currentRoomCode.value = null;
    currentRole.value = null;
    currentUserName.value = null;

    localStorage.removeItem('current_room_id');
    localStorage.removeItem('current_room_name');
    localStorage.removeItem('current_room_code');
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
    token, userId, currentRoomId, currentRoomName, 
    currentRoomCode, // ✨ Export ออกไป
    currentRole, currentUserName, isAuthenticated, isAdmin,
    setToken, setUserId, setRoom, clearRoom, logout,
  };
});