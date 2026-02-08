<script setup lang="ts">
import { computed } from 'vue'
import type { LeagueList } from '../types'

interface Props {
  league: LeagueList
}

const props = defineProps<Props>()

// Computed
const statusBadge = computed(() => {
  if (props.league.is_active) {
    return {
      text: 'Ativa',
      class: 'bg-emerald-500/20 text-emerald-400',
    }
  } else if (props.league.is_finished) {
    return {
      text: 'Finalizada',
      class: 'bg-slate-500/20 text-slate-400',
    }
  } else {
    return {
      text: 'Aguardando',
      class: 'bg-amber-500/20 text-amber-400',
    }
  }
})

const formatBadge = computed(() => {
  return props.league.format === 'CUP'
    ? {
        text: 'Copa',
        class: 'bg-blue-500/20 text-blue-400',
      }
    : {
        text: 'Liga',
        class: 'bg-purple-500/20 text-purple-400',
      }
})

const formattedStartDate = computed(() => {
  return new Date(props.league.start_date).toLocaleDateString('pt-BR')
})

const formattedEndDate = computed(() => {
  return new Date(props.league.end_date).toLocaleDateString('pt-BR')
})
</script>

<template>
  <div
    class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 hover:border-emerald-500/50 transition-all cursor-pointer"
  >
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-xl font-semibold text-white">
        {{ league.name }}
      </h3>
      <div class="flex gap-2">
        <span
          :class="formatBadge.class"
          class="px-2.5 py-1 text-xs font-medium rounded-full"
        >
          {{ formatBadge.text }}
        </span>
        <span
          :class="statusBadge.class"
          class="px-2.5 py-1 text-xs font-medium rounded-full"
        >
          {{ statusBadge.text }}
        </span>
      </div>
    </div>

    <p v-if="league.description" class="text-slate-400 text-sm mb-4 line-clamp-2">
      {{ league.description }}
    </p>

    <div class="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p class="text-slate-500">Início</p>
        <p class="font-medium text-white">{{ formattedStartDate }}</p>
      </div>
      <div>
        <p class="text-slate-500">Fim</p>
        <p class="font-medium text-white">{{ formattedEndDate }}</p>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-slate-700/50 flex justify-between text-sm">
      <div class="flex items-center gap-4">
        <div v-if="league.format === 'CUP'">
          <span class="text-slate-500">Times:</span>
          <span class="ml-1 font-medium text-white">{{ league.team_count }}</span>
        </div>
        <div v-if="league.format === 'LEAGUE'">
          <span class="text-slate-500">Tipo:</span>
          <span class="ml-1 font-medium text-white">Ranking Individual</span>
        </div>
      </div>
      <div class="text-slate-500">
        por {{ league.created_by_username }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
