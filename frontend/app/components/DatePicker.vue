<script setup lang="ts">
import { DatePicker as VCalendarDatePicker } from 'v-calendar'
// @ts-ignore
import type { DatePickerDate, DatePickerRangeObject } from 'v-calendar/dist/types/src/use/datePicker'
import 'v-calendar/dist/style.css'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  modelValue: {
    type: [Date, Object] as PropType<DatePickerDate | DatePickerRangeObject | null>,
    default: null
  }
})

const emit = defineEmits(['update:model-value', 'close'])

const date = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:model-value', value)
    emit('close')
  }
})

const attrs = {
  'transparent': true,
  'borderless': true,
  'color': 'orange', // Changed from 'primary' to 'orange' to match theme and use built-in colors
  'is-dark': { selector: 'html', darkClass: 'dark' },
  'first-day-of-week': 2
}

function onDayClick(_: any, event: MouseEvent): void {
  const target = event.target as HTMLElement
  target.blur()
}
</script>

<template>
  <VCalendarDatePicker
    v-if="date && (date as DatePickerRangeObject)?.start && (date as DatePickerRangeObject)?.end"
    v-model.range="date"
    :columns="2"
    v-bind="{ ...attrs, ...$attrs }"
    @dayclick="onDayClick"
  />
  <VCalendarDatePicker
    v-else
    v-model="date"
    v-bind="{ ...attrs, ...$attrs }"
    @dayclick="onDayClick"
  />
</template>

<style>
/* Removed custom CSS mapping which caused invisible text issues */
/* v-calendar's built-in 'orange' theme will be used instead */
</style>
