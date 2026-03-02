<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useRoute } from 'vue-router'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const authStore = useAuthStore()
const runtimeConfig = useRuntimeConfig()

const loading = ref(true)
const lottery = ref<any>(null)
const error = ref<string | null>(null)

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    navigateTo('/login')
    return
  }
  await fetchLotteryDetail()
})

const fetchLotteryDetail = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await $fetch<any>(`${runtimeConfig.public.apiBase}/lottery/${route.params.id}`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    lottery.value = data
  } catch (err: any) {
    console.error('Fetch error:', err)
    error.value = 'ไม่พบข้อมูลสลาก หรือคุณไม่มีสิทธิ์เข้าถึง'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  } catch (e) {
    return dateString
  }
}
</script>

<template>
  <div> <!-- Layout handles background now -->
    
    <!-- Navbar (Sticky) -->
    <div class="pt-6 px-4 flex items-center justify-between mb-4 sticky top-0 z-30 transition-all duration-300">
      <NuxtLink to="/home" class="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-slate-600 hover:text-slate-900 hover:scale-105 transition-all">
        <UIcon name="i-heroicons-arrow-left" class="text-xl" />
      </NuxtLink>
      <div class="font-bold text-lg text-slate-700 tracking-wide">สลากของฉัน</div>
      <div class="w-10"></div>
    </div>

    <div class="px-5 space-y-5 relative z-10 pb-10"> <!-- Removed max-w-md mx-auto as layout handles it -->
      
      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
        <div class="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
        <div class="text-slate-400 animate-pulse">กำลังโหลด...</div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-white rounded-2xl p-8 text-center shadow-sm border border-red-100">
        <UIcon name="i-heroicons-exclamation-triangle" class="text-4xl text-red-400 mb-3" />
        <div class="text-red-500 font-medium mb-4">{{ error }}</div>
        <button @click="fetchLotteryDetail" class="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold">ลองใหม่</button>
      </div>

      <!-- Content -->
      <div v-else class="space-y-5 animate-slide-up">
        
        <!-- 1. Hero Card (Number & Date) -->
        <div class="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden relative group">
           <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400"></div>
           <div class="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full blur-2xl opacity-60"></div>
           
           <div class="p-6 text-center relative z-10">
              <div class="inline-block px-3 py-1 bg-slate-50 rounded-full text-xs font-bold text-slate-400 mb-4 tracking-wider uppercase">
                งวดประจำวันที่
              </div>
              <h3 class="text-lg font-bold text-slate-700 mb-6">{{ formatDate(lottery.draw_date) }}</h3>
              
              <div class="relative py-2">
                <span class="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-500 tracking-[0.3em] uppercase opacity-80">Lucky No.</span>
                <div class="text-7xl font-black text-slate-800 tracking-[0.1em] font-mono drop-shadow-sm scale-100 group-hover:scale-105 transition-transform duration-500">
                  {{ lottery.numbers.replace(/,/g, ', ').replace(/\s+/g, ' ') }}
                </div>
              </div>
           </div>
        </div>

        <!-- 2. Info Card (Type & Location) -->
        <div class="grid grid-cols-3 gap-3">
           <!-- Type -->
           <div class="col-span-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[100px]">
              <div class="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-2">
                 <UIcon name="i-heroicons-ticket" class="text-lg" />
              </div>
              <span class="text-xs text-slate-400 font-medium">ประเภท</span>
              <span class="font-bold text-indigo-900 text-lg uppercase">{{ lottery.type }}</span>
           </div>
           
           <!-- Temple -->
           <div class="col-span-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center min-h-[100px] relative overflow-hidden">
              <div class="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                 <UIcon name="i-heroicons-building-library" class="text-8xl -mb-4 -mr-4" />
              </div>
              <div class="flex items-center gap-2 text-amber-600 mb-1">
                 <UIcon name="i-heroicons-map-pin" class="text-base" />
                 <span class="text-xs font-bold uppercase tracking-wide">สถานที่ขอพร</span>
              </div>
              <div class="font-bold text-slate-800 text-lg leading-tight truncate pr-2">
                {{ lottery.temple_name || '-' }}
              </div>
              <div class="text-xs text-slate-400 mt-1 truncate pr-2">
                {{ lottery.location || 'ไม่ได้ระบุพิกัด' }}
              </div>
           </div>
        </div>

        <!-- 3. Photo Gallery Card -->
        <div v-if="lottery.photo_url || lottery.photo_url_2" class="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
           <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-slate-700 flex items-center gap-2">
                <UIcon name="i-heroicons-photo" class="text-amber-500" />
                รูปภาพบันทึกความทรงจำ
              </h3>
              <span class="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{{ (lottery.photo_url && lottery.photo_url_2) ? '2 รูป' : '1 รูป' }}</span>
           </div>
           
           <div class="space-y-4">
              <div v-if="lottery.photo_url" class="rounded-2xl overflow-hidden border border-slate-100 group relative">
                 <img :src="lottery.photo_url" class="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
                 <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div v-if="lottery.photo_url_2" class="rounded-2xl overflow-hidden border border-slate-100 group relative">
                 <img :src="lottery.photo_url_2" class="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
                 <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
           </div>
        </div>

        <!-- Meta Info -->
        <div class="text-center pt-4 opacity-40 hover:opacity-100 transition-opacity">
           <p class="text-[10px] text-slate-500 font-mono">
             Reference ID: {{ lottery.id }} • Created: {{ new Date(lottery.created_at).toLocaleDateString('th-TH') }}
           </p>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
