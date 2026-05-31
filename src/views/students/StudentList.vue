<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { StudentService } from '@/services/student'
import type { Student } from '@/types/student'
import Swal from 'sweetalert2'

const authStore = useAuthStore()

// --- ถอด Mock Data แล้วใช้จาก Store ---
const currentServerId = authStore.currentRoomId!
const currentUserName = authStore.currentUserName!
const isAdmin = computed(() => authStore.isAdmin)

// --- State ---
const students = ref<Student[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const showInactive = ref(false)

// --- Computed ---
const filteredStudents = computed(() => {
  // 1. กันไว้ก่อน ถ้า students.value ยังเป็น null/undefined/ว่าง
  if (!students.value || students.value.length === 0) return [];

  return students.value.filter((student) => {
    // 2. Filter by status
    if (!showInactive.value && student.status === 'inactive') {
      return false
    }

    // 3. Filter by search query
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return true

    // ใช้ Optional Chaining (?.) และ Nullish Coalescing (|| '') เพื่อกัน Error
    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase()
    const studentNo = student.student_no?.toString() || ''
    const studentId = student.student_id?.toString().toLowerCase() || ''
    const nickname = student.nickname?.toLowerCase() || ''

    return (
      fullName.includes(query) ||
      studentNo.includes(query) ||
      studentId.includes(query) ||
      nickname.includes(query)
    )
  })
})

// --- Methods ---
const fetchStudents = async () => {
  isLoading.value = true
  try {
    const data = await StudentService.getStudents(currentServerId)
    console.log("ข้อมูลที่ได้รับจาก API:", data)
    students.value = Array.isArray(data) ? data : []
  } catch (error: any) {
    console.error('Fetch students error:', error)
    students.value = []
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
  // Guard ดักไว้ฝั่ง Script ด้วย
  if (!isAdmin.value) {
    return Swal.fire('ไม่มีสิทธิ์', 'เฉพาะแอดมินเท่านั้นที่ลบข้อมูลได้', 'error')
  }

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
  <div class="p-4 sm:p-6 md:p-8">
    
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <h1 class="text-xl md:text-2xl font-bold text-gray-800">
        <i class="bi bi-people-fill me-2"></i>รายชื่อนักเรียน
      </h1>
      <RouterLink
        v-if="isAdmin"
        to="/students/add"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center w-full sm:w-auto"
      >
        <i class="bi bi-person-plus-fill me-2"></i>เพิ่มนักเรียน
      </RouterLink>
    </div>

    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
      <div class="relative w-full lg:flex-1">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
          <i class="bi bi-search"></i>
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหาชื่อ, เลขที่, หรือชื่อเล่น..."
          class="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
      
      <div class="flex items-center gap-2 w-full lg:w-auto select-none">
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" v-model="showInactive" class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span class="ms-3 text-sm font-medium text-gray-700">แสดงนักเรียนที่ออกแล้ว (Inactive)</span>
        </label>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
      ></div>
      <span class="ms-3 text-gray-600">กำลังโหลดข้อมูล...</span>
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div class="overflow-x-auto w-full">
        <table class="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr class="bg-gray-50 text-gray-600 uppercase text-xs md:text-sm leading-normal">
              <th class="py-3 px-4 font-semibold text-center w-20">เลขที่</th>
              <th class="py-3 px-4 font-semibold">ชื่อ-นามสกุล</th>
              <th class="py-3 px-4 font-semibold">ชื่อเล่น</th>
              <th class="py-3 px-4 font-semibold">บทบาท</th>
              <th class="py-3 px-4 font-semibold text-center">สถานะ</th>
              <th class="py-3 px-4 font-semibold text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-xs md:text-sm font-light">
            <tr
              v-for="student in filteredStudents"
              :key="student.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              :class="{ 'opacity-60 grayscale-[0.5]': student.status === 'inactive' }"
            >
              <td class="py-3 px-4 text-center font-medium">
                {{ student.student_no }}
              </td>
              <td class="py-3 px-4 font-normal text-gray-800">
                {{ student.prefix }}{{ student.first_name }} {{ student.last_name }}
              </td>
              <td class="py-3 px-4">
                {{ student.nickname || '-' }}
              </td>
              <td class="py-3 px-4">
                <span
                  class="px-2 py-1 rounded-md text-[10px] md:text-xs font-medium"
                  :class="student.class_role === 'student' ? 'bg-gray-100' : 'bg-purple-100 text-purple-700'"
                >
                  {{ student.class_role }}
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <span
                  v-if="student.status === 'active'"
                  class="bg-green-100 text-green-700 py-1 px-2.5 rounded-full text-[10px] md:text-xs font-bold"
                >
                  Active
                </span>
                <span
                  v-else
                  class="bg-red-100 text-red-700 py-1 px-2.5 rounded-full text-[10px] md:text-xs font-bold"
                >
                  Inactive
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <RouterLink
                    :to="`/students/${student.student_no}`"
                    class="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center min-w-[32px] min-h-[32px]"
                    title="ดูโปรไฟล์"
                  >
                    <i class="bi bi-eye"></i>
                  </RouterLink>
                  <template v-if="isAdmin">
                    <RouterLink
                      :to="`/students/${student.student_no}/edit`"
                      class="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors flex items-center justify-center min-w-[32px] min-h-[32px]"
                      title="แก้ไข"
                    >
                      <i class="bi bi-pencil"></i>
                    </RouterLink>
                    <button
                      @click="confirmDelete(student)"
                      class="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center min-w-[32px] min-h-[32px]"
                      title="ลบ"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="filteredStudents.length === 0">
              <td colspan="6" class="py-10 text-center text-gray-400 italic">
                ไม่พบข้อมูลนักเรียนที่ตรงตามเงื่อนไข
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>