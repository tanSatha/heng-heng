<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const email = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')
const devToken = ref('') // For Dev/Demo

const runtimeConfig = useRuntimeConfig()

const handleSubmit = async () => {
  if (!email.value) return
  
  loading.value = true
  message.value = ''
  error.value = ''
  devToken.value = ''

  try {
    const res = await $fetch<any>(`${runtimeConfig.public.apiBase}/auth/forgot-password`, {
      method: 'POST',
      body: { email: email.value }
    })
    
    message.value = 'ส่งลิงก์รีเซ็ตรหัสผ่านเรียบร้อยแล้ว'
    
    // For DEV only: Show token link
    if (res.devToken) {
       devToken.value = res.devToken
    }

  } catch (e: any) {
    error.value = e.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="heng-bg min-h-screen flex items-center justify-center p-4">
    <div class="glass-card w-full max-w-md p-8 animate-fade-in-up relative overflow-hidden">
      <!-- Decorative Elements -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
      
      <!-- Header -->
      <div class="text-center mb-8 relative z-10">
        <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <UIcon name="i-heroicons-lock-closed" class="text-3xl text-amber-500" />
        </div>
        <h1 class="text-3xl font-black text-gold-gradient mb-2">ลืมรหัสผ่าน?</h1>
        <p class="text-gray-500 text-sm">ไม่ต้องกังวล! เพียงกรอกอีเมลของคุณ<br>เราจะส่งขั้นตอนการกู้คืนให้คุณ</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6 relative z-10">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2 ml-1">อีเมล</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <UIcon name="i-heroicons-envelope" />
            </div>
            <input 
              v-model="email" 
              type="email" 
              required
              placeholder="hellomaster@gmail.com"
              class="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>

        <!-- Feedback Messages -->
        <div v-if="message" class="p-4 rounded-xl bg-green-50 text-green-700 text-sm flex items-center gap-2 border border-green-200">
          <UIcon name="i-heroicons-check-circle" class="text-xl shrink-0" />
          <span>{{ message }}</span>
        </div>
        
        <!-- DEV Only: Token Display -->
        <div v-if="devToken" class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm">
           <p class="font-bold text-amber-800 mb-2">[DEV MODE] Click to Reset:</p>
           <NuxtLink 
             :to="`/reset-password?token=${devToken}`"
             class="text-amber-600 underline break-all hover:text-amber-800"
           >
             กดที่นี่เพื่อตั้งรหัสผ่านใหม่
           </NuxtLink>
        </div>

        <div v-if="error" class="p-4 rounded-xl bg-red-50 text-red-700 text-sm flex items-center gap-2 border border-red-200">
          <UIcon name="i-heroicons-exclamation-circle" class="text-xl shrink-0" />
          <span>{{ error }}</span>
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <UIcon v-if="loading" name="i-heroicons-arrow-path" class="animate-spin text-xl" />
          <span>{{ loading ? 'กำลังดำเนินการ...' : 'ส่งลิงก์กู้คืน' }}</span>
        </button>

        <div class="text-center mt-6">
          <NuxtLink to="/login" class="text-sm font-medium text-gray-500 hover:text-amber-600 transition-colors flex items-center justify-center gap-1">
            <UIcon name="i-heroicons-arrow-left" class="text-xs" />
            กลับไปหน้าเข้าสู่ระบบ
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>
