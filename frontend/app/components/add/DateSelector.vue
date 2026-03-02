<script setup lang="ts">
import { computed, onMounted } from 'vue'

// onMounted(() => {
//   alert('DateSelector Check Process: Mounted!')
//   console.log('DateSelector Check Process: Mounted!')
// })

const props = defineProps<{
  modelValue: string,
  lotteryType?: string
}>()

const emit = defineEmits(['update:modelValue'])

const showCalendar = ref(false)
const calendarRef = ref(null)

// Compute attributes for highlighting dates based on Lottery Type
const attributes = computed(() => {
  const type = props.lotteryType?.toUpperCase() || ''
  
  if (type === 'LAO') {
    return [
      {
        key: 'lao-draw',
        highlight: {
          color: 'orange',
          fillMode: 'light',
        },
        dates: { repeat: { weekdays: [2, 4, 6] } }, // Mon(2), Wed(4), Fri(6)
        popover: { label: 'หวยลาวออก' }
      }
    ]
  } else if (type === 'THAI') {
    return [
        {
          key: 'thai-draw',
          highlight: {
            color: 'orange',
            fillMode: 'light',
          },
          dates: { repeat: { days: [1, 16] } }, // 1st and 16th of every month
          popover: { label: 'หวยไทยออก' }
        }
    ]
  }
  return []
})

// Proxied Date object for the DatePicker component
const date = computed({
  get: () => {
    if (!props.modelValue) return null
    const d = new Date(props.modelValue)
    return isNaN(d.getTime()) ? null : d
  },
  set: (val: any) => {
    if (val) {
       const year = val.getFullYear()
       const month = String(val.getMonth() + 1).padStart(2, '0')
       const day = String(val.getDate()).padStart(2, '0')
       emit('update:modelValue', `${year}-${month}-${day}`)
       showCalendar.value = false // Auto close on select
    } else {
       emit('update:modelValue', '')
    }
  }
})

// Display formatted date in Thai
const formattedDate = computed(() => {
  if (!date.value) return 'เลือกวันที่...'
  return date.value.toLocaleDateString('th-TH', {
     weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
})
</script>

<template>
  <div class="mb-4 relative" ref="calendarRef">
    <label class="block text-sm font-bold text-gray-700 mb-2">งวดวันที่ <span class="text-red-500">*</span></label>
    
    <!-- Input Button -->
    <button 
      @click="showCalendar = !showCalendar"
      type="button" 
      class="relative w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between hover:border-amber-400 transition-all shadow-sm group cursor-pointer hover:bg-white/80 text-left"
    >
       <span :class="date ? 'text-gray-800' : 'text-gray-400'" class="font-medium group-hover:text-amber-800 transition-colors pointer-events-none select-none">
          {{ formattedDate }}
       </span>
       <UIcon name="i-heroicons-calendar" class="text-amber-500 text-xl group-hover:scale-110 transition-transform pointer-events-none" />
    </button>

    <!-- Manual Dropdown / Popover -->
    <div v-if="showCalendar" class="absolute left-0 top-full mt-2 z-[50] bg-white rounded-lg shadow-xl border border-gray-100 p-2 w-full min-w-[300px]">
       <DatePicker 
          v-model="date" 
          :attributes="attributes" 
          locale="th" 
          expanded borderless
          :min-date="new Date()"
       />
    </div>

    <!-- Backdrop to close when clicking outside -->
    <div v-if="showCalendar" @click="showCalendar = false" class="fixed inset-0 z-[40]" style="cursor: default;"></div>
  </div>
</template>
