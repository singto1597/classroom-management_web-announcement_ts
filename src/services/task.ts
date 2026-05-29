import api from './api'
import type { Task, TaskCreate, TaskUpdate, DailyNote, DailyNoteCreate } from '@/types/task'

export const TaskService = {
  // --- Task API ---
  async getAllTasks(serverId: string): Promise<Task[]> {
    return await api.get(`/${serverId}/tasks`) as any[]
  },

  async getTaskById(serverId: string, taskId: number): Promise<Task> {
    return await api.get(`/${serverId}/tasks/${taskId}`)
  },

  async createTask(serverId: string, data: TaskCreate): Promise<void> {
    await api.post(`/${serverId}/tasks`, data)
  },

  async updateTask(serverId: string, taskId: number, data: TaskUpdate): Promise<void> {
    await api.put(`/${serverId}/tasks/${taskId}`, data)
  },

  async markDone(serverId: string, taskId: number, userName: string): Promise<void> {
    await api.patch(`/${serverId}/tasks/${taskId}/done`, { user_name: userName })
  },

  async markPending(serverId: string, taskId: number, userName: string): Promise<void> {
    await api.patch(`/${serverId}/tasks/${taskId}/restore`, { user_name: userName })
  },

  async deleteTask(serverId: string, taskId: number, userName: string): Promise<void> {
    await api.delete(`/${serverId}/tasks/${taskId}`, { data: { user_name: userName } })
  },

  // --- Daily Note API ---
  async getDailyNotes(serverId: string): Promise<DailyNote[]> {
    return await api.get(`/${serverId}/notes`) as any[]
  },

  async createDailyNote(serverId: string, data: DailyNoteCreate): Promise<void> {
    await api.post(`/${serverId}/notes`, data)
  }
}
