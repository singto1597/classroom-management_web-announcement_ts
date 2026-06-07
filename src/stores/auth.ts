import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('access_token'));
  const discordId = ref<string | null>(localStorage.getItem('discord_id_str'));
  
  // ✨ แปลงค่าจาก localStorage ให้เป็น Number
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

  const setDiscordId = (id: string | number | null | undefined) => {
    if (id === null || id === undefined) {
      discordId.value = null;
      localStorage.removeItem('discord_id_str');
    } else {
      const idStr = String(id);
      discordId.value = idStr;
      localStorage.setItem('discord_id_str', idStr);
    }
  };

  // ✨ อัปเดตให้รับ roomId เป็น number
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
    currentRoomName,
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