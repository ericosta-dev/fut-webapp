<script setup lang="ts">
import { SelectItem, SelectItemText, SelectItemIndicator } from 'radix-vue'
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-vue-next'

const props = defineProps<{
  value: string
  class?: HTMLAttributes['class']
  disabled?: boolean
}>()

const classes = computed(() =>
  cn(
    'relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm text-foreground outline-none hover:bg-muted focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=checked]:text-accent',
    props.class,
  ),
)
</script>

<template>
  <SelectItem :value="value" :class="classes" :disabled="disabled">
    <SelectItemIndicator class="absolute left-2 flex items-center justify-center">
      <Check :size="14" class="text-accent" />
    </SelectItemIndicator>
    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
