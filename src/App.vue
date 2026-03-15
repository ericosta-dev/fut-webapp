<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Toaster } from 'vue-sonner'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initialize()
})
</script>

<template>
  <RouterView />
  <Toaster
    position="top-right"
    :toast-options="{
      style: {
        background: '#111111',
        border: '1px solid #27272A',
        color: '#FFFFFF',
      },
    }"
  />
</template>
