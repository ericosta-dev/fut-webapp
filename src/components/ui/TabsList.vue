<script setup lang="ts">
import { TabsList } from 'radix-vue'
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const classes = computed(() =>
  cn(
    'inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
    props.class,
  ),
)
</script>

<template>
  <TabsList :class="classes">
    <slot />
  </TabsList>
</template>
