<script setup lang="ts">
const { formatDate, viewDetail } = useLotteryHelpers()

defineProps<{
  recentRecords: any[]
  loading: boolean
}>()
</script>

<template>
  <div class="mb-8 animate-fade-in-up delay-100">
    <div class="flex items-center justify-between mb-4">
       <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
         <span class="text-xl">🎟️</span> ล่าสุด 5 รายการ
       </h2>
    </div>

    <div v-if="loading" class="text-center py-10 opacity-60">
      <div class="animate-spin text-3xl mb-2">⏳</div>
      <p class="text-sm">กำลังโหลดข้อมูล...</p>
    </div>

    <div v-else-if="recentRecords.length === 0" class="text-center py-10 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50">
      <div class="text-4xl mb-3 opacity-80">📭</div>
      <p class="text-gray-500 text-sm font-medium">ยังไม่มีรายการที่บันทึกไว้</p>
      <NuxtLink to="/add" class="mt-4 inline-block btn-gold shadow-lg px-6 py-2 rounded-full text-sm font-bold">
        + เพิ่มเลขเด็ด
      </NuxtLink>
    </div>

    <div v-else class="space-y-4">
      <div v-for="(record, index) in recentRecords" :key="record.id"
           @click="viewDetail(record.id)"
           class="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/60 relative overflow-hidden group hover:shadow-gold-sm transition-all duration-300 cursor-pointer"
           :style="`animation-delay: ${index * 100}ms`">
           
        <!-- Card Decoration -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-yellow-400/20 to-transparent rounded-bl-full -mr-4 -mt-4"></div>
        
        <div class="flex justify-between items-start mb-3 relative z-10">
          <span class="px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm"
            :class="record.type === 'THAI' ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'">
            {{ record.type === 'THAI' ? '🇹🇭 หวยไทย' : '🇱🇦 หวยลาว' }}
          </span>
          <ClientOnly>
            <span class="text-xs font-medium text-gray-500 bg-white/80 px-2 py-1 rounded-full border border-gray-100 shadow-sm">
              {{ formatDate(record.drawDate) }}
            </span>
          </ClientOnly>
        </div>

        <div class="mb-4 text-center relative z-10">
          <h3 class="text-4xl font-black tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-r from-purple-900 to-indigo-900 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
            {{ record.numbers.replace(/,/g, ', ').replace(/\s+/g, ' ') }}
          </h3>
        </div>

        <div class="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 relative z-10">
          <div class="flex items-center gap-2 truncate max-w-[75%]">
            <span class="text-xl">🕌</span>
            <span class="truncate text-base font-bold text-gray-700">{{ record.templeName || 'ไม่ระบุวัด' }}</span>
          </div>
          <span class="flex items-center gap-1 text-purple-600 font-medium group-hover:translate-x-1 transition-transform">
            รายละเอียด ➜
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
