<script setup lang="ts">
import { DropdownMenuLabel } from 'radix-vue'
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const classes = computed(() => cn('px-2 py-1.5 text-sm font-semibold text-foreground', props.class))
</script>

<template>
  <DropdownMenuLabel :class="classes">
    <slot />
  </DropdownMenuLabel>
</template>
