<script setup lang="ts">
defineProps<{
  modelValue: string[]
}>()
const emit = defineEmits(['update:modelValue'])

const toggle = (type: string, current: string[]) => {
  if (current.includes(type)) {
    // ต้องมีอย่างน้อย 1 ประเภท
    if (current.length === 1) return
    emit('update:modelValue', current.filter(t => t !== type))
  } else {
    emit('update:modelValue', [...current, type])
  }
}
</script>

<template>
  <div>
    <label class="block text-sm font-bold text-gray-700 mb-2">ประเภทหวย</label>
    <div class="flex p-1 bg-white rounded-full shadow-sm border border-gray-100">
      <button
        type="button"
        @click="toggle('THAI', modelValue)"
        :class="['flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all', modelValue.includes('THAI') ? 'bg-amber-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50']"
      >
        🇹🇭 หวยรัฐบาลไทย
      </button>
      <button
        type="button"
        @click="toggle('LAO', modelValue)"
        :class="['flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all', modelValue.includes('LAO') ? 'bg-amber-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50']"
      >
        🇱🇦 หวยลาวพัฒนา
      </button>
    </div>
    <p v-if="modelValue.length === 2" class="text-xs text-amber-600 mt-1.5 text-center font-medium">
      ✨ เลือก 2 ประเภท ระบบจะสร้าง 2 ใบให้อัตโนมัติ
    </p>
  </div>
</template>
