<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const config = useRuntimeConfig()
const router = useRouter()

definePageMeta({
  layout: 'auth'
})

const loading = ref(false)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const successMsg = ref('')

// Check if already logged in
if (authStore.isAuthenticated) {
  navigateTo('/home')
}

const signup = async () => {
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'รหัสผ่านไม่ตรงกัน / Passwords do not match'
    return
  }
  
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  try {
    const res = await $fetch(`${config.public.apiBase}/auth/register`, {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    
    // Auto login
    successMsg.value = 'สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...'
    
    // Small delay for UX
    await new Promise(r => setTimeout(r, 1000))
    
    const loginRes = await $fetch<{ access_token: string }>(`${config.public.apiBase}/auth/login`, {
        method: 'POST',
        body: { email: email.value, password: password.value }
    })

    if (loginRes.access_token) {
        authStore.setToken(loginRes.access_token)
        authStore.setUser({ email: email.value })
        navigateTo('/home')
    }

  } catch (err: any) {
    console.error(err)
    if (err.statusCode === 409) {
      errorMsg.value = 'อีเมลนี้ถูกใช้งานแล้ว / Email already exists'
    } else {
      errorMsg.value = 'เกิดข้อผิดพลาดในการสมัคร / Registration failed'
    }
    loading.value = false
  }
}
</script>

<template>
  <div class="heng-bg min-h-screen flex items-center justify-center relative overflow-hidden py-10 px-4">

    <!-- Decorative ornament rings -->
    <div class="ornament-ring" style="width: 450px; height: 450px; top: -160px; right: -160px;"></div>
    <div class="ornament-ring" style="width: 300px; height: 300px; bottom: -100px; left: -100px; animation-direction: reverse;"></div>

    <!-- Particle system -->
    <div class="heng-particles">
      <div class="particle particle-gold" style="width: 260px; height: 260px; top: -60px; left: -60px;"></div>
      <div class="particle particle-gold" style="width: 160px; height: 160px; bottom: -30px; right: -30px; animation-delay: -4s;"></div>
      <div class="particle particle-purple" style="width: 140px; height: 140px; top: 20%; right: 10%; animation-delay: -7s;"></div>
      <div class="particle particle-shimmer" style="width: 4px; height: 4px; top: 15%; right: 35%; animation-delay: 0s;"></div>
      <div class="particle particle-shimmer" style="width: 3px; height: 3px; bottom: 35%; left: 20%; animation-delay: 2s;"></div>
      <div class="particle particle-shimmer" style="width: 5px; height: 5px; top: 55%; left: 65%; animation-delay: 3.5s;"></div>
    </div>

    <div class="relative z-10 w-full max-w-md">
      <!-- Logo Section -->
      <div class="text-center mb-8 animate-fade-in-up">
        <div class="text-6xl mb-4 animate-bounce-slow drop-shadow-2xl">🙏</div>
        <h2 class="text-4xl text-center font-black mb-8 text-gold-gradient drop-shadow-sm">
        📖 บุ๊คเลข
      </h2>
        <p class="text-base mt-3 font-semibold tracking-wide" style="color: #6b7280;">
          สมัครสมาชิกใหม่
        </p>
      </div>

      <!-- Signup Card -->
      <div class="glass-card p-7 sm:p-8 animate-fade-in-up delay-200">

        <!-- Error Message -->
        <div v-if="errorMsg" class="mb-5 p-3.5 rounded-xl text-sm text-center animate-fade-in-scale"
          style="background: rgba(254, 226, 226, 0.5); border: 1px solid rgba(239, 68, 68, 0.3); color: #b91c1c;">
          {{ errorMsg }}
        </div>
        
        <!-- Success Message -->
        <div v-if="successMsg" class="mb-5 p-4 rounded-xl text-sm text-center animate-fade-in-scale"
          style="background: rgba(220, 252, 231, 0.5); border: 1px solid rgba(34, 197, 94, 0.3); color: #15803d;">
          {{ successMsg }}
        </div>

        <form @submit.prevent="signup" class="space-y-4">
          <div>
            <label class="heng-label">อีเมล / Email</label>
            <div class="relative">
              <div class="input-icon">
                <UIcon name="i-heroicons-envelope" class="text-lg" style="color: #9333ea;" />
              </div>
              <input
                v-model="email"
                type="email"
                placeholder="example@email.com"
                class="heng-input"
                required
              />
            </div>
          </div>

          <div>
            <label class="heng-label">รหัสผ่าน / Password</label>
            <div class="relative">
              <div class="input-icon">
                <UIcon name="i-heroicons-lock-closed" class="text-lg" style="color: #9333ea;" />
              </div>
              <input
                v-model="password"
                type="password"
                placeholder="••••••••"
                class="heng-input"
                required
              />
            </div>
          </div>

          <div>
            <label class="heng-label">ยืนยันรหัสผ่าน / Confirm Password</label>
            <div class="relative">
              <div class="input-icon">
                <UIcon name="i-heroicons-shield-check" class="text-lg" style="color: #9333ea;" />
              </div>
              <input
                v-model="confirmPassword"
                type="password"
                placeholder="••••••••"
                class="heng-input"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="btn-gold w-full py-4 rounded-xl text-lg flex items-center justify-center gap-2 mt-2"
          >
            <UIcon name="i-heroicons-user-plus" class="text-xl" />
            <span>{{ loading ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก' }}</span>
          </button>
        </form>

        <div class="mt-7 text-center">
          <p class="text-sm" style="color: #6b7280;">
            มีบัญชีอยู่แล้ว?
            <NuxtLink to="/login" class="font-bold cursor-pointer hover:underline pl-1 transition-colors duration-300"
              style="color: #d97706;">
              เข้าสู่ระบบที่นี่
            </NuxtLink>
          </p>
        </div>
      </div>

      <!-- Bottom branding -->
      <p class="heng-footer mt-6">✨ HENG-HENG.APP ✨</p>
    </div>
  </div>
</template>

<style scoped>
.input-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
}
</style>
