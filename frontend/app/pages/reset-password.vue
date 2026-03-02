<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const router = useRouter()
const token = route.query.token as string

const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const runtimeConfig = useRuntimeConfig()

// Check Token
if (!token) {
  error.value = 'ลิงก์การกู้คืนรหัสผ่านไม่ถูกต้อง หรือหมดอายุ'
}

const handleSubmit = async () => {
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'รหัสผ่านทั้งสองช่องไม่ตรงกัน'
    return
  }
  
  if (newPassword.value.length < 6) {
    error.value = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    const res = await $fetch<any>(`${runtimeConfig.public.apiBase}/auth/reset-password`, {
      method: 'POST',
      body: { token, newPassword: newPassword.value }
    })
    
    success.value = true
    setTimeout(() => {
      navigateTo('/login')
    }, 2000)

  } catch (e: any) {
    error.value = e.data?.message || 'ลิงก์นี้หมดอายุหรือถูกใช้งานแล้ว กรุณาขอใหม่อีกครั้ง'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- Reset Password Page -->
  <div class="heng-bg min-h-screen flex items-center justify-center p-4">
    <div class="glass-card w-full max-w-md p-8 animate-fade-in-up relative overflow-hidden">
      <!-- Decorative Elements -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-green-400/20 rounded-full blur-3xl -ml-16 -mt-16"></div>

      <!-- Header -->
      <div class="text-center mb-8 relative z-10">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <UIcon name="i-heroicons-key" class="text-3xl text-green-600" />
        </div>
        <h1 class="text-3xl font-black text-gold-gradient mb-2">ตั้งรหัสผ่านใหม่</h1>
        <p class="text-gray-500 text-sm">กรุณาระบุรหัสผ่านใหม่เพื่อเข้าใช้งาน</p>
      </div>

      <!-- Success State -->
      <div v-if="success" class="text-center py-8 animate-fade-in">
        <UIcon name="i-heroicons-check-circle" class="text-6xl text-green-500 mb-4 animate-bounce" />
        <h2 class="text-xl font-bold text-gray-800 mb-2">เรียบร้อยแล้ว!</h2>
        <p class="text-gray-500">กำลังพาคุณไปหน้าเข้าสู่ระบบ...</p>
      </div>

      <!-- Form -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-6 relative z-10">
      
        <!-- New Password -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2 ml-1">รหัสผ่านใหม่</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <UIcon name="i-heroicons-lock-closed" />
            </div>
            <input 
              v-model="newPassword" 
              type="password" 
              required
              placeholder="••••••••"
              class="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2 ml-1">ยืนยันรหัสผ่านใหม่</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <UIcon name="i-heroicons-lock-closed" />
            </div>
            <input 
              v-model="confirmPassword" 
              type="password" 
              required
              placeholder="••••••••"
              class="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="p-4 rounded-xl bg-red-50 text-red-700 text-sm flex items-center gap-2 border border-red-200 animate-shake">
          <UIcon name="i-heroicons-exclamation-circle" class="text-xl shrink-0" />
          <span>{{ error }}</span>
        </div>

        <button 
          type="submit" 
          :disabled="loading || !token"
          class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <UIcon v-if="loading" name="i-heroicons-arrow-path" class="animate-spin text-xl" />
          <span>{{ loading ? 'กำลังอัปเดต...' : 'บันทึกรหัสผ่านใหม่' }}</span>
        </button>

      </form>
    </div>
  </div>
</template>
