<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Player } from '@/types'

interface Props {
  players: Player[]
  leagueFormat: 'CUP' | 'LEAGUE'
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'shuffle', playerIds: string[], teamCount: number, teamNames: string[]): void
  (e: 'addTeam', name: string, playerIds: string[]): void
}>()

// ─── Position order ───────────────────────────────────────────────────────────
const POSITION_ORDER: Record<string, number> = { DEF: 0, MID: 1, FWD: 2 }

function sortByPosition(a: Player, b: Player) {
  return (POSITION_ORDER[a.position] ?? 99) - (POSITION_ORDER[b.position] ?? 99)
}

/** Non-GK players split by status, each sorted DEF → MID → FWD */
const fieldPlayerSections = computed(() => {
  const nonGk = props.players.filter((p) => p.position !== 'GK')
  const monthly = nonGk.filter((p) => p.status === 'MONTHLY').sort(sortByPosition)
  const oneTime = nonGk.filter((p) => p.status === 'ONE_TIME').sort(sortByPosition)
  const sections: { label: string; players: Player[] }[] = []
  if (monthly.length) sections.push({ label: 'Mensalistas', players: monthly })
  if (oneTime.length) sections.push({ label: 'Avulsos', players: oneTime })
  return sections
})

const allFieldPlayers = computed(() => fieldPlayerSections.value.flatMap((s) => s.players))

// ─── Shuffle mode ─────────────────────────────────────────────────────────────
type Mode = 'manual' | 'shuffle'
const mode = ref<Mode>(props.leagueFormat === 'LEAGUE' ? 'shuffle' : 'manual')

// ─── Shuffle config ───────────────────────────────────────────────────────────
const selectedPlayerIds = ref<Set<string>>(new Set())
const teamCount = ref(2)
const teamNames = ref<string[]>(['Time A', 'Time B'])

watch(teamCount, (n) => {
  const current = teamNames.value.slice(0, n)
  while (current.length < n) current.push(`Time ${current.length + 1}`)
  teamNames.value = current
})

function togglePlayer(id: string) {
  if (selectedPlayerIds.value.has(id)) {
    selectedPlayerIds.value.delete(id)
  } else {
    selectedPlayerIds.value.add(id)
  }
  // Force reactivity
  selectedPlayerIds.value = new Set(selectedPlayerIds.value)
}

function toggleAll() {
  if (allSelected.value) {
    selectedPlayerIds.value = new Set()
  } else {
    selectedPlayerIds.value = new Set(allFieldPlayers.value.map((p) => p.id))
  }
}

const allSelected = computed(
  () =>
    allFieldPlayers.value.length > 0 &&
    selectedPlayerIds.value.size === allFieldPlayers.value.length,
)

function handleShuffle() {
  emit('shuffle', Array.from(selectedPlayerIds.value), teamCount.value, teamNames.value)
}

// ─── Manual mode ─────────────────────────────────────────────────────────────
const newTeamName = ref('')
const manualSelectedIds = ref<Set<string>>(new Set())

function toggleManualPlayer(id: string) {
  if (manualSelectedIds.value.has(id)) {
    manualSelectedIds.value.delete(id)
  } else {
    manualSelectedIds.value.add(id)
  }
  manualSelectedIds.value = new Set(manualSelectedIds.value)
}

function handleAddTeam() {
  if (!newTeamName.value.trim()) return
  emit('addTeam', newTeamName.value.trim(), Array.from(manualSelectedIds.value))
  newTeamName.value = ''
  manualSelectedIds.value = new Set()
}
</script>

