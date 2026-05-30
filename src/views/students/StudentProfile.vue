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

// --- ถอด Mock Data เปลี่ยนมาดึงจาก Store ---
const currentServerId = authStore.currentRoomId!
const isAdmin = computed(() => authStore.isAdmin) // ใช้ getter จาก store โดยตรง

const fetchStudent = async () => {
  try {
    loading.value = true
    if (!currentServerId) throw new Error('ไม่พบข้อมูลเซิร์ฟเวอร์ กรุณาเลือกห้องเรียนก่อน')
    
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
  <div class="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
    <div v-if="loading" class="flex flex-col justify-center items-center h-[60vh] gap-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="text-slate-500 font-medium animate-pulse">กำลังโหลดโปรไฟล์หรูๆ...</p>
    </div>

    <div v-else-if="student" class="max-w-5xl mx-auto space-y-6">
      <div class="flex justify-between items-center px-2">
        <button 
          @click="router.push('/students')" 
          class="group flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <div class="p-2 rounded-full bg-white shadow-sm border border-slate-200 group-hover:shadow transition-all">
            <i class="bi bi-arrow-left"></i>
          </div>
          กลับหน้ารายชื่อ
        </button>
        
        <RouterLink 
          v-if="isAdmin"
          :to="`/students/${student.student_no}/edit`" 
          class="btn bg-slate-900 hover:bg-slate-800 text-white border-none rounded-xl px-6 shadow-lg shadow-slate-900/20 flex items-center gap-2 transition-all font-medium"
        >
          <i class="bi bi-pencil-square"></i>
          แก้ไขโปรไฟล์
        </RouterLink>
      </div>

      <div class="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100">
        
        <div class="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 p-10 md:p-14 text-white overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div class="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <span class="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-blue-100">
                  {{ student.class_role }}
                </span>
                <span :class="[
                  'px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md border',
                  student.status === 'active' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/20 border-rose-500/30 text-rose-300'
                ]">
                  {{ student.status === 'active' ? 'กำลังศึกษา' : 'พ้นสภาพ' }}
                </span>
              </div>
              <div>
                <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
                  {{ student.prefix }}{{ student.first_name }} {{ student.last_name }}
                </h1>
                <p class="text-blue-200/80 text-lg flex items-center gap-2 font-medium">
                  <i class="bi bi-person-badge"></i> รหัสประจำตัว: {{ student.student_id || 'ไม่ระบุ' }}
                  <span class="opacity-50">|</span>
                  <span class="text-white">ชื่อเล่น: {{ student.nickname || '-' }}</span>
                </p>
              </div>
            </div>
            
            <div class="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-6 rounded-3xl text-center min-w-[140px] shadow-2xl flex flex-col items-center justify-center">
              <p class="text-xs font-bold text-blue-200/70 uppercase tracking-widest mb-1">เลขที่</p>
              <p class="text-5xl font-black text-white">{{ student.student_no }}</p>
            </div>
          </div>
        </div>

        <div class="p-10 md:p-14">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            <div class="space-y-10">
              
              <section>
                <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <i class="bi bi-person-lines-fill text-indigo-500"></i> ข้อมูลการติดต่อ
                </h3>
                <div class="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 space-y-5">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-700 border border-slate-100/50">
                      <i class="bi bi-telephone text-lg"></i>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500 font-medium mb-0.5">เบอร์โทรศัพท์</p>
                      <p class="text-slate-800 font-bold text-lg">{{ student.phone_number || '-' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#00B900] border border-slate-100/50">
                      <i class="bi bi-line text-lg"></i>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500 font-medium mb-0.5">Line ID</p>
                      <p class="text-slate-800 font-bold text-lg">{{ student.line_id || '-' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#E1306C] border border-slate-100/50">
                      <i class="bi bi-instagram text-lg"></i>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500 font-medium mb-0.5">Instagram</p>
                      <p class="text-slate-800 font-bold text-lg">{{ student.ig_username || '-' }}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <i class="bi bi-geo-alt-fill text-emerald-500"></i> ที่อยู่ตามทะเบียนบ้าน
                </h3>
                <div class="bg-emerald-50/30 rounded-3xl p-6 border border-emerald-100/50 text-slate-700 leading-relaxed font-medium">
                  {{ student.address_house_no ? `${student.address_house_no} ถ.${student.address_road || '-'} ต.${student.address_sub_district || '-'} อ.${student.address_district || '-'} จ.${student.address_province || '-'} ${student.address_post_code || ''}` : 'ไม่มีข้อมูลที่อยู่' }}
                </div>
              </section>

            </div>

            <div class="space-y-10">
              
              <section>
                <div class="bg-indigo-50/50 rounded-3xl p-8 border border-indigo-100">
                  <div class="flex items-start justify-between">
                    <div>
                      <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">ติดต่อฉุกเฉิน</h4>
                      <p class="text-indigo-900 font-semibold text-lg">{{ student.phone_number_parent_relation || 'ผู้ปกครอง' }}</p>
                    </div>
                    <div class="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                      <i class="bi bi-shield-check text-xl"></i>
                    </div>
                  </div>
                  <div class="mt-4 pt-4 border-t border-indigo-200/50">
                    <p class="text-3xl font-black text-indigo-700 tracking-tight">{{ student.phone_number_parent || '-' }}</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <i class="bi bi-grid-fill text-blue-500"></i> ข้อมูลพื้นฐาน
                </h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-slate-50/50 rounded-3xl p-5 border border-slate-100">
                    <p class="text-xs text-slate-400 font-bold uppercase mb-2">กรุ๊ปเลือด</p>
                    <p class="text-2xl font-black text-rose-600">{{ student.blood_group || '-' }}</p>
                  </div>
                  <div class="bg-slate-50/50 rounded-3xl p-5 border border-slate-100">
                    <p class="text-xs text-slate-400 font-bold uppercase mb-2">ไซส์เสื้อ</p>
                    <p class="text-2xl font-black text-blue-600">{{ student.shirt_size || '-' }}</p>
                  </div>
                  <div class="bg-slate-50/50 rounded-3xl p-5 border border-slate-100 col-span-2">
                    <p class="text-xs text-slate-400 font-bold uppercase mb-1">แพ้อาหาร / โรคประจำตัว</p>
                    <p class="font-medium text-slate-800">{{ student.food_allergy || 'ไม่มี' }}</p>
                  </div>
                  <div class="bg-slate-50/50 rounded-3xl p-5 border border-slate-100 col-span-2">
                    <p class="text-xs text-slate-400 font-bold uppercase mb-1">คณะที่ใฝ่ฝัน</p>
                    <p class="font-medium text-slate-800">{{ student.target_faculty || '-' }}</p>
                  </div>
                </div>
              </section>

            </div>
          </div>

          <div class="mt-12 space-y-8 border-t border-slate-100 pt-12">
            
            <section>
              <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <i class="bi bi-stars text-amber-500"></i> สอวน. และค่ายวิชาการ
              </h3>
              <div class="bg-amber-50/30 rounded-3xl p-8 border border-amber-100 text-slate-700 font-medium whitespace-pre-line leading-relaxed">
                {{ student.olympic_camp || 'ยังไม่มีประวัติการเข้าค่ายวิชาการ' }}
              </div>
            </section>

            <section>
              <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <i class="bi bi-trophy-fill text-orange-500"></i> ผลงานและรางวัล (Portfolio)
              </h3>
              <div class="bg-orange-50/30 rounded-3xl p-8 border border-orange-100 text-slate-700 font-medium whitespace-pre-line leading-relaxed min-h-[150px]">
                {{ student.portfolio || 'ยังไม่มีข้อมูลผลงานหรือรางวัล' }}
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>