<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import TheStatsSummary from '~/components/home/StatsSummary.vue'
import TheAddButton from '~/components/home/AddButton.vue'
import TheRecordsList from '~/components/home/RecordsList.vue'

definePageMeta({
  layout: 'default'
})

const authStore = useAuthStore()
const runtimeConfig = useRuntimeConfig()

const records = ref<any[]>([])
const loading = ref(true)

// Redirect if not logged in
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    navigateTo('/login')
    return
  }
  await fetchRecords()
})

const fetchRecords = async () => {
  loading.value = true
  try {
    const statsData = await $fetch<any[]>(`${runtimeConfig.public.apiBase}/lottery/my-stats`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` },
    })
    
    records.value = statsData || []
    
  } catch (error: any) {
    console.error('Error fetching records:', error)
    if (error.status === 401 || error.statusCode === 401) {
       // Token might be expired
       authStore.logout()
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="heng-bg min-h-screen relative overflow-hidden pb-40"> <!-- Added extra padding bottom for nav bar -->

    <!-- Chinese Traditional Ornaments (Background) -->
    <div class="ornament-ring" style="width: 500px; height: 500px; top: -200px; right: -150px;"></div>
    <div class="ornament-ring" style="width: 350px; height: 350px; bottom: -100px; left: -100px; animation-direction: reverse;"></div>

    <!-- Gold Particles -->
    <ClientOnly>
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
         <div v-for="n in 10" :key="n" class="particle" 
              :style="{ 
                left: `${Math.random() * 100}%`, 
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5
              }">
         </div>
      </div>
    </ClientOnly>

    <!-- Main Content -->
    <div class="max-w-xl mx-auto relative z-10 px-4 pt-2">
      <TheStatsSummary :records="records" />
      
      <TheAddButton />
      
      <TheRecordsList :records="records" :loading="loading" @refresh="fetchRecords" />
    </div>

    <!-- Bottom branding -->
    <p class="heng-footer mt-8">✨ HENG-HENG.APP ✨</p>
  </div>
</template>

<style scoped>
/* Scoped styles specific to Home page if needed */
.ornament-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 215, 0, 0.15);
  background: radial-gradient(circle, rgba(255,215,0,0.02) 0%, rgba(255,215,0,0) 70%);
  z-index: 0;
  animation: spin-slow 60s linear infinite;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #FFD700;
  border-radius: 50%;
  box-shadow: 0 0 10px #FFD700;
  animation: float-particle 10s ease-in-out infinite;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes float-particle {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-20px) scale(1.5); opacity: 0.8; }
}

.heng-footer {
  text-align: center;
  font-size: 0.75rem;
  color: rgba(180, 160, 200, 0.5);
  font-weight: 600;
  letter-spacing: 2px;
  padding-bottom: 6rem; /* Make sure footer is visible above tabbar */
  position: relative;
  z-index: 0;
}
</style>
