<script setup lang="ts">
import {
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
  SelectItemText,
  SelectItemIndicator,
} from 'radix-vue'
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'
import { Check, ChevronDown } from 'lucide-vue-next'

const props = defineProps<{
  modelValue?: string
  placeholder?: string
  class?: HTMLAttributes['class']
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const triggerClasses = computed(() =>
  cn(
    'flex h-10 w-full items-center justify-between rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
    props.class,
  ),
)
</script>

<template>
  <SelectRoot
    :model-value="modelValue"
    @update:model-value="(v) => emit('update:modelValue', v as string)"
    :disabled="disabled"
  >
    <SelectTrigger :class="triggerClasses">
      <SelectValue :placeholder="placeholder" />
      <ChevronDown :size="16" class="ml-2 shrink-0 text-muted-foreground" />
    </SelectTrigger>
    <SelectPortal>
      <SelectContent
        position="popper"
        :side-offset="4"
        class="z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-card shadow-xl animate-scale-in"
      >
        <SelectViewport class="p-1">
          <slot />
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
