<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { TaskService } from '@/services/task'
import Swal from 'sweetalert2'

const router = useRouter()
const route = useRoute()
const currentServerId = '1500761770468315248'
const currentUserName = 'Web_Admin'
const taskId = Number(route.params.id)

const isLoading = ref(true)
const isSubmitting = ref(false)

const form = reactive({
  task_name: '',
  task_detail: '',
  due_date: ''
})

const fetchTask = async () => {
  try {
    const task = await TaskService.getTaskById(currentServerId, taskId)
    form.task_name = task.task_name
    form.task_detail = task.task_detail
    form.due_date = task.due_date
  } catch (error: any) {
    Swal.fire('Error', error.response?.data?.detail || 'Failed to fetch task', 'error')
    router.push('/tasks')
  } finally {
    isLoading.value = false
  }
}

const handleUpdateTask = async () => {
  if (!form.task_name) return
  isSubmitting.value = true
  try {
    await TaskService.updateTask(currentServerId, taskId, {
      ...form,
      user_name: currentUserName
    })
    await Swal.fire({
      icon: 'success',
      title: 'แก้ไขงานเรียบร้อย!',
      timer: 1500,
      showConfirmButton: false
    })
    router.push('/tasks')
  } catch (error: any) {
    Swal.fire('Error', error.response?.data?.detail || 'Failed to update task', 'error')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchTask)
</script>

<template>
  <div class="container mx-auto p-4 max-w-2xl">
    <div class="card bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
      <div class="bg-blue-600 p-4 text-white">
        <h4 class="text-xl font-bold flex items-center gap-2">
          <i class="bi bi-pencil-square"></i> แก้ไขงาน
        </h4>
      </div>

      <div class="card-body p-8">
        <div v-if="isLoading" class="flex justify-center py-10">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>

        <form v-else @submit.prevent="handleUpdateTask">
          <div class="form-control mb-4">
            <label class="label font-semibold">ชื่องาน</label>
            <input 
              v-model="form.task_name" 
              type="text" 
              class="input input-bordered w-full rounded-xl" 
              required 
            />
          </div>

          <div class="form-control mb-4">
            <label class="label font-semibold">รายละเอียด</label>
            <textarea 
              v-model="form.task_detail" 
              class="textarea textarea-bordered h-32 rounded-xl" 
            ></textarea>
          </div>

          <div class="form-control mb-6">
            <label class="label font-semibold">กำหนดส่ง</label>
            <input 
              v-model="form.due_date" 
              type="date" 
              class="input input-bordered w-full rounded-xl" 
              required 
            />
          </div>

          <div class="flex flex-col gap-3">
            <button 
              type="submit" 
              class="btn btn-primary w-full rounded-xl shadow-md"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="loading loading-spinner"></span>
              บันทึกการแก้ไข
            </button>
            <router-link to="/tasks" class="btn btn-ghost w-full">ยกเลิก</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
