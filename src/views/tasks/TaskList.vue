<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { TaskService } from '@/services/task'
import type { Task, DailyNote } from '@/types/task'
import Swal from 'sweetalert2'

// Mock context (ปล่อยให้ Backend ตรวจสอบสิทธิ์เอง)
const currentServerId = '1500761770468315248'
const currentUserName = 'singto1597'

const tasks = ref<Task[]>([])
const notes = ref<DailyNote[]>([])
const isLoading = ref(true)
const filter = ref<'all' | 'pending' | 'done'>('pending')

// ตั้งค่า Toast สำหรับ SweetAlert ให้แจ้งเตือนแบบสมูท ไม่บล็อกหน้าจอ
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
})

const fetchData = async () => {
  isLoading.value = true
  try {
    // โหลดข้อมูลแบบขนาน ถ้า Note พัง Task ก็ยังทำงานได้
    const [tasksResult, notesResult] = await Promise.allSettled([
      TaskService.getAllTasks(currentServerId),
      TaskService.getDailyNotes(currentServerId)
    ])

    if (tasksResult.status === 'fulfilled') {
      tasks.value = tasksResult.value as Task[]
    } else {
      Toast.fire({ icon: 'error', title: 'ดึงข้อมูลงานไม่สำเร็จ' })
    }

    if (notesResult.status === 'fulfilled') {
      notes.value = notesResult.value as DailyNote[]
    } else {
      notes.value = [] // ปล่อยว่างถ้าดึง Note ไม่ได้
    }
  } finally {
    isLoading.value = false
  }
}

const filteredTasks = computed(() => {
  if (filter.value === 'all') return tasks.value
  return tasks.value.filter(task => task.status === filter.value)
})

const getStatusBadgeClass = (task: Task) => {
  if (task.status === 'done') return 'bg-gray-500 text-white'
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(task.due_date)
  dueDate.setHours(0, 0, 0, 0)
  
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'bg-red-500 text-white'
  if (diffDays === 0 || diffDays === 1) return 'bg-yellow-500 text-black'
  return 'bg-green-500 text-white'
}

const getStatusText = (task: Task) => {
  if (task.status === 'done') return 'ส่งแล้ว 🎉'
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(task.due_date)
  dueDate.setHours(0, 0, 0, 0)
  
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return `เลยกำหนดมา ${Math.abs(diffDays)} วัน!`
  if (diffDays === 0) return 'ส่งวันนี้!'
  if (diffDays === 1) return 'ส่งพรุ่งนี้!'
  return `เหลืออีก ${diffDays} วัน`
}

const toggleStatus = async (task: Task) => {
  try {
    if (task.status === 'pending') {
      await TaskService.markDone(currentServerId, task.id, currentUserName)
      Toast.fire({ icon: 'success', title: '🎉 ยินดีด้วย! งานเสร็จแล้ว' })
    } else {
      await TaskService.markPending(currentServerId, task.id, currentUserName)
      Toast.fire({ icon: 'info', title: '🔄 เปลี่ยนกลับเป็นยังไม่เสร็จ' })
    }
    await fetchData()
  } catch (error: any) {
    // ถ้า Backend ด่ากลับมาว่าไม่มีสิทธิ์ จะโชว์ตรงนี้
    Swal.fire('ข้อผิดพลาด', error.response?.data?.detail || 'ไม่สามารถอัปเดตสถานะได้', 'error')
  }
}

