import api from '@/services/api'
import type { Student } from '@/types/student'

export const StudentService = {
  /**
   * ดึงรายชื่อนักเรียนทั้งหมดในห้อง
   */
  async getStudents(serverId: string): Promise<Student[]> {
    return await api.get(`/api/classroom/${serverId}/students`)
  },

  /**
   * ดึงข้อมูลนักเรียนรายคน (ตามเลขที่)
   */
  async getStudentByNo(serverId: string, studentNo: string | number): Promise<Student> {
    // ยิงไปที่ endpoint /search เหมือนระบบ PHP เดิม
    const results = await api.get(`/api/classroom/${serverId}/search`, {
      params: { q: studentNo }
    })
    
    // ถ้าเจอข้อมูล ให้คืนค่าคนแรกใน Array
    if (results && results.length > 0) {
      return results[0]
    }
    
    // ถ้าไม่เจอให้โยน Error
    throw new Error('ไม่พบข้อมูลนักเรียนหมายเลขนี้')
  },

  /**
   * อัปเดตข้อมูลนักเรียน
   */
  async updateStudent(
    serverId: string,
    studentNo: string | number,
    payload: Partial<Student>
  ): Promise<void> {
    await api.patch(`/api/classroom/${serverId}/students/${studentNo}`, payload)
  },

  /**
   * ลบนักเรียน
   */
  async deleteStudent(serverId: string, studentNo: number, userName: string): Promise<void> {
    await api.delete(`/api/classroom/${serverId}/students/${studentNo}`, {
      data: { user_name: userName }
    })
  },

  /**
   * อัปเดตสถานะนักเรียน (เช่น active, inactive)
   */
  async updateStatus(
    serverId: string,
    studentNo: number,
    status: string,
    userName: string
  ): Promise<void> {
    await api.patch(`/api/classroom/${serverId}/students/${studentNo}/status`, {
      status,
      user_name: userName
    })
  },

  /**
   * เพิ่มนักเรียน (คนเดียว)
   */
  async addStudent(serverId: string, payload: any): Promise<void> {
    await api.post(`/api/classroom/${serverId}/students`, payload)
  },

  /**
   * เพิ่มนักเรียน (Bulk)
   */
  async bulkAddStudents(
    serverId: string,
    students: any[],
    userName: string
  ): Promise<void> {
    await api.post(`/api/classroom/${serverId}/students/bulk`, {
      students,
      user_name: userName
    })
  }
}

export default StudentService