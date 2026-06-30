<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { StudentService } from '@/services/student';
import Swal from 'sweetalert2';
import draggable from 'vuedraggable'; // 📦 นำเข้า vuedraggable

const authStore = useAuthStore();
const roomId = computed(() => authStore.currentRoomId!);
const userName = computed(() => authStore.currentUserName || 'Admin');

// 1. 📂 Schema กำหนดโครงสร้างข้อมูลให้เลือก (จัดกลุ่ม พร้อมสีและไอคอน)
const exportSchema = [
  {
    id: 'core', name: 'ข้อมูลส่วนตัว', icon: 'bi-person-badge', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200',
    fields: [
      { id: 'student_no', label: 'เลขที่' },
      { id: 'student_id', label: 'รหัสนักเรียน' },
      { id: 'prefix', label: 'คำนำหน้า' },
      { id: 'first_name', label: 'ชื่อจริง' },
      { id: 'last_name', label: 'นามสกุล' },
      { id: 'nickname', label: 'ชื่อเล่น' },
      { id: 'birthday', label: 'วันเกิด' }
    ]
  },
  {
    id: 'academic', name: 'วิชาการและหน้าที่', icon: 'bi-journal-bookmark-fill', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200',
    fields: [
      { id: 'class_role', label: 'บทบาทในห้อง' },
      { id: 'cleaning_duty', label: 'เวรทำความสะอาด' },
      { id: 'olympic_camp', label: 'สอวน. / ค่าย' },
      { id: 'target_faculty', label: 'คณะเป้าหมาย' },
      { id: 'portfolio', label: 'ผลงาน' }
    ]
  },
  {
    id: 'health', name: 'ข้อมูลสุขภาพ', icon: 'bi-heart-pulse-fill', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200',
    fields: [
      { id: 'blood_group', label: 'กรุ๊ปเลือด' },
      { id: 'shirt_size', label: 'ไซส์เสื้อ' },
      { id: 'food_allergy', label: 'แพ้อาหาร' },
      { id: 'congenital_disease', label: 'โรคประจำตัว' }
    ]
  },
  {
    id: 'contact', name: 'การติดต่อ', icon: 'bi-telephone-fill', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200',
    fields: [
      { id: 'phone_number', label: 'เบอร์โทรศัพท์' },
      { id: 'phone_number_parent', label: 'เบอร์ผู้ปกครอง' },
      { id: 'phone_number_parent_relation', label: 'ความสัมพันธ์' },
      { id: 'line_id', label: 'LINE ID' },
      { id: 'ig_username', label: 'IG Username' },
      { id: 'email', label: 'อีเมล' }
    ]
  },
  {
    id: 'address', name: 'ที่อยู่', icon: 'bi-house-door-fill', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200',
    fields: [
      { id: 'address_house_no', label: 'บ้านเลขที่/หมู่/ซอย' },
      { id: 'address_road', label: 'ถนน' },
      { id: 'address_sub_district', label: 'ตำบล/แขวง' },
      { id: 'address_district', label: 'อำเภอ/เขต' },
      { id: 'address_province', label: 'จังหวัด' },
      { id: 'address_post_code', label: 'รหัสไปรษณีย์' }
    ]
  }
];

// 2. 🗂️ State สำหรับเก็บรายการที่ถูกเลือกและจัดเรียงอยู่ (นี่คือตัวแปรหลักที่ผูกกับ vuedraggable)
// โครงสร้าง: { id: 'first_name', label: 'ชื่อจริง', catColor: 'text-blue-600' }
const selectedColumns = ref<any[]>([]);

// 3. 🧠 Logic การเลือกข้อมูล
const isFieldSelected = (fieldId: string) => !!selectedColumns.value.find(c => c.id === fieldId);

const toggleField = (field: any, category: any) => {
  const index = selectedColumns.value.findIndex(c => c.id === field.id);
  if (index > -1) {
    // ถ้ามีอยู่แล้ว ให้ลบออก (Uncheck)
    selectedColumns.value.splice(index, 1);
  } else {
    // ถ้ายังไม่มี ให้เพิ่มต่อท้าย (Check)
    selectedColumns.value.push({ id: field.id, label: field.label, catColor: category.color });
  }
};