const deleteTask = async (taskId: number) => {
  const result = await Swal.fire({
    title: 'ลบงานนี้ทิ้งเลยไหม?',
    text: "คุณจะไม่สามารถกู้คืนข้อมูลได้!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'ใช่, ลบเลย!',
    cancelButtonText: 'ยกเลิก'
  })

  if (result.isConfirmed) {
    try {
      await TaskService.deleteTask(currentServerId, taskId, currentUserName)
      Toast.fire({ icon: 'success', title: '🗑️ ลบงานเรียบร้อยแล้ว' })
      await fetchData()
    } catch (error: any) {
      // ดักจับ Error จาก Backend เช่น "You don't have permission"
      Swal.fire('ข้อผิดพลาด', error.response?.data?.detail || 'ไม่สามารถลบงานได้', 'error')
    }
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="container mx-auto p-4 max-w-6xl">
    <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <h3 class="text-2xl font-bold flex items-center gap-2">
        <i class="bi bi-clipboard-check text-blue-600"></i> รายการงาน & โน้ต
      </h3>
      
      <div class="join shadow-sm bg-white">
        <button 
          class="btn btn-sm join-item border-gray-200"
          :class="filter === 'pending' ? 'btn-primary' : 'btn-ghost'"
          @click="filter = 'pending'"
        >กำลังทำ</button>
        <button 
          class="btn btn-sm join-item border-gray-200"
          :class="filter === 'done' ? 'btn-success' : 'btn-ghost'"
          @click="filter = 'done'"
        >เสร็จแล้ว</button>
        <button 
          class="btn btn-sm join-item border-gray-200"
          :class="filter === 'all' ? 'btn-neutral' : 'btn-ghost'"
          @click="filter = 'all'"
        >ทั้งหมด</button>
      </div>
    </div>

    <div v-if="notes.length > 0" class="mb-8">
      <h4 class="text-lg font-bold mb-4 flex items-center gap-2 text-yellow-600">
        <i class="bi bi-sticky-fill"></i> โน้ตรายวันล่าสุด
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="note in notes.slice(0, 3)" :key="note.id" class="card bg-yellow-50 border border-yellow-200 shadow-sm">
          <div class="card-body p-4">
            <div class="flex justify-between items-start">
              <span class="text-xs font-bold text-yellow-700 bg-yellow-200 px-2 py-1 rounded">
                📅 {{ note.target_date }}
              </span>
            </div>
            <div class="mt-2">
              <p class="text-sm font-bold text-gray-800">🎒 เตรียม: {{ note.bring_items }}</p>
              <p class="text-sm text-gray-600 mt-1">📢 {{ note.announcement }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center my-20">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <div v-else-if="filteredTasks.length === 0" class="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
      <div class="text-5xl mb-4">🎉</div>
      <p class="text-gray-500 text-lg">ไม่มีงานในหมวดหมู่นี้เลย</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="task in filteredTasks" 
        :key="task.id"
        class="card bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
        :class="{ 'opacity-70 bg-gray-50': task.status === 'done' }"
      >
        <div class="card-body p-5">
          <div class="flex justify-between items-start mb-2">
            <h5 class="card-title text-lg font-bold" :class="{ 'line-through text-gray-400': task.status === 'done' }">
              📌 {{ task.task_name }}
            </h5>
          </div>
          
          <p class="text-gray-500 text-sm mb-1">
            <i class="bi bi-calendar-event me-1"></i> กำหนดส่ง: {{ task.due_date }}
          </p>
          
          <p class="text-gray-600 mb-4 whitespace-pre-wrap" :class="{ 'line-through text-gray-400': task.status === 'done' }">
            {{ task.task_detail }}
          </p>

          <div class="flex justify-between items-center mt-auto">
            <span :class="['badge py-3 px-3 rounded-lg text-xs font-semibold', getStatusBadgeClass(task)]">
              {{ getStatusText(task) }}
            </span>

            <div class="flex gap-2">
               <button 
                 @click="toggleStatus(task)"
                 class="btn btn-sm px-2"
                 :class="task.status === 'done' ? 'btn-outline btn-warning' : 'btn-outline btn-success'"
                 :title="task.status === 'done' ? 'ยังไม่เสร็จ' : 'เสร็จแล้ว'"
               >
                 <i v-if="task.status === 'done'" class="bi bi-arrow-counterclockwise"></i>
                 <i v-else class="bi bi-check-lg"></i>
               </button>

               <router-link 
                 :to="`/tasks/${task.id}/edit`" 
                 class="btn btn-sm btn-outline btn-primary px-2"
               >
                 <i class="bi bi-pencil"></i>
               </router-link>

               <button 
                 @click="deleteTask(task.id)"
                 class="btn btn-sm btn-outline btn-error px-2"
               >
                 <i class="bi bi-trash"></i>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 flex flex-col md:flex-row justify-center gap-4">
      <router-link to="/tasks/add" class="btn btn-primary shadow-lg px-8 rounded-xl">
        <i class="bi bi-plus-lg me-2"></i> เพิ่มงาน / โน้ตใหม่
      </router-link>
      <router-link to="/schedules" class="btn btn-outline btn-neutral shadow-sm px-8 rounded-xl">
        <i class="bi bi-calendar3 me-2"></i> จัดการตารางเรียน
      </router-link>
      <router-link to="/" class="btn btn-ghost">
        <i class="bi bi-house me-2"></i> กลับหน้าหลัก
      </router-link>
    </div>
  </div>
</template>