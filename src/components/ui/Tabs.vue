<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'radix-vue'
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  defaultValue?: string
  modelValue?: string
  class?: HTMLAttributes['class']
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <TabsRoot
    :default-value="defaultValue"
    :model-value="modelValue"
    @update:model-value="(v) => emit('update:modelValue', v as string)"
    :class="cn('', props.class)"
  >
    <slot />
  </TabsRoot>
</template>
