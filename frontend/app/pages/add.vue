<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import LotteryTypeSelector from '~/components/add/LotteryTypeSelector.vue'
import NumberInput from '~/components/add/NumberInput.vue'
import TempleSelector from '~/components/add/TempleSelector.vue'
import DateSelector from '~/components/add/DateSelector.vue'
import ImageUploader from '~/components/add/ImageUploader.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const authStore = useAuthStore()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()

const submitting = ref(false)
const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const errorMessage = ref('กรุณาลองใหม่อีกครั้ง')

const toDateStr = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const getNextThaiDraw = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = today.getDate()
  const m = today.getMonth()
  const y = today.getFullYear()
  if (d <= 1) return toDateStr(new Date(y, m, 1))
  if (d <= 16) return toDateStr(new Date(y, m, 16))
  return toDateStr(new Date(y, m + 1, 1))
}

const getNextLaoDraw = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // Mon=1, Wed=3, Fri=5 (getDay: 0=Sun,1=Mon,...,5=Fri,6=Sat)
  const drawDays = [1, 3, 5]
  const d = new Date(today)
  for (let i = 0; i <= 7; i++) {
    if (drawDays.includes(d.getDay())) return toDateStr(d)
    d.setDate(d.getDate() + 1)
  }
  return toDateStr(today)
}

const getNextDrawDate = (type: string) =>
  type === 'LAO' ? getNextLaoDraw() : getNextThaiDraw()

// Form State
const form = ref({
  types: ['THAI'] as string[],
  number1: '',
  number2: '',
  templeName: '',
  drawDateThai: getNextThaiDraw(),
  drawDateLao: getNextLaoDraw(),
  photoThaiUrl1: '',
  photoThaiUrl2: '',
  photoLaoUrl1: '',
  photoLaoUrl2: '',
})

const closeSuccessModal = () => {
    showSuccessModal.value = false
    navigateTo('/home')
}

