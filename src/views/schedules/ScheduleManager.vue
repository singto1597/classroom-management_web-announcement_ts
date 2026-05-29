<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ScheduleService } from '@/services/schedule'
import Swal from 'sweetalert2'

const router = useRouter()
const currentServerId = '1500761770468315248'
const currentUserName = 'singto1597'

const activeTab = ref<'default' | 'override'>('default')
const isSubmitting = ref(false)

const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']

const defaultForm = reactive({
  day_of_week: 'จันทร์',
  attire: '',
  subjects: ''
})

const overrideForm = reactive({
  target_date: new Date().toISOString().split('T')[0],
  new_attire: '',
  note: ''
})

const handleSaveDefault = async () => {
  if (!defaultForm.attire || !defaultForm.subjects) return
  isSubmitting.value = true
  try {
    await ScheduleService.saveDefault(currentServerId, {
      ...defaultForm,
      user_name: currentUserName
    })
    Swal.fire({
      icon: 'success',
      title: `บันทึกตารางวัน${defaultForm.day_of_week} เรียบร้อยแล้ว!`,
      timer: 2000,
      showConfirmButton: false
    })
  } catch (error: any) {
    Swal.fire('Error', error.response?.data?.detail || 'Failed to save default schedule', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleSaveOverride = async () => {
  if (!overrideForm.new_attire || !overrideForm.note) return
  isSubmitting.value = true
  try {
    await ScheduleService.saveOverride(currentServerId, {
      ...overrideForm,
      user_name: currentUserName
    })
    Swal.fire({
      icon: 'success',
      title: `ตั้งข้อยกเว้นสำหรับวันที่ ${overrideForm.target_date} เรียบร้อย!`,
      timer: 2000,
      showConfirmButton: false
    })
  } catch (error: any) {
    Swal.fire('Error', error.response?.data?.detail || 'Failed to save override', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="container mx-auto p-4 max-w-2xl">
    <div class="card bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
      <!-- Tabs Header -->
      <div class="flex border-b">
        <button 
          @click="activeTab = 'default'"
          class="flex-1 py-4 text-center font-bold transition-all flex items-center justify-center gap-2"
          :class="activeTab === 'default' ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'"
        >
          <i class="bi bi-calendar-week"></i> ตารางปกติ
        </button>
        <button 
          @click="activeTab = 'override'"
          class="flex-1 py-4 text-center font-bold transition-all flex items-center justify-center gap-2"
          :class="activeTab === 'override' ? 'bg-red-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'"
        >
          <i class="bi bi-exclamation-triangle"></i> ข้อยกเว้นพิเศษ
        </button>
      </div>

      <div class="card-body p-8">
        <!-- Default Schedule Form -->
        <form v-if="activeTab === 'default'" @submit.prevent="handleSaveDefault">
          <h2 class="text-xl font-bold mb-6 text-green-700 flex items-center gap-2">
             ตั้งตารางเรียนยืนพื้น (จันทร์ - ศุกร์)
          </h2>

          <div class="form-control mb-4">
            <label class="label font-semibold">วันในสัปดาห์</label>
            <select v-model="defaultForm.day_of_week" class="select select-bordered w-full rounded-xl">
              <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
            </select>
          </div>

          <div class="form-control mb-4">
            <label class="label font-semibold">👕 ชุดที่ต้องใส่</label>
            <input 
              v-model="defaultForm.attire" 
              type="text" 
              class="input input-bordered w-full rounded-xl" 
              placeholder="เช่น ชุดนักเรียน, ชุดพละ"
              required 
            />
          </div>

          <div class="form-control mb-6">
            <label class="label font-semibold">📚 วิชาเรียน (เรียงตามคาบ)</label>
            <textarea 
              v-model="defaultForm.subjects" 
              class="textarea textarea-bordered h-32 rounded-xl" 
              placeholder="คณิต, ไทย, อังกฤษ, พักกลางวัน, ฟิสิกส์..."
              required
            ></textarea>
          </div>

          <div class="flex flex-col gap-3">
            <button 
              type="submit" 
              class="btn btn-success text-white w-full rounded-xl shadow-md"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="loading loading-spinner"></span>
              บันทึกตารางเรียน
            </button>
            <router-link to="/" class="btn btn-ghost w-full">กลับหน้าหลัก</router-link>
          </div>
        </form>

        <!-- Override Schedule Form -->
        <form v-else @submit.prevent="handleSaveOverride">
          <h2 class="text-xl font-bold mb-6 text-red-700 flex items-center gap-2">
             ตั้งข้อยกเว้นฉุกเฉิน (เปลี่ยนชุด/กิจกรรมพิเศษ)
          </h2>

          <div class="form-control mb-4">
            <label class="label font-semibold">วันที่เกิดการยกเว้น</label>
            <input 
              v-model="overrideForm.target_date" 
              type="date" 
              class="input input-bordered w-full rounded-xl border-red-200" 
              required 
            />
          </div>

          <div class="form-control mb-4">
            <label class="label font-semibold">👕 ชุดใหม่ที่ต้องใส่</label>
            <input 
              v-model="overrideForm.new_attire" 
              type="text" 
              class="input input-bordered w-full rounded-xl border-red-200" 
              placeholder="เช่น ชุดนักเรียน, ชุดพละ"
              required 
            />
          </div>

          <div class="form-control mb-6">
            <label class="label font-semibold">📢 หมายเหตุ / สาเหตุที่เปลี่ยน</label>
            <textarea 
              v-model="overrideForm.note" 
              class="textarea textarea-bordered h-32 rounded-xl border-red-200" 
              placeholder="เช่น มีกิจกรรม...จึงต้องใส่ชุดนักเรียน"
              required
            ></textarea>
          </div>

          <div class="flex flex-col gap-3">
            <button 
              type="submit" 
              class="btn btn-error text-white w-full rounded-xl shadow-md"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="loading loading-spinner"></span>
              บันทึกข้อยกเว้น
            </button>
            <router-link to="/" class="btn btn-ghost w-full">กลับหน้าหลัก</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
