<script setup lang="ts">
import type { MatchDayList } from '../types'

interface Props {
  matchday: MatchDayList
}

defineProps<Props>()

defineEmits<{
  (e: 'click'): void
  (e: 'delete'): void
}>()

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  DRAFT: { label: 'Rascunho', class: 'bg-slate-500/20 text-slate-400' },
  IN_PROGRESS: { label: 'Em Andamento', class: 'bg-amber-500/20 text-amber-400' },
  COMPLETED: { label: 'Concluído', class: 'bg-emerald-500/20 text-emerald-400' },
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div
    class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 cursor-pointer hover:border-emerald-500/30 hover:bg-slate-800/80 transition-all group"
    @click="$emit('click')"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <!-- Date + label -->
        <p class="text-xs text-slate-400 font-medium">{{ formatDate(matchday.date) }}</p>
        <h3 class="text-white font-semibold mt-0.5 truncate">
          {{ matchday.label || 'Súmula sem título' }}
        </h3>
      </div>

      <!-- Status badge -->
      <span
        :class="STATUS_CONFIG[matchday.status]?.class"
        class="flex-shrink-0 px-2.5 py-1 text-xs font-medium rounded-full"
      >
        {{ STATUS_CONFIG[matchday.status]?.label }}
      </span>
    </div>

    <!-- Counters -->
    <div class="mt-3 flex gap-4">
      <div class="flex items-center gap-1.5 text-sm text-slate-400">
        <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"
          />
        </svg>
        {{ matchday.team_count }} time(s)
      </div>
      <div class="flex items-center gap-1.5 text-sm text-slate-400">
        <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 10h18M3 6h18M3 14h18M3 18h18"
          />
        </svg>
        {{ matchday.match_count }} jogo(s)
      </div>
    </div>

    <!-- Delete button (visible on hover) -->
    <button
      class="mt-3 -mb-1 text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
      @click.stop="$emit('delete')"
    >
      Excluir
    </button>
  </div>
</template>
