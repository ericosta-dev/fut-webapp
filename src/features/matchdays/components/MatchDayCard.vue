<script setup lang="ts">
import { Badge, Card, CardContent } from '@/components/ui'
import { CalendarDays, Users, ListOrdered, Trash2 } from 'lucide-vue-next'
import type { MatchDayList } from '../types'

interface Props {
  matchday: MatchDayList
}

defineProps<Props>()

defineEmits<{
  (e: 'click'): void
  (e: 'delete'): void
}>()

const STATUS_CONFIG: Record<string, { label: string; variant: 'secondary' | 'warning' | 'success' }> = {
  DRAFT: { label: 'Rascunho', variant: 'secondary' },
  IN_PROGRESS: { label: 'Em Andamento', variant: 'warning' },
  COMPLETED: { label: 'Concluído', variant: 'success' },
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
  <Card
    class="cursor-pointer hover:border-primary/30 transition-all group"
    @click="$emit('click')"
  >
    <CardContent class="p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <p class="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <CalendarDays :size="12" />
            {{ formatDate(matchday.date) }}
          </p>
          <h3 class="text-foreground font-semibold mt-0.5 truncate">
            {{ matchday.label || 'Súmula sem título' }}
          </h3>
        </div>
        <Badge :variant="STATUS_CONFIG[matchday.status]?.variant ?? 'secondary'">
          {{ STATUS_CONFIG[matchday.status]?.label }}
        </Badge>
      </div>

      <div class="mt-3 flex gap-4">
        <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users :size="14" class="text-muted-foreground/60" />
          {{ matchday.team_count }} time(s)
        </div>
        <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ListOrdered :size="14" class="text-muted-foreground/60" />
          {{ matchday.match_count }} jogo(s)
        </div>
      </div>

      <button
        class="mt-3 -mb-1 text-xs text-destructive hover:text-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
        @click.stop="$emit('delete')"
      >
        <Trash2 :size="12" /> Excluir
      </button>
    </CardContent>
  </Card>
</template>