<template>
  <div class="space-y-4">
    <!-- Mode selector (LEAGUE only — CUP uses import) -->
    <div v-if="leagueFormat === 'LEAGUE'" class="flex gap-2">
      <button
        @click="mode = 'shuffle'"
        :class="[
          mode === 'shuffle'
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700',
          'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
        ]"
      >
        🎲 Sortear Times
      </button>
      <button
        @click="mode = 'manual'"
        :class="[
          mode === 'manual'
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700',
          'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
        ]"
      >
        ✏️ Montar Manualmente
      </button>
    </div>

    <!-- Shuffle mode ──────────────────────────────────────────────────────── -->
    <div v-if="mode === 'shuffle'" class="space-y-4">
      <!-- Team count -->
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-1.5">Quantidade de Times</label>
        <div class="flex items-center gap-3">
          <button
            @click="teamCount = Math.max(2, teamCount - 1)"
            class="w-8 h-8 rounded-lg bg-slate-700 text-white hover:bg-slate-600 flex items-center justify-center font-bold"
          >
            −
          </button>
          <span class="text-white font-semibold text-lg w-6 text-center">{{ teamCount }}</span>
          <button
            @click="teamCount = Math.min(8, teamCount + 1)"
            class="w-8 h-8 rounded-lg bg-slate-700 text-white hover:bg-slate-600 flex items-center justify-center font-bold"
          >
            +
          </button>
        </div>
      </div>

      <!-- Team names -->
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-1.5">Nomes dos Times</label>
        <div class="grid grid-cols-2 gap-2">
          <input
            v-for="(_, i) in teamNames"
            :key="i"
            v-model="teamNames[i]"
            type="text"
            :placeholder="`Time ${i + 1}`"
            class="bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <!-- Player selection -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-slate-300">
            Selecionar Jogadores
            <span class="text-slate-500">({{ selectedPlayerIds.size }} selecionados)</span>
          </label>
          <button @click="toggleAll" class="text-xs text-emerald-400 hover:text-emerald-300">
            {{ allSelected ? 'Desmarcar Todos' : 'Selecionar Todos' }}
          </button>
        </div>
        <div class="space-y-3 max-h-64 overflow-y-auto pr-1">
          <div v-for="section in fieldPlayerSections" :key="section.label">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              {{ section.label }}
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                v-for="player in section.players"
                :key="player.id"
                @click="togglePlayer(player.id)"
                :class="[
                  selectedPlayerIds.has(player.id)
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-slate-600 text-slate-400 hover:border-slate-500',
                  'px-3 py-2 rounded-lg border text-sm text-left transition-colors',
                ]"
              >
                <span class="text-slate-500 text-xs mr-1">#{{ player.number ?? '–' }}</span>
                {{ player.nickname || player.name }}
              </button>
            </div>
          </div>
          <p v-if="allFieldPlayers.length === 0" class="text-xs text-slate-500 italic">
            Nenhum jogador de linha encontrado.
          </p>
        </div>
      </div>

      <button
        @click="handleShuffle"
        :disabled="selectedPlayerIds.size < teamCount || loading"
        class="w-full py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ loading ? 'Sorteando...' : '🎲 Sortear e Criar Times' }}
      </button>
    </div>

    <!-- Manual mode ──────────────────────────────────────────────────────── -->
    <div v-else class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-1.5">Nome do Time</label>
        <input
          v-model="newTeamName"
          type="text"
          placeholder="Ex: Time Verde"
          class="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          @keydown.enter="handleAddTeam"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-300 mb-1.5">
          Jogadores do Time
          <span class="text-slate-500">({{ manualSelectedIds.size }} selecionados)</span>
        </label>
        <div class="space-y-3 max-h-64 overflow-y-auto pr-1">
          <div v-for="section in fieldPlayerSections" :key="section.label">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              {{ section.label }}
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                v-for="player in section.players"
                :key="player.id"
                @click="toggleManualPlayer(player.id)"
                :class="[
                  manualSelectedIds.has(player.id)
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-slate-600 text-slate-400 hover:border-slate-500',
                  'px-3 py-2 rounded-lg border text-sm text-left transition-colors',
                ]"
              >
                <span class="text-slate-500 text-xs mr-1">#{{ player.number ?? '–' }}</span>
                {{ player.nickname || player.name }}
              </button>
            </div>
          </div>
          <p v-if="allFieldPlayers.length === 0" class="text-xs text-slate-500 italic">
            Nenhum jogador de linha encontrado.
          </p>
        </div>
      </div>

      <button
        @click="handleAddTeam"
        :disabled="!newTeamName.trim() || loading"
        class="w-full py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        + Adicionar Time
      </button>
    </div>
  </div>
</template>
