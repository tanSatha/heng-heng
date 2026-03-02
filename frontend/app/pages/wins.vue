<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default'
})

const authStore = useAuthStore()
const runtimeConfig = useRuntimeConfig()

const userWins = ref<any[]>([])
const loading = ref(true)

const fetchUserWins = async () => {
  loading.value = true
  if (authStore.token) {
    try {
      const wins = await $fetch<any[]>(`${runtimeConfig.public.apiBase}/lottery/user-wins`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      userWins.value = wins || []
    } catch (e) {
      console.error('Failed to fetch user wins', e)
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    navigateTo('/login')
    return
  }
  fetchUserWins()
})

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="relative pb-28 min-h-[80vh]">
    <div class="sticky top-0 z-30 px-4 py-4 bg-white/40 backdrop-blur-md flex items-center shadow-sm mb-4">
      <h1 class="text-xl font-black text-gray-800 flex items-center gap-2">
        <span class="text-2xl">🎉</span> ประวัติถูกรางวัล
      </h1>
      <div class="flex-1"></div>
      <div class="text-xs font-bold bg-green-100 px-3 py-1 rounded-full text-green-700">
        {{ userWins.length }} รายการ
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-xl mx-auto px-4">
      <div v-if="loading" class="flex justify-center items-center py-20">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl text-amber-500" />
      </div>

      <div v-else-if="userWins.length === 0" class="text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm">
        <div class="text-6xl mb-4 opacity-50">😢</div>
        <h3 class="text-lg font-bold text-gray-700 mb-2">ยังไม่มีประวัติการถูกรางวัล</h3>
        <p class="text-gray-500 text-sm">ขอให้งวดหน้าเป็นวันของคุณนะครับ!</p>
        <NuxtLink to="/add" class="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-amber-100 text-amber-700 font-bold rounded-2xl hover:bg-amber-200 transition-colors">
          <UIcon name="i-heroicons-plus" />
          เพิ่มเลขเด็ดเลย
        </NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <div v-for="win in userWins" :key="win.id" class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-5 shadow-lg shadow-green-500/20 text-white relative overflow-hidden group border border-green-400">
          <div class="absolute -right-4 -top-4 text-8xl opacity-10 blur-sm transform group-hover:scale-110 transition-transform duration-500 pointer-events-none">✨</div>
          
          <div class="flex justify-between items-center mb-3 relative z-10">
             <span class="font-black text-xl drop-shadow-sm">{{ win.type === 'THAI' ? 'หวยรัฐบาลไทย' : 'หวยลาวพัฒนา' }}</span>
             <span class="text-xs bg-black/20 px-3 py-1 rounded-full whitespace-nowrap">{{ formatDate(win.drawDate) }}</span>
          </div>
          
          <div class="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 relative z-10">
            <div class="flex flex-col gap-1">
               <span class="text-[10px] opacity-80 uppercase tracking-wider">เลขที่ถูก:</span>
               <div class="flex flex-wrap gap-2 font-black text-xl">
                  <span v-for="num in win.wonNumbers" :key="num" class="bg-white text-green-700 px-3 border border-green-200 py-1 rounded-xl shadow-inner">{{ num }}</span>
               </div>
            </div>
          </div>
          
          <div class="mt-4 flex items-center justify-between relative z-10">
             <div class="flex items-center gap-1.5 text-sm">
                <UIcon name="i-heroicons-map-pin" class="opacity-80" />
                <span class="font-bold opacity-90">{{ win.templeName || 'ไม่ระบุ' }}</span>
             </div>
             <NuxtLink :to="`/lottery/${win.id}`" class="text-xs bg-white text-green-700 px-4 py-2 rounded-full font-bold shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1">
                ดูรายละเอียด
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
             </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