const isCategoryAllSelected = (category: any) => category.fields.every((f: any) => isFieldSelected(f.id));
const isCategoryPartialSelected = (category: any) => category.fields.some((f: any) => isFieldSelected(f.id)) && !isCategoryAllSelected(category);

const toggleCategory = (category: any) => {
  if (isCategoryAllSelected(category)) {
    // ลบฟิลด์ทั้งหมดในหมวดหมู่นี้ออกจาก selectedColumns
    selectedColumns.value = selectedColumns.value.filter(c => !category.fields.find((f: any) => f.id === c.id));
  } else {
    // เพิ่มฟิลด์ที่ยังไม่ถูกเลือกลงไปต่อท้าย
    category.fields.forEach((field: any) => {
      if (!isFieldSelected(field.id)) {
        selectedColumns.value.push({ id: field.id, label: field.label, catColor: category.color });
      }
    });
  }
};

const clearAll = () => { selectedColumns.value = []; };

// 4. 🚀 ฟังก์ชันส่งออก
const handleExport = async () => {
  if (selectedColumns.value.length === 0) {
    return Swal.fire({ icon: 'warning', title: 'แจ้งเตือน', text: 'กรุณาเลือกอย่างน้อย 1 คอลัมน์ครับ!' });
  }

  // ✨ ดึงเฉพาะ ID ส่งไปเป็น Array จัดลำดับตามที่ลากวางไว้เป๊ะๆ!
  const finalFieldsOrder = selectedColumns.value.map(col => col.id);

  try {
    Swal.fire({ title: 'กำลังคราฟต์ไฟล์ Excel...', text: 'รอสักครู่ ระบบกำลังจัดเรียงคอลัมน์ให้คุณ', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    // เรียกใช้ Service ที่ส่ง Array ไปให้ FastAPI จัดการ
    const blob = await StudentService.exportStudentsExcel(roomId.value, finalFieldsOrder, userName.value);
    
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Custom_Students_${roomId.value}_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    Swal.fire({ icon: 'success', title: 'สำเร็จ!', text: 'ดาวน์โหลดไฟล์ Excel เรียบร้อยแล้ว', timer: 1500, showConfirmButton: false });
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ส่งออกล้มเหลว' });
  }
};
</script>

<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
    <div class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div>
        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Custom Export Builder ✨</h2>
        <p class="text-slate-500 mt-2 font-medium">เลือกข้อมูลที่ต้องการ และลากวางคอลัมน์ฝั่งขวาเพื่อจัดลำดับใน Excel ได้ตามใจชอบ</p>
      </div>
      <button @click="handleExport" class="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-slate-900/20 active:scale-95 transition-all flex items-center gap-2 w-full md:w-auto justify-center">
        <i class="bi bi-file-earmark-excel-fill text-emerald-400 text-lg"></i> โหลดไฟล์ Excel
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      
      <!-- ⬅️ ซ้าย: กล่องเลือกข้อมูล (Source) -->
      <div class="lg:col-span-7 space-y-5">
        <div 
          v-for="cat in exportSchema" 
          :key="cat.id" 
          class="bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm transition-all hover:border-slate-300"
        >
          <!-- Category Header -->
          <div 
            @click="toggleCategory(cat)"
            class="p-4 cursor-pointer flex items-center justify-between transition-colors group select-none"
            :class="cat.bg"
          >
            <div class="flex items-center gap-3">
              <i :class="[cat.icon, cat.color, 'text-xl']"></i>
              <h3 class="font-bold text-slate-800 text-lg group-hover:text-black transition-colors">{{ cat.name }}</h3>
            </div>
            
            <!-- Checkbox จำลอง สำหรับ Group -->
            <div 
              class="w-6 h-6 rounded border-2 flex items-center justify-center transition-all"
              :class="[
                isCategoryAllSelected(cat) ? `${cat.bg.replace('50', '500')} border-transparent text-white` : 
                isCategoryPartialSelected(cat) ? `${cat.bg.replace('50', '200')} border-transparent text-slate-600` : 
                'border-slate-300 bg-white'
              ]"
            >
              <i v-if="isCategoryAllSelected(cat)" class="bi bi-check-lg font-black text-sm"></i>
              <i v-else-if="isCategoryPartialSelected(cat)" class="bi bi-dash-lg font-black text-sm"></i>
            </div>
          </div>

          <!-- Fields Grid -->
          <div class="p-4 bg-white">
            <div class="flex flex-wrap gap-2.5">
              <button 
                v-for="field in cat.fields" 
                :key="field.id"
                @click="toggleField(field, cat)"
                class="px-3.5 py-1.5 rounded-full text-sm font-bold border transition-all active:scale-95 select-none"
                :class="isFieldSelected(field.id) ? `${cat.color} ${cat.bg} border-transparent shadow-sm` : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'"
              >
                <i v-if="isFieldSelected(field.id)" class="bi bi-check2 me-1"></i>
                <i v-else class="bi bi-plus me-1 opacity-50"></i>
                {{ field.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ➡️ ขวา: จัดลำดับการส่งออก (Sortable Result) -->
      <div class="lg:col-span-5 bg-slate-900 rounded-[2rem] p-6 lg:p-8 shadow-2xl sticky top-8 text-white">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="font-black text-xl flex items-center gap-2"><i class="bi bi-layout-three-columns text-emerald-400"></i> ลำดับคอลัมน์ Excel</h3>
            <p class="text-slate-400 text-sm mt-1">ลากขึ้นลงเพื่อจัดลำดับ ({{ selectedColumns.length }} คอลัมน์)</p>
          </div>
          <button v-if="selectedColumns.length > 0" @click="clearAll" class="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-400/10 px-3 py-1.5 rounded-lg transition-colors">
            ล้างทั้งหมด
          </button>
        </div>

        <!-- กล่องว่างเปล่า -->
        <div v-if="selectedColumns.length === 0" class="border-2 border-dashed border-slate-700 rounded-[1.5rem] p-10 flex flex-col items-center justify-center text-slate-500 gap-3">
          <i class="bi bi-cursor text-4xl"></i>
          <p class="font-medium text-sm text-center">คลิกเลือกข้อมูลจากฝั่งซ้าย<br>เพื่อนำมาจัดลำดับที่นี่</p>
        </div>

        <!-- 🚀 กล่อง DRAG & DROP -->
        <draggable 
          v-else
          v-model="selectedColumns" 
          item-key="id" 
          class="space-y-2.5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar"
          ghost-class="opacity-40 scale-[0.98]"
          drag-class="cursor-grabbing shadow-2xl"
          animation="200"
        >
          <!-- แอนิเมชั่นตอนกล่องถูกเพิ่มเข้ามา -->
          <template #item="{ element, index }">
            <div class="group flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 p-3 rounded-2xl cursor-grab active:cursor-grabbing transition-colors">
              <div class="flex items-center gap-3 overflow-hidden">
                <i class="bi bi-grip-vertical text-slate-500 group-hover:text-slate-300"></i>
                <div class="flex items-center gap-2 truncate">
                  <span class="text-[10px] font-black bg-slate-900 text-slate-400 w-6 h-6 flex items-center justify-center rounded-full shrink-0">{{ index + 1 }}</span>
                  <span :class="[element.catColor, 'font-bold text-sm truncate']">{{ element.label }}</span>
                </div>
              </div>
              <button @click.stop="toggleField(element, { color: element.catColor })" class="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-colors shrink-0">
                <i class="bi bi-x-lg text-xs font-black"></i>
              </button>
            </div>
          </template>
        </draggable>
        
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ทำให้ Scrollbar ฝั่งขวาดูกลืนไปกับ ธีม Dark */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>