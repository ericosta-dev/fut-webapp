<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMatchDaysStore } from '../stores/matchdaysStore'
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

// ─── Computed ─────────────────────────────────────────────────────────────────
const homeTeam = computed(() => props.match.home_team_detail)
const awayTeam = computed(() => props.match.away_team_detail)

const teams = computed(() => [homeTeam.value, awayTeam.value].filter(Boolean))

const matchDayGoalkeepers = computed(
  () => store.currentMatchDay?.matchday_goalkeepers ?? [],
)

/**
 * Goalkeepers available for the selected team:
 * any player in the matchday GK pool who isn't already assigned in this match.
 * The goalkeeper doesn't need to be a member of the team — they were simply
 * the player who stood in goal for that team at that moment.
 */
const availableGoalkeepers = computed(() => {
  if (!selectedTeamId.value) return []
  const assignedPlayerIds = new Set(props.match.goalkeepers.map((gk) => gk.player))
  return matchDayGoalkeepers.value.filter((gk) => !assignedPlayerIds.has(gk.player))
})

/**
 * Whether a team is selected but the pool is fully assigned (no GK left to pick).
 */
const noEligibleForSelectedTeam = computed(() => {
  if (!selectedTeamId.value) return false
  if (matchDayGoalkeepers.value.length === 0) return false // handled by separate warning
  return availableGoalkeepers.value.length === 0
})

// Goalkeeper already assigned to a team (null if none)
function goalkeeperForTeam(teamId: string) {
  return props.match.goalkeepers.find((gk) => gk.team === teamId) ?? null
}

function playerDisplayName(playerId: string): string {
  // First try the goalkeeper objects in the match (they carry player_detail)
  const fromMatch = props.match.goalkeepers.find((gk) => gk.player === playerId)
  if (fromMatch?.player_detail) {
    return fromMatch.player_detail.nickname || fromMatch.player_detail.name
  }
  // Fall back to the matchday GK pool entries
  const fromPool = matchDayGoalkeepers.value.find((gk) => gk.player === playerId)
  if (fromPool?.player_detail) {
    return fromPool.player_detail.nickname || fromPool.player_detail.name
  }
  return '?'
}

// ─── Methods ──────────────────────────────────────────────────────────────────
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
    <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">Goleiros</p>

    <!-- Current goalkeepers per team -->
    <div class="grid grid-cols-2 gap-2">
      <div
        v-for="team in teams"
        :key="team!.id"
        class="bg-slate-700/40 rounded-lg px-3 py-2 flex items-center justify-between gap-2"
      >
        <div>
          <p class="text-xs text-slate-400 mb-0.5">{{ team!.name }}</p>
          <template v-if="goalkeeperForTeam(team!.id)">
            <p class="text-sm text-white">
              🧤 {{ playerDisplayName(goalkeeperForTeam(team!.id)!.player) }}
            </p>
          </template>
          <p v-else class="text-xs text-slate-500 italic">Sem goleiro</p>
        </div>
        <button
          v-if="goalkeeperForTeam(team!.id)"
          class="text-slate-500 hover:text-red-400 transition-colors text-xs shrink-0"
          title="Remover goleiro"
          @click="handleRemove(goalkeeperForTeam(team!.id)!.id)"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Add form -->
    <div v-if="match.goalkeepers.length < 2" class="flex gap-2 items-start flex-wrap">
      <select
        v-model="selectedTeamId"
        class="flex-1 min-w-[100px] bg-slate-700 border border-slate-600 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
        class="flex-1 min-w-[100px] bg-slate-700 border border-slate-600 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
      >
        <option value="">{{ selectedTeamId && availableGoalkeepers.length === 0 ? 'Sem goleiros disponíveis' : 'Goleiro' }}</option>
        <option v-for="gk in availableGoalkeepers" :key="gk.player" :value="gk.player">
          {{ gk.player_detail.nickname || gk.player_detail.name }}
        </option>
      </select>

      <button
        :disabled="isSubmitting || !selectedTeamId || !selectedPlayerId"
        class="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-600 hover:bg-slate-500 text-white disabled:opacity-50 transition-colors shrink-0"
        @click="handleAdd"
      >
        {{ isSubmitting ? '...' : '+ Goleiro' }}
      </button>
    </div>

    <p v-if="formError" class="text-red-400 text-xs">{{ formError }}</p>

    <p
      v-if="matchDayGoalkeepers.length === 0"
      class="text-xs text-amber-400/80"
    >
      ⚠ Nenhum goleiro registrado nesta súmula. Adicione goleiros na aba Times.
    </p>
    <p
      v-else-if="noEligibleForSelectedTeam"
      class="text-xs text-amber-400/80"
    >
      ⚠ Todos os goleiros do pool já foram atribuídos nesta partida.
    </p>
    <p
      v-else-if="match.goalkeepers.length === 0 && teams.some((t) => !goalkeeperForTeam(t!.id))"
      class="text-xs text-slate-500"
    >
      Nenhum goleiro registrado para esta partida.
    </p>
  </div>
</template>
