import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  // State: โหลดค่าตั้งต้นจาก localStorage
  const token = ref<string | null>(localStorage.getItem('access_token'));
  const discordId = ref<string | null>(localStorage.getItem('discord_id_str'));
  const currentRoomId = ref<string | null>(localStorage.getItem('current_room_id'));
  const currentRole = ref<string | null>(localStorage.getItem('current_role'));
  const currentUserName = ref<string | null>(localStorage.getItem('current_user_name'));

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => currentRole.value !== 'student' && currentRole.value !== null);

  // Actions
  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('access_token', newToken);
  };

  const setDiscordId = (id: string | number | null | undefined) => {
    if (id === null || id === undefined) {
        discordId.value = null;
        localStorage.removeItem('discord_id_str');
    } else {
        const idStr = String(id); // แปลงเป็น string เสมอเพื่อความชัวร์
        discordId.value = idStr;
        localStorage.setItem('discord_id_str', idStr);
    }
  };

  const setRoom = (roomId: string, role: string, userName: string) => {
    currentRoomId.value = roomId;
    currentRole.value = role;
    currentUserName.value = userName;
    localStorage.setItem('current_room_id', roomId);
    localStorage.setItem('current_role', role);
    localStorage.setItem('current_user_name', userName);
  };

  const clearRoom = () => {
    currentRoomId.value = null;
    currentRole.value = null;
    currentUserName.value = null;
    localStorage.removeItem('current_room_id');
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
