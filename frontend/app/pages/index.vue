<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isAuthenticated) {
    navigateTo('/home')
  }
})
</script>

<template>
  <div class="heng-bg min-h-screen flex flex-col items-center justify-center relative overflow-hidden">

    <!-- Decorative ornament rings -->
    <div class="ornament-ring" style="width: 600px; height: 600px; top: -200px; right: -200px; opacity: 0.4;"></div>
    <div class="ornament-ring" style="width: 400px; height: 400px; bottom: -100px; left: -150px; opacity: 0.3; animation-direction: reverse;"></div>

    <!-- Particle system -->
    <div class="heng-particles">
      <div class="particle particle-gold" style="width: 350px; height: 350px; top: -100px; right: -80px;"></div>
      <div class="particle particle-gold" style="width: 220px; height: 220px; bottom: -60px; left: -40px; animation-delay: -3s;"></div>
      <div class="particle particle-purple" style="width: 180px; height: 180px; top: 40%; left: 15%; animation-delay: -5s;"></div>
      <div class="particle particle-gold" style="width: 120px; height: 120px; top: 20%; right: 25%; animation-delay: -8s;"></div>
      <!-- Shimmer dots -->
      <div class="particle particle-shimmer" style="width: 4px; height: 4px; top: 15%; left: 30%; animation-delay: 0s;"></div>
      <div class="particle particle-shimmer" style="width: 3px; height: 3px; top: 25%; right: 20%; animation-delay: 1s;"></div>
      <div class="particle particle-shimmer" style="width: 5px; height: 5px; top: 60%; left: 70%; animation-delay: 2s;"></div>
      <div class="particle particle-shimmer" style="width: 3px; height: 3px; bottom: 25%; left: 25%; animation-delay: 3s;"></div>
      <div class="particle particle-shimmer" style="width: 4px; height: 4px; top: 45%; right: 35%; animation-delay: 1.5s;"></div>
    </div>

    <div class="relative z-10 text-center px-6 max-w-2xl mx-auto">
      <!-- Hero icon -->
      <div class="animate-fade-in-up">
        <div class="text-7xl sm:text-8xl mb-6 animate-bounce-slow drop-shadow-2xl">🙏</div>
      </div>

      <!-- Title -->
      <div class="animate-fade-in-up delay-100">
        <h1 class="text-5xl sm:text-7xl font-black mb-3 text-gold-gradient leading-tight tracking-tight"
          style="filter: drop-shadow(0 4px 12px rgba(255,215,0,0.2));">
          บุ๊คเลข
        </h1>
      </div>

      <!-- Subtitle -->
      <div class="animate-fade-in-up delay-200">
        <p class="text-lg sm:text-xl font-semibold mb-1" style="color: #9333ea;">
          บันทึกเลขเด็ด แชร์ความโชคดี
        </p>
        <p class="text-sm sm:text-base mb-10 max-w-md mx-auto leading-relaxed" style="color: #6b7280;">
          Track your lucky lottery numbers from temples & share viral cards with friends
        </p>
      </div>

      <!-- CTA Button -->
      <div class="animate-fade-in-up delay-300 mb-16">
        <NuxtLink to="/login">
          <button class="btn-gold text-xl px-14 py-5 rounded-2xl animate-pulse-glow">
            🔥 เริ่มเลย!
          </button>
        </NuxtLink>
      </div>

      <!-- Feature Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 animate-fade-in-up delay-400">
        <div class="feature-card group">
          <div class="feature-icon">📝</div>
          <h3 class="text-gold-static font-bold text-base mb-1">บันทึกเลข</h3>
          <p class="text-xs leading-relaxed" style="color: #6b7280;">จดเลขเด็ดจากวัดดังทั่วไทย</p>
        </div>
        <div class="feature-card group">
          <div class="feature-icon">🎴</div>
          <h3 class="text-gold-static font-bold text-base mb-1">แชร์ Viral Card</h3>
          <p class="text-xs leading-relaxed" style="color: #6b7280;">สร้างการ์ดเลขเด็ดสุดเท่แชร์เพื่อน</p>
        </div>
        <div class="feature-card group">
          <div class="feature-icon">📊</div>
          <h3 class="text-gold-static font-bold text-base mb-1">สถิติแม่น</h3>
          <p class="text-xs leading-relaxed" style="color: #6b7280;">ดูสถิติเลขเด็ดย้อนหลังของคุณ</p>
        </div>
      </div>
    </div>

    <!-- Bottom branding -->
    <p class="heng-footer absolute bottom-4">✨ BOOK-LEK.APP ✨</p>
  </div>
</template>

<style scoped>
.feature-card {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 1.25rem;
  padding: 1.75rem 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.6);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.feature-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(145deg, rgba(245, 158, 11, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.feature-card:hover {
  border-color: #f59e0b;
  background: rgba(255, 255, 255, 0.85);
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(245, 158, 11, 0.15), 0 0 25px rgba(245, 158, 11, 0.05);
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
}

.feature-card:hover .feature-icon {
  transform: scale(1.15) translateY(-2px);
}
</style>
