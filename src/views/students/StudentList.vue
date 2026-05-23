<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { StudentService } from '@/services/student'
import type { Student } from '@/types/student'
import Swal from 'sweetalert2'

// --- Mock Data ---
const currentServerId = 1500761770468315248
const currentUserName = 'singto1597'

// --- State ---
const students = ref<Student[]>([])
const isLoading = ref(true)

// --- Methods ---
const fetchStudents = async () => {
  isLoading.ref = true
  try {
    students.value = await StudentService.getStudents(currentServerId)
  } catch (error: any) {
    console.error('Fetch students error:', error)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: error.response?.data?.detail || 'ไม่สามารถโหลดข้อมูลนักเรียนได้'
    })
  } finally {
    isLoading.value = false
  }
}

const confirmDelete = async (student: Student) => {
  const result = await Swal.fire({
    title: 'ยืนยันการลบ?',
    text: `คุณต้องการลบ ${student.first_name} ${student.last_name} (เลขที่ ${student.student_no}) ใช่หรือไม่?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'ใช่, ลบเลย!',
    cancelButtonText: 'ยกเลิก'
  })

  if (result.isConfirmed) {
    try {
      await StudentService.deleteStudent(currentServerId, student.student_no, currentUserName)
      await Swal.fire('ลบสำเร็จ!', 'ข้อมูลนักเรียนถูกลบออกแล้ว', 'success')
      fetchStudents()
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'ลบไม่สำเร็จ',
        text: error.response?.data?.detail || 'เกิดข้อผิดพลาดในการลบข้อมูล'
      })
    }
  }
}

onMounted(() => {
  fetchStudents()
})
</script>

<template>
  <div class="p-6">
    <!-- Header Section -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        <i class="bi bi-people-fill me-2"></i>รายชื่อนักเรียน
      </h1>
      <button
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all flex items-center"
      >
        <i class="bi bi-person-plus-fill me-2"></i>เพิ่มนักเรียน
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
      ></div>
      <span class="ms-3 text-gray-600">กำลังโหลดข้อมูล...</span>
    </div>

    <!-- Table Section -->
    <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
              <th class="py-3 px-6 font-semibold">เลขที่</th>
              <th class="py-3 px-6 font-semibold">ชื่อ-นามสกุล</th>
              <th class="py-3 px-6 font-semibold">ชื่อเล่น</th>
              <th class="py-3 px-6 font-semibold">บทบาท</th>
              <th class="py-3 px-6 font-semibold text-center">สถานะ</th>
              <th class="py-3 px-6 font-semibold text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm font-light">
            <tr
              v-for="student in students"
              :key="student.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-6 text-center font-medium">
                {{ student.student_no }}
              </td>
              <td class="py-3 px-6">
                {{ student.prefix }}{{ student.first_name }} {{ student.last_name }}
              </td>
              <td class="py-3 px-6">
                {{ student.nickname || '-' }}
              </td>
              <td class="py-3 px-6">
                <span
                  class="px-2 py-1 rounded-md text-xs font-medium"
                  :class="student.class_role === 'student' ? 'bg-gray-100' : 'bg-purple-100 text-purple-700'"
                >
                  {{ student.class_role }}
                </span>
              </td>
              <td class="py-3 px-6 text-center">
                <span
                  v-if="student.status === 'active'"
                  class="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold"
                >
                  Active
                </span>
                <span
                  v-else
                  class="bg-red-100 text-red-700 py-1 px-3 rounded-full text-xs font-bold"
                >
                  Inactive
                </span>
              </td>
              <td class="py-3 px-6 text-center">
                <div class="flex item-center justify-center gap-2">
                  <button
                    class="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                    title="แก้ไข"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    @click="confirmDelete(student)"
                    class="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    title="ลบ"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <!-- Empty State -->
            <tr v-if="students.length === 0">
              <td colspan="6" class="py-10 text-center text-gray-400 italic">
                ไม่พบข้อมูลนักเรียนในห้องนี้
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* สไตล์เพิ่มเติมถ้าจำเป็น (ส่วนใหญ่ใช้ Tailwind) */
</style>
