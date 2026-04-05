<script setup lang="ts">
import { computed } from 'vue'
import {
  Badge,
  Button,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuItem,
} from '@/components/ui'
import { Calendar, MoreVertical, Settings, User, Users } from 'lucide-vue-next'
import type { LeagueList } from '../types'

interface Props {
  league: LeagueList
}

interface Emits {
  (e: 'configure', leagueId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const statusVariant = computed(() => {
  if (props.league.is_active) return 'success'
  if (props.league.is_finished) return 'secondary'
  return 'warning'
})

const statusText = computed(() => {
  if (props.league.is_active) return 'Ativa'
  if (props.league.is_finished) return 'Finalizada'
  return 'Aguardando'
})

const formatVariant = computed(() => (props.league.format === 'CUP' ? 'default' : 'accent'))
const formatText = computed(() => (props.league.format === 'CUP' ? 'Copa' : 'Liga'))

const formattedStartDate = computed(() =>
  new Date(props.league.start_date).toLocaleDateString('pt-BR'),
)
const formattedEndDate = computed(() =>
  new Date(props.league.end_date).toLocaleDateString('pt-BR'),
)
</script>

<template>
  <Card class="hover:border-primary/50 transition-all cursor-pointer">
    <CardContent class="p-6 space-y-4">
      <div class="flex justify-between items-start">
        <h3 class="text-xl font-semibold text-foreground">{{ league.name }}</h3>
        <div class="flex items-start gap-2">
          <div class="flex flex-wrap justify-end gap-2">
            <Badge :variant="formatVariant">{{ formatText }}</Badge>
            <Badge :variant="statusVariant">{{ statusText }}</Badge>
          </div>

          <DropdownMenu>
            <template #trigger>
              <Button
                variant="ghost"
                size="icon-sm"
                class="text-muted-foreground hover:text-foreground"
                @click.stop
              >
                <MoreVertical :size="16" />
              </Button>
            </template>

            <DropdownMenuItem @click.stop="emit('configure', league.id)">
              <Settings :size="14" />
              Configurar liga
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>

      <p v-if="league.description" class="text-muted-foreground text-sm line-clamp-2">
        {{ league.description }}
      </p>

      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="flex items-center gap-2">
          <Calendar :size="14" class="text-muted-foreground" />
          <div>
            <p class="text-muted-foreground text-xs">Início</p>
            <p class="font-medium text-foreground">{{ formattedStartDate }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Calendar :size="14" class="text-muted-foreground" />
          <div>
            <p class="text-muted-foreground text-xs">Fim</p>
            <p class="font-medium text-foreground">{{ formattedEndDate }}</p>
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-border flex justify-between text-sm">
        <div class="flex items-center gap-4">
          <div v-if="league.format === 'CUP'" class="flex items-center gap-1.5">
            <Users :size="14" class="text-muted-foreground" />
            <span class="text-muted-foreground">Times:</span>
            <span class="font-medium text-foreground">{{ league.team_count }}</span>
          </div>
          <div v-else class="flex items-center gap-1.5">
            <User :size="14" class="text-muted-foreground" />
            <span class="font-medium text-foreground">Ranking Individual</span>
          </div>
        </div>
        <span class="text-muted-foreground">por {{ league.created_by_username }}</span>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
