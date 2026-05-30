import api from './api';
import type { UserRoom } from '@/types/classroom';

export const ClassroomService = {
  async getUserRooms(discordId: string): Promise<UserRoom[]> {
    return await api.get(`/api/classroom/${discordId}/rooms`);
  }
};
