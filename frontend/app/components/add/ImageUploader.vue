<script setup lang="ts">
const props = defineProps<{
  photoUrl1: string
  photoUrl2: string
}>()
const emit = defineEmits(['update:photoUrl1', 'update:photoUrl2'])

const uploading1 = ref(false)
const uploading2 = ref(false)
const showMenu = ref<1 | 2 | null>(null)
const runtimeConfig = useRuntimeConfig()

const fileInputCamera1 = ref<HTMLInputElement>()
const fileInputCamera2 = ref<HTMLInputElement>()
const fileInputGallery1 = ref<HTMLInputElement>()
const fileInputGallery2 = ref<HTMLInputElement>()

const openMenu = (index: 1 | 2) => {
  showMenu.value = index
}

const pickCamera = (index: 1 | 2) => {
  showMenu.value = null
  if (index === 1) fileInputCamera1.value?.click()
  else fileInputCamera2.value?.click()
}

const pickGallery = (index: 1 | 2) => {
  showMenu.value = null
  if (index === 1) fileInputGallery1.value?.click()
  else fileInputGallery2.value?.click()
}

const handleUpload = async (event: any, index: 1 | 2) => {
  const file = event.target.files[0]
  if (!file) return

  if (index === 1) uploading1.value = true
  else uploading2.value = true

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res: any = await $fetch(`${runtimeConfig.public.apiBase}/lottery/upload`, {
      method: 'POST',
      body: formData,
    })
    if (index === 1) emit('update:photoUrl1', res.url)
    else emit('update:photoUrl2', res.url)
  } catch (e) {
    alert('อัปโหลดรูปไม่สำเร็จ')
    console.error(e)
  } finally {
    if (index === 1) uploading1.value = false
    else uploading2.value = false
    event.target.value = ''
  }
}

const clearPhoto = (index: 1 | 2) => {
  if (index === 1) emit('update:photoUrl1', '')
  else emit('update:photoUrl2', '')
}
</script>

<template>
  <div>
    <label class="block text-sm font-bold text-gray-700 mb-2">รูปถ่ายเลขธูป / ปิงปอง (2 รูป)</label>
    <div class="grid grid-cols-2 gap-4">

      <!-- Slot 1 & 2 -->
      <template v-for="index in [1, 2] as const" :key="index">
        <div
          class="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-amber-400 hover:bg-amber-50 transition-all cursor-pointer relative overflow-hidden group"
          :class="{ 'border-amber-400 bg-amber-50': index === 1 ? photoUrl1 : photoUrl2 }"
          @click="!(index === 1 ? photoUrl1 : photoUrl2) && openMenu(index)"
        >
          <!-- Uploading overlay -->
          <div v-if="index === 1 ? uploading1 : uploading2"
            class="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin text-amber-500 text-2xl" />
          </div>

          <!-- Preview -->
          <img
            v-if="index === 1 ? photoUrl1 : photoUrl2"
            :src="index === 1 ? photoUrl1 : photoUrl2"
            class="w-full h-full object-cover transition-transform group-hover:scale-105"
          />

          <!-- Placeholder -->
          <div v-else class="text-center pointer-events-none">
            <UIcon name="i-heroicons-camera" class="text-3xl text-gray-400 group-hover:text-amber-500 transition-colors mb-1" />
            <span class="block text-xs text-gray-500 font-medium">เพิ่มรูป {{ index }}</span>
            <span class="block text-[10px] text-gray-400 mt-0.5">กล้อง / คลัง</span>
          </div>

          <!-- Delete button -->
          <button
            v-if="index === 1 ? photoUrl1 : photoUrl2"
            @click.stop="clearPhoto(index)"
            class="absolute top-2 right-2 p-1.5 bg-red-100/90 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-20 shadow-sm"
          >
            <UIcon name="i-heroicons-trash" class="text-xs" />
          </button>
        </div>
      </template>
    </div>

    <!-- Hidden file inputs -->
    <input ref="fileInputCamera1" type="file" accept="image/*" capture="environment" class="hidden" @change="(e) => handleUpload(e, 1)" />
    <input ref="fileInputCamera2" type="file" accept="image/*" capture="environment" class="hidden" @change="(e) => handleUpload(e, 2)" />
    <input ref="fileInputGallery1" type="file" accept="image/*" class="hidden" @change="(e) => handleUpload(e, 1)" />
    <input ref="fileInputGallery2" type="file" accept="image/*" class="hidden" @change="(e) => handleUpload(e, 2)" />

    <!-- Action Sheet -->
    <Teleport to="body">
      <Transition name="sheet">
        <div v-if="showMenu" class="fixed inset-0 z-50 flex items-end justify-center" @click.self="showMenu = null">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showMenu = null" />
          <div class="relative w-full max-w-md bg-white rounded-t-3xl p-5 pb-8 shadow-2xl">
            <div class="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <p class="text-center text-sm font-bold text-gray-500 mb-4">เพิ่มรูปที่ {{ showMenu }}</p>
            <div class="space-y-3">
              <button
                @click="pickCamera(showMenu!)"
                class="w-full flex items-center gap-4 p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <div class="w-11 h-11 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
                  <UIcon name="i-heroicons-camera" class="text-white text-xl" />
                </div>
                <div class="text-left">
                  <p class="font-bold text-gray-800">ถ่ายรูป</p>
                  <p class="text-xs text-gray-500">เปิดกล้องถ่ายภาพ</p>
                </div>
              </button>
              <button
                @click="pickGallery(showMenu!)"
                class="w-full flex items-center gap-4 p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <div class="w-11 h-11 bg-purple-500 rounded-xl flex items-center justify-center shrink-0">
                  <UIcon name="i-heroicons-photo" class="text-white text-xl" />
                </div>
                <div class="text-left">
                  <p class="font-bold text-gray-800">เลือกจากคลังรูป</p>
                  <p class="text-xs text-gray-500">เปิด Gallery / Photos</p>
                </div>
              </button>
            </div>
            <button @click="showMenu = null" class="w-full mt-4 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm">
              ยกเลิก
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;
}
.sheet-enter-active .relative,
.sheet-leave-active .relative {
  transition: transform 0.25s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .relative {
  transform: translateY(100%);
}
</style>
