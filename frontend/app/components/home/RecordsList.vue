<script setup lang="ts">
const { formatDate, getTypeEmoji, getTypeLabel, viewDetail } = useLotteryHelpers()
const authStore = useAuthStore()
const runtimeConfig = useRuntimeConfig()

defineProps<{
  records: any[]
  loading: boolean
}>()

const emit = defineEmits(['refresh'])

const deletingId = ref<number | null>(null)
const showDialog = ref(false)
const pendingDeleteId = ref<number | null>(null)

const confirmDelete = (id: number) => {
  pendingDeleteId.value = id
  showDialog.value = true
}

const handleDelete = async () => {
  if (!pendingDeleteId.value) return
  const id = pendingDeleteId.value
  showDialog.value = false
  deletingId.value = id
  try {
    await $fetch(`${runtimeConfig.public.apiBase}/lottery/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    emit('refresh')
  } catch (e) {
    console.error('Delete failed', e)
  } finally {
    deletingId.value = null
    pendingDeleteId.value = null
  }
}

const cancelDelete = () => {
  showDialog.value = false
  pendingDeleteId.value = null
}
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
        class="record-card group relative overflow-hidden"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <div class="flex items-center gap-3 relative z-10">
          <!-- Photo Thumbnail -->
          <div @click="viewDetail(record.id)" class="shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-100 shadow-sm group-hover:border-amber-300 transition-colors duration-300 cursor-pointer">
            <img
              v-if="record.photoUrl || record.photo_url"
              :src="record.photoUrl || record.photo_url"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              alt="สลาก"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
              <span class="text-2xl opacity-40">🎫</span>
            </div>
          </div>

          <!-- Number & Info -->
          <div @click="viewDetail(record.id)" class="flex-1 min-w-0 py-1 cursor-pointer">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xl font-black text-amber-600 tracking-wide group-hover:text-amber-700 transition-colors">
                {{ record.numbers.replace(/,/g, ', ').replace(/\s+/g, ' ') }}
              </span>
            </div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-sm font-bold text-gray-700 truncate group-hover:text-amber-600 transition-colors">
                🏛️ {{ record.temple?.name || record.temple_name || 'ไม่ทราบวัด' }}
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

          <!-- Win Badge -->
          <div v-if="record.isWin" class="text-2xl filter drop-shadow">🏆</div>

          <!-- Delete Button -->
          <button
            @click.stop="confirmDelete(record.id)"
            :disabled="deletingId === record.id"
            class="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all duration-200"
          >
            <UIcon
              v-if="deletingId === record.id"
              name="i-heroicons-arrow-path"
              class="text-lg animate-spin"
            />
            <UIcon v-else name="i-heroicons-trash" class="text-lg" />
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Dialog -->
    <Teleport to="body">
      <Transition name="dialog">
        <div v-if="showDialog" class="fixed inset-0 z-50 flex items-center justify-center px-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="cancelDelete" />

          <!-- Dialog -->
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 text-center">
            <div class="text-5xl mb-3">🗑️</div>
            <h3 class="text-lg font-black text-gray-800 mb-1">ลบรายการนี้?</h3>
            <p class="text-sm text-gray-500 mb-6">รายการที่ลบแล้วจะไม่สามารถกู้คืนได้</p>
            <div class="flex gap-3">
              <button
                @click="cancelDelete"
                class="flex-1 py-3 rounded-xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                @click="handleDelete"
                class="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
              >
                ลบเลย
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}
.dialog-enter-active .relative,
.dialog-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
.dialog-enter-from .relative {
  transform: scale(0.9);
  opacity: 0;
}
</style>
