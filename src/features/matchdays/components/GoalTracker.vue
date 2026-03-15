<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMatchDaysStore } from '../stores/matchdaysStore'
import { Button } from '@/components/ui'
import { X, Plus, Loader2 } from 'lucide-vue-next'
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
const isOwnGoal = ref(false)
const assistedById = ref('')
const isSubmitting = ref(false)
const formError = ref('')

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
  <div class="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
    <!-- Score header -->
    <div class="flex items-center justify-between text-sm font-medium">
      <span class="text-foreground truncate max-w-[35%]">{{ homeTeam?.name }}</span>
      <div class="flex items-center gap-2 px-3 py-1 bg-background rounded-lg border border-border">
        <span class="text-primary font-bold text-lg tabular-nums">{{ match.home_score }}</span>
        <span class="text-muted-foreground">×</span>
        <span class="text-primary font-bold text-lg tabular-nums">{{ match.away_score }}</span>
      </div>
      <span class="text-foreground truncate max-w-[35%] text-right">{{ awayTeam?.name }}</span>
    </div>

    <!-- Goals list side by side -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <p class="text-xs text-muted-foreground uppercase tracking-wide mb-1">{{ homeTeam?.name }}</p>
        <ul class="space-y-1">
          <li
            v-for="g in homeGoals"
            :key="g.id"
            class="group flex items-center justify-between gap-1 text-sm"
          >
            <span class="text-foreground/90 flex items-center gap-1">
              <span v-if="g.is_own_goal" class="text-destructive text-xs font-bold">(OG)</span>
              {{ playerName(g.player) }}
              <span v-if="g.assisted_by" class="text-muted-foreground text-xs">
                ← {{ playerName(g.assisted_by) }}
              </span>
            </span>
            <button
              class="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
              title="Remover gol"
              @click="handleDeleteGoal(g.id)"
            >
              <X :size="12" />
            </button>
          </li>
          <li v-if="homeGoals.length === 0" class="text-xs text-muted-foreground italic">–</li>
        </ul>
      </div>

      <div>
        <p class="text-xs text-muted-foreground uppercase tracking-wide mb-1">{{ awayTeam?.name }}</p>
        <ul class="space-y-1">
          <li
            v-for="g in awayGoals"
            :key="g.id"
            class="group flex items-center justify-between gap-1 text-sm"
          >
            <span class="text-foreground/90 flex items-center gap-1">
              <span v-if="g.is_own_goal" class="text-destructive text-xs font-bold">(OG)</span>
              {{ playerName(g.player) }}
              <span v-if="g.assisted_by" class="text-muted-foreground text-xs">
                ← {{ playerName(g.assisted_by) }}
              </span>
            </span>
            <button
              class="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
              title="Remover gol"
              @click="handleDeleteGoal(g.id)"
            >
              <X :size="12" />
            </button>
          </li>
          <li v-if="awayGoals.length === 0" class="text-xs text-muted-foreground italic">–</li>
        </ul>
      </div>
    </div>

    <!-- Add goal form -->
    <div class="border-t border-border pt-3 space-y-2">
      <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Registrar Gol</p>

      <div class="grid grid-cols-2 gap-2">
        <select
          v-model="selectedTeamId"
          class="bg-card border border-border text-foreground text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
          @change="onTeamChange"
        >
          <option value="">Time</option>
          <option :value="homeTeam?.id">{{ homeTeam?.name }}</option>
          <option :value="awayTeam?.id">{{ awayTeam?.name }}</option>
        </select>

        <select
          v-model="selectedPlayerId"
          :disabled="!selectedTeamId"
          class="bg-card border border-border text-foreground text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        >
          <option value="">Jogador</option>
          <option v-for="p in playersInSelectedTeam" :key="p.id" :value="p.id">
            {{ p.nickname || p.name }}
          </option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-2 items-start">
        <select
          v-model="assistedById"
          :disabled="!selectedPlayerId || isOwnGoal"
          class="bg-card border border-border text-foreground text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        >
          <option value="">Assistência (opcional)</option>
          <option v-for="p in assistCandidates" :key="p.id" :value="p.id">
            {{ p.nickname || p.name }}
          </option>
        </select>

        <label class="flex items-center gap-2 cursor-pointer text-sm text-foreground/80 self-center">
          <input
            v-model="isOwnGoal"
            type="checkbox"
            class="w-4 h-4 rounded border-border bg-card text-primary focus:ring-primary"
            @change="onOwnGoalChange"
          />
          Gol Contra
        </label>
      </div>

      <p v-if="formError" class="text-destructive text-xs">{{ formError }}</p>

      <Button
        :disabled="isSubmitting || !selectedTeamId || !selectedPlayerId"
        variant="accent"
        size="sm"
        class="w-full"
        @click="handleAddGoal"
      >
        <Loader2 v-if="isSubmitting" :size="14" class="animate-spin" />
        <Plus v-else :size="14" />
        {{ isSubmitting ? 'Registrando...' : 'Adicionar Gol' }}
      </Button>
    </div>
  </div>
</template>
