<script setup lang="ts">
import { buildAuthUrl } from '@/services/auth';

const handleLogin = () => {
  window.location.href = buildAuthUrl();
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
      <h1 class="text-2xl font-bold mb-6 text-gray-800">Classroom Sync</h1>
      <p class="text-gray-600 mb-8">Please login with Discord to continue</p>
      
      <button 
        @click="handleLogin"
        class="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-3 px-4 rounded-lg transition duration-200"
      >
        <i class="bi bi-discord text-xl"></i>
        Login with Discord
      </button>
    </div>
  </div>
</template>
