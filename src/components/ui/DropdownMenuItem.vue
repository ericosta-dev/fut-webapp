<script setup lang="ts">
import { DropdownMenuItem } from 'radix-vue'
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  disabled?: boolean
}>()

const classes = computed(() =>
  cn(
    'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground outline-none transition-colors hover:bg-muted focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    props.class,
  ),
)
</script>

<template>
  <DropdownMenuItem :class="classes" :disabled="disabled">
    <slot />
  </DropdownMenuItem>
</template>
