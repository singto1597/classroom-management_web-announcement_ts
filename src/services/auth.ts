// auth.ts
import api from './api';

// Discord Configs
const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
const DISCORD_REDIRECT_URI = import.meta.env.VITE_DISCORD_REDIRECT_URI;

// Google Configs
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

export const getDiscordAuthUrl = (): string => {
  const scope = encodeURIComponent('identify email');
  return `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=${scope}`;
};

export const getGoogleAuthUrl = (): string => {
  const scope = encodeURIComponent('openid email profile');
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=${scope}`;
};

export const loginWithDiscord = async (code: string): Promise<{ access_token: string }> => {
  return await api.post('/api/auth/discord/login', { code });
};

export const loginWithGoogle = async (code: string): Promise<{ access_token: string }> => {
  return await api.post('/api/auth/google/login', { code });
};

// ✨ เพิ่มฟังก์ชันกลางสำหรับจัดการ Token ที่ได้กลับมา
export const processAuthSuccess = (token: string, authStore: any, router: any) => {
  authStore.setToken(token);
  
  const payloadBase64 = token.split('.')[1];
  const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
  );
  const decoded = JSON.parse(jsonPayload);

  const userId = String(decoded.user_id || decoded.discord_id || decoded.sub);
  if (!userId || userId === 'undefined') {
    throw new Error('โครงสร้าง Token ไม่ถูกต้อง ไม่พบ User ID');
  }

  authStore.setUserId(userId);
  router.push('/select-room');
};