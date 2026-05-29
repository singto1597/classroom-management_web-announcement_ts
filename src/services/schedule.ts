import api from './api'
import type { DefaultScheduleCreate, ScheduleOverrideCreate } from '@/types/schedule'

export const ScheduleService = {
  async saveDefault(serverId: string, data: DefaultScheduleCreate): Promise<void> {
    await api.post(`/api/classroom/${serverId}/schedule/default`, data)
  },

  async saveOverride(serverId: string, data: ScheduleOverrideCreate): Promise<void> {
    await api.post(`/api/classroom/${serverId}/schedule/override`, data)
  }
}