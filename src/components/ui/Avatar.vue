<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}>()

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

const classes = computed(() =>
  cn(
    'relative flex shrink-0 overflow-hidden rounded-full bg-primary/20 text-primary items-center justify-center font-semibold',
    sizeClasses[props.size ?? 'md'],
    props.class,
  ),
)

const initials = computed(() => {
  if (props.fallback) return props.fallback.charAt(0).toUpperCase()
  if (props.alt) return props.alt.charAt(0).toUpperCase()
  return '?'
})
</script>

<template>
  <span :class="classes">
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="aspect-square h-full w-full object-cover"
    />
    <span v-else>{{ initials }}</span>
  </span>
</template>
