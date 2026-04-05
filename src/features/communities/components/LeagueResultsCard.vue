<script setup lang="ts">
import CupMatchdayResults from '@/features/leagues/components/CupMatchdayResults.vue'
import type { MatchDaySummary } from '@/features/leagues/types'

defineProps<{
  matchdays: MatchDaySummary[]
  loading?: boolean
}>()
</script>

<template>
  <section>
    <!-- Loading -->
    <div v-if="loading" class="rounded-xl border border-border bg-card p-4">
      <div class="animate-pulse space-y-3">
        <div class="h-5 bg-muted rounded w-1/3" />
        <div v-for="i in 3" :key="i" class="space-y-1">
          <div class="h-8 bg-muted rounded" />
          <div class="h-6 bg-muted rounded w-5/6" />
        </div>
      </div>
    </div>

    <!-- Results -->
    <CupMatchdayResults v-else :matchdays="matchdays" />
  </section>
</template>
