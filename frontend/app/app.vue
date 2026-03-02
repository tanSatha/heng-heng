<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

// Re-fetch user profile on app load if token exists
onMounted(async () => {
  if (authStore.token && !authStore.user) {
    await authStore.fetchProfile()
  }
})

useHead({
  title: 'บุ๊คเลข - แอปบันทึกเลขเด็ด',
  meta: [
    { name: 'description', content: 'แอปพลิเคชันสำหรับบันทึกและจัดการเลขเด็ดของคุณ' }
  ]
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
