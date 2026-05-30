<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { FinanceService } from '@/services/finance';
import type { Transaction } from '@/types/finance';
import Swal from 'sweetalert2';

// Mock Data
const currentServerId = '1500761770468315248';
const currentUserName = 'singto1597';

const transactions = ref<Transaction[]>([]);
const totalCount = ref(0);
const isLoading = ref(true);

const filters = ref({
  type: '',
  start_date: '',
  end_date: '',
  limit: 50,
  offset: 0
});

const currentPage = ref(1);

const fetchTransactions = async () => {
  isLoading.value = true;
  try {
    const apiFilters = {
      ...filters.value,
      transaction_type: filters.value.type || undefined,
      start_date: filters.value.start_date || undefined,
      end_date: filters.value.end_date || undefined,
      offset: (currentPage.value - 1) * filters.value.limit
    };
    
    // Remove empty strings to avoid sending them to API
    Object.keys(apiFilters).forEach(key => {
      if ((apiFilters as any)[key] === '') delete (apiFilters as any)[key];
    });

    const res = await FinanceService.getTransactions(currentServerId, apiFilters);
    transactions.value = res.items;
    totalCount.value = res.total_count;
  } catch (error: any) {
    Swal.fire('Error', error.message || 'โหลดข้อมูลไม่สำเร็จ', 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleRevert = async (transaction: Transaction) => {
  const result = await Swal.fire({
    title: 'ต้องการยกเลิก?',
    html: `คุณกำลังจะยกเลิกรายการ:<br><b>"${transaction.description}"</b><br><br><span class="text-rose-500 text-sm">ยอดเงินจะถูกคืนกลับกระเป๋าเดิม หากเป็นรายการรับเงินจากเพื่อน สถานะบิลเพื่อนจะถูกตีกลับเป็น "ค้างจ่าย" ทันที</span>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'ยืนยันการยกเลิก',
    cancelButtonText: 'ปิด'
  });

  if (result.isConfirmed) {
    try {
      await FinanceService.revertTransaction(currentServerId, transaction.id, currentUserName);
      Swal.fire({ icon: 'success', title: 'ยกเลิกรายการสำเร็จ!', timer: 1500, showConfirmButton: false });
      fetchTransactions();
    } catch (error: any) {
      Swal.fire('ยกเลิกไม่ได้', error.message, 'error');
    }
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const datePart = date.toLocaleDateString('en-GB'); // dd/mm/yyyy
  const timePart = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  return { datePart, timePart };
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(num);
};

const totalPages = computed(() => Math.ceil(totalCount.value / filters.value.limit));

onMounted(() => {
  fetchTransactions();
});

watch([currentPage, () => filters.value.limit], () => {
  fetchTransactions();
});

const applyFilters = () => {
  currentPage.value = 1;
  fetchTransactions();
};

const resetFilters = () => {
  filters.value = {
    type: '',
    start_date: '',
    end_date: '',
    limit: 50,
    offset: 0
  };
  currentPage.value = 1;
  fetchTransactions();
};
</script>

<template>
  <div class="p-4 md:p-8">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800">ประวัติการทำรายการ</h1>
        <p class="text-gray-500 mt-1">รายการรับ จ่าย และโอนเงินทั้งหมดของห้อง</p>
      </div>
      <RouterLink 
        to="/finance/transactions/add"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition flex items-center gap-2"
      >
        <i class="bi bi-plus-lg"></i> บันทึกรายการ
      </RouterLink>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 mb-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase">ประเภท</label>
          <select v-model="filters.type" class="w-full bg-gray-50 border border-gray-100 py-2 px-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition">
            <option value="">ทั้งหมด</option>
            <option value="income">รายรับ</option>
            <option value="expense">รายจ่าย</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase">จากวันที่</label>
          <input type="date" v-model="filters.start_date" class="w-full bg-gray-50 border border-gray-100 py-2 px-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase">ถึงวันที่</label>
          <input type="date" v-model="filters.end_date" class="w-full bg-gray-50 border border-gray-100 py-2 px-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition">
        </div>
        <div class="flex gap-2">
          <button @click="applyFilters" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl shadow-sm transition">
            ค้นหา
          </button>
          <button @click="resetFilters" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2 rounded-xl transition border border-gray-200">
            ล้างค่า
          </button>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-50 flex justify-between items-center">
        <select v-model="filters.limit" class="text-sm bg-gray-50 border border-gray-100 py-1 px-3 rounded-lg outline-none">
          <option :value="10">10 รายการ</option>
          <option :value="50">50 รายการ</option>
          <option :value="100">100 รายการ</option>
        </select>
        <p class="text-sm text-gray-400">พบทั้งหมด {{ totalCount }} รายการ</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-400 text-xs uppercase font-bold border-b border-gray-100">
              <th class="px-6 py-4">วันที่-เวลา</th>
              <th class="px-6 py-4">รายการ</th>
              <th class="px-6 py-4">กระเป๋าเงิน</th>
              <th class="px-6 py-4 text-right">จำนวนเงิน</th>
              <th class="px-6 py-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="isLoading">
              <td colspan="5" class="px-6 py-10 text-center">
                <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                <span class="text-gray-400">กำลังโหลด...</span>
              </td>
            </tr>
            <tr v-else-if="transactions.length === 0">
              <td colspan="5" class="px-6 py-10 text-center text-gray-400 italic">
                ไม่พบข้อมูลการทำรายการ
              </td>
            </tr>
            <tr v-for="t in transactions" :key="t.id" class="hover:bg-gray-50/50 transition-colors group">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-bold text-gray-700">{{ formatDate(t.created_at).datePart }}</div>
                <div class="text-xs text-gray-400">{{ formatDate(t.created_at).timePart }} น.</div>
              </td>
              <td class="px-6 py-4">
                <div class="font-bold text-gray-800">{{ t.description }}</div>
                <div class="flex items-center gap-2 mt-1">
                  <span v-if="t.category_name" class="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    {{ t.category_name }}
                  </span>
                  <span class="text-[10px] text-gray-400 flex items-center gap-1">
                    <i class="bi bi-person-circle"></i> {{ t.recorded_by }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                  <i class="bi bi-wallet2"></i> {{ t.account_name || 'ไม่ระบุ' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right whitespace-nowrap">
                <span :class="[t.transaction_type === 'income' ? 'text-emerald-600' : 'text-rose-600', 'font-extrabold text-base']">
                  {{ t.transaction_type === 'income' ? '+' : '-' }} ฿{{ formatNumber(t.amount) }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <div v-if="t.transfer_group_id && t.transaction_type === 'income'" class="text-gray-300 italic text-[10px]" title="ยกเลิกได้ที่รายการขาออก">
                  <i class="bi bi-link-45deg"></i> โอนเงิน
                </div>
                <button 
                  v-else
                  @click="handleRevert(t)"
                  class="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  title="ยกเลิกรายการ"
                >
                  <i class="bi bi-arrow-counterclockwise text-lg"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="p-6 border-t border-gray-50 flex justify-center gap-2">
        <button 
          v-for="page in totalPages" 
          :key="page"
          @click="currentPage = page"
          :class="[
            'w-10 h-10 rounded-xl font-bold transition-all border',
            currentPage === page ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          ]"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>
