<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  orientation?: 'horizontal' | 'vertical'
}>()

const classes = computed(() =>
  cn(
    'shrink-0 bg-border',
    props.orientation === 'vertical' ? 'h-full w-px' : 'h-px w-full',
    props.class,
  ),
)
</script>

<template>
  <div role="separator" :class="classes" />
</template>
