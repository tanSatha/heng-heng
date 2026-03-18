<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const config = useRuntimeConfig()

definePageMeta({
  layout: 'auth'
})

const mode = ref<'email' | 'phone'>('email')
const loading = ref(false)
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const successMsg = ref('')

if (authStore.isAuthenticated) {
  navigateTo('/home')
}

const switchMode = (m: 'email' | 'phone') => {
  mode.value = m
  errorMsg.value = ''
}

const signup = async () => {
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'รหัสผ่านไม่ตรงกัน'
    return
  }

  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const body: any = { password: password.value }
    if (mode.value === 'email') body.email = email.value
    else body.phone = phone.value

    await $fetch(`${config.public.apiBase}/auth/register`, { method: 'POST', body })

    successMsg.value = 'สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...'
    await new Promise(r => setTimeout(r, 800))

    const identifier = mode.value === 'email' ? email.value : phone.value
    const loginRes = await $fetch<{ access_token: string }>(`${config.public.apiBase}/auth/login`, {
      method: 'POST',
      body: { identifier, password: password.value }
    })

    if (loginRes.access_token) {
      authStore.setToken(loginRes.access_token)
      authStore.setUser({ email: email.value || phone.value })
      navigateTo('/home')
    }
  } catch (err: any) {
    const msg = err?.data?.message || ''
    if (err.statusCode === 409) {
      errorMsg.value = msg.includes('Phone') ? 'เบอร์นี้ถูกใช้งานแล้ว' : 'อีเมลนี้ถูกใช้งานแล้ว'
    } else {
      errorMsg.value = 'เกิดข้อผิดพลาดในการสมัคร'
    }
    loading.value = false
  }
}
</script>

<template>
  <div class="heng-bg min-h-screen flex items-center justify-center relative overflow-hidden py-10 px-4">

    <div class="ornament-ring" style="width: 450px; height: 450px; top: -160px; right: -160px;"></div>
    <div class="ornament-ring" style="width: 300px; height: 300px; bottom: -100px; left: -100px; animation-direction: reverse;"></div>

    <div class="heng-particles">
      <div class="particle particle-gold" style="width: 260px; height: 260px; top: -60px; left: -60px;"></div>
      <div class="particle particle-gold" style="width: 160px; height: 160px; bottom: -30px; right: -30px; animation-delay: -4s;"></div>
      <div class="particle particle-purple" style="width: 140px; height: 140px; top: 20%; right: 10%; animation-delay: -7s;"></div>
      <div class="particle particle-shimmer" style="width: 4px; height: 4px; top: 15%; right: 35%;"></div>
      <div class="particle particle-shimmer" style="width: 3px; height: 3px; bottom: 35%; left: 20%; animation-delay: 2s;"></div>
      <div class="particle particle-shimmer" style="width: 5px; height: 5px; top: 55%; left: 65%; animation-delay: 3.5s;"></div>
    </div>

    <div class="relative z-10 w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8 animate-fade-in-up">
        <div class="text-6xl mb-4 animate-bounce-slow drop-shadow-2xl">🙏</div>
        <h2 class="text-4xl text-center font-black mb-8 text-gold-gradient drop-shadow-sm">📖 บุ๊คเลข</h2>
        <p class="text-base mt-3 font-semibold tracking-wide" style="color: #6b7280;">สมัครสมาชิกใหม่</p>
      </div>

      <!-- Card -->
      <div class="glass-card p-7 sm:p-8 animate-fade-in-up delay-200">

        <!-- Tab selector -->
        <div class="flex p-1 bg-gray-100 rounded-2xl mb-6">
          <button
            type="button"
            @click="switchMode('email')"
            :class="['flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2',
              mode === 'email' ? 'bg-white shadow text-purple-700' : 'text-gray-400 hover:text-gray-600']"
          >
            <UIcon name="i-heroicons-envelope" class="text-base" />
            อีเมล
          </button>
          <button
            type="button"
            @click="switchMode('phone')"
            :class="['flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2',
              mode === 'phone' ? 'bg-white shadow text-purple-700' : 'text-gray-400 hover:text-gray-600']"
          >
            <UIcon name="i-heroicons-phone" class="text-base" />
            เบอร์มือถือ
          </button>
        </div>

        <!-- Error / Success -->
        <div v-if="errorMsg" class="mb-5 p-3.5 rounded-xl text-sm text-center"
          style="background: rgba(254,226,226,0.5); border: 1px solid rgba(239,68,68,0.3); color: #b91c1c;">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="mb-5 p-4 rounded-xl text-sm text-center"
          style="background: rgba(220,252,231,0.5); border: 1px solid rgba(34,197,94,0.3); color: #15803d;">
          {{ successMsg }}
        </div>

        <form @submit.prevent="signup" class="space-y-4">

          <!-- Email input -->
          <div v-if="mode === 'email'">
            <label class="heng-label">อีเมล</label>
            <div class="relative">
              <div class="input-icon">
                <UIcon name="i-heroicons-envelope" class="text-lg" style="color: #9333ea;" />
              </div>
              <input v-model="email" type="email" placeholder="example@email.com"
                class="heng-input" required autocomplete="email" />
            </div>
          </div>

          <!-- Phone input -->
          <div v-else>
            <label class="heng-label">เบอร์มือถือ</label>
            <div class="relative">
              <div class="input-icon">
                <UIcon name="i-heroicons-phone" class="text-lg" style="color: #9333ea;" />
              </div>
              <input v-model="phone" type="tel" placeholder="0812345678"
                class="heng-input" required inputmode="numeric" autocomplete="tel" />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="heng-label">รหัสผ่าน</label>
            <div class="relative">
              <div class="input-icon">
                <UIcon name="i-heroicons-lock-closed" class="text-lg" style="color: #9333ea;" />
              </div>
              <input v-model="password" type="password" placeholder="••••••••"
                class="heng-input" required autocomplete="new-password" />
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="heng-label">ยืนยันรหัสผ่าน</label>
            <div class="relative">
              <div class="input-icon">
                <UIcon name="i-heroicons-shield-check" class="text-lg" style="color: #9333ea;" />
              </div>
              <input v-model="confirmPassword" type="password" placeholder="••••••••"
                class="heng-input" required autocomplete="new-password" />
            </div>
          </div>

          <button type="submit" :disabled="loading"
            class="btn-gold w-full py-4 rounded-xl text-lg flex items-center justify-center gap-2 mt-2">
            <UIcon name="i-heroicons-user-plus" class="text-xl" />
            <span>{{ loading ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก' }}</span>
          </button>
        </form>

        <div class="mt-5 text-center">
          <NuxtLink to="/forgot-password" class="text-sm font-medium hover:underline" style="color: #9333ea;">
            ลืมรหัสผ่าน?
          </NuxtLink>
        </div>

        <div class="mt-4 text-center">
          <p class="text-sm" style="color: #6b7280;">
            มีบัญชีอยู่แล้ว?
            <NuxtLink to="/login" class="font-bold cursor-pointer hover:underline pl-1" style="color: #d97706;">
              เข้าสู่ระบบที่นี่
            </NuxtLink>
          </p>
        </div>
      </div>

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
