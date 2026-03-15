<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMatchDaysStore } from '../stores/matchdaysStore'
import { usePlayersStore } from '@/stores/players'
import { Badge, Button } from '@/components/ui'
import { Shield, X, Plus, Loader2 } from 'lucide-vue-next'

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

const registeredGoalkeepers = computed(
  () => store.currentMatchDay?.matchday_goalkeepers ?? [],
)

const registeredPlayerIds = computed(
  () => new Set(registeredGoalkeepers.value.map((gk) => gk.player)),
)

const availablePlayers = computed(() =>
  playersStore.activePlayers.filter((p) => !registeredPlayerIds.value.has(p.id)),
)

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
  <div class="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
    <div class="flex items-center gap-2">
      <Shield :size="16" class="text-primary" />
      <h4 class="text-sm font-semibold text-foreground">Goleiros da Súmula</h4>
      <Badge variant="secondary" class="text-xs">{{ registeredGoalkeepers.length }}</Badge>
    </div>

    <p class="text-xs text-muted-foreground">
      Registre aqui os goleiros disponíveis para esta súmula. Apenas esses jogadores poderão
      ser selecionados como goleiros nas partidas.
    </p>

    <div v-if="registeredGoalkeepers.length > 0" class="flex flex-wrap gap-2">
      <div
        v-for="gk in registeredGoalkeepers"
        :key="gk.id"
        class="flex items-center gap-1.5 bg-card rounded-full border border-border px-3 py-1.5 text-sm"
      >
        <span class="text-foreground">{{ gk.player_detail.nickname || gk.player_detail.name }}</span>
        <button
          class="text-muted-foreground hover:text-destructive transition-colors ml-1"
          title="Remover goleiro"
          @click="handleRemove(gk.id)"
        >
          <X :size="12" />
        </button>
      </div>
    </div>

    <p v-else class="text-xs text-muted-foreground italic">
      Nenhum goleiro registrado para esta súmula.
    </p>

    <div v-if="availablePlayers.length > 0" class="flex gap-2 items-center">
      <select
        v-model="selectedPlayerId"
        class="flex-1 bg-card border border-border text-foreground text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="">Adicionar goleiro...</option>
        <option v-for="p in availablePlayers" :key="p.id" :value="p.id">
          {{ p.nickname || p.name }}
        </option>
      </select>

      <Button
        :disabled="isSubmitting || !selectedPlayerId"
        variant="accent"
        size="sm"
        @click="handleAdd"
      >
        <Loader2 v-if="isSubmitting" :size="12" class="animate-spin" />
        <Plus v-else :size="12" />
        Goleiro
      </Button>
    </div>

    <p v-if="formError" class="text-destructive text-xs">{{ formError }}</p>
  </div>
</template>
