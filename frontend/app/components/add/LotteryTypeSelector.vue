<script setup lang="ts">
defineProps<{
  modelValue: string
}>()
const emit = defineEmits(['update:modelValue'])

const lotteryTypes = [
  { value: 'THAI', label: 'หวยรัฐบาลไทย' },
  { value: 'LAO', label: 'หวยลาว' }
]
</script>

<template>
  <div>
    <label class="block text-sm font-bold text-gray-700 mb-2">ประเภทหวย</label>
    <div class="grid grid-cols-2 gap-2">
      <button 
        v-for="type in lotteryTypes" 
        :key="type.value"
        type="button"
        @click="emit('update:modelValue', type.value)"
        class="py-3 rounded-xl text-sm font-bold transition-all border-2"
        :class="modelValue === type.value 
          ? 'bg-amber-100 border-amber-400 text-amber-700 shadow-sm' 
          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
      >
        {{ type.label }}
      </button>
    </div>
  </div>
</template>
