<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import StudentService from '@/services/student'
import type { Student } from '@/types/student'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const studentNo = route.params.no as string
const loading = ref(true)
const saving = ref(false)

const currentServerId = '1500761770468315248'
const currentUserName = 'singto1597'

const form = ref<Partial<Student>>({
  student_id: '',
  prefix: '',
  first_name: '',
  last_name: '',
  nickname: '',
  blood_group: '',
  shirt_size: '',
  food_allergy: '',
  phone_number: '',
  phone_number_parent: '',
  phone_number_parent_relation: '',
  line_id: '',
  ig_username: '',
  target_faculty: '',
  cleaning_duty: '',
  olympic_camp: '',
  portfolio: '',
  address_house_no: '',
  address_road: '',
  address_sub_district: '',
  address_district: '',
  address_province: '',
  address_post_code: ''
})

const fetchStudent = async () => {
  try {
    loading.value = true
    
    // ✅ 1. รับค่ามาเก็บไว้ในตัวแปร data แทน (ลบ student.value ทิ้งไปเลย)
    const data = await StudentService.getStudentByNo(currentServerId, studentNo)
    
    // Pre-fill form (เฉพาะฟิลด์ที่เรามีใน form)
    Object.keys(form.value).forEach(key => {
      // ✅ 2. ตอนนี้ data มีตัวตนแล้ว เอามาวนลูปใส่ฟอร์มได้เลย
      if (key in data) {
        (form.value as any)[key] = (data as any)[key] || ''
      }
    })
  } catch (error: any) {
    console.error("🔴 สอดแนม Error:", error) // เผื่อพังอีกจะได้กด F12 ดูได้
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถโหลดข้อมูลได้'
    })
    router.push('/students')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  try {
    saving.value = true
    
    // ❌ ลบการดึง authStore ที่ยังไม่มีทิ้งไป
    // const serverId = authStore.user?.current_server_id
    // if (!serverId) throw new Error('ไม่พบข้อมูลเซิร์ฟเวอร์')

    // Clean payload (ลบ whitespace)
    const payload = { ...form.value }
    Object.keys(payload).forEach(key => {
      if (typeof (payload as any)[key] === 'string') {
        (payload as any)[key] = (payload as any)[key].trim() || null
      }
    })

    // ✅ เรียกใช้ API โดยส่ง currentServerId และ currentUserName ที่เรา Mock ไว้ด้านบน
    await StudentService.updateStudent(currentServerId, studentNo, payload, currentUserName)
    
    await Swal.fire({
      icon: 'success',
      title: 'สำเร็จ',
      text: 'อัปเดตข้อมูลเรียบร้อยแล้ว',
      timer: 1500,
      showConfirmButton: false
    })
    
    router.push(`/students/${studentNo}`)
  } catch (error: any) {
    console.error("Save Error:", error) // ใส่ไว้เผื่อสอดแนมใน Console
    Swal.fire({
      icon: 'error',
      title: 'บันทึกไม่สำเร็จ',
      text: error.response?.data?.detail || error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchStudent()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 py-10">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col justify-center items-center h-[60vh] gap-4">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <p class="text-slate-500 font-medium animate-pulse">กำลังโหลดข้อมูลโปรไฟล์...</p>
      </div>

      <!-- Form Content -->
      <form v-else @submit.prevent="handleSubmit" class="max-w-5xl mx-auto space-y-8">
        
        <!-- Header Section -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <div class="p-2 bg-primary/10 rounded-lg text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <h2 class="text-2xl font-bold text-slate-800">แก้ไขข้อมูลโปรไฟล์</h2>
            </div>
            <p class="text-slate-500 text-sm ml-11">รหัสนักเรียน: <span class="font-semibold text-slate-700">#{{ studentNo }}</span> • อัปเดตข้อมูลของคุณให้เป็นปัจจุบัน</p>
          </div>
          <div class="flex gap-3 w-full md:w-auto ml-11 md:ml-0">
            <button 
              type="button" 
              @click="router.back()" 
              class="btn btn-ghost hover:bg-slate-100 flex-1 md:flex-none font-medium text-slate-600"
              :disabled="saving"
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              class="btn btn-primary px-8 shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all flex-1 md:flex-none font-medium text-white"
              :disabled="saving"
            >
              <span v-if="saving" class="loading loading-spinner loading-sm"></span>
              <span v-else>💾</span>
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- ข้อมูลส่วนตัวหลัก -->
          <div class="card bg-white shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 rounded-2xl overflow-hidden">
            <div class="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
              <span class="text-xl">🔵</span>
              <h3 class="font-bold text-slate-700 text-lg">ข้อมูลส่วนตัวหลัก</h3>
            </div>
            <div class="p-6 space-y-5">
              <div class="form-control">
                <label class="label pb-1"><span class="label-text font-medium text-slate-600">รหัสนักเรียน</span></label>
                <input v-model="form.student_id" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" />
              </div>
              <div class="grid grid-cols-2 gap-5">
                <div class="form-control">
                  <label class="label pb-1"><span class="label-text font-medium text-slate-600">คำนำหน้า</span></label>
                  <input v-model="form.prefix" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" />
                </div>
                <div class="form-control">
                  <label class="label pb-1"><span class="label-text font-medium text-slate-600">ชื่อเล่น</span></label>
                  <input v-model="form.nickname" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-5">
                <div class="form-control">
                  <label class="label pb-1"><span class="label-text font-medium text-slate-600">ชื่อ</span></label>
                  <input v-model="form.first_name" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" required />
                </div>
                <div class="form-control">
                  <label class="label pb-1"><span class="label-text font-medium text-slate-600">นามสกุล</span></label>
                  <input v-model="form.last_name" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" required />
                </div>
              </div>
            </div>
          </div>

          <!-- ข้อมูลสุขภาพ -->
          <div class="card bg-white shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 rounded-2xl overflow-hidden">
            <div class="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
              <span class="text-xl">🔴</span>
              <h3 class="font-bold text-slate-700 text-lg">ข้อมูลสุขภาพ</h3>
            </div>
            <div class="p-6 space-y-5">
              <div class="grid grid-cols-2 gap-5">
                <div class="form-control">
                  <label class="label pb-1"><span class="label-text font-medium text-slate-600">กรุ๊ปเลือด</span></label>
                  <input v-model="form.blood_group" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" placeholder="A, B, O, AB" />
                </div>
                <div class="form-control">
                  <label class="label pb-1"><span class="label-text font-medium text-slate-600">ไซส์เสื้อ</span></label>
                  <input v-model="form.shirt_size" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" placeholder="S, M, L, XL" />
                </div>
              </div>
              <div class="form-control">
                <label class="label pb-1"><span class="label-text font-medium text-slate-600">โรคประจำตัว / แพ้อาหาร</span></label>
                <input v-model="form.food_allergy" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" placeholder="ไม่มีระบุ 'ไม่มี'" />
              </div>
            </div>
          </div>

          <!-- ข้อมูลการติดต่อ -->
          <div class="card bg-white shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 rounded-2xl overflow-hidden">
            <div class="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
              <span class="text-xl">🟣</span>
              <h3 class="font-bold text-slate-700 text-lg">ข้อมูลการติดต่อ</h3>
            </div>
            <div class="p-6 space-y-5">
              <div class="form-control">
                <label class="label pb-1"><span class="label-text font-medium text-slate-600">เบอร์โทรศัพท์</span></label>
                <input v-model="form.phone_number" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" />
              </div>
              <div class="grid grid-cols-2 gap-5">
                <div class="form-control">
                  <label class="label pb-1"><span class="label-text font-medium text-slate-600">เบอร์ผู้ปกครอง</span></label>
                  <input v-model="form.phone_number_parent" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" />
                </div>
                <div class="form-control">
                  <label class="label pb-1"><span class="label-text font-medium text-slate-600">เกี่ยวข้องเป็น</span></label>
                  <input v-model="form.phone_number_parent_relation" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" placeholder="เช่น บิดา, มารดา" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-5">
                <div class="form-control">
                  <label class="label pb-1"><span class="label-text font-medium text-slate-600">Line ID</span></label>
                  <input v-model="form.line_id" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" />
                </div>
                <div class="form-control">
                  <label class="label pb-1"><span class="label-text font-medium text-slate-600">IG Username</span></label>
                  <input v-model="form.ig_username" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" />
                </div>
              </div>
            </div>
          </div>

          <!-- วิชาการ -->
          <div class="card bg-white shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 rounded-2xl overflow-hidden">
            <div class="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
              <span class="text-xl">📚</span>
              <h3 class="font-bold text-slate-700 text-lg">วิชาการและหน้าที่</h3>
            </div>
            <div class="p-6 space-y-5">
              <div class="grid grid-cols-2 gap-5">
                <div class="form-control">
                  <label class="label pb-1"><span class="label-text font-medium text-slate-600">คณะที่ใฝ่ฝัน</span></label>
                  <input v-model="form.target_faculty" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" />
                </div>
                <div class="form-control">
                  <label class="label pb-1"><span class="label-text font-medium text-slate-600">เวรทำความสะอาด</span></label>
                  <input v-model="form.cleaning_duty" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" placeholder="เช่น วันจันทร์" />
                </div>
              </div>
              <div class="form-control">
                <label class="label pb-1"><span class="label-text font-medium text-slate-600">สอวน. / ค่ายวิชาการ</span></label>
                <textarea v-model="form.olympic_camp" class="textarea textarea-bordered h-28 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white text-base py-3" placeholder="ระบุค่ายวิชาการที่เคยเข้าร่วม..."></textarea>
              </div>
            </div>
          </div>

          <!-- ผลงาน -->
          <div class="lg:col-span-2">
            <div class="card bg-white shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 rounded-2xl overflow-hidden">
              <div class="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
                <span class="text-xl">🏆</span>
                <h3 class="font-bold text-slate-700 text-lg">ผลงาน / รางวัลที่เคยได้รับ</h3>
              </div>
              <div class="p-6">
                <textarea v-model="form.portfolio" class="textarea textarea-bordered w-full h-40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white text-base p-4" placeholder="เล่าผลงานเด่นๆ หรือรางวัลที่ประทับใจของคุณที่นี่..."></textarea>
              </div>
            </div>
          </div>

          <!-- ที่อยู่ -->
          <div class="lg:col-span-2">
            <div class="card bg-white shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 rounded-2xl overflow-hidden mb-8">
              <div class="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
                <span class="text-xl">🏠</span>
                <h3 class="font-bold text-slate-700 text-lg">ข้อมูลที่อยู่ตามทะเบียนบ้าน</h3>
              </div>
              <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div class="form-control">
                    <label class="label pb-1"><span class="label-text font-medium text-slate-600">บ้านเลขที่/หมู่/ซอย</span></label>
                    <input v-model="form.address_house_no" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" />
                  </div>
                  <div class="form-control">
                    <label class="label pb-1"><span class="label-text font-medium text-slate-600">ถนน</span></label>
                    <input v-model="form.address_road" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" />
                  </div>
                  <div class="form-control">
                    <label class="label pb-1"><span class="label-text font-medium text-slate-600">ตำบล / แขวง</span></label>
                    <input v-model="form.address_sub_district" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" />
                  </div>
                  <div class="form-control">
                    <label class="label pb-1"><span class="label-text font-medium text-slate-600">อำเภอ / เขต</span></label>
                    <input v-model="form.address_district" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" />
                  </div>
                  <div class="form-control md:col-span-1 lg:col-span-2">
                    <label class="label pb-1"><span class="label-text font-medium text-slate-600">จังหวัด</span></label>
                    <input v-model="form.address_province" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" />
                  </div>
                  <div class="form-control md:col-span-1 lg:col-span-2">
                    <label class="label pb-1"><span class="label-text font-medium text-slate-600">รหัสไปรษณีย์</span></label>
                    <input v-model="form.address_post_code" type="text" class="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-slate-50 focus:bg-white h-11" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  </div>
</template>