<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import TheRecordsList from '~/components/home/RecordsList.vue'

definePageMeta({
  layout: 'default'
})

const authStore = useAuthStore()
const runtimeConfig = useRuntimeConfig()

const records = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    navigateTo('/login')
    return
  }
  await fetchRecords()
})

const fetchRecords = async () => {
  loading.value = true
  try {
    const statsData = await $fetch<any[]>(`${runtimeConfig.public.apiBase}/lottery/my-stats`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` },
    })
    records.value = statsData || []
  } catch (error: any) {
    console.error('Error fetching records:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative pb-28">
    <div class="sticky top-0 z-30 px-4 py-4 bg-white/40 backdrop-blur-md flex items-center shadow-sm mb-4">
      <h1 class="text-xl font-black text-gray-800 flex items-center gap-2">
        <span class="text-2xl">📋</span> รายการบันทึก
      </h1>
      <div class="flex-1"></div>
      <div class="text-xs font-bold bg-white/60 px-3 py-1 rounded-full text-gold-static">
        {{ records.length }} รายการ
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-xl mx-auto px-4">
      <TheRecordsList :records="records" :loading="loading" @refresh="fetchRecords" />
    </div>

    <div class="ornament-ring" style="width: 300px; height: 300px; top: 100px; right: -150px; opacity: 0.1;"></div>
    <div class="ornament-ring" style="width: 200px; height: 200px; bottom: 100px; left: -100px; opacity: 0.1;"></div>
  </div>
</template>

<style scoped>
.ornament-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 215, 0, 0.15);
  z-index: -1;
  pointer-events: none;
}
</style>
