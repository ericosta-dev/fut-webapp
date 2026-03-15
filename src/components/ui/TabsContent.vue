<script setup lang="ts">
import { TabsContent } from 'radix-vue'
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  value: string
  class?: HTMLAttributes['class']
}>()

const classes = computed(() =>
  cn(
    'mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    props.class,
  ),
)
</script>

<template>
  <TabsContent :value="value" :class="classes">
    <slot />
  </TabsContent>
</template>
