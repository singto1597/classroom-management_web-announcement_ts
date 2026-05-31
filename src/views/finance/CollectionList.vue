<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { FinanceService } from '@/services/finance';
import type { Collection } from '@/types/finance';
import Swal from 'sweetalert2';

const authStore = useAuthStore();
const currentServerId = authStore.currentRoomId!;
const currentUserName = authStore.currentUserName!;

const collections = ref<Collection[]>([]);
const isLoading = ref(true);

const fetchCollections = async () => {
  isLoading.value = true;
  try {
    const res = await FinanceService.getCollections(currentServerId);
    collections.value = res;
  } catch (error: any) {
    Swal.fire('Error', 'โหลดโปรเจกต์เก็บเงินไม่สำเร็จ', 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleCreateCollection = async () => {
  const { value: formValues } = await Swal.fire({
    title: 'สร้างโปรเจกต์เก็บเงินใหม่',
    html: `
      <div class="text-left bg-blue-50/50 p-4 rounded-2xl mb-4 text-[13px] text-blue-700 font-medium border border-blue-100 leading-relaxed shadow-sm">
        <i class="bi bi-info-circle-fill text-blue-500 me-1"></i> ระบบจะสร้างบิลเรียกเก็บเงินไปยังนักเรียนที่มีสถานะ Active ทุกคนอัตโนมัติ
      </div>
      <div class="flex flex-col gap-3">
        <input id="swal-title" class="swal2-input custom-swal-input" placeholder="ชื่อรายการ (เช่น ค่าชีทฟิสิกส์)">
        <div class="relative">
          <input id="swal-amount" type="number" class="swal2-input custom-swal-input !pl-8" placeholder="ยอดเรียกเก็บต่อคน">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">฿</span>
        </div>
        <div class="text-left mt-1">
          <label class="text-xs font-bold text-slate-400 ms-2 uppercase tracking-wider">ครบกำหนดชำระ</label>
          <input id="swal-date" type="date" class="swal2-input custom-swal-input mt-1">
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: '<i class="bi bi-rocket-takeoff-fill me-1"></i> สร้างรายการ',
    cancelButtonText: 'ยกเลิก',
    customClass: {
      popup: 'rounded-3xl',
      confirmButton: 'rounded-xl font-bold px-6 py-2.5',
      cancelButton: 'rounded-xl font-bold px-6 py-2.5',
    },
    preConfirm: () => {
      const title = (document.getElementById('swal-title') as HTMLInputElement).value;
      const amount = (document.getElementById('swal-amount') as HTMLInputElement).value;
      const dueDate = (document.getElementById('swal-date') as HTMLInputElement).value;
      if (!title || !amount || !dueDate) {
        Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
        return false;
      }
      return { title, amount: parseFloat(amount), due_date: dueDate };
    }
  });

  if (formValues) {
    try {
      await FinanceService.createCollection(currentServerId, { ...formValues, user_name: currentUserName });
      Swal.fire({ icon: 'success', title: 'สร้างสำเร็จ!', timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-3xl' } });
      fetchCollections();
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  }
};

const handleEditCollection = async (col: Collection) => {
  const { value: formValues } = await Swal.fire({
    title: 'ตั้งค่าโปรเจกต์',
    html: `
      <div class="flex flex-col gap-3 mt-4 text-left">
        <div>
          <label class="text-xs font-bold text-slate-400 ms-2 uppercase tracking-wider">ชื่อรายการ</label>
          <input id="swal-title" class="swal2-input custom-swal-input mt-1" placeholder="ชื่อรายการ" value="${col.title}">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-400 ms-2 uppercase tracking-wider">ยอดเรียกเก็บ (฿)</label>
          <input id="swal-amount" type="number" class="swal2-input custom-swal-input mt-1" placeholder="ยอดเรียกเก็บ" value="${col.amount}">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-400 ms-2 uppercase tracking-wider">ครบกำหนดชำระ</label>
          <input id="swal-date" type="date" class="swal2-input custom-swal-input mt-1" value="${col.due_date}">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-400 ms-2 uppercase tracking-wider">สถานะแคมเปญ</label>
          <select id="swal-status" class="swal2-select custom-swal-input mt-1">
            <option value="active" ${col.status === 'active' ? 'selected' : ''}>🟢 เปิดรับเงิน</option>
            <option value="closed" ${col.status === 'closed' ? 'selected' : ''}>🔴 ปิดแคมเปญ</option>
          </select>
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'บันทึกการตั้งค่า',
    cancelButtonText: 'ยกเลิก',
    customClass: {
      popup: 'rounded-3xl',
      confirmButton: 'rounded-xl font-bold px-6 py-2.5',
      cancelButton: 'rounded-xl font-bold px-6 py-2.5',
    },
    preConfirm: () => {
      const title = (document.getElementById('swal-title') as HTMLInputElement).value;
      const amount = (document.getElementById('swal-amount') as HTMLInputElement).value;
      const dueDate = (document.getElementById('swal-date') as HTMLInputElement).value;
      const status = (document.getElementById('swal-status') as HTMLSelectElement).value;
      return { title, amount: parseFloat(amount), due_date: dueDate, status };
    }
  });

  if (formValues) {
    try {
      await FinanceService.updateCollection(currentServerId, col.id, { ...formValues, user_name: currentUserName });
      Swal.fire({ icon: 'success', title: 'อัปเดตสำเร็จ!', timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-3xl' } });
      fetchCollections();
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  }
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB');
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(num);
};

onMounted(() => {
  fetchCollections();
});
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 p-4 sm:p-6 md:p-8">
    <div class="max-w-7xl mx-auto">
      
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-5">
        <div class="flex flex-row items-center gap-4 w-full md:w-auto">
          <RouterLink 
            to="/finance"
            class="bg-white hover:bg-slate-100 text-slate-600 p-3 rounded-2xl transition-all shadow-sm border border-slate-200 group flex-shrink-0"
            title="กลับหน้าภาพรวม"
          >
            <i class="bi bi-arrow-left text-xl group-hover:-translate-x-1 transition-transform"></i>
          </RouterLink>
          <div class="flex-1">
            <h1 class="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              โปรเจกต์เก็บเงิน
            </h1>
            <p class="text-slate-500 mt-1 text-sm md:text-base font-medium">จัดการแคมเปญระดมทุนและการเก็บเงินเพื่อนในห้อง</p>
          </div>
        </div>
        
        <button 
          v-if="authStore.isAdmin"
          @click="handleCreateCollection"
          class="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]"
        >
          <i class="bi bi-plus-circle text-lg"></i> สร้างโปรเจกต์ใหม่
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <span class="text-slate-400 font-medium">กำลังโหลดข้อมูลโปรเจกต์...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="collections.length === 0" class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm px-4 text-center">
        <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5 shadow-inner">
          <i class="bi bi-folder2-open text-4xl text-slate-300"></i>
        </div>
        <h3 class="text-xl font-extrabold text-slate-700 mb-1">ยังไม่มีโปรเจกต์เก็บเงินในขณะนี้</h3>
        <p class="text-slate-500 text-sm">กดปุ่ม "สร้างโปรเจกต์ใหม่" เพื่อเริ่มต้นเรียกเก็บเงินจากเพื่อนๆ ได้เลย</p>
      </div>

      <!-- Projects Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        <div 
          v-for="col in collections" 
          :key="col.id"
          :class="[
            'bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-7 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl relative overflow-hidden',
            col.status === 'closed' ? 'opacity-85 grayscale-[0.2] border border-slate-200' : 'border border-slate-100'
          ]"
        >
          <!-- Decoration Line (Active = Blue, Closed = Slate) -->
          <div class="absolute top-0 left-0 w-full h-1.5" :class="col.status === 'active' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-slate-300'"></div>

          <div>
            <div class="flex justify-between items-start mb-5">
              <div class="flex items-center gap-2">
                <span 
                  :class="[
                    'px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border',
                    col.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                  ]"
                >
                  {{ col.status === 'active' ? 'เปิดรับเงิน' : 'ปิดแล้ว' }}
                </span>
              </div>
              <button 
                v-if="authStore.isAdmin"
                @click="handleEditCollection(col)"
                class="w-9 h-9 flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-colors"
                title="ตั้งค่า"
              >
                <i class="bi bi-gear-fill"></i>
              </button>
            </div>

            <h3 class="text-xl md:text-2xl font-extrabold text-slate-800 mb-2 leading-tight" :title="col.title">{{ col.title }}</h3>
            
            <div class="flex items-center gap-2 mb-6 text-xs font-bold text-slate-400 bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
              <i class="bi bi-calendar-event text-blue-500"></i> ครบกำหนด: <span class="text-slate-600">{{ formatDate(col.due_date) }}</span>
            </div>

            <div class="flex items-baseline gap-1 mb-8">
              <span :class="['text-3xl font-black tracking-tight', col.status === 'active' ? 'text-blue-600' : 'text-slate-600']">
                ฿{{ formatNumber(col.amount) }}
              </span>
              <span class="text-slate-400 text-sm font-bold">/ คน</span>
            </div>
          </div>

          <!-- Action Button -->
          <RouterLink 
            :to="`/finance/collections/${col.id}`"
            class="w-full bg-slate-800 hover:bg-slate-900 text-white text-center font-bold py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 group-hover:shadow-slate-800/20"
          >
            ดูรายละเอียด <i class="bi bi-arrow-right transition-transform group-hover:translate-x-1"></i>
          </RouterLink>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Custom SweetAlert Inputs ให้เต็มจอ 100% บนมือถือและดูพรีเมียม */
:deep(.custom-swal-input) {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  margin: 0 !important;
  border-radius: 0.75rem !important;
  border: 1px solid #e2e8f0 !important;
  font-size: 0.875rem !important;
  padding: 0.75rem 1rem !important;
  box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.02) !important;
  font-family: inherit !important;
  color: #334155 !important;
  transition: all 0.2s ease !important;
}

:deep(.custom-swal-input:focus) {
  outline: none !important;
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
}

/* ลบลูกศรขึ้นลงในช่อง Input แบบ Number */
:deep(input[type=number]::-webkit-inner-spin-button), 
:deep(input[type=number]::-webkit-outer-spin-button) { 
  -webkit-appearance: none; 
  margin: 0; 
}
:deep(input[type=number]) {
  -moz-appearance: textfield;
}

/* ป้องกัน SweetAlert Container ล้นจอมือถือ */
:deep(.swal2-html-container) {
  overflow: visible !important;
  margin: 1em 1.6em 0.3em !important;
}
</style>