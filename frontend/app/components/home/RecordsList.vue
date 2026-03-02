<script setup lang="ts">
const { formatDate, getTypeEmoji, getTypeLabel, viewDetail } = useLotteryHelpers()

defineProps<{
  records: any[]
  loading: boolean
}>()

const emit = defineEmits(['refresh'])
</script>

<template>
  <div class="animate-fade-in-up delay-300">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color: rgba(255, 215, 0, 0.7);">
        📋 รายการเลขเด็ดของคุณ
      </h2>
      <button @click="emit('refresh')" class="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-300"
        style="color: rgba(255, 215, 0, 0.4); border: 1px solid rgba(255, 215, 0, 0.1);"
        :class="{ 'opacity-50': loading }">
        🔄 รีเฟรช
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center py-16">
      <div class="text-4xl animate-bounce-slow mb-4">🙏</div>
      <p class="text-sm font-medium" style="color: rgba(255, 215, 0, 0.4);">กำลังโหลด...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="records.length === 0" class="glass-card p-10 text-center">
      <div class="text-5xl mb-4">📝</div>
      <h3 class="text-lg font-bold mb-2" style="color: rgba(255, 215, 0, 0.7);">ยังไม่มีเลขเด็ด</h3>
      <p class="text-sm mb-6" style="color: rgba(190, 170, 220, 0.45);">
        เริ่มบันทึกเลขเด็ดจากวัดดังได้เลย!
      </p>
      <NuxtLink to="/add" class="btn-gold px-8 py-3 rounded-xl text-base inline-block">
        ✨ เริ่มบันทึกเลย
      </NuxtLink>
    </div>

    <!-- Records List -->
    <div v-else class="space-y-4">
      <div
        v-for="(record, index) in records"
        :key="record.id"
        @click="viewDetail(record.id)"
        class="record-card group relative overflow-hidden cursor-pointer"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <div class="flex items-center gap-4 relative z-10">
          <!-- Number Badge -->
          <div class="number-badge shadow-md group-hover:scale-105 transition-transform duration-300">
            <span class="text-2xl font-black tracking-[0.1em]">{{ record.numbers.replace(/,/g, ', ').replace(/\s+/g, ' ') }}</span>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0 py-1">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-base font-bold text-gray-800 truncate group-hover:text-amber-600 transition-colors">
                🏛️ {{ record.temple?.name || 'ไม่ทราบวัด' }}
              </span>
            </div>
            
            <div class="flex items-center flex-wrap gap-2 text-xs text-gray-500">
              <span class="px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 font-medium">
                {{ getTypeLabel(record.type) }}
              </span>
              <ClientOnly>
                <span class="flex items-center gap-1">
                  📅 {{ formatDate(record.drawDate) }}
                </span>
              </ClientOnly>
            </div>
          </div>

          <!-- Win Badge or Arrow -->
          <div v-if="record.isWin" class="text-2xl filter drop-shadow hover:scale-110 transition-transform">
            🏆
          </div>
          <div v-else class="text-gray-300 pr-2 group-hover:text-amber-400 transition-colors">
            <UIcon name="i-heroicons-chevron-right" class="text-xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.record-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1rem;
  border: 1px solid #f3f4f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.record-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(255, 180, 0, 0.1), 0 4px 6px -2px rgba(255, 180, 0, 0.05);
  border-color: rgba(255, 215, 0, 0.3);
}

.number-badge {
  min-width: 80px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  background: linear-gradient(135deg, #FFC107 0%, #FF9800 100%);
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  padding: 0 16px;
}
</style>
