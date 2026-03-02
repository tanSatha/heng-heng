<script setup lang="ts">
defineProps(['number1', 'number2'])
defineEmits(['update:number1', 'update:number2'])
</script>

<template>
  <div>
    <label class="block text-sm font-bold text-gray-700 mb-2">เลขที่ได้มา (กรอกได้ 3 ตัว และ 2 ตัว)</label>
    <div class="grid grid-cols-2 gap-4">
      <input 
        :value="number1" 
        @input="$emit('update:number1', ($event.target as HTMLInputElement).value)"
        type="text" 
        inputmode="numeric" 
        maxlength="3" 
        placeholder="เลข 3 ตัว"
        class="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all outline-none text-center text-xl font-bold tracking-widest"
      />
      <input 
        :value="number2" 
        @input="$emit('update:number2', ($event.target as HTMLInputElement).value)"
        type="text" 
        inputmode="numeric" 
        maxlength="2" 
        placeholder="เลข 2 ตัว"
        class="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all outline-none text-center text-xl font-bold tracking-widest"
      />
    </div>
  </div>
</template>
