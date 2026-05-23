<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { exchangeCodeWithBackend } from '@/services/auth';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const errorMsg = ref<string | null>(null);

onMounted(async () => {
  const code = route.query.code as string;
  
  if (!code) {
    errorMsg.value = 'Authorization code not found.';
    return;
  }

  try {
    const response = await exchangeCodeWithBackend(code);
    authStore.setToken(response.access_token);
    
    // หลังจากเก็บ Token แล้วให้พาไปหน้า Dashboard
    router.push('/dashboard');
  } catch (err: any) {
    console.error('Auth failed:', err);
    errorMsg.value = err.message || 'Authentication failed. Please try again.';
  }
});

const goBackToLogin = () => {
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
      <div v-if="!errorMsg">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5865F2] mx-auto mb-4"></div>
        <h2 class="text-xl font-semibold text-gray-700">Authenticating...</h2>
        <p class="text-gray-500 mt-2">Please wait while we verify your account.</p>
      </div>

      <div v-else>
        <div class="text-red-500 text-5xl mb-4">
          <i class="bi bi-exclamation-circle"></i>
        </div>
        <h2 class="text-xl font-semibold text-gray-800">Authentication Error</h2>
        <p class="text-gray-600 mt-2 mb-6">{{ errorMsg }}</p>
        
        <button 
          @click="goBackToLogin"
          class="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
        >
          Back to Login
        </button>
      </div>
    </div>
  </div>
</template>