const handleSubmit = async () => {
  if (!form.value.number1 && !form.value.number2) {
    alert('กรุณาระบุเลขอย่างน้อย 1 ช่อง')
    return
  }
  if (!form.value.templeName) {
    alert('กรุณาระบุชื่อวัด')
    return
  }

  const types = form.value.types
  const dateLines = types.map(t => {
    const date = t === 'THAI' ? form.value.drawDateThai : form.value.drawDateLao
    const label = t === 'THAI' ? '🇹🇭 ไทย' : '🇱🇦 ลาว'
    return `${label}: ${date}`
  }).join('\n')

  if (!confirm(`ยืนยันบันทึกเลขเด็ด\n${dateLines}\n(หากวันที่ผิด กรุณากด Cancel แล้วเปลี่ยนวันที่)`)) {
    return
  }

  submitting.value = true
  errorMessage.value = 'กรุณาลองใหม่อีกครั้ง'
  try {
    const numbers = [form.value.number1, form.value.number2].filter(n => n).join(', ')

    await Promise.all(types.map(type => {
      const drawDate = type === 'THAI' ? form.value.drawDateThai : form.value.drawDateLao
      const photoUrl1 = type === 'THAI' ? form.value.photoThaiUrl1 : form.value.photoLaoUrl1
      const photoUrl2 = type === 'THAI' ? form.value.photoThaiUrl2 : form.value.photoLaoUrl2
      return $fetch(`${runtimeConfig.public.apiBase}/lottery`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authStore.token}` },
        body: {
          numbers,
          type,
          draw_date: new Date(drawDate).toISOString(),
          temple_name: form.value.templeName,
          photo_url: photoUrl1,
          photo_url_2: photoUrl2
        }
      })
    }))

    showSuccessModal.value = true

  } catch (error: any) {
    console.error(error)
    errorMessage.value = error.response?._data?.message || error.data?.message || 'กรุณาลองใหม่อีกครั้ง'
    showErrorModal.value = true
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="px-4 pb-40 relative">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 animate-fade-in-down">
      <h1 class="text-2xl font-black text-gold-gradient">
        เพิ่มเลขเด็ด
      </h1>
      <NuxtLink to="/home" class="btn-ghost p-2 rounded-full text-gray-500 hover:bg-white/50 transition-colors">
        <UIcon name="i-heroicons-x-mark" class="text-2xl" />
      </NuxtLink>
    </div>

    <!-- Main Form -->
    <div class="glass-card p-6 animate-fade-in-up space-y-5 shadow-lg relative z-10">
      
      <LotteryTypeSelector v-model="form.types" />

      <NumberInput
        v-model:number1="form.number1"
        v-model:number2="form.number2"
      />

      <TempleSelector v-model="form.templeName" />

      <DateSelector
        v-if="form.types.includes('THAI')"
        v-model="form.drawDateThai"
        lotteryType="THAI"
        :label="form.types.length === 2 ? '🇹🇭 งวดหวยรัฐบาลไทย' : undefined"
      />
      <DateSelector
        v-if="form.types.includes('LAO')"
        v-model="form.drawDateLao"
        lotteryType="LAO"
        :label="form.types.length === 2 ? '🇱🇦 งวดหวยลาวพัฒนา' : undefined"
      />
      
      <ImageUploader
        v-if="form.types.includes('THAI')"
        v-model:photoUrl1="form.photoThaiUrl1"
        v-model:photoUrl2="form.photoThaiUrl2"
        :label="form.types.length === 2 ? '🇹🇭 รูปหวยรัฐบาลไทย (2 รูป)' : undefined"
      />
      <ImageUploader
        v-if="form.types.includes('LAO')"
        v-model:photoUrl1="form.photoLaoUrl1"
        v-model:photoUrl2="form.photoLaoUrl2"
        :label="form.types.length === 2 ? '🇱🇦 รูปหวยลาวพัฒนา (2 รูป)' : undefined"
      />

    </div>

    <!-- Submit Button -->
    <button 
      @click="handleSubmit"
      :disabled="submitting"
      class="w-full btn-gold py-4 rounded-xl text-lg font-bold shadow-xl mt-6 flex justify-center items-center gap-2 disabled:opacity-70 disabled:grayscale transition-all active:scale-95 relative z-10"
    >
      <UIcon v-if="submitting" name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
      <span v-else>บันทึกความเฮง ✨</span>
    </button>
    
    <!-- Custom Success Modal -->
    <Teleport to="body">
       <Transition name="fade">
          <div v-if="showSuccessModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
             <!-- Backdrop -->
             <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeSuccessModal"></div>
             
             <!-- Content -->
             <div class="bg-white rounded-3xl p-8 w-full max-w-sm text-center relative z-10 animate-bounce-in shadow-2xl overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-tr from-amber-100/50 to-transparent pointer-events-none"></div>
                
                <div class="text-6xl mb-4 animate-bounce">🎉</div>
                <h3 class="text-2xl font-black text-gold-gradient mb-2 relative z-10">บันทึกสำเร็จ!</h3>
                <p class="text-gray-500 mb-6 relative z-10">ขอให้งวดนี้รวยๆ เฮงๆ นะครับ</p>
                
                <button @click="closeSuccessModal" class="btn-gold w-full py-3 rounded-xl font-bold relative z-10 hover:shadow-gold transition-all">
                  กลับหน้าหลัก
                </button>
             </div>
          </div>
       </Transition>
    </Teleport>
    
    <!-- Custom Error Modal -->
    <Teleport to="body">
       <Transition name="fade">
          <div v-if="showErrorModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
             <!-- Backdrop -->
             <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showErrorModal = false"></div>
             
             <!-- Content -->
             <div class="bg-white rounded-3xl p-8 w-full max-w-sm text-center relative z-10 animate-bounce-in shadow-2xl">
                <div class="text-6xl mb-4">😢</div>
                <h3 class="text-xl font-bold text-red-500 mb-2">บันทึกไม่สำเร็จ</h3>
                <p class="text-gray-500 mb-6">{{ errorMessage }}</p>
                
                <button @click="showErrorModal = false" class="bg-gray-100 text-gray-700 w-full py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
                  ปิด
                </button>
             </div>
          </div>
       </Transition>
    </Teleport>
    
  </div>
</template>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 1.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-bounce-in {
  animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
