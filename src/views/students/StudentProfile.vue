<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import StudentService from '@/services/student'
import type { Student } from '@/types/student'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const studentNo = route.params.no as string
const student = ref<Student | null>(null)
const loading = ref(true)

const isAdmin = computed(() => authStore.user?.role !== 'student')

const currentServerId = '1500761770468315248'
const currentUserName = 'singto1597'

const fetchStudent = async () => {
  try {
    loading.value = true
    //const serverId = authStore.user?.current_server_id
    //if (!serverId) throw new Error('ไม่พบข้อมูลเซิร์ฟเวอร์')
    
    //student.value = await StudentService.getStudentByNo(serverId, studentNo)
    student.value = await StudentService.getStudentByNo(currentServerId, studentNo)
  } catch (error: any) {
    console.error('Error fetching student:', error)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: error.response?.data?.detail || 'ไม่สามารถโหลดข้อมูลนักเรียนได้'
    })
    router.push('/students')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStudent()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="student" class="max-w-4xl mx-auto">
      <!-- Header Actions -->
      <div class="flex justify-between items-center mb-6">
        <button 
          @click="router.push('/students')" 
          class="btn btn-outline btn-sm flex items-center gap-2"
        >
          <i class="bi bi-arrow-left"></i>
          กลับไปหน้ารายชื่อ
        </button>
        
        <RouterLink 
          v-if="isAdmin"
          :to="`/students/${student.student_no}/edit`" 
          class="btn btn-primary btn-sm flex items-center gap-2 shadow-sm"
        >
          <i class="bi bi-pencil"></i>
          แก้ไขข้อมูลคนนี้
        </RouterLink>
      </div>

      <!-- Profile Card -->
      <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <!-- Banner/Header Section -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <span class="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                  {{ student.class_role }}
                </span>
                <span :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm',
                  student.status === 'active' ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'
                ]">
                  {{ student.status === 'active' ? 'กำลังศึกษา' : 'พ้นสภาพ' }}
                </span>
              </div>
              <h1 class="text-3xl md:text-4xl font-bold">
                {{ student.prefix }}{{ student.first_name }} {{ student.last_name }}
              </h1>
              <p class="text-blue-100 mt-1 text-lg">
                ชื่อเล่น: <span class="font-semibold">{{ student.nickname || '-' }}</span>
              </p>
            </div>
            
            <div class="bg-white text-gray-900 px-6 py-4 rounded-2xl shadow-lg text-center min-w-[120px]">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">เลขที่</p>
              <p class="text-4xl font-black text-blue-600">{{ student.student_no }}</p>
            </div>
          </div>
        </div>

        <div class="p-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Left Column: Academic & Health -->
            <div class="space-y-8">
              <!-- Academic Section -->
              <section>
                <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <i class="bi bi-book text-blue-500"></i>
                  วิชาการและหน้าที่
                </h3>
                <div class="bg-gray-50 rounded-2xl p-5 space-y-4">
                  <div class="flex justify-between border-b border-gray-200 pb-2">
                    <span class="text-gray-500">คณะที่ใฝ่ฝัน</span>
                    <span class="font-semibold text-gray-800">{{ student.target_faculty || '-' }}</span>
                  </div>
                  <div class="flex justify-between border-b border-gray-200 pb-2">
                    <span class="text-gray-500">เวรทำความสะอาด</span>
                    <span class="font-semibold text-gray-800">{{ student.cleaning_duty || '-' }}</span>
                  </div>
                </div>
              </section>

              <!-- Health Section -->
              <section>
                <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <i class="bi bi-heart-pulse text-red-500"></i>
                  ข้อมูลสุขภาพ
                </h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-red-50 rounded-2xl p-4 text-center">
                    <p class="text-xs text-red-600 font-bold uppercase mb-1">กรุ๊ปเลือด</p>
                    <p class="text-xl font-bold text-red-800">{{ student.blood_group || '-' }}</p>
                  </div>
                  <div class="bg-blue-50 rounded-2xl p-4 text-center">
                    <p class="text-xs text-blue-600 font-bold uppercase mb-1">ไซส์เสื้อ</p>
                    <p class="text-xl font-bold text-blue-800">{{ student.shirt_size || '-' }}</p>
                  </div>
                </div>
                <div class="mt-4 bg-gray-50 rounded-2xl p-4">
                  <p class="text-xs text-gray-500 font-bold uppercase mb-1">โรคประจำตัว/แพ้อาหาร</p>
                  <p class="text-gray-800 font-medium">{{ student.food_allergy || '-' }}</p>
                </div>
              </section>
            </div>

            <!-- Right Column: Contact -->
            <div class="space-y-8">
              <section>
                <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <i class="bi bi-person-lines-fill text-indigo-500"></i>
                  ข้อมูลการติดต่อ
                </h3>
                <div class="bg-gray-50 rounded-2xl p-5 space-y-4">
                  <div class="flex items-center gap-4">
                    <div class="bg-white p-2 rounded-lg shadow-sm">
                      <i class="bi bi-telephone text-indigo-500"></i>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 font-bold">เบอร์โทรศัพท์</p>
                      <p class="text-gray-800 font-semibold">{{ student.phone_number || '-' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="bg-white p-2 rounded-lg shadow-sm">
                      <i class="bi bi-line text-green-500"></i>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 font-bold">Line ID</p>
                      <p class="text-gray-800 font-semibold">{{ student.line_id || '-' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="bg-white p-2 rounded-lg shadow-sm">
                      <i class="bi bi-instagram text-pink-500"></i>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 font-bold">Instagram</p>
                      <p class="text-gray-800 font-semibold">{{ student.ig_username || '-' }}</p>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Parent Contact -->
              <section>
                <div class="bg-indigo-50 rounded-2xl p-5">
                  <h4 class="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-3">เบอร์ติดต่อฉุกเฉิน / ผู้ปกครอง</h4>
                  <div class="flex justify-between items-center">
                    <span class="text-indigo-600 font-medium">{{ student.phone_number_parent_relation || 'ผู้ปกครอง' }}</span>
                    <span class="text-indigo-900 font-bold text-lg">{{ student.phone_number_parent || '-' }}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <!-- Full Width: Portfolio -->
          <div class="mt-8">
            <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <i class="bi bi-trophy text-yellow-500"></i>
              ผลงานและค่ายวิชาการ
            </h3>
            <div class="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-2xl p-6">
              <p class="text-gray-800 whitespace-pre-line leading-relaxed">
                {{ student.portfolio || 'ยังไม่มีข้อมูลผลงาน' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
