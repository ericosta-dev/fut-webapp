<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMatchDaysStore } from '../stores/matchdaysStore'
import { Button, Label } from '@/components/ui'
import { Shield, X, AlertTriangle, Loader2 } from 'lucide-vue-next'
import type { Match } from '../types'

interface Props {
  match: Match
  communityId: string
  leagueId: string
  matchdayId: string
}

const props = defineProps<Props>()
const store = useMatchDaysStore()

const selectedTeamId = ref('')
const selectedPlayerId = ref('')
const isSubmitting = ref(false)
const formError = ref('')

const homeTeam = computed(() => props.match.home_team_detail)
const awayTeam = computed(() => props.match.away_team_detail)
const teams = computed(() => [homeTeam.value, awayTeam.value].filter(Boolean))

const matchDayGoalkeepers = computed(
  () => store.currentMatchDay?.matchday_goalkeepers ?? [],
)

const availableGoalkeepers = computed(() => {
  if (!selectedTeamId.value) return []
  const assignedPlayerIds = new Set(props.match.goalkeepers.map((gk) => gk.player))
  return matchDayGoalkeepers.value.filter((gk) => !assignedPlayerIds.has(gk.player))
})

const noEligibleForSelectedTeam = computed(() => {
  if (!selectedTeamId.value) return false
  if (matchDayGoalkeepers.value.length === 0) return false
  return availableGoalkeepers.value.length === 0
})

function goalkeeperForTeam(teamId: string) {
  return props.match.goalkeepers.find((gk) => gk.team === teamId) ?? null
}

function playerDisplayName(playerId: string): string {
  const fromMatch = props.match.goalkeepers.find((gk) => gk.player === playerId)
  if (fromMatch?.player_detail) return fromMatch.player_detail.nickname || fromMatch.player_detail.name
  const fromPool = matchDayGoalkeepers.value.find((gk) => gk.player === playerId)
  if (fromPool?.player_detail) return fromPool.player_detail.nickname || fromPool.player_detail.name
  return '?'
}

function onTeamChange() {
  selectedPlayerId.value = ''
}

async function handleAdd() {
  formError.value = ''
  if (!selectedTeamId.value || !selectedPlayerId.value) {
    formError.value = 'Selecione o time e o goleiro.'
    return
  }
  isSubmitting.value = true
  try {
    await store.addGoalkeeper(
      props.communityId,
      props.leagueId,
      props.matchdayId,
      props.match.id,
      { player: selectedPlayerId.value, team: selectedTeamId.value },
    )
    selectedTeamId.value = ''
    selectedPlayerId.value = ''
  } catch {
    formError.value = 'Erro ao adicionar goleiro.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleRemove(goalkeeperIdVal: string) {
  await store.removeGoalkeeper(
    props.communityId,
    props.leagueId,
    props.matchdayId,
    props.match.id,
    goalkeeperIdVal,
  )
}
</script>

<template>
  <div class="space-y-2">
    <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
      <Shield :size="12" /> Goleiros
    </p>

    <div class="grid grid-cols-2 gap-2">
      <div
        v-for="team in teams"
        :key="team!.id"
        class="bg-muted/40 rounded-lg px-3 py-2 flex items-center justify-between gap-2"
      >
        <div>
          <p class="text-xs text-muted-foreground mb-0.5">{{ team!.name }}</p>
          <template v-if="goalkeeperForTeam(team!.id)">
            <p class="text-sm text-foreground flex items-center gap-1">
              <Shield :size="12" class="text-primary" />
              {{ playerDisplayName(goalkeeperForTeam(team!.id)!.player) }}
            </p>
          </template>
          <p v-else class="text-xs text-muted-foreground italic">Sem goleiro</p>
        </div>
        <button
          v-if="goalkeeperForTeam(team!.id)"
          class="text-muted-foreground hover:text-destructive transition-colors shrink-0"
          title="Remover goleiro"
          @click="handleRemove(goalkeeperForTeam(team!.id)!.id)"
        >
          <X :size="14" />
        </button>
      </div>
    </div>

    <div v-if="match.goalkeepers.length < 2" class="flex gap-2 items-start flex-wrap">
      <select
        v-model="selectedTeamId"
        class="flex-1 min-w-[100px] bg-card border border-border text-foreground text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
        @change="onTeamChange"
      >
        <option value="">Time</option>
        <option
          v-for="team in teams"
          :key="team!.id"
          :value="team!.id"
          :disabled="!!goalkeeperForTeam(team!.id)"
        >
          {{ team!.name }}
        </option>
      </select>

      <select
        v-model="selectedPlayerId"
        :disabled="!selectedTeamId || availableGoalkeepers.length === 0"
        class="flex-1 min-w-[100px] bg-card border border-border text-foreground text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
      >
        <option value="">{{ selectedTeamId && availableGoalkeepers.length === 0 ? 'Sem goleiros disponíveis' : 'Goleiro' }}</option>
        <option v-for="gk in availableGoalkeepers" :key="gk.player" :value="gk.player">
          {{ gk.player_detail.nickname || gk.player_detail.name }}
        </option>
      </select>

      <Button
        :disabled="isSubmitting || !selectedTeamId || !selectedPlayerId"
        variant="secondary"
        size="sm"
        @click="handleAdd"
      >
        <Loader2 v-if="isSubmitting" :size="12" class="animate-spin" />
        <Shield v-else :size="12" />
        Goleiro
      </Button>
    </div>

    <p v-if="formError" class="text-destructive text-xs">{{ formError }}</p>

    <p
      v-if="matchDayGoalkeepers.length === 0"
      class="text-xs text-warning flex items-center gap-1"
    >
      <AlertTriangle :size="12" /> Nenhum goleiro registrado nesta súmula. Adicione goleiros na aba Times.
    </p>
    <p
      v-else-if="noEligibleForSelectedTeam"
      class="text-xs text-warning flex items-center gap-1"
    >
      <AlertTriangle :size="12" /> Todos os goleiros do pool já foram atribuídos nesta partida.
    </p>
    <p
      v-else-if="match.goalkeepers.length === 0 && teams.some((t) => !goalkeeperForTeam(t!.id))"
      class="text-xs text-muted-foreground"
    >
      Nenhum goleiro registrado para esta partida.
    </p>
  </div>
</template>
