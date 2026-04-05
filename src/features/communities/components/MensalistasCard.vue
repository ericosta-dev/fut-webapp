<script setup lang="ts">
import { computed } from 'vue'
import { Users } from 'lucide-vue-next'
import { Badge } from '@/components/ui'
import type { Player } from '@/types'

const props = defineProps<{
  players: Player[]
  maxMensalistas: number
  loading?: boolean
}>()

const mensalistas = computed(() =>
  props.players.filter((p) => p.status === 'MONTHLY' && p.is_active),
)

const limitLabel = computed(() => {
  if (props.maxMensalistas === 0) return `${mensalistas.value.length}`
  return `${mensalistas.value.length}/${props.maxMensalistas}`
})

const positionLabel: Record<string, string> = {
  FWD: 'ATA',
  MID: 'MEI',
  DEF: 'ZAG',
  GK: 'GOL',
}

const positionVariant = (
  pos: string,
): 'default' | 'outline' | 'secondary' | 'accent' | 'success' | 'warning' => {
  if (pos === 'FWD') return 'accent'
  if (pos === 'MID') return 'default'
  if (pos === 'DEF') return 'secondary'
  return 'outline'
}
</script>

<template>
  <section class="rounded-xl border border-border bg-card overflow-hidden">
    <div class="px-4 py-3 border-b border-border flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Users :size="16" class="text-primary" />
        <h3 class="text-sm font-semibold text-foreground">Mensalistas</h3>
      </div>
      <span class="text-xs text-muted-foreground tabular-nums">{{ limitLabel }}</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="px-4 py-4">
      <div class="animate-pulse space-y-2">
        <div v-for="i in 4" :key="i" class="h-8 bg-muted rounded-lg" />
      </div>
    </div>

    <!-- List -->
    <div v-else-if="mensalistas.length > 0" class="divide-y divide-border">
      <div
        v-for="player in mensalistas"
        :key="player.id"
        class="flex items-center px-4 py-2 gap-3 hover:bg-muted/40 transition-colors"
      >
        <div
          class="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0"
        >
          {{ (player.nickname || player.name).charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-foreground font-medium truncate">
            {{ player.nickname || player.name }}
          </p>
        </div>
        <Badge :variant="positionVariant(player.position)" class="text-[10px] shrink-0">
          {{ positionLabel[player.position] ?? player.position }}
        </Badge>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="px-4 py-6 text-center text-muted-foreground text-sm italic">
      Nenhum mensalista cadastrado.
    </div>
  </section>
</template>
