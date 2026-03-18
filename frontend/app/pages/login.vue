<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const config = useRuntimeConfig()
const router = useRouter()

definePageMeta({
  layout: 'auth'
})

const loading = ref('')
const mode = ref<'email' | 'phone'>('email')
const identifier = ref('')
const password = ref('')
const errorMsg = ref('')

const switchMode = (m: 'email' | 'phone') => {
  mode.value = m
  identifier.value = ''
  errorMsg.value = ''
}

// Check if already logged in
if (authStore.isAuthenticated) {
  navigateTo('/home')
}

const loginWithLine = async () => {
  alert('ระบบ Login ด้วย LINE ผ่าน Backend กำลังพัฒนา')
}

const loginWithGoogle = () => {
  window.location.href = `${config.public.apiBase}/auth/google`
}

const loginWithEmail = async () => {
  loading.value = 'email'
  errorMsg.value = ''

  try {
    const res = await $fetch<{ access_token: string }>(`${config.public.apiBase}/auth/login`, {
      method: 'POST',
      body: { identifier: identifier.value, password: password.value }
    })

    if (res.access_token) {
      authStore.setToken(res.access_token)
      authStore.setUser({ email: identifier.value })
      navigateTo('/home')
    }
  } catch (err: any) {
    console.error(err)
    if (err.statusCode === 401) {
      errorMsg.value = 'อีเมล / เบอร์โทร หรือรหัสผ่านไม่ถูกต้อง'
    } else {
      errorMsg.value = 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
    }
  } finally {
    loading.value = ''
  }
}
</script>

<template>
  <div class="heng-bg min-h-screen flex items-center justify-center relative overflow-hidden py-10 px-4">

    <!-- Decorative ornament rings -->
    <div class="ornament-ring" style="width: 500px; height: 500px; top: -180px; left: -180px;"></div>
    <div class="ornament-ring" style="width: 350px; height: 350px; bottom: -120px; right: -120px; animation-direction: reverse;"></div>

    <!-- Particle system -->
    <div class="heng-particles">
      <div class="particle particle-gold" style="width: 280px; height: 280px; top: -80px; left: -80px;"></div>
      <div class="particle particle-gold" style="width: 180px; height: 180px; bottom: -40px; right: -40px; animation-delay: -3s;"></div>
      <div class="particle particle-purple" style="width: 160px; height: 160px; top: 30%; right: 15%; animation-delay: -6s;"></div>
      <div class="particle particle-shimmer" style="width: 4px; height: 4px; top: 20%; left: 25%; animation-delay: 0s;"></div>
      <div class="particle particle-shimmer" style="width: 3px; height: 3px; top: 40%; right: 30%; animation-delay: 1.5s;"></div>
      <div class="particle particle-shimmer" style="width: 5px; height: 5px; bottom: 30%; left: 60%; animation-delay: 2.5s;"></div>
    </div>

    <div class="relative z-10 w-full max-w-md">
      <!-- Logo Section -->
      <div class="text-center mb-8 animate-fade-in-up">
        <div class="text-6xl mb-4 animate-bounce-slow drop-shadow-2xl">🙏</div>
        <h2 class="text-4xl text-center font-black mb-8 text-gold-gradient drop-shadow-sm"
          style="filter: drop-shadow(0 4px 12px rgba(255,215,0,0.2));">
          📖 บุ๊คเลข
        </h2>
        <p class="text-base mt-3 font-semibold tracking-wide" style="color: #6b7280;">
          เข้าสู่ระบบ
        </p>
      </div>

      <!-- Login Card -->
      <div class="glass-card p-7 sm:p-8 animate-fade-in-up delay-200">
        
        <!-- Error Message -->
        <div v-if="errorMsg" class="mb-5 p-3.5 rounded-xl text-sm text-center animate-fade-in-scale"
          style="background: rgba(254, 226, 226, 0.5); border: 1px solid rgba(239, 68, 68, 0.3); color: #b91c1c;">
          {{ errorMsg }}
        </div>

        <!-- Social Login Buttons -->
        <div class="space-y-3 mb-6">
          <!-- Google Login -->
          <button
            @click="loginWithGoogle"
            :disabled="!!loading"
            class="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-base transition-all duration-300 btn-ghost"
            style="color: #ea4335; border-color: #ea4335;"
          >
            <UIcon name="i-heroicons-globe-alt" class="text-xl" />
            <span>เข้าสู่ระบบด้วย Google</span>
          </button>
        </div>

        <!-- Tab selector -->
        <div class="flex p-1 bg-gray-100 rounded-2xl mb-5">
          <button type="button" @click="switchMode('email')"
            :class="['flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2',
              mode === 'email' ? 'bg-white shadow text-purple-700' : 'text-gray-400 hover:text-gray-600']">
            <UIcon name="i-heroicons-envelope" class="text-base" />
            อีเมล
          </button>
          <button type="button" @click="switchMode('phone')"
            :class="['flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2',
              mode === 'phone' ? 'bg-white shadow text-purple-700' : 'text-gray-400 hover:text-gray-600']">
            <UIcon name="i-heroicons-phone" class="text-base" />
            เบอร์มือถือ
          </button>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="loginWithEmail" class="space-y-4">
          <div v-if="mode === 'email'">
            <label class="heng-label">อีเมล</label>
            <div class="relative">
              <div class="input-icon">
                <UIcon name="i-heroicons-envelope" class="text-lg" style="color: #9333ea;" />
              </div>
              <input v-model="identifier" type="email" placeholder="example@email.com"
                class="heng-input" required autocomplete="email" />
            </div>
          </div>
          <div v-else>
            <label class="heng-label">เบอร์มือถือ</label>
            <div class="relative">
              <div class="input-icon">
                <UIcon name="i-heroicons-phone" class="text-lg" style="color: #9333ea;" />
              </div>
              <input v-model="identifier" type="tel" placeholder="0812345678"
                class="heng-input" required inputmode="numeric" autocomplete="tel" />
            </div>
          </div>

          <div>
            <label class="heng-label">รหัสผ่าน</label>
            <div class="relative">
              <div class="input-icon">
                <UIcon name="i-heroicons-lock-closed" class="text-lg" style="color: #9333ea;" />
              </div>
              <input v-model="password" type="password" placeholder="••••••••"
                class="heng-input" required autocomplete="current-password" />
            </div>
            <div class="flex justify-end mt-1">
              <NuxtLink to="/forgot-password" class="text-xs text-amber-600 hover:text-amber-800 hover:underline transition-colors">
                ลืมรหัสผ่าน?
              </NuxtLink>
            </div>
          </div>

          <button type="submit" :disabled="!!loading"
            class="btn-gold w-full py-3.5 rounded-xl text-base mt-2">
            {{ loading === 'email' ? 'กำลังเข้าระบบ...' : '🔑 เข้าสู่ระบบ' }}
          </button>
        </form>

        <!-- Footer -->
        <div class="mt-7 text-center">
          <p class="text-sm" style="color: #6b7280;">
            ยังไม่มีบัญชี?
            <NuxtLink to="/signup" class="font-bold cursor-pointer hover:underline pl-1 transition-colors duration-300"
              style="color: #d97706;">
              สมัครสมาชิกที่นี่
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
