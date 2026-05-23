import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  // State: โหลดค่าตั้งต้นจาก localStorage
  const token = ref<string | null>(localStorage.getItem('access_token'));
  const discordId = ref<string | null>(localStorage.getItem('discord_id'));

  // Getters
  const isAuthenticated = computed(() => !!token.value);

  // Actions
  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('access_token', newToken);
  };

  const setDiscordId = (id: string) => {
    discordId.value = id;
    localStorage.setItem('discord_id', id);
  };

  const logout = () => {
    token.value = null;
    discordId.value = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('discord_id');
    router.push('/login');
  };

  return {
    token,
    discordId,
    isAuthenticated,
    setToken,
    setDiscordId,
    logout,
  };
});
