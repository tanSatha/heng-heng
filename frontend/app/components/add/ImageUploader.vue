<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  photoUrl1: string
  photoUrl2: string
}>()
const emit = defineEmits(['update:photoUrl1', 'update:photoUrl2'])

const uploading1 = ref(false)
const uploading2 = ref(false)
const runtimeConfig = useRuntimeConfig()

const handleUpload = async (event: any, index: number) => {
  const file = event.target.files[0]
  if (!file) return

  if (index === 1) uploading1.value = true
  else uploading2.value = true

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res: any = await $fetch(`${runtimeConfig.public.apiBase}/lottery/upload`, {
      method: 'POST',
      body: formData
    })
    
    if (index === 1) emit('update:photoUrl1', res.url)
    else emit('update:photoUrl2', res.url)
    
  } catch (e) {
    alert('อัปโหลดรูปไม่สำเร็จ')
    console.error(e)
  } finally {
    if (index === 1) uploading1.value = false
    else uploading2.value = false
  }
}

const clearPhoto = (index: number) => {
  if (index === 1) emit('update:photoUrl1', '')
  else emit('update:photoUrl2', '')
}
</script>

<template>
  <div>
    <label class="block text-sm font-bold text-gray-700 mb-2">รูปถ่ายเลขธูป / ปิงปอง (2 รูป)</label>
    <div class="grid grid-cols-2 gap-4">
      <!-- Slot 1 -->
      <div 
        class="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-amber-400 hover:bg-amber-50 transition-all cursor-pointer relative overflow-hidden group"
        :class="{ 'border-amber-400 bg-amber-50': photoUrl1 }"
      >
        <div v-if="uploading1" class="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin text-amber-500 text-2xl" />
        </div>

        <input 
          v-if="!photoUrl1"
          type="file" 
          accept="image/*" 
          capture="environment"
          @change="(e) => handleUpload(e, 1)"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        <img 
          v-if="photoUrl1" 
          :src="photoUrl1" 
          class="w-full h-full object-cover transition-transform group-hover:scale-105" 
        />
        
        <div v-else class="text-center">
          <UIcon name="i-heroicons-camera" class="text-3xl text-gray-400 group-hover:text-amber-500 transition-colors mb-2" />
          <span class="block text-xs text-gray-500 font-medium">เพิ่มรูป 1</span>
        </div>

        <button 
          v-if="photoUrl1"
          @click.stop="clearPhoto(1)"
          class="absolute top-2 right-2 p-1.5 bg-red-100/90 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-20 shadow-sm custom-path-clip"
        >
          <UIcon name="i-heroicons-trash" class="text-xs" />
        </button>
      </div>

      <!-- Slot 2 -->
      <div 
        class="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-amber-400 hover:bg-amber-50 transition-all cursor-pointer relative overflow-hidden group"
        :class="{ 'border-amber-400 bg-amber-50': photoUrl2 }"
      >
        <div v-if="uploading2" class="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin text-amber-500 text-2xl" />
        </div>

        <input 
          v-if="!photoUrl2"
          type="file" 
          accept="image/*" 
          capture="environment"
          @change="(e) => handleUpload(e, 2)"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        <img 
          v-if="photoUrl2" 
          :src="photoUrl2" 
          class="w-full h-full object-cover transition-transform group-hover:scale-105" 
        />
        
        <div v-else class="text-center">
          <UIcon name="i-heroicons-camera" class="text-3xl text-gray-400 group-hover:text-amber-500 transition-colors mb-2" />
          <span class="block text-xs text-gray-500 font-medium">เพิ่มรูป 2</span>
        </div>

        <button 
          v-if="photoUrl2"
          @click.stop="clearPhoto(2)"
          class="absolute top-2 right-2 p-1.5 bg-red-100/90 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-20 shadow-sm custom-path-clip"
        >
          <UIcon name="i-heroicons-trash" class="text-xs" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-path-clip {
  /* No special clip needed if button is standard sqaure/rounded */
}
</style>
