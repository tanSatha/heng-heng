<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const runtimeConfig = useRuntimeConfig()
const authStore = useAuthStore()

definePageMeta({
  layout: 'default'
})

const activeTab = ref<'THAI' | 'LAO'>('LAO')
const laoResults = ref<any[]>([])
const thaiResults = ref<any[]>([])
const loading = ref(true)
const userWins = ref<any[]>([])
const showWins = ref(true)

const fetchResults = async () => {
  loading.value = true
  try {
    if (activeTab.value === 'LAO') {
      const res = await $fetch<any[]>(`${runtimeConfig.public.apiBase}/lottery/results/lao`, { params: { limit: 5 } })
      laoResults.value = res || []
    } else {
      const res = await $fetch<any[]>(`${runtimeConfig.public.apiBase}/lottery/results/thai`, { params: { limit: 5 } })
      thaiResults.value = res || []
    }
  } catch (e) {
    console.error(`Failed to fetch ${activeTab.value} results`, e)
  } finally {
    loading.value = false
  }
}

watch(activeTab, (newVal) => {
  if (import.meta.client) {
    localStorage.setItem('result_active_tab', newVal)
  }
  fetchResults()
})

const fetchUserWins = async () => {
  if (authStore.token) {
    try {
      const wins = await $fetch<any[]>(`${runtimeConfig.public.apiBase}/lottery/user-wins`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      userWins.value = wins || []
    } catch (e) {
      console.error('Failed to fetch user wins', e)
    }
  }
}

onMounted(() => {
  const savedTab = localStorage.getItem('result_active_tab')
  if (savedTab === 'THAI' || savedTab === 'LAO') {
    if (activeTab.value !== savedTab) {
      activeTab.value = savedTab
      // Watcher will trigger fetchResults
    } else {
      fetchResults()
    }
  } else {
    fetchResults()
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
  <div class="heng-bg min-h-screen relative pb-28 px-4 flex flex-col items-center">
    
    <div class="w-full max-w-md">
      <h1 class="text-3xl font-black text-center text-gold-gradient mb-2 drop-shadow-sm">🏆 ตรวจผลรางวัล</h1>
      <p class="text-center text-gray-500 text-sm mb-6">ผลสลากล่าสุดจากการอัปเดตอัตโนมัติ</p>

      <!-- Winning Notifications -->
      <div v-if="userWins.length > 0 && showWins" class="mb-6 w-full animate-fade-in-up">
         <div class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 shadow-lg shadow-green-500/20 text-white relative overflow-hidden group border border-green-400">
            <!-- Close Button -->
            <button @click="showWins = false" class="absolute top-4 right-4 text-white/70 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-full transition-all z-20">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <div class="absolute -right-4 -top-4 text-8xl opacity-20 blur-sm transform group-hover:scale-110 transition-transform duration-500 pointer-events-none">🎉</div>
            <h2 class="text-2xl font-black mb-1 drop-shadow-md pr-8">🎉 ยินดีด้วย คุณถูกรางวัล!</h2>
            <p class="text-green-50 mb-4 opacity-90 text-sm">เลขเด็ดที่คุณเพิ่มไว้ตรงกับผลการออกรางวัล</p>
            
            <div class="space-y-3 relative z-10">
               <div v-for="win in userWins" :key="win.id" class="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                  <div class="flex justify-between items-center mb-2">
                     <span class="font-bold text-lg drop-shadow-sm">{{ win.type === 'THAI' ? 'หวยรัฐบาลไทย' : 'หวยลาวพัฒนา' }}</span>
                     <span class="text-xs bg-black/20 px-3 py-1 rounded-full whitespace-nowrap">{{ formatDate(win.drawDate) }}</span>
                  </div>
                  <div class="flex flex-col gap-1">
                     <span class="text-[10px] opacity-80 uppercase tracking-wider">เลขที่ถูก:</span>
                     <div class="flex flex-wrap gap-2 font-black text-xl">
                        <span v-for="num in win.wonNumbers" :key="num" class="bg-white text-green-700 px-3 border border-green-200 py-1 rounded-xl shadow-inner">{{ num }}</span>
                     </div>
                  </div>
                  
                  <div class="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
                     <div class="flex items-center gap-1.5 text-sm">
                        <span>ที่มา:</span>
                        <span class="font-bold">{{ win.templeName || 'ไม่ระบุ' }}</span>
                     </div>
                     <NuxtLink :to="`/lottery/${win.id}`" class="text-xs bg-white text-green-700 px-3 py-1.5 rounded-full font-bold shadow-sm hover:scale-105 transition-all flex items-center gap-1">
                        ดูรายละเอียด
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                     </NuxtLink>
                  </div>
               </div>
            </div>

            <!-- View Win History Button Inside Card -->
            <div class="mt-4 pt-4 border-t border-white/20 relative z-10">
              <NuxtLink to="/wins" class="group flex items-center justify-center gap-2 text-sm font-bold text-white bg-white/10 hover:bg-white/20 px-5 py-3 rounded-full transition-all backdrop-blur-sm border border-white/30 shadow-sm w-full">
                ดูประวัติการถูกรางวัลทั้งหมด
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </NuxtLink>
            </div>
         </div>
      </div>

      <!-- Tabs -->
      <div class="flex p-1 bg-white rounded-full shadow-sm mb-6 border border-gray-100">
        <button 
          @click="activeTab = 'THAI'"
          :class="['flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all', activeTab === 'THAI' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50']"
        >
          🇹🇭 หวยรัฐบาลไทย
        </button>
        <button 
          @click="activeTab = 'LAO'"
          :class="['flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all', activeTab === 'LAO' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50']"
        >
          🇱🇦 หวยลาวพัฒนา
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-10 opacity-60">
         <div class="animate-spin text-3xl mb-2">⏳</div>
         <p class="text-sm">กำลังโหลดข้อมูล...</p>
      </div>

      <!-- Lao Results -->
      <div v-else-if="activeTab === 'LAO'">
        <div v-if="laoResults.length === 0" class="bg-white rounded-2xl p-6 text-center text-gray-500 shadow-sm border border-gray-100">
           ไม่มีข้อมูลผลหวยลาว
        </div>
        <div v-else class="space-y-4">
           <div v-for="result in laoResults" :key="result.id" class="bg-white rounded-3xl p-5 shadow-sm border border-gold-static/20 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100 to-transparent rounded-bl-full opacity-50 -mr-4 -mt-4"></div>
              
              <div class="relative z-10 flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                 <div class="font-bold text-slate-700">งวดวันที่</div>
                 <div class="text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full text-sm">
                    {{ formatDate(result.drawDate) }}
                 </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 relative z-10">
                 <div class="col-span-1 text-center bg-slate-50 rounded-xl p-2 border border-slate-100">
                    <div class="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">4 ตัว</div>
                    <div class="font-black text-slate-800 text-lg">{{ result.resultData.number4 || '-' }}</div>
                 </div>
                 <div class="col-span-1 text-center bg-slate-50 rounded-xl p-2 border border-slate-100">
                    <div class="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">3 ตัว</div>
                    <div class="font-black text-slate-800 text-lg">{{ result.resultData.number3 || '-' }}</div>
                 </div>
                 <div class="col-span-1 text-center bg-slate-50 rounded-xl p-2 border border-slate-100">
                    <div class="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">2 ตัวล่าง</div>
                    <div class="font-black text-slate-800 text-lg text-amber-600">
                      {{ result.resultData.number4 ? result.resultData.number4.substring(0, 2) : '-' }}
                    </div>
                 </div>
                 <div class="col-span-1 text-center bg-slate-50 rounded-xl p-2 border border-slate-100">
                    <div class="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">2 ตัวบน</div>
                    <div class="font-black text-slate-800 text-lg text-amber-600">
                      {{ result.resultData.number4 ? result.resultData.number4.substring(2, 4) : '-' }}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <!-- Thai Results -->
      <div v-else-if="activeTab === 'THAI'">
        <div v-if="thaiResults.length === 0" class="bg-white rounded-2xl p-6 text-center text-gray-500 shadow-sm border border-gray-100">
           ไม่มีข้อมูลผลหวยไทย
        </div>
        <div v-else class="space-y-4">
           <div v-for="result in thaiResults" :key="result.id" class="bg-white rounded-3xl p-5 shadow-sm border border-gold-static/20 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100 to-transparent rounded-bl-full opacity-50 -mr-4 -mt-4"></div>
              
              <div class="relative z-10 flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                 <div class="font-bold text-slate-700">งวดวันที่</div>
                 <div class="text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full text-sm">
                    {{ formatDate(result.drawDate) }}
                 </div>
              </div>

              <!-- Prize 1 -->
              <div class="mb-4 text-center relative z-10 bg-amber-50/50 rounded-2xl py-4 border border-amber-100">
                <div class="text-[10px] text-amber-600 font-bold mb-1 uppercase tracking-wider">รางวัลที่ 1</div>
                <div class="font-black text-slate-800 text-4xl tracking-widest text-amber-600 drop-shadow-sm">{{ result.resultData.number1 || '-' }}</div>
              </div>

              <div class="grid grid-cols-2 gap-3 relative z-10">
                 <!-- Front 3 -->
                 <div class="col-span-1 text-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div class="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">เลขหน้า 3 ตัว</div>
                    <div class="font-black text-slate-800 text-lg flex justify-center gap-3">
                      <span>{{ result.resultData.front3?.[0] || '-' }}</span>
                      <span>{{ result.resultData.front3?.[1] || '-' }}</span>
                    </div>
                 </div>
                 <!-- Back 3 -->
                 <div class="col-span-1 text-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div class="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">เลขท้าย 3 ตัว</div>
                    <div class="font-black text-slate-800 text-lg flex justify-center gap-3">
                      <span>{{ result.resultData.back3?.[0] || '-' }}</span>
                      <span>{{ result.resultData.back3?.[1] || '-' }}</span>
                    </div>
                 </div>
                 <!-- Bottom 2 -->
                 <div class="col-span-2 text-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div class="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">เลขท้าย 2 ตัว</div>
                    <div class="font-black text-amber-600 text-2xl drop-shadow-sm">{{ result.resultData.bottom2 || '-' }}</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

    </div>

    <!-- Background Ornaments -->
    <div class="ornament-ring" style="width: 400px; height: 400px; top: -100px; left: -100px; opacity: 0.1;"></div>
  </div>
</template>

<style scoped>
.btn-gold {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.ornament-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 215, 0, 0.15);
  z-index: -1;
  pointer-events: none;
}
</style>
