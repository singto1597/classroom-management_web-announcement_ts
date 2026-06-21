import api from './api';
import type { UserRoom } from '@/types/classroom';

export const ClassroomService = {
  async getUserRooms(discordId: string): Promise<UserRoom[]> {
    return await api.get(`/api/classroom/${discordId}/rooms`);
  },
  async createRoom(payload: { room_name: string }): Promise<any> {
    return await api.post('/api/classroom/create', payload);
  },
  async joinRoom(payload: { room_code: string; student_no: number; first_name: string; last_name: string }): Promise<any> {
    return await api.post('/api/classroom/join', payload);
  }
};