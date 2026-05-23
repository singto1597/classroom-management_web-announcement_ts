import api from './api';

const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_DISCORD_REDIRECT_URI;

/**
 * สร้าง URL สำหรับการ Login ผ่าน Discord OAuth2
 */
export const buildAuthUrl = (): string => {
  const scope = encodeURIComponent('identify');
  return `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scope}`;
};

/**
 * ส่ง Authorization Code ไปแลก JWT Token จาก Backend
 * @param code - Code ที่ได้มาจาก Discord
 */
export const exchangeCodeWithBackend = async (code: string): Promise<{ access_token: string }> => {
  return await api.post('/api/auth/discord/login', { code });
};
