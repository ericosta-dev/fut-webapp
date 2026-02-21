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

// ─── Form state ───────────────────────────────────────────────────────────────
const selectedTeamId = ref('')
const selectedPlayerId = ref('')
const isOwnGoal = ref(false)
const assistedById = ref('')
const isSubmitting = ref(false)
const formError = ref('')

// ─── Computed ─────────────────────────────────────────────────────────────────
const homeTeam = computed(() => props.match.home_team_detail)
const awayTeam = computed(() => props.match.away_team_detail)

const selectedTeam = computed(() =>
  selectedTeamId.value === homeTeam.value?.id ? homeTeam.value : awayTeam.value,
)

const playersInSelectedTeam = computed(() => selectedTeam.value?.players_detail ?? [])

const assistCandidates = computed(() =>
  playersInSelectedTeam.value.filter((p) => p.id !== selectedPlayerId.value),
)

const homeGoals = computed(() =>
  props.match.goals.filter(
    (g) =>
      (!g.is_own_goal && g.team === props.match.home_team) ||
      (g.is_own_goal && g.team === props.match.away_team),
  ),
)

const awayGoals = computed(() =>
  props.match.goals.filter(
    (g) =>
      (!g.is_own_goal && g.team === props.match.away_team) ||
      (g.is_own_goal && g.team === props.match.home_team),
  ),
)

// ─── Methods ──────────────────────────────────────────────────────────────────
function resetForm() {
  selectedTeamId.value = ''
  selectedPlayerId.value = ''
  isOwnGoal.value = false
  assistedById.value = ''
  formError.value = ''
}

function onOwnGoalChange() {
  if (isOwnGoal.value) assistedById.value = ''
}

function onTeamChange() {
  selectedPlayerId.value = ''
  assistedById.value = ''
}

async function handleAddGoal() {
  formError.value = ''
  if (!selectedTeamId.value) {
    formError.value = 'Selecione o time.'
    return
  }
  if (!selectedPlayerId.value) {
    formError.value = 'Selecione o jogador.'
    return
  }
  isSubmitting.value = true
  try {
    await store.createGoal(
      props.communityId,
      props.leagueId,
      props.matchdayId,
      props.match.id,
      {
        player: selectedPlayerId.value,
        team: selectedTeamId.value,
        is_own_goal: isOwnGoal.value,
        assisted_by: isOwnGoal.value ? null : assistedById.value || null,
      },
    )
    resetForm()
  } catch {
    formError.value = 'Erro ao registrar gol. Tente novamente.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleDeleteGoal(goalId: string) {
  await store.deleteGoal(
    props.communityId,
    props.leagueId,
    props.matchdayId,
    props.match.id,
    goalId,
  )
}

function playerName(playerId: string): string {
  const all = [
    ...(homeTeam.value?.players_detail ?? []),
    ...(awayTeam.value?.players_detail ?? []),
  ]
  const p = all.find((pl) => pl.id === playerId)
  return p ? (p.nickname || p.name) : '?'
}
</script>

<template>
  <div class="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4 space-y-4">
    <!-- Score header -->
    <div class="flex items-center justify-between text-sm font-medium">
      <span class="text-white truncate max-w-[35%]">{{ homeTeam?.name }}</span>
      <div class="flex items-center gap-2 px-3 py-1 bg-slate-900/60 rounded-lg">
        <span class="text-emerald-400 font-bold text-lg tabular-nums">{{ match.home_score }}</span>
        <span class="text-slate-500">×</span>
        <span class="text-emerald-400 font-bold text-lg tabular-nums">{{ match.away_score }}</span>
      </div>
      <span class="text-white truncate max-w-[35%] text-right">{{ awayTeam?.name }}</span>
    </div>

    <!-- Goals list side by side -->
    <div class="grid grid-cols-2 gap-3">
      <!-- Home goals -->
      <div>
        <p class="text-xs text-slate-400 uppercase tracking-wide mb-1">{{ homeTeam?.name }}</p>
        <ul class="space-y-1">
          <li
            v-for="g in homeGoals"
            :key="g.id"
            class="group flex items-center justify-between gap-1 text-sm"
          >
            <span class="text-slate-200 flex items-center gap-1">
              <span v-if="g.is_own_goal" class="text-red-400 text-xs font-bold">(OG)</span>
              {{ playerName(g.player) }}
              <span v-if="g.assisted_by" class="text-slate-400 text-xs">
                ← {{ playerName(g.assisted_by) }}
              </span>
            </span>
            <button
              class="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity text-xs"
              title="Remover gol"
              @click="handleDeleteGoal(g.id)"
            >
              ✕
            </button>
          </li>
          <li v-if="homeGoals.length === 0" class="text-xs text-slate-500 italic">–</li>
        </ul>
      </div>

      <!-- Away goals -->
      <div>
        <p class="text-xs text-slate-400 uppercase tracking-wide mb-1">{{ awayTeam?.name }}</p>
        <ul class="space-y-1">
          <li
            v-for="g in awayGoals"
            :key="g.id"
            class="group flex items-center justify-between gap-1 text-sm"
          >
            <span class="text-slate-200 flex items-center gap-1">
              <span v-if="g.is_own_goal" class="text-red-400 text-xs font-bold">(OG)</span>
              {{ playerName(g.player) }}
              <span v-if="g.assisted_by" class="text-slate-400 text-xs">
                ← {{ playerName(g.assisted_by) }}
              </span>
            </span>
            <button
              class="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity text-xs"
              title="Remover gol"
              @click="handleDeleteGoal(g.id)"
            >
              ✕
            </button>
          </li>
          <li v-if="awayGoals.length === 0" class="text-xs text-slate-500 italic">–</li>
        </ul>
      </div>
    </div>

    <!-- Add goal form -->
    <div class="border-t border-slate-700/50 pt-3 space-y-2">
      <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">Registrar Gol</p>

      <div class="grid grid-cols-2 gap-2">
        <!-- Team select -->
        <select
          v-model="selectedTeamId"
          class="bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          @change="onTeamChange"
        >
          <option value="">Time</option>
          <option :value="homeTeam?.id">{{ homeTeam?.name }}</option>
          <option :value="awayTeam?.id">{{ awayTeam?.name }}</option>
        </select>

        <!-- Player select -->
        <select
          v-model="selectedPlayerId"
          :disabled="!selectedTeamId"
          class="bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
        >
          <option value="">Jogador</option>
          <option v-for="p in playersInSelectedTeam" :key="p.id" :value="p.id">
            {{ p.nickname || p.name }}
          </option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-2 items-start">
        <!-- Assist select -->
        <select
          v-model="assistedById"
          :disabled="!selectedPlayerId || isOwnGoal"
          class="bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
        >
          <option value="">Assistência (opcional)</option>
          <option v-for="p in assistCandidates" :key="p.id" :value="p.id">
            {{ p.nickname || p.name }}
          </option>
        </select>

        <!-- Own goal checkbox -->
        <label class="flex items-center gap-2 cursor-pointer text-sm text-slate-300 self-center">
          <input
            v-model="isOwnGoal"
            type="checkbox"
            class="w-4 h-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
            @change="onOwnGoalChange"
          />
          Gol Contra
        </label>
      </div>

      <p v-if="formError" class="text-red-400 text-xs">{{ formError }}</p>

      <button
        :disabled="isSubmitting || !selectedTeamId || !selectedPlayerId"
        class="w-full py-1.5 px-3 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        @click="handleAddGoal"
      >
        {{ isSubmitting ? 'Registrando...' : '+ Adicionar Gol' }}
      </button>
    </div>
  </div>
</template>
