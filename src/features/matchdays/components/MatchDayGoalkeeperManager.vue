<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMatchDaysStore } from '../stores/matchdaysStore'
import { usePlayersStore } from '@/stores/players'

interface Props {
  communityId: string
  leagueId: string
  matchdayId: string
}

const props = defineProps<Props>()

const store = useMatchDaysStore()
const playersStore = usePlayersStore()

const selectedPlayerId = ref('')
const isSubmitting = ref(false)
const formError = ref('')

// ─── Computed ─────────────────────────────────────────────────────────────────
const registeredGoalkeepers = computed(
  () => store.currentMatchDay?.matchday_goalkeepers ?? [],
)

const registeredPlayerIds = computed(
  () => new Set(registeredGoalkeepers.value.map((gk) => gk.player)),
)

/** Community players not yet in the goalkeeper pool */
const availablePlayers = computed(() =>
  playersStore.activePlayers.filter((p) => !registeredPlayerIds.value.has(p.id)),
)

// ─── Methods ──────────────────────────────────────────────────────────────────
async function handleAdd() {
  formError.value = ''
  if (!selectedPlayerId.value) {
    formError.value = 'Selecione um jogador.'
    return
  }
  isSubmitting.value = true
  try {
    await store.addMatchDayGoalkeeper(
      props.communityId,
      props.leagueId,
      props.matchdayId,
      { player: selectedPlayerId.value },
    )
    selectedPlayerId.value = ''
  } catch {
    formError.value = 'Erro ao adicionar goleiro.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleRemove(goalkeeperId: string) {
  await store.removeMatchDayGoalkeeper(
    props.communityId,
    props.leagueId,
    props.matchdayId,
    goalkeeperId,
  )
}
</script>

<template>
  <div class="bg-slate-700/20 rounded-xl border border-slate-700/50 p-4 space-y-3">
    <div class="flex items-center gap-2">
      <span class="text-lg">🧤</span>
      <h4 class="text-sm font-semibold text-white">Goleiros da Súmula</h4>
      <span class="text-xs text-slate-500">({{ registeredGoalkeepers.length }})</span>
    </div>

    <p class="text-xs text-slate-400">
      Registre aqui os goleiros disponíveis para esta súmula. Apenas esses jogadores poderão
      ser selecionados como goleiros nas partidas.
    </p>

    <!-- Registered goalkeepers list -->
    <div v-if="registeredGoalkeepers.length > 0" class="flex flex-wrap gap-2">
      <div
        v-for="gk in registeredGoalkeepers"
        :key="gk.id"
        class="flex items-center gap-1.5 bg-slate-700/60 rounded-full px-3 py-1.5 text-sm"
      >
        <span class="text-white">{{ gk.player_detail.nickname || gk.player_detail.name }}</span>
        <button
          class="text-slate-500 hover:text-red-400 transition-colors ml-1"
          title="Remover goleiro"
          @click="handleRemove(gk.id)"
        >
          ✕
        </button>
      </div>
    </div>

    <p v-else class="text-xs text-slate-500 italic">
      Nenhum goleiro registrado para esta súmula.
    </p>

    <!-- Add form -->
    <div v-if="availablePlayers.length > 0" class="flex gap-2 items-center">
      <select
        v-model="selectedPlayerId"
        class="flex-1 bg-slate-700 border border-slate-600 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      >
        <option value="">Adicionar goleiro...</option>
        <option v-for="p in availablePlayers" :key="p.id" :value="p.id">
          {{ p.nickname || p.name }}
        </option>
      </select>

      <button
        :disabled="isSubmitting || !selectedPlayerId"
        class="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors shrink-0"
        @click="handleAdd"
      >
        {{ isSubmitting ? '...' : '+ Goleiro' }}
      </button>
    </div>

    <p v-if="formError" class="text-red-400 text-xs">{{ formError }}</p>
  </div>
</template>
