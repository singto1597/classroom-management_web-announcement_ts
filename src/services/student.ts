import api from '@/services/api'
import type { Student } from '@/types/student'

export const StudentService = {
  /**
   * ดึงรายชื่อนักเรียนทั้งหมดในห้อง
   */
  async getStudents(serverId: number): Promise<Student[]> {
    const response = await api.get(`/api/classroom/${serverId}/students`)
    return response.data
  },

  /**
   * ลบนักเรียน (Hard Delete)
   */
  async deleteStudent(serverId: number, studentNo: number, userName: string): Promise<void> {
    await api.delete(`/api/classroom/${serverId}/students/${studentNo}`, {
      data: { user_name: userName }
    })
  },

  /**
   * อัปเดตสถานะนักเรียน (เช่น active, inactive)
   */
  async updateStatus(
    serverId: number,
    studentNo: number,
    status: string,
    userName: string
  ): Promise<void> {
    await api.patch(`/api/classroom/${serverId}/students/${studentNo}/status`, {
      status,
      user_name: userName
    })
  }
}

export default StudentService
