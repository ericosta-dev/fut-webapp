<script setup lang="ts">
import { CalendarDays } from 'lucide-vue-next'
import { Badge } from '@/components/ui'
import type { MatchDaySummary } from '../types'

defineProps<{
  matchdays: MatchDaySummary[]
}>()

const statusLabel: Record<string, string> = {
  COMPLETED: 'Concluída',
  IN_PROGRESS: 'Em Andamento',
  DRAFT: 'Rascunho',
}

const statusVariant = (status: string): 'default' | 'outline' | 'secondary' | 'destructive' => {
  if (status === 'COMPLETED') return 'secondary'
  if (status === 'IN_PROGRESS') return 'default'
  return 'outline'
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}
</script>

<template>
  <section>
    <h3 class="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
      <CalendarDays :size="16" class="text-primary" /> Resultados por Rodada
    </h3>

    <div v-if="matchdays.length === 0" class="rounded-xl border border-border px-4 py-6 text-center text-muted-foreground text-sm italic">
      Nenhuma rodada registrada ainda.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="md in matchdays"
        :key="md.id"
        class="rounded-xl border border-border bg-card overflow-hidden"
      >
        <!-- Matchday header -->
        <div class="flex items-center justify-between gap-3 px-4 py-2.5 bg-muted/50 border-b border-border">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-foreground">{{ md.label }}</span>
            <span class="text-xs text-muted-foreground">· {{ formatDate(md.date) }}</span>
          </div>
          <Badge :variant="statusVariant(md.status)" class="text-xs shrink-0">
            {{ statusLabel[md.status] ?? md.status }}
          </Badge>
        </div>

        <!-- Match scores -->
        <div class="divide-y divide-border">
          <div
            v-for="match in md.matches"
            :key="match.match_id"
            class="flex items-center px-4 py-2 gap-3"
          >
            <span class="flex-1 text-sm text-foreground text-right font-medium truncate">
              {{ match.home_team_name }}
            </span>
            <span class="shrink-0 tabular-nums font-bold text-foreground px-3 py-0.5 rounded-lg bg-muted text-sm">
              {{ match.home_score }} × {{ match.away_score }}
            </span>
            <span class="flex-1 text-sm text-foreground font-medium truncate">
              {{ match.away_team_name }}
            </span>
          </div>

          <div v-if="md.matches.length === 0" class="px-4 py-3 text-sm text-muted-foreground italic">
            Sem jogos registrados.
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
