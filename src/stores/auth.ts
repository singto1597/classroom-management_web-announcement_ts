import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import router from '@/router';
import api from '@/services/api'; 

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('access_token'));
  const userId = ref<string | null>(localStorage.getItem('user_id_str'));
  
  const prefix = ref<string | null>(localStorage.getItem('user_prefix'));
  const firstName = ref<string | null>(localStorage.getItem('user_first_name'));
  const lastName = ref<string | null>(localStorage.getItem('user_last_name'));
  const email = ref<string | null>(localStorage.getItem('user_email'));
  const discordId = ref<string | null>(localStorage.getItem('user_discord_id'));
  const googleId = ref<string | null>(localStorage.getItem('user_google_id'));

  const storedRoomId = localStorage.getItem('current_room_id');
  const currentRoomId = ref<number | null>(storedRoomId ? Number(storedRoomId) : null);
  const currentRoomName = ref<string | null>(localStorage.getItem('current_room_name'));
  const currentRoomCode = ref<string | null>(localStorage.getItem('current_room_code')); 
  const currentRole = ref<string | null>(localStorage.getItem('current_role'));

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => currentRole.value !== 'student' && currentRole.value !== null);

  const isOnboarded = computed(() => !!prefix.value && prefix.value.trim() !== '');

  const currentUserName = computed(() => {
    const p = prefix.value || '';
    const f = firstName.value && firstName.value !== 'ไม่ระบุชื่อ' ? firstName.value : '';
    const l = lastName.value || '';
    const full = `${p}${f} ${l}`.trim();
    return full || 'ผู้ใช้งานระบบ';
  });

  const fetchProfile = async () => {
    if (!token.value) return;
    try {
      const data: any = await api.get(`/api/auth/me`);
      
      // 🚨 สำคัญมาก! เติมเส้นเลือดใหญ่: เซฟ ID เสมอ
      if (data.id) setUserId(data.id);
      
      const validFirstName = data.first_name !== 'ไม่ระบุชื่อ' ? data.first_name : '';
      
      prefix.value = data.prefix || '';
      firstName.value = validFirstName || '';
      lastName.value = data.last_name || '';
      email.value = data.email || '';
      discordId.value = data.discord_id ? String(data.discord_id) : null;
      googleId.value = data.google_id ? String(data.google_id) : null;
      
      if (prefix.value) localStorage.setItem('user_prefix', prefix.value);
      else localStorage.removeItem('user_prefix');

      if (firstName.value) localStorage.setItem('user_first_name', firstName.value);
      else localStorage.removeItem('user_first_name');

      if (lastName.value) localStorage.setItem('user_last_name', lastName.value);
      else localStorage.removeItem('user_last_name');

      if (email.value) localStorage.setItem('user_email', email.value);
      if (discordId.value) localStorage.setItem('user_discord_id', discordId.value);
      if (googleId.value) localStorage.setItem('user_google_id', googleId.value);

    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }
  };

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

  const setRoom = (roomId: number, roomName: string, roomCode: string | null | undefined, role: string, userName?: string) => {
    currentRoomId.value = roomId;
    currentRoomName.value = roomName;
    currentRoomCode.value = roomCode || 'N/A';
    currentRole.value = role;

    localStorage.setItem('current_room_id', String(roomId));
    localStorage.setItem('current_room_name', roomName);
    localStorage.setItem('current_room_code', roomCode || 'N/A');
    localStorage.setItem('current_role', role);
  };

  const clearRoom = () => {
    currentRoomId.value = null;
    currentRoomName.value = null;
    currentRoomCode.value = null;
    currentRole.value = null;
    localStorage.removeItem('current_room_id');
    localStorage.removeItem('current_room_name');
    localStorage.removeItem('current_room_code');
    localStorage.removeItem('current_role');
  };

  const logout = () => {
    token.value = null;
    userId.value = null;
    prefix.value = null;
    firstName.value = null;
    lastName.value = null;
    email.value = null;
    discordId.value = null;
    googleId.value = null;
    clearRoom();
    localStorage.clear();
    router.push('/login');
  };

  return {
    token, userId, prefix, firstName, lastName, currentUserName,
    email, discordId, googleId, isOnboarded,
    currentRoomId, currentRoomName, currentRoomCode, currentRole,
    isAuthenticated, isAdmin,
    setToken, setUserId, setRoom, clearRoom, logout, fetchProfile
  };
});