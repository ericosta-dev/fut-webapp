<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  modelValue?: string
  placeholder?: string
  type?: string
  disabled?: boolean
  id?: string
  name?: string
  required?: boolean
  autofocus?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const classes = computed(() =>
  cn(
    'flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
    props.class,
  ),
)

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <input
    :class="classes"
    :value="modelValue"
    :placeholder="placeholder"
    :type="type ?? 'text'"
    :disabled="disabled"
    :id="id"
    :name="name"
    :required="required"
    :autofocus="autofocus"
    @input="onInput"
  />
</template>
