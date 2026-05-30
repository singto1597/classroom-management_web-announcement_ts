<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { FinanceService } from '@/services/finance';
import type { Debtor, StudentDebtProfile, Account, StudentDebtItem } from '@/types/finance';
import Swal from 'sweetalert2';

const authStore = useAuthStore();
const currentServerId = authStore.currentRoomId!;
const currentUserName = authStore.currentUserName!;
const isAdmin = computed(() => authStore.isAdmin);

const debtors = ref<Debtor[]>([]);
const accounts = ref<Account[]>([]);
const isLoading = ref(true);

// Modal/Batch Pay State
const isModalOpen = ref(false);
const selectedStudent = ref<{ id: number; name: string } | null>(null);
const studentDebts = ref<StudentDebtItem[]>([]);
const isLoadingDebts = ref(false);
const selectedPaymentIds = ref<number[]>([]);
const payAmounts = ref<Record<number, number>>({});
const paidToAccountId = ref<string>('');
const slipImageUrl = ref('');

// Memory logic
const lastSelectedMemory = ref<number[] | null>(null);

const fetchDebtors = async () => {
  isLoading.value = true;
  try {
    const [debtRes, accRes] = await Promise.all([
      FinanceService.getAllDebtors(currentServerId),
      FinanceService.getAccounts(currentServerId)
    ]);
    debtors.value = debtRes;
    accounts.value = accRes;
    
    // Auto-select first account
    if (accounts.value.length > 0) {
      paidToAccountId.value = accounts.value[0].id.toString();
    }
  } catch (error: any) {
    Swal.fire('Error', 'โหลดข้อมูลลูกหนี้ไม่สำเร็จ', 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleClearDebt = async (debtor: Debtor) => {
  // ดักฝั่ง Script: ป้องกันคนกดเรียกฟังก์ชันข้าม UI
  if (!isAdmin.value) {
    Swal.fire('ไม่มีสิทธิ์เข้าถึง', 'เฉพาะแอดมินเท่านั้นที่สามารถเคลียร์หนี้ได้', 'error');
    return;
  }

  selectedStudent.value = { id: debtor.student_id, name: debtor.student_name };
  isModalOpen.value = true;
  isLoadingDebts.value = true;
  selectedPaymentIds.value = [];
  payAmounts.value = {};
  slipImageUrl.value = '';

  try {
    const res = await FinanceService.getStudentDebts(currentServerId, debtor.student_id);
    studentDebts.value = res.debts;

    // Logic: Auto-Select ฉลาดจำค่าเดิม
    studentDebts.value.forEach(debt => {
      let shouldCheck = false;
      if (lastSelectedMemory.value === null) {
        shouldCheck = true;
      } else {
        shouldCheck = lastSelectedMemory.value.includes(debt.collection_id);
      }

      if (shouldCheck) {
        selectedPaymentIds.value.push(debt.payment_id);
      }
      payAmounts.value[debt.payment_id] = debt.amount;
    });
  } catch (error: any) {
    Swal.fire('Error', 'ดึงรายการค้างชำระไม่สำเร็จ', 'error');
    isModalOpen.value = false;
  } finally {
    isLoadingDebts.value = false;
  }
};

const totalSelectedAmount = computed(() => {
  return selectedPaymentIds.value.reduce((total, id) => {
    return total + (payAmounts.value[id] || 0);
  }, 0);
});

const handleBatchPay = async () => {
  // ดักอีกชั้นตอนกดยืนยันจ่ายเงิน
  if (!isAdmin.value) {
    return Swal.fire('ไม่มีสิทธิ์', 'เฉพาะแอดมินเท่านั้น', 'error');
  }

  if (selectedPaymentIds.value.length === 0) {
    return Swal.fire('อ๊ะ!', 'กรุณาเลือกรายการที่ต้องการชำระเงิน', 'warning');
  }

  // จดจำการตั้งค่าก่อนกดยืนยัน
  lastSelectedMemory.value = studentDebts.value
    .filter(d => selectedPaymentIds.value.includes(d.payment_id))
    .map(d => d.collection_id);

  try {
    Swal.fire({
      title: 'กำลังบันทึก...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    // ลูปยิงทีละรายการตาม Logic เดิม
    const promises = selectedPaymentIds.value.map(pid => {
      return FinanceService.confirmPayment(currentServerId, pid, {
        paid_to_account_id: Number(paidToAccountId.value),
        paid_amount: payAmounts.value[pid],
        slip_image_url: slipImageUrl.value || undefined,
        user_name: currentUserName
      });
    });

    await Promise.all(promises);

    Swal.fire({ icon: 'success', title: 'สำเร็จ!', text: 'บันทึกการรับเงินรวบยอดเรียบร้อย', timer: 1500, showConfirmButton: false });
    isModalOpen.value = false;
    fetchDebtors();
  } catch (error: any) {
    Swal.fire('Error', error.message || 'บันทึกไม่สำเร็จ', 'error');
  }
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(num);
};

onMounted(() => {
  fetchDebtors();
});
</script>

<template>
  <div class="p-4 md:p-8">
    <div class="mb-8 flex items-center gap-4">
      <RouterLink 
        to="/finance"
        class="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2.5 rounded-xl transition shadow-sm group"
        title="กลับหน้าภาพรวม"
      >
        <i class="bi bi-arrow-left text-xl"></i>
      </RouterLink>
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-rose-600 flex items-center gap-2">
          <i class="bi bi-exclamation-triangle-fill"></i> สรุปผู้ค้างชำระ (ทวงหนี้รวม)
        </h1>
        <p class="text-gray-500 mt-1">รายชื่อผู้ค้างจ่ายเงินจากทุกโปรเจกต์ (รวมโปรเจกต์ที่ปิดไปแล้ว)</p>
      </div>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
    </div>

    <div v-else class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-400 text-xs uppercase font-bold border-b border-gray-100">
              <th class="px-6 py-4">เลขที่</th>
              <th class="px-6 py-4">ชื่อนักเรียน</th>
              <th class="px-6 py-4 text-center">ค้างจ่าย (บิล)</th>
              <th class="px-6 py-4 text-right">ยอดรวม (฿)</th>
              <th class="px-6 py-4 text-right pe-8">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="debtors.length === 0">
              <td colspan="5" class="px-6 py-20 text-center text-emerald-600 font-bold">
                🎉 ไม่มีใครติดหนี้ห้องเลย! (รวยมาก)
              </td>
            </tr>
            <tr v-for="d in debtors" :key="d.student_id" class="hover:bg-rose-50/30 transition-colors">
              <td class="px-6 py-4 font-bold text-gray-400">#{{ d.student_no }}</td>
              <td class="px-6 py-4 font-bold text-gray-800">{{ d.student_name }}</td>
              <td class="px-6 py-4 text-center">
                <span class="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-bold">
                  {{ d.overdue_count }} รายการ
                </span>
              </td>
              <td class="px-6 py-4 text-right whitespace-nowrap font-black text-rose-600 text-lg">
                ฿{{ formatNumber(d.total_pending_amount) }}
              </td>
              <td class="px-6 py-4 text-right pe-8">
                <button 
                  v-if="isAdmin"
                  @click="handleClearDebt(d)"
                  class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded-xl shadow-sm transition text-xs flex items-center gap-2 ml-auto"
                >
                  <i class="bi bi-wallet2"></i> เคลียร์หนี้
                </button>
                <span v-else class="text-xs text-gray-400 italic bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 inline-block">
                  <i class="bi bi-lock"></i> รอแอดมินเคลียร์
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="isModalOpen && isAdmin" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-xl font-bold text-gray-800">
            บันทึกรับเงินรวบยอด: <span class="text-blue-600">{{ selectedStudent?.name }}</span>
          </h3>
          <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600"><i class="bi bi-x-lg"></i></button>
        </div>

        <div class="p-6 max-h-[60vh] overflow-y-auto">
          <div v-if="isLoadingDebts" class="flex justify-center py-10">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div v-else class="space-y-3">
            <p class="text-xs font-bold text-gray-400 uppercase mb-2">เลือกรายการบิลที่ต้องการจ่าย</p>
            <label 
              v-for="debt in studentDebts" 
              :key="debt.payment_id"
              :class="[
                'flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer',
                selectedPaymentIds.includes(debt.payment_id) ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100 opacity-60'
              ]"
            >
              <input 
                type="checkbox" 
                :value="debt.payment_id" 
                v-model="selectedPaymentIds"
                class="w-5 h-5 rounded-lg border-gray-300 text-emerald-600 focus:ring-emerald-500"
              >
              <div class="flex-1">
                <h4 class="font-bold text-gray-800 text-sm">{{ debt.title }}</h4>
                <p class="text-rose-500 text-xs font-bold">ยอดค้าง: ฿{{ formatNumber(debt.amount) }}</p>
              </div>
              <div class="w-32">
                <div class="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden h-9">
                  <span class="px-2 text-gray-400 text-xs">฿</span>
                  <input 
                    type="number" 
                    v-model="payAmounts[debt.payment_id]" 
                    :disabled="!selectedPaymentIds.includes(debt.payment_id)"
                    class="w-full text-right pr-2 outline-none text-sm font-bold disabled:bg-gray-50"
                  >
                </div>
              </div>
            </label>
          </div>
        </div>

        <div class="p-6 bg-gray-50 border-t border-gray-100">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-xs font-bold text-gray-400 mb-1 uppercase">รับเข้ากระเป๋า</label>
              <select v-model="paidToAccountId" class="w-full bg-white border border-gray-200 p-2.5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500">
                <option v-for="acc in accounts" :key="acc.id" :value="acc.id.toString()">{{ acc.account_name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 mb-1 uppercase">URL รูปสลิป</label>
              <input v-model="slipImageUrl" type="url" placeholder="https://..." class="w-full bg-white border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>

          <div class="flex justify-between items-center">
            <div class="text-gray-800">
              <span class="text-xs font-bold uppercase block text-gray-400">ยอดรวมที่เลือกชำระ</span>
              <span class="text-2xl font-black text-rose-600">฿{{ formatNumber(totalSelectedAmount) }}</span>
            </div>
            <button 
              @click="handleBatchPay"
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-2xl shadow-lg transition-all transform hover:scale-105"
            >
              <i class="bi bi-check-circle-fill me-1"></i> ยืนยันการรับเงิน
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>