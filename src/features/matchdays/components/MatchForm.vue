<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MatchDayTeam } from '../types'

interface Props {
  teams: MatchDayTeam[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'create', homeTeamId: string, awayTeamId: string): void
  (e: 'cancel'): void
}>()

const homeTeamId = ref('')
const awayTeamId = ref('')

const availableAwayTeams = computed(() =>
  props.teams.filter((t) => t.id !== homeTeamId.value),
)

const isValid = computed(
  () => homeTeamId.value && awayTeamId.value && homeTeamId.value !== awayTeamId.value,
)

function handleSubmit() {
  if (!isValid.value) return
  emit('create', homeTeamId.value, awayTeamId.value)
  homeTeamId.value = ''
  awayTeamId.value = ''
}
</script>

<template>
  <div class="bg-slate-700/30 border border-slate-600/50 rounded-xl p-4 space-y-3">
    <h4 class="text-white font-medium">Nova Partida</h4>

    <div class="grid grid-cols-2 gap-3 items-center">
      <!-- Home team -->
      <div>
        <label class="block text-xs text-slate-400 mb-1">Time Mandante</label>
        <select
          v-model="homeTeamId"
          class="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="" disabled>Selecionar...</option>
          <option v-for="team in teams" :key="team.id" :value="team.id">
            {{ team.name }}
          </option>
        </select>
      </div>

      <!-- VS label -->
      <div></div>
    </div>

    <div class="flex items-center gap-2">
      <div class="flex-1 h-px bg-slate-600"></div>
      <span class="text-slate-500 text-xs font-bold">VS</span>
      <div class="flex-1 h-px bg-slate-600"></div>
    </div>

    <!-- Away team -->
    <div>
      <label class="block text-xs text-slate-400 mb-1">Time Visitante</label>
      <select
        v-model="awayTeamId"
        class="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="" disabled>Selecionar...</option>
        <option v-for="team in availableAwayTeams" :key="team.id" :value="team.id">
          {{ team.name }}
        </option>
      </select>
    </div>

    <!-- Actions -->
    <div class="flex gap-2 pt-1">
      <button
        @click="handleSubmit"
        :disabled="!isValid"
        class="flex-1 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Adicionar Partida
      </button>
      <button
        @click="$emit('cancel')"
        class="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
      >
        Cancelar
      </button>
    </div>
  </div>
</template>
