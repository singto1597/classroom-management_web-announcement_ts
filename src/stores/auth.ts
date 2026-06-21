import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('access_token'));
  const userId = ref<string | null>(localStorage.getItem('user_id_str'));
  
  // 🌟 State สำหรับเก็บชื่อจริง-นามสกุล
  const firstName = ref<string | null>(localStorage.getItem('user_first_name'));
  const lastName = ref<string | null>(localStorage.getItem('user_last_name'));

  const storedRoomId = localStorage.getItem('current_room_id');
  const currentRoomId = ref<number | null>(storedRoomId ? Number(storedRoomId) : null);
  const currentRoomName = ref<string | null>(localStorage.getItem('current_room_name'));
  const currentRoomCode = ref<string | null>(localStorage.getItem('current_room_code')); 
  const currentRole = ref<string | null>(localStorage.getItem('current_role'));

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => currentRole.value !== 'student' && currentRole.value !== null);

  // 🌟 ฟังก์ชันไปดึงข้อมูล Profile จาก Backend (ใช้ fetch แทน axios)
  const fetchProfile = async () => {
    if (!token.value) return;
    try {
      const response = await fetch(`/api/auth/me`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      
      // เอาชื่อที่ได้จาก DB มาเซ็ตลงตัวแปร
      firstName.value = data.first_name || 'ไม่ระบุชื่อ';
      lastName.value = data.last_name || '';
      
      // เซฟลง LocalStorage กันเหนียวเวลากด F5
      localStorage.setItem('user_first_name', firstName.value!);
      localStorage.setItem('user_last_name', lastName.value!);
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

  const setRoom = (roomId: number, roomName: string, roomCode: string | null | undefined, role: string) => {
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
    firstName.value = null;
    lastName.value = null;
    clearRoom();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id_str');
    localStorage.removeItem('user_first_name');
    localStorage.removeItem('user_last_name');
    router.push('/login');
  };

  return {
    token, userId, firstName, lastName,
    currentRoomId, currentRoomName, currentRoomCode, currentRole,
    isAuthenticated, isAdmin,
    setToken, setUserId, setRoom, clearRoom, logout, fetchProfile
  };
});