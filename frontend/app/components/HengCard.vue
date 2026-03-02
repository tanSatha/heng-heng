<script setup lang="ts">
import { toPng } from 'html-to-image'

const props = defineProps<{
  templeName: string
  numbers: string
}>()

const emit = defineEmits(['close'])

const luckyQuotes = [
  '💰 รวยๆ Rich Rich!',
  '🌟 เศรษฐีกำลังโหลด...',
  '✨ โชคลาภมาแล้ว!',
  '🎯 ถูกแน่นอน 100%',
  '🔥 Hot Hot Hot!',
  '💎 เงินทองไหลมา',
  '🙏 บารมีพระเครื่อง',
  '⭐ Millionaire Loading...',
]

const randomQuote = computed(() => {
  return luckyQuotes[Math.floor(Math.random() * luckyQuotes.length)]
})

const sharing = ref(false)

const shareToLine = async () => {
  sharing.value = true
  try {
    const element = document.getElementById('heng-card')
    if (!element) return

    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2,
    })

    // Convert data URL to blob
    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], 'heng-heng.png', { type: 'image/png' })

    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'เลขเด็ดจากวัด',
        text: `เลขเด็ดจาก${props.templeName}: ${props.numbers}`,
        files: [file],
      })
    } else {
      // Fallback: download the image
      const link = document.createElement('a')
      link.download = `heng_heng_${props.numbers}.png`
      link.href = dataUrl
      link.click()
    }
  } catch (error) {
    console.error('Error sharing:', error)
    alert('ไม่สามารถแชร์ได้ กรุณาลองอีกครั้ง / Share failed.')
  } finally {
    sharing.value = false
  }
}
</script>

<template>
  <div class="space-y-6 flex flex-col items-center py-6 animate-fade-in-scale">
    <!-- The Viral Card -->
    <div
      id="heng-card"
      class="card-wrapper"
    >
      <!-- Gold texture overlay -->
      <div class="card-texture"></div>

      <!-- Inner glow -->
      <div class="card-inner-glow"></div>
      
      <!-- Content -->
      <div class="relative h-full flex flex-col items-center justify-between p-8 text-center z-10">
        <!-- Top -->
        <div>
          <div class="text-6xl mb-3 drop-shadow-lg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">🙏</div>
          <div class="text-xl font-black leading-tight px-4"
            style="color: #6b0000; text-shadow: 0 1px 2px rgba(255,215,0,0.1); font-family: 'Noto Sans Thai', sans-serif;">
            วัดดังจาก: {{ templeName }}
          </div>
          <div class="w-14 h-0.5 mx-auto mt-3 mb-5 rounded-full"
            style="background: linear-gradient(90deg, transparent, #8b0000, transparent);"></div>
        </div>
        
        <!-- Number Display -->
        <div class="w-full">
          <div class="number-display">
            <!-- Decorative corners -->
            <div class="corner corner-tl"></div>
            <div class="corner corner-tr"></div>
            <div class="corner corner-bl"></div>
            <div class="corner corner-br"></div>
            
            <div class="text-6xl sm:text-7xl font-black tracking-[0.1em]"
              style="color: #b91c1c; text-shadow: 3px 3px 0px rgba(0,0,0,0.04);">
              {{ numbers.replace(/,/g, ', ').replace(/\s+/g, ' ') }}
            </div>
          </div>
          
          <div class="mt-6 text-lg font-bold py-2 px-5 rounded-full inline-block"
            style="color: #6b0000; background: rgba(255,255,255,0.35); backdrop-filter: blur(4px); border: 1px solid rgba(139,0,0,0.1);">
            {{ randomQuote }}
          </div>
        </div>
        
        <!-- Bottom -->
        <div class="mt-2">
          <div class="text-xl mb-1.5" style="filter: grayscale(0.3);">✨💰✨</div>
          <div class="text-[10px] font-black tracking-[0.2em] uppercase"
            style="color: rgba(107, 0, 0, 0.5);">
            HENG-HENG.APP
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-col w-full gap-3 pt-2 max-w-[360px]">
      <button
        @click="shareToLine"
        :disabled="sharing"
        class="btn-green w-full py-4 rounded-xl text-base flex items-center justify-center gap-2"
      >
        <UIcon name="i-heroicons-share" class="text-xl" />
        <span>{{ sharing ? 'กำลังสร้างรูปภาพ...' : 'แชร์ไปยัง LINE / บันทึกรูป' }}</span>
      </button>
      
      <button
        @click="emit('close')"
        class="btn-ghost w-full py-3 rounded-xl text-base"
      >
        ปิด / Close
      </button>
    </div>
  </div>
</template>

<style scoped>
.card-wrapper {
  width: 360px;
  height: 520px;
  position: relative;
  overflow: hidden;
  border-radius: 2rem;
  border: 8px solid #7a0000;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 2px rgba(255, 215, 0, 0.15),
    inset 0 2px 20px rgba(255, 255, 255, 0.05);
  background: linear-gradient(
    135deg,
    #d4af37 0%,
    #f4e4c1 20%,
    #ffd700 40%,
    #f4e4c1 60%,
    #d4af37 80%,
    #c5981a 100%
  );
}

.card-texture {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  background-image:
    repeating-linear-gradient(
      45deg,
      #8b0000 0px,
      #8b0000 1px,
      transparent 1px,
      transparent 12px
    );
}

.card-inner-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 50% 30%,
    rgba(255, 255, 255, 0.15) 0%,
    transparent 60%
  );
}

.number-display {
  position: relative;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 1.5rem;
  padding: 2rem 1.5rem;
  border: 3px solid #8b0000;
  box-shadow:
    inset 0 2px 8px rgba(0, 0, 0, 0.06),
    0 8px 24px rgba(139, 0, 0, 0.15);
}

.corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: #d4af37;
  border-style: solid;
}
.corner-tl { top: -4px; left: -4px; border-width: 3px 0 0 3px; border-radius: 8px 0 0 0; }
.corner-tr { top: -4px; right: -4px; border-width: 3px 3px 0 0; border-radius: 0 8px 0 0; }
.corner-bl { bottom: -4px; left: -4px; border-width: 0 0 3px 3px; border-radius: 0 0 0 8px; }
.corner-br { bottom: -4px; right: -4px; border-width: 0 3px 3px 0; border-radius: 0 0 8px 0; }
</style>
