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
  // แนะนำให้ใช้ Redirect URI เดิม หรือแนบ ?provider=discord ไว้ใน Discord Developer Portal ด้วย
  return `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=${scope}`;
};

/**
 * สร้าง URL สำหรับการ Login ผ่าน Google OAuth2
 */
export const getGoogleAuthUrl = (): string => {
  const scope = encodeURIComponent('openid email profile');
  // แนบ state หรือ provider เพื่อให้ Callback รู้ว่ามาจากไหน (อย่าลืมเพิ่ม Callback URL นี้ใน Google Cloud Console)
  const redirectUri = `${GOOGLE_REDIRECT_URI}?provider=google`; 
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
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