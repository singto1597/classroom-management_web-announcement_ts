<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { TaskService } from '@/services/task'
import Swal from 'sweetalert2'

const router = useRouter()
const currentServerId = '1500761770468315248'
const currentUserName = 'Web_Admin'

const activeTab = ref<'task' | 'note'>('task')
const isSubmitting = ref(false)

const taskForm = reactive({
  task_name: '',
  task_detail: '',
  due_date: new Date().toISOString().split('T')[0]
})

const noteForm = reactive({
  target_date: new Date().toISOString().split('T')[0],
  bring_items: '',
  announcement: ''
})

const handleAddTask = async () => {
  if (!taskForm.task_name) return
  isSubmitting.value = true
  try {
    await TaskService.createTask(currentServerId, {
      ...taskForm,
      user_name: currentUserName
    })
    await Swal.fire({
      icon: 'success',
      title: 'เพิ่มงานเรียบร้อยแล้ว!',
      timer: 1500,
      showConfirmButton: false
    })
    router.push('/tasks')
  } catch (error: any) {
    Swal.fire('Error', error.response?.data?.detail || 'Failed to add task', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleAddNote = async () => {
  if (!noteForm.target_date) return
  isSubmitting.value = true
  try {
    await TaskService.createDailyNote(currentServerId, {
      ...noteForm,
      user_name: currentUserName
    })
    await Swal.fire({
      icon: 'success',
      title: `บันทึกโน้ตสำหรับวันที่ ${noteForm.target_date} เรียบร้อย!`,
      timer: 1500,
      showConfirmButton: false
    })
    router.push('/tasks')
  } catch (error: any) {
    Swal.fire('Error', error.response?.data?.detail || 'Failed to add note', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="container mx-auto p-4 max-w-2xl">
    <div class="card bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
      <div class="flex border-b">
        <button 
          @click="activeTab = 'task'"
          class="flex-1 py-4 text-center font-bold transition-all"
          :class="activeTab === 'task' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'"
        >
          <i class="bi bi-journal-plus me-2"></i> เพิ่มงาน/การบ้าน
        </button>
        <button 
          @click="activeTab = 'note'"
          class="flex-1 py-4 text-center font-bold transition-all"
          :class="activeTab === 'note' ? 'bg-yellow-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'"
        >
          <i class="bi bi-sticky me-2"></i> โน้ตรายวัน/ประกาศ
        </button>
      </div>

      <div class="card-body p-8">
        <!-- Add Task Form -->
        <form v-if="activeTab === 'task'" @submit.prevent="handleAddTask">
          <div class="form-control mb-4">
            <label class="label font-semibold">ชื่องาน</label>
            <input 
              v-model="taskForm.task_name" 
              type="text" 
              class="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-blue-500" 
              placeholder="เช่น การบ้านวิชาคณิตศาสตร์"
              required 
            />
          </div>

          <div class="form-control mb-4">
            <label class="label font-semibold">รายละเอียด</label>
            <textarea 
              v-model="taskForm.task_detail" 
              class="textarea textarea-bordered h-32 rounded-xl focus:ring-2 focus:ring-blue-500" 
              placeholder="รายละเอียดงาน ขั้นตอนการทำ หรือลิงก์ที่เกี่ยวข้อง..."
            ></textarea>
          </div>

          <div class="form-control mb-6">
            <label class="label font-semibold">กำหนดส่ง</label>
            <input 
              v-model="taskForm.due_date" 
              type="date" 
              class="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-blue-500" 
              required 
            />
          </div>

          <div class="flex flex-col gap-3">
            <button 
              type="submit" 
              class="btn btn-primary w-full rounded-xl"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="loading loading-spinner"></span>
              บันทึกงาน
            </button>
            <router-link to="/tasks" class="btn btn-ghost w-full">ยกเลิก</router-link>
          </div>
        </form>

        <!-- Add Note Form -->
        <form v-else @submit.prevent="handleAddNote">
          <div class="form-control mb-4">
            <label class="label font-semibold">วันที่เป้าหมาย</label>
            <input 
              v-model="noteForm.target_date" 
              type="date" 
              class="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-yellow-500 border-yellow-200" 
              required 
            />
          </div>

          <div class="form-control mb-4">
            <label class="label font-semibold">🎒 สิ่งที่ต้องเตรียม</label>
            <input 
              v-model="noteForm.bring_items" 
              type="text" 
              class="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-yellow-500 border-yellow-200" 
              placeholder="เช่น สีไม้, กระดาษ A4 (ถ้าไม่มีใส่ -)"
            />
          </div>

          <div class="form-control mb-6">
            <label class="label font-semibold">📢 ประกาศ</label>
            <textarea 
              v-model="noteForm.announcement" 
              class="textarea textarea-bordered h-32 rounded-xl focus:ring-2 focus:ring-yellow-500 border-yellow-200" 
              placeholder="ประกาศเพิ่มเติมสำหรับวันนี้... (ถ้าไม่มีใส่ -)"
            ></textarea>
          </div>

          <div class="flex flex-col gap-3">
            <button 
              type="submit" 
              class="btn btn-warning w-full rounded-xl text-white"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="loading loading-spinner"></span>
              บันทึกโน้ต
            </button>
            <router-link to="/tasks" class="btn btn-ghost w-full">ยกเลิก</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
