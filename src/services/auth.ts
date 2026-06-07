import api from './api';

// Discord Configs
const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
const DISCORD_REDIRECT_URI = import.meta.env.VITE_DISCORD_REDIRECT_URI;

// Google Configs
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

/**
 * สร้าง URL สำหรับการ Login ผ่าน Discord OAuth2
 */
export const getDiscordAuthUrl = (): string => {
  const scope = encodeURIComponent('identify email');
  // แนะนำให้ใช้ Redirect URI เดิม หรือเพิ่ม &state=discord เข้าไปเพื่อให้ชัดเจนขึ้นก็ได้
  return `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=${scope}&state=discord`;
};

/**
 * สร้าง URL สำหรับการ Login ผ่าน Google OAuth2
 */
export const getGoogleAuthUrl = (): string => {
  const scope = encodeURIComponent('openid email profile');
  
  // 🚨 แก้ไขแล้ว: ใช้ Redirect URI เพียวๆ ห้ามมี ? อะไรต่อท้ายเด็ดขาด!
  const redirectUri = GOOGLE_REDIRECT_URI; 
  
  // 🚨 แก้ไขแล้ว: เอาคำว่า google ไปฝากไว้ใน &state=google แทน
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=google`;
};

/**
 * ส่ง Authorization Code ไปแลก JWT Token จาก Backend (Discord)
 */
export const loginWithDiscord = async (code: string): Promise<{ access_token: string }> => {
  return await api.post('/api/auth/discord/login', { code });
};

/**
 * ส่ง Authorization Code ไปแลก JWT Token จาก Backend (Google)
 */
export const loginWithGoogle = async (code: string): Promise<{ access_token: string }> => {
  return await api.post('/api/auth/google/login', { code });
};