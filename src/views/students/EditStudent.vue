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
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="max-w-5xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">✏️ แก้ไขข้อมูลโปรไฟล์ (#{{ studentNo }})</h2>
          <p class="text-gray-500">กรอกข้อมูลที่ต้องการแก้ไขและกดบันทึก</p>
        </div>
        <div class="flex gap-2">
          <button 
            type="button" 
            @click="router.back()" 
            class="btn btn-ghost"
            :disabled="saving"
          >
            ยกเลิก
          </button>
          <button 
            type="submit" 
            class="btn btn-primary px-8 shadow-md"
            :disabled="saving"
          >
            <span v-if="saving" class="loading loading-spinner"></span>
            💾 บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- ข้อมูลส่วนตัวหลัก -->
        <div class="card bg-white shadow-sm border border-gray-100">
          <div class="card-header bg-blue-600 text-white p-4 font-bold rounded-t-2xl">
            🔵 ข้อมูลส่วนตัวหลัก
          </div>
          <div class="card-body p-6 space-y-4">
            <div class="form-control">
              <label class="label"><span class="label-text font-semibold">รหัสนักเรียน</span></label>
              <input v-model="form.student_id" type="text" class="input input-bordered w-full" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold">คำนำหน้า</span></label>
                <input v-model="form.prefix" type="text" class="input input-bordered w-full" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold">ชื่อเล่น</span></label>
                <input v-model="form.nickname" type="text" class="input input-bordered w-full" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold">ชื่อ</span></label>
                <input v-model="form.first_name" type="text" class="input input-bordered w-full" required />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold">นามสกุล</span></label>
                <input v-model="form.last_name" type="text" class="input input-bordered w-full" required />
              </div>
            </div>
          </div>
        </div>

        <!-- ข้อมูลสุขภาพ -->
        <div class="card bg-white shadow-sm border border-gray-100">
          <div class="card-header bg-red-600 text-white p-4 font-bold rounded-t-2xl">
            🔴 ข้อมูลสุขภาพ
          </div>
          <div class="card-body p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold">กรุ๊ปเลือด</span></label>
                <input v-model="form.blood_group" type="text" class="input input-bordered w-full" placeholder="A, B, O, AB" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold">ไซส์เสื้อ</span></label>
                <input v-model="form.shirt_size" type="text" class="input input-bordered w-full" placeholder="S, M, L, XL" />
              </div>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-semibold">โรคประจำตัว/แพ้อาหาร</span></label>
              <input v-model="form.food_allergy" type="text" class="input input-bordered w-full" />
            </div>
          </div>
        </div>

        <!-- ข้อมูลการติดต่อ -->
        <div class="card bg-white shadow-sm border border-gray-100">
          <div class="card-header bg-indigo-600 text-white p-4 font-bold rounded-t-2xl">
            🟣 ข้อมูลการติดต่อ
          </div>
          <div class="card-body p-6 space-y-4">
            <div class="form-control">
              <label class="label"><span class="label-text font-semibold">เบอร์โทรศัพท์</span></label>
              <input v-model="form.phone_number" type="text" class="input input-bordered w-full" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold">เบอร์ผู้ปกครอง</span></label>
                <input v-model="form.phone_number_parent" type="text" class="input input-bordered w-full" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold">เกี่ยวข้องเป็น</span></label>
                <input v-model="form.phone_number_parent_relation" type="text" class="input input-bordered w-full" placeholder="แม่, พ่อ, ป้า" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold">Line ID</span></label>
                <input v-model="form.line_id" type="text" class="input input-bordered w-full" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold">IG Username</span></label>
                <input v-model="form.ig_username" type="text" class="input input-bordered w-full" />
              </div>
            </div>
          </div>
        </div>

        <!-- วิชาการ -->
        <div class="card bg-white shadow-sm border border-gray-100">
          <div class="card-header bg-yellow-600 text-white p-4 font-bold rounded-t-2xl">
            📚 วิชาการและหน้าที่
          </div>
          <div class="card-body p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold">คณะที่ใฝ่ฝัน</span></label>
                <input v-model="form.target_faculty" type="text" class="input input-bordered w-full" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold">เวรทำความสะอาด</span></label>
                <input v-model="form.cleaning_duty" type="text" class="input input-bordered w-full" />
              </div>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-semibold">สอวน. / ค่ายวิชาการ</span></label>
              <textarea v-model="form.olympic_camp" class="textarea textarea-bordered h-20" />
            </div>
          </div>
        </div>

        <!-- ผลงาน -->
        <div class="md:col-span-2">
          <div class="card bg-white shadow-sm border border-gray-100">
            <div class="card-header bg-orange-500 text-white p-4 font-bold rounded-t-2xl">
              🏆 ผลงาน / รางวัลที่เคยได้รับ
            </div>
            <div class="card-body p-6">
              <textarea v-model="form.portfolio" class="textarea textarea-bordered w-full h-32" placeholder="เล่าผลงานเด่นๆ ของคุณที่นี่..." />
            </div>
          </div>
        </div>

        <!-- ที่อยู่ -->
        <div class="md:col-span-2">
          <div class="card bg-white shadow-sm border border-gray-100">
            <div class="card-header bg-gray-600 text-white p-4 font-bold rounded-t-2xl">
              🟤 ข้อมูลที่อยู่ตามทะเบียนบ้าน
            </div>
            <div class="card-body p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold">บ้านเลขที่/หมู่/ซอย</span></label>
                <input v-model="form.address_house_no" type="text" class="input input-bordered w-full" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold">ถนน</span></label>
                <input v-model="form.address_road" type="text" class="input input-bordered w-full" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold">ตำบล</span></label>
                <input v-model="form.address_sub_district" type="text" class="input input-bordered w-full" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold">อำเภอ</span></label>
                <input v-model="form.address_district" type="text" class="input input-bordered w-full" />
              </div>
              <div class="form-control md:col-span-2">
                <label class="label"><span class="label-text font-semibold">จังหวัด</span></label>
                <input v-model="form.address_province" type="text" class="input input-bordered w-full" />
              </div>
              <div class="form-control md:col-span-2">
                <label class="label"><span class="label-text font-semibold">รหัสไปรษณีย์</span></label>
                <input v-model="form.address_post_code" type="text" class="input input-bordered w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
