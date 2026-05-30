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
    html:
      '<div class="text-left bg-blue-50 p-3 rounded-xl mb-4 text-xs text-blue-600 font-bold border border-blue-100">' +
      '<i class="bi bi-info-circle-fill"></i> ระบบจะสร้างบิลเรียกเก็บเงินไปยังนักเรียนที่มีสถานะ Active ทุกคนอัตโนมัติ' +
      '</div>' +
      '<input id="swal-title" class="swal2-input" placeholder="ชื่อรายการ (เช่น ค่าชีทฟิสิกส์)">' +
      '<input id="swal-amount" type="number" class="swal2-input" placeholder="ยอดเรียกเก็บต่อคน (฿)">' +
      '<input id="swal-date" type="date" class="swal2-input" placeholder="ครบกำหนด">',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: '🚀 สร้างรายการ',
    cancelButtonText: 'ยกเลิก',
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
      Swal.fire({ icon: 'success', title: 'สร้างสำเร็จ!', timer: 1500, showConfirmButton: false });
      fetchCollections();
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  }
};

const handleEditCollection = async (col: Collection) => {
  const { value: formValues } = await Swal.fire({
    title: 'ตั้งค่าโปรเจกต์',
    html:
      `<input id="swal-title" class="swal2-input" placeholder="ชื่อรายการ" value="${col.title}">` +
      `<input id="swal-amount" type="number" class="swal2-input" placeholder="ยอดเรียกเก็บ" value="${col.amount}">` +
      `<input id="swal-date" type="date" class="swal2-input" value="${col.due_date}">` +
      `<select id="swal-status" class="swal2-input">
        <option value="active" ${col.status === 'active' ? 'selected' : ''}>🟢 เปิดรับเงิน</option>
        <option value="closed" ${col.status === 'closed' ? 'selected' : ''}>🔴 ปิดแคมเปญ</option>
      </select>`,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'บันทึก',
    cancelButtonText: 'ยกเลิก',
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
      Swal.fire({ icon: 'success', title: 'อัปเดตสำเร็จ!', timer: 1500, showConfirmButton: false });
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
  <div class="p-4 md:p-8">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div class="flex items-center gap-4">
        <RouterLink 
          to="/finance"
          class="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2.5 rounded-xl transition shadow-sm group"
          title="กลับหน้าภาพรวม"
        >
          <i class="bi bi-arrow-left text-xl"></i>
        </RouterLink>
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-800">โปรเจกต์เก็บเงิน (Collections)</h1>
          <p class="text-gray-500 mt-1">จัดการแคมเปญระดมทุนและการเก็บเงินเพื่อนในห้อง</p>
        </div>
      </div>
      <button 
        v-if="authStore.isAdmin"
        @click="handleCreateCollection"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition flex items-center gap-2"
      >
        <i class="bi bi-plus-circle"></i> สร้างโปรเจกต์ใหม่
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="collections.length === 0" class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
      <i class="bi bi-folder2-open text-5xl text-gray-200 block mb-4"></i>
      <h3 class="text-lg font-bold text-gray-400">ยังไม่มีโปรเจกต์เก็บเงินในขณะนี้</h3>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="col in collections" 
        :key="col.id"
        :class="[
          'bg-white rounded-3xl border shadow-sm p-6 flex flex-col justify-between transition-all group hover:shadow-lg',
          col.status === 'closed' ? 'bg-gray-50/50 opacity-80 border-gray-100' : 'border-gray-50'
        ]"
      >
        <div>
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-2">
              <span 
                :class="[
                  'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                  col.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                ]"
              >
                {{ col.status === 'active' ? 'เปิดรับเงิน' : 'ปิดแล้ว' }}
              </span>
              <span class="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                <i class="bi bi-calendar-event"></i> {{ formatDate(col.due_date) }}
              </span>
            </div>
            <button 
              v-if="authStore.isAdmin"
              @click="handleEditCollection(col)"
              class="text-gray-300 hover:text-gray-600 p-1 rounded-lg transition-colors"
              title="ตั้งค่า"
            >
              <i class="bi bi-gear-fill"></i>
            </button>
          </div>

          <h3 class="text-xl font-extrabold text-gray-800 mb-2 truncate" :title="col.title">{{ col.title }}</h3>
          <div class="flex items-baseline gap-1 mb-6">
            <span class="text-2xl font-black text-blue-600">฿{{ formatNumber(col.amount) }}</span>
            <span class="text-gray-400 text-xs font-bold">/ คน</span>
          </div>
        </div>

        <RouterLink 
          :to="`/finance/collections/${col.id}`"
          class="w-full bg-gray-800 hover:bg-black text-white text-center font-bold py-3 rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
        >
          <i class="bi bi-search"></i> ดูรายละเอียด
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.swal2-input {
  border-radius: 1rem !important;
  font-family: 'Sarabun', sans-serif !important;
}
</style>
