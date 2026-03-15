<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button, Label } from '@/components/ui'
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
  <div class="rounded-xl border border-border bg-card p-4 space-y-3">
    <h4 class="text-foreground font-medium">Nova Partida</h4>

    <div class="grid grid-cols-2 gap-3 items-center">
      <div>
        <Label class="text-xs mb-1">Time Mandante</Label>
        <select
          v-model="homeTeamId"
          class="w-full bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="" disabled>Selecionar...</option>
          <option v-for="team in teams" :key="team.id" :value="team.id">
            {{ team.name }}
          </option>
        </select>
      </div>
      <div></div>
    </div>

    <div class="flex items-center gap-2">
      <div class="flex-1 h-px bg-border"></div>
      <span class="text-muted-foreground text-xs font-bold">VS</span>
      <div class="flex-1 h-px bg-border"></div>
    </div>

    <div>
      <Label class="text-xs mb-1">Time Visitante</Label>
      <select
        v-model="awayTeamId"
        class="w-full bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <option value="" disabled>Selecionar...</option>
        <option v-for="team in availableAwayTeams" :key="team.id" :value="team.id">
          {{ team.name }}
        </option>
      </select>
    </div>

    <div class="flex gap-2 pt-1">
      <Button @click="handleSubmit" :disabled="!isValid" variant="accent" size="sm" class="flex-1">
        Adicionar Partida
      </Button>
      <Button @click="$emit('cancel')" variant="outline" size="sm">Cancelar</Button>
    </div>
  </div>
</template>
