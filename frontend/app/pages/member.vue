<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(false)

// Edit Profile State
const isEditing = ref(false)
const editForm = ref({
  username: '',
  avatarUrl: ''
})
const editLoading = ref(false)
const editError = ref('')
const uploading = ref(false)

const handleLogout = async () => {
  loading.value = true
  // Mock delay for feel
  await new Promise(resolve => setTimeout(resolve, 800))
  authStore.logout()
}

// Format date if needed
const joinDate = computed(() => {
  if (!authStore.user?.createdAt) return 'ไม่ระบุ'
  return new Date(authStore.user.createdAt).toLocaleDateString('th-TH', {
    dateStyle: 'medium'
  })
})

const openEdit = () => {
  editForm.value = {
    username: authStore.user?.username || '',
    avatarUrl: authStore.user?.avatarUrl || ''
  }
  isEditing.value = true
  editError.value = ''
}

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  if (!file.type.startsWith('image/')) {
    editError.value = 'Please select an image file (PNG, JPG, GIF)'
    return
  }

  const formData = new FormData()
  formData.append('file', file)

  uploading.value = true
  editError.value = ''
  
  try {
    const runtimeConfig = useRuntimeConfig()
    const response = await $fetch<any>(`${runtimeConfig.public.apiBase}/auth/upload-avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: formData
    })
    
    // Auto set URL to form
    editForm.value.avatarUrl = response.url
  } catch (e: any) {
    console.error('Upload Error', e)
    editError.value = e.data?.message || 'Failed to upload image'
  } finally {
    uploading.value = false
  }
}

const saveProfile = async () => {
  editLoading.value = true
  editError.value = ''
  try {
    const runtimeConfig = useRuntimeConfig()
    const updatedUser = await $fetch<any>(`${runtimeConfig.public.apiBase}/auth/profile`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: editForm.value
    })
    
    // Update store
    authStore.user = updatedUser
    isEditing.value = false
  } catch (e: any) {
    editError.value = e.data?.message || 'Failed to update profile'
  } finally {
    editLoading.value = false
  }
}
</script>

<template>
  <div class="px-4 pb-24 relative">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8 animate-fade-in-down">
      <h1 class="text-3xl font-black text-gold-gradient">
        ข้อมูลสมาชิก
      </h1>
      <button @click="router.back()" class="btn-ghost p-2 rounded-full text-gold-600">
        <UIcon name="i-heroicons-arrow-left" class="text-2xl" />
      </button>
    </div>

    <!-- Profile Card -->
    <div class="glass-card p-6 mb-6 animate-fade-in-up md:max-w-md mx-auto relative overflow-hidden">
      <!-- Edit Button -->
      <button @click="openEdit" class="absolute top-4 right-4 text-purple-600 bg-purple-50 p-2 rounded-full hover:bg-purple-100 transition-colors z-20">
        <UIcon name="i-heroicons-pencil-square" class="text-xl" />
      </button>

      <!-- Decorator -->
      <div class="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/20 rounded-full blur-3xl"></div>
      
      <div class="flex flex-col items-center text-center relative z-10">
        <!-- Avatar -->
        <div class="relative mb-4 group">
          <div class="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 shadow-gold relative">
            <img 
              :src="authStore.user?.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + authStore.user?.username" 
              alt="Avatar" 
              class="w-full h-full object-cover rounded-full bg-slate-50 border-2 border-white"
            />
          </div>
          <div class="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white shadow-sm"></div>
        </div>

        <h2 class="text-2xl font-bold text-gray-800 mb-1">
          {{ authStore.user?.username || 'ผู้ใช้งานทั่วไป' }}
        </h2>
        <p class="text-sm text-gray-500 mb-4 font-mono bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
          {{ authStore.user?.email }}
        </p>

        <div class="grid grid-cols-2 gap-4 w-full mt-4 border-t border-gray-100 pt-4">
          <div class="text-center">
            <p class="text-xs text-gray-400 uppercase tracking-widest font-semibold">สถานะ</p>
            <p class="text-green-600 font-bold bg-green-50 inline-block px-2 py-0.5 rounded text-sm mt-1">ออนไลน์</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-gray-400 uppercase tracking-widest font-semibold">สมาชิกตั้งแต่</p>
            <p class="text-gray-700 font-medium text-sm mt-1">{{ joinDate }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="space-y-3 animate-fade-in-up delay-100 md:max-w-md mx-auto">
      <button class="w-full glass-card p-4 flex items-center justify-between group hover:bg-white/60 transition-colors">
        <div class="flex items-center gap-3">
          <div class="bg-purple-100 p-2 rounded-lg text-purple-600">
            <UIcon name="i-heroicons-cog-6-tooth" class="text-xl" />
          </div>
          <span class="font-medium text-gray-700">ตั้งค่าบัญชี</span>
        </div>
        <UIcon name="i-heroicons-chevron-right" class="text-gray-400 group-hover:text-purple-500 transition-colors" />
      </button>

      <button class="w-full glass-card p-4 flex items-center justify-between group hover:bg-white/60 transition-colors">
        <div class="flex items-center gap-3">
          <div class="bg-amber-100 p-2 rounded-lg text-amber-600">
            <UIcon name="i-heroicons-question-mark-circle" class="text-xl" />
          </div>
          <span class="font-medium text-gray-700">ช่วยเหลือ & สนับสนุน</span>
        </div>
        <UIcon name="i-heroicons-chevron-right" class="text-gray-400 group-hover:text-amber-500 transition-colors" />
      </button>

      <button 
        @click="handleLogout"
        :disabled="loading"
        class="w-full mt-6 bg-red-50 border border-red-100 p-4 rounded-xl flex items-center justify-center gap-2 text-red-600 font-bold shadow-sm hover:bg-red-100 transition-all active:scale-95"
      >
        <UIcon v-if="loading" name="i-heroicons-arrow-path" class="text-xl animate-spin" />
        <UIcon v-else name="i-heroicons-arrow-right-on-rectangle" class="text-xl" />
        <span>{{ loading ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ' }}</span>
      </button>
      
      <p class="text-center text-xs text-gray-400 mt-4">
        Version 1.0.0 (Beta)
      </p>
    </div>

    <!-- Edit Modal Overlay -->
    <div v-if="isEditing" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div class="glass-card w-full max-w-sm p-6 relative animate-bounce-in">
        <button @click="isEditing = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <UIcon name="i-heroicons-x-mark" class="text-2xl" />
        </button>
        
        <h3 class="text-xl font-bold text-gray-800 mb-6">แก้ไขข้อมูลส่วนตัว</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">ชื่อผู้ใช้ (Username)</label>
            <input 
              v-model="editForm.username"
              type="text" 
              class="w-full px-4 py-2 rounded-xl bg-purple-50 border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 font-medium"
              placeholder="ตั้งชื่อผู้ใช้เท่ๆ..."
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">รูปโปรไฟล์</label>
            <div class="flex items-center gap-4">
              <div class="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                <img 
                  :src="editForm.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + editForm.username" 
                  class="w-full h-full object-cover"
                />
                <div v-if="uploading" class="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <UIcon name="i-heroicons-arrow-path" class="text-white animate-spin" />
                </div>
              </div>
              
              <div class="flex-1">
                <input 
                  type="file" 
                  accept="image/*"
                  @change="handleFileUpload"
                  class="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-purple-50 file:text-purple-700
                    hover:file:bg-purple-100
                  "
                />
                <p class="text-xs text-gray-400 mt-1">รองรับ JPG, PNG, GIF</p>
              </div>
            </div>
          </div>

          <div v-if="editError" class="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg flex items-center gap-2">
            <UIcon name="i-heroicons-exclamation-circle" />
            {{ editError }}
          </div>

          <button 
            @click="saveProfile"
            :disabled="editLoading"
            class="w-full btn-gold py-3 rounded-xl font-bold text-lg mt-2 flex justify-center items-center gap-2"
          >
            <UIcon v-if="editLoading" name="i-heroicons-arrow-path" class="animate-spin" />
            <span>{{ editLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
