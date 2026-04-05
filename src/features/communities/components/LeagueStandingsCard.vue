<script setup lang="ts">
import { computed } from 'vue'
import CupStandings from '@/features/leagues/components/CupStandings.vue'
import LeaguePlayerStandings from '@/features/leagues/components/LeaguePlayerStandings.vue'
import type { CupTeamStanding } from '@/features/leagues/types'
import type { LeaguePlayerStandingEntry, LeagueFormat } from '@/features/leagues/types'

const props = defineProps<{
  format: LeagueFormat
  cupStandings?: CupTeamStanding[]
  playerStandings?: LeaguePlayerStandingEntry[]
  loading?: boolean
}>()

const hasCupData = computed(() => props.format === 'CUP' && (props.cupStandings?.length ?? 0) > 0)
const hasLeagueData = computed(
  () => props.format === 'LEAGUE' && (props.playerStandings?.length ?? 0) > 0,
)
const hasData = computed(() => hasCupData.value || hasLeagueData.value)
</script>

<template>
  <section>
    <!-- Loading -->
    <div v-if="loading" class="rounded-xl border border-border bg-card p-4">
      <div class="animate-pulse space-y-2">
        <div class="h-5 bg-muted rounded w-1/3" />
        <div class="h-4 bg-muted rounded" v-for="i in 5" :key="i" />
      </div>
    </div>

    <!-- CUP standings -->
    <CupStandings v-else-if="format === 'CUP'" :standings="cupStandings ?? []" />

    <!-- LEAGUE standings -->
    <LeaguePlayerStandings
      v-else-if="format === 'LEAGUE'"
      :standings="playerStandings ?? []"
    />

    <!-- No data fallback -->
    <div
      v-else-if="!hasData && !loading"
      class="rounded-xl border border-border px-4 py-6 text-center text-muted-foreground text-sm italic"
    >
      Nenhuma classificação disponível.
    </div>
  </section>
</template>
