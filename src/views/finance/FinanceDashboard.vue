<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { FinanceService } from '@/services/finance';
import type { FinanceSummary, Account } from '@/types/finance';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

import { useAuthStore } from '@/stores/auth';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const authStore = useAuthStore();
const currentServerId = authStore.currentRoomId!;

const summary = ref<FinanceSummary | null>(null);
const accounts = ref<Account[]>([]);
const isLoading = ref(true);

const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());

const thaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const fetchDashboardData = async () => {
  isLoading.value = true;
  try {
    const [summaryRes, accountsRes] = await Promise.all([
      FinanceService.getSummary(currentServerId, selectedMonth.value, selectedYear.value),
      FinanceService.getAccounts(currentServerId)
    ]);
    summary.value = summaryRes;
    accounts.value = accountsRes;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    isLoading.value = false;
  }
};

const chartData = computed(() => {
  if (!summary.value || summary.value.expense_breakdown.length === 0) {
    return {
      labels: ['ยังไม่มีรายจ่าย'],
      datasets: [{
        data: [1],
        backgroundColor: ['#e5e7eb'],
        borderWidth: 0
      }]
    };
  }

  return {
    labels: summary.value.expense_breakdown.map(item => item.category_name),
    datasets: [{
      data: summary.value.expense_breakdown.map(item => item.total_amount),
      backgroundColor: [
        '#3b82f6', '#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'
      ],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          family: "'Sarabun', sans-serif",
          size: 12
        }
      }
    },
    tooltip: {
      enabled: summary.value?.expense_breakdown.length !== 0
    }
  },
  cutout: '70%'
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(num);
};

onMounted(() => {
  fetchDashboardData();
});

watch([selectedMonth, selectedYear], () => {
  fetchDashboardData();
});
</script>

<template>
  <div class="p-4 md:p-8">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div class="flex items-center gap-4">
        <RouterLink 
          to="/dashboard"
          class="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2.5 rounded-xl transition shadow-sm group"
          title="กลับหน้าหลัก"
        >
          <i class="bi bi-house-door-fill text-xl"></i>
        </RouterLink>
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            📊 สรุปภาพรวมการเงิน
          </h1>
          <p class="text-gray-500 mt-1">
            ประจำเดือน {{ thaiMonths[selectedMonth - 1] }} {{ selectedYear + 543 }}
          </p>
        </div>
      </div>

      <div class="flex gap-2 w-full md:w-auto">
        <select 
          v-model="selectedMonth" 
          class="bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
        >
          <option v-for="(month, index) in thaiMonths" :key="index" :value="index + 1">
            เดือน {{ month }}
          </option>
        </select>
        <select 
          v-model="selectedYear" 
          class="bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
        >
          <option v-for="y in [2024, 2025, 2026]" :key="y" :value="y">
            พ.ศ. {{ y + 543 }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-500">กำลังโหลดข้อมูลการเงิน...</p>
    </div>

    <div v-else-if="summary" class="space-y-8">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Net Worth Card -->
        <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group">
          <i class="bi bi-wallet2 absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:scale-110 transition-transform"></i>
          <p class="text-blue-100 text-sm font-semibold mb-2">เงินคงเหลือรวม</p>
          <h2 class="text-2xl md:text-3xl font-extrabold">฿ {{ formatNumber(summary.net_worth) }}</h2>
        </div>

        <!-- Pending Debt Card -->
        <div class="bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group">
          <i class="bi bi-hourglass-split absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:scale-110 transition-transform"></i>
          <p class="text-amber-100 text-sm font-semibold mb-2">ยอดที่เพื่อนค้างจ่ายรวม</p>
          <h2 class="text-2xl md:text-3xl font-extrabold">฿ {{ formatNumber(summary.pending_collection_amount) }}</h2>
        </div>

        <!-- Income Card -->
        <div class="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group">
          <i class="bi bi-graph-up-arrow absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:scale-110 transition-transform"></i>
          <p class="text-emerald-100 text-sm font-semibold mb-2">รายรับ ({{ thaiMonths[selectedMonth - 1] }})</p>
          <h2 class="text-2xl md:text-3xl font-extrabold">฿ {{ formatNumber(summary.total_income) }}</h2>
        </div>

        <!-- Expense Card -->
        <div class="bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group">
          <i class="bi bi-graph-down-arrow absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:scale-110 transition-transform"></i>
          <p class="text-rose-100 text-sm font-semibold mb-2">รายจ่าย ({{ thaiMonths[selectedMonth - 1] }})</p>
          <h2 class="text-2xl md:text-3xl font-extrabold">฿ {{ formatNumber(summary.total_expense) }}</h2>
        </div>
      </div>

      <!-- Quick Menu -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RouterLink 
          to="/finance/transactions"
          class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col items-center gap-2 group"
        >
          <div class="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <i class="bi bi-list-task text-xl"></i>
          </div>
          <span class="text-sm font-bold text-gray-700">ประวัติรายการ</span>
        </RouterLink>

        <RouterLink 
          to="/finance/collections"
          class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col items-center gap-2 group"
        >
          <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <i class="bi bi-folder2-open text-xl"></i>
          </div>
          <span class="text-sm font-bold text-gray-700">โปรเจกต์เก็บเงิน</span>
        </RouterLink>

        <RouterLink 
          to="/finance/debtors"
          class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all flex flex-col items-center gap-2 group"
        >
          <div class="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <i class="bi bi-exclamation-triangle text-xl"></i>
          </div>
          <span class="text-sm font-bold text-gray-700">ยอดค้างจ่าย</span>
        </RouterLink>

        <RouterLink 
          v-if="authStore.isAdmin"
          to="/finance/settings"
          class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all flex flex-col items-center gap-2 group"
        >
          <div class="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <i class="bi bi-gear-fill text-xl"></i>
          </div>
          <span class="text-sm font-bold text-gray-700">ตั้งค่าการเงิน</span>
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Wallets Section -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-800">กระเป๋าเงินห้อง</h3>
            <RouterLink 
              v-if="authStore.isAdmin"
              to="/finance/settings" 
              class="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
            >
              จัดการบัญชี
            </RouterLink>
          </div>

          <div v-if="accounts.length === 0" class="text-center py-10 text-gray-400">
            ยังไม่มีกระเป๋าเงิน
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              v-for="acc in accounts" 
              :key="acc.id" 
              class="p-4 rounded-xl border border-gray-100 bg-gray-50 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all"
            >
              <div>
                <span class="text-gray-400 text-xs block mb-0.5">ชื่อบัญชี</span>
                <span class="font-bold text-gray-700">{{ acc.account_name }}</span>
              </div>
              <div class="text-right">
                <span class="text-gray-400 text-xs block mb-0.5">คงเหลือ</span>
                <span class="text-blue-600 font-bold text-lg">฿ {{ formatNumber(acc.balance) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart Section -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 class="text-xl font-bold text-gray-800 text-center mb-6">สัดส่วนรายจ่าย</h3>
          <div class="h-64 relative">
            <Doughnut :data="chartData" :options="chartOptions" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* เพิ่ม Font Sarabun สำหรับ Chart หรือส่วนอื่นๆ */
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
</style>
