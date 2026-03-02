<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
}>()
const emit = defineEmits(['update:modelValue'])

const runtimeConfig = useRuntimeConfig()
const searchQuery = ref(props.modelValue || '')
const dialogSearchQuery = ref('') // Separate query for dialog
const nearbyTemples = ref<any[]>([])
const loadingTemples = ref(false)
const locationError = ref('')
const showDialog = ref(false)
let searchTimeout: any = null

const openDialog = () => {
  showDialog.value = true
  dialogSearchQuery.value = '' // Reset dialog search
  fetchNearbyTemples('') // Fetch nearby (no keyword)
}

const handleSearchInDialog = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchNearbyTemples(dialogSearchQuery.value)
  }, 500)
}

const fetchNearbyTemples = (keyword: string = '') => {
  if (!navigator.geolocation) {
    locationError.value = 'เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง'
    return
  }

  loadingTemples.value = true
  locationError.value = ''

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords
        
        const params: any = { lat: latitude, lng: longitude, limit: 10 }
        if (keyword) params.keyword = keyword

        const data = await $fetch<any[]>(`${runtimeConfig.public.apiBase}/lottery/nearby-places`, {
          params
        })
        nearbyTemples.value = data || []
      } catch (error) {
        console.error('Error fetching places:', error)
        locationError.value = 'ไม่สามารถค้นหาวัดได้'
      } finally {
        loadingTemples.value = false
      }
    },
    (error) => {
      console.error('Geolocation error:', error)
      loadingTemples.value = false
      locationError.value = 'กรุณาเปิดสิทธิ์การเข้าถึงตำแหน่ง'
    }
  )
}

const selectTemple = (name: string) => {
  searchQuery.value = name
  emit('update:modelValue', name)
  showDialog.value = false
}

const handleManualInput = () => {
  emit('update:modelValue', searchQuery.value)
}

// Watch prop change to update local query
watch(() => props.modelValue, (newVal) => {
  if (newVal !== searchQuery.value) {
    searchQuery.value = newVal
  }
})
</script>

<template>
  <div>
    <label class="block text-sm font-bold text-gray-700 mb-2">ชื่อวัด / สถานที่ขอพร <span class="text-red-500">*</span></label>
    
    <!-- Input + Search Button -->
    <div class="flex gap-2">
      <input 
        v-model="searchQuery"
        @input="handleManualInput"
        type="text" 
        placeholder="พิมพ์ชื่อวัด หรือกดปุ่มค้นหา"
        class="flex-1 pl-4 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all outline-none text-gray-800"
      />
      <button 
        @click="openDialog"
        type="button"
        class="px-4 bg-amber-100 hover:bg-amber-200 text-amber-600 rounded-xl transition-colors flex items-center justify-center min-w-[3rem]"
      >
        <UIcon v-if="loadingTemples" name="i-heroicons-arrow-path" class="text-xl animate-spin" />
        <UIcon v-else name="i-heroicons-map-pin" class="text-xl" />
      </button>
    </div>
    <p v-if="locationError" class="text-red-500 text-xs mt-1">{{ locationError }}</p>

    <!-- Temple Dialog Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDialog" class="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showDialog = false"></div>
          
          <!-- Dialog Card -->
          <div class="relative z-10 w-full max-w-md mx-4 mb-4 sm:mb-0 bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[85vh]">
            <!-- Dialog Header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50 shrink-0">
              <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span class="text-xl">🏛️</span> เลือกวัด/สถานที่
              </h3>
              <button @click="showDialog = false" class="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <UIcon name="i-heroicons-x-mark" class="text-xl text-gray-500" />
              </button>
            </div>

            <!-- Search inside Dialog -->
            <div class="px-5 py-3 border-b border-gray-50 shrink-0">
              <div class="relative">
                <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  v-model="dialogSearchQuery"
                  @input="handleSearchInDialog"
                  type="text" 
                  placeholder="ค้นหาชื่อวัด..."
                  class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all outline-none text-gray-800 text-base"
                  autofocus
                />
              </div>
            </div>

            <!-- Temple List -->
            <div class="flex-1 overflow-y-auto">
              <!-- Loading -->
              <div v-if="loadingTemples" class="flex items-center justify-center py-10">
                <UIcon name="i-heroicons-arrow-path" class="text-2xl text-amber-500 animate-spin mr-2" />
                <span class="text-sm text-gray-500">กำลังค้นหา...</span>
              </div>

              <!-- Error -->
              <div v-else-if="locationError" class="text-center py-10 px-5">
                <div class="text-3xl mb-2">📍</div>
                <p class="text-red-500 text-sm">{{ locationError }}</p>
              </div>

              <!-- Empty -->
              <div v-else-if="nearbyTemples.length === 0" class="text-center py-10 px-5">
                <div class="text-3xl mb-2">🔍</div>
                <p class="text-gray-400 text-sm">ไม่พบสถานที่ใกล้เคียง</p>
                <p class="text-gray-300 text-xs mt-1">ลองพิมพ์ชื่อวัดที่ต้องการ</p>
              </div>

              <!-- Results -->
              <div v-else class="p-5 space-y-4 bg-gray-50/50">
                <div 
                  v-for="(temple, idx) in nearbyTemples" 
                  :key="temple.id || idx" 
                  @click="selectTemple(temple.name)"
                  class="temple-card group relative overflow-hidden bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-amber-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div class="flex items-center gap-4 relative z-10">
                    <!-- Icon -->
                    <div class="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl border-4 border-amber-100 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 text-white shrink-0">
                      🏛️
                    </div>
                    
                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <h4 class="text-base font-black text-gray-800 group-hover:text-amber-600 transition-colors truncate mb-1">
                        {{ temple.name }}
                      </h4>
                      <p class="text-xs text-gray-400 group-hover:text-gray-500 transition-colors truncate">
                        {{ temple.vicinity || 'สถานที่ขอพร' }}
                      </p>
                    </div>

                    <!-- Distance Badge -->
                     <span v-if="temple.distance" class="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 whitespace-nowrap shadow-sm ml-2">
                      {{ temple.distance }}
                    </span>
                    <span v-else class="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200 ml-2">
                      ใกล้ฉัน
                    </span>
                  </div>
                  
                  <!-- Hover Gradient bg -->
                  <div class="absolute inset-0 bg-gradient-to-r from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <!-- Decorative Circle -->
                  <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-100/50 rounded-full blur-2xl group-hover:bg-amber-200/50 transition-colors duration-300 pointer-events-none"></div>
                </div>
              </div>
            </div>

            <!-- Close Button -->
            <div class="px-5 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
              <button 
                @click="showDialog = false"
                class="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-sm font-medium transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
