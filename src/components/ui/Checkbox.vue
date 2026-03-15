<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  modelValue?: boolean
  disabled?: boolean
  id?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const classes = computed(() =>
  cn(
    'peer h-4 w-4 shrink-0 rounded-sm border border-border bg-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer appearance-none relative',
    props.modelValue && 'bg-primary border-primary',
    props.class,
  ),
)

function toggle() {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>

<template>
  <button
    role="checkbox"
    :aria-checked="modelValue"
    :class="classes"
    :disabled="disabled"
    :id="id"
    type="button"
    @click="toggle"
  >
    <svg
      v-if="modelValue"
      class="absolute inset-0 m-auto h-3 w-3 text-primary-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </button>
</template>
