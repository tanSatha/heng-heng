<script setup lang="ts">
defineProps<{
  modelValue: string
}>()
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div>
    <label class="block text-sm font-bold text-gray-700 mb-2">ประเภทหวย</label>
    <div class="flex p-1 bg-white rounded-full shadow-sm border border-gray-100">
      <button
        type="button"
        @click="emit('update:modelValue', 'THAI')"
        :class="['flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all', modelValue === 'THAI' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50']"
      >
        🇹🇭 หวยรัฐบาลไทย
      </button>
      <button
        type="button"
        @click="emit('update:modelValue', 'LAO')"
        :class="['flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all', modelValue === 'LAO' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50']"
      >
        🇱🇦 หวยลาวพัฒนา
      </button>
    </div>
  </div>
</template>
