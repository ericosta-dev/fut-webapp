<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Input, Label, Button, Badge } from '@/components/ui'
import { Shuffle, Plus, Check } from 'lucide-vue-next'
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

const POSITION_ORDER: Record<string, number> = { DEF: 0, MID: 1, FWD: 2 }

function sortByPosition(a: Player, b: Player) {
  return (POSITION_ORDER[a.position] ?? 99) - (POSITION_ORDER[b.position] ?? 99)
}

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

type Mode = 'manual' | 'shuffle'
const mode = ref<Mode>(props.leagueFormat === 'LEAGUE' ? 'shuffle' : 'manual')

const selectedPlayerIds = ref<Set<string>>(new Set())
const teamCount = ref(2)
const teamNames = ref<string[]>(['Time A', 'Time B'])

watch(teamCount, (n) => {
  const current = teamNames.value.slice(0, n)
  while (current.length < n) current.push(`Time ${current.length + 1}`)
  teamNames.value = current
})

function togglePlayer(id: string) {
  if (selectedPlayerIds.value.has(id)) selectedPlayerIds.value.delete(id)
  else selectedPlayerIds.value.add(id)
  selectedPlayerIds.value = new Set(selectedPlayerIds.value)
}

function toggleAll() {
  if (allSelected.value) selectedPlayerIds.value = new Set()
  else selectedPlayerIds.value = new Set(allFieldPlayers.value.map((p) => p.id))
}

const allSelected = computed(
  () => allFieldPlayers.value.length > 0 && selectedPlayerIds.value.size === allFieldPlayers.value.length,
)

function handleShuffle() {
  emit('shuffle', Array.from(selectedPlayerIds.value), teamCount.value, teamNames.value)
}

const newTeamName = ref('')
const manualSelectedIds = ref<Set<string>>(new Set())

function toggleManualPlayer(id: string) {
  if (manualSelectedIds.value.has(id)) manualSelectedIds.value.delete(id)
  else manualSelectedIds.value.add(id)
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
    <!-- Mode selector -->
    <div v-if="leagueFormat === 'LEAGUE'" class="flex gap-2">
      <Button
        @click="mode = 'shuffle'"
        :variant="mode === 'shuffle' ? 'default' : 'outline'"
        size="sm"
      >
        <Shuffle :size="14" /> Sortear Times
      </Button>
      <Button
        @click="mode = 'manual'"
        :variant="mode === 'manual' ? 'default' : 'outline'"
        size="sm"
      >
        <Plus :size="14" /> Montar Manualmente
      </Button>
    </div>

    <!-- Shuffle mode -->
    <div v-if="mode === 'shuffle'" class="space-y-4">
      <div>
        <Label class="mb-1.5">Quantidade de Times</Label>
        <div class="flex items-center gap-3">
          <button
            @click="teamCount = Math.max(2, teamCount - 1)"
            class="w-8 h-8 rounded-lg bg-muted text-foreground hover:bg-muted/80 flex items-center justify-center font-bold transition-colors"
          >
            −
          </button>
          <span class="text-foreground font-semibold text-lg w-6 text-center">{{ teamCount }}</span>
          <button
            @click="teamCount = Math.min(8, teamCount + 1)"
            class="w-8 h-8 rounded-lg bg-muted text-foreground hover:bg-muted/80 flex items-center justify-center font-bold transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <Label class="mb-1.5">Nomes dos Times</Label>
        <div class="grid grid-cols-2 gap-2">
          <Input
            v-for="(_, i) in teamNames"
            :key="i"
            v-model="teamNames[i]"
            :placeholder="`Time ${i + 1}`"
          />
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-2">
          <Label>
            Selecionar Jogadores
            <Badge variant="secondary" class="ml-2 text-xs">{{ selectedPlayerIds.size }} selecionados</Badge>
          </Label>
          <button @click="toggleAll" class="text-xs text-primary hover:text-primary/80 transition-colors">
            {{ allSelected ? 'Desmarcar Todos' : 'Selecionar Todos' }}
          </button>
        </div>
        <div class="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
          <div v-for="section in fieldPlayerSections" :key="section.label">
            <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              {{ section.label }}
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                v-for="player in section.players"
                :key="player.id"
                @click="togglePlayer(player.id)"
                :class="[
                  selectedPlayerIds.has(player.id)
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border text-muted-foreground hover:border-muted-foreground/50',
                  'px-3 py-2 rounded-lg border text-sm text-left transition-colors flex items-center gap-1.5',
                ]"
              >
                <Check v-if="selectedPlayerIds.has(player.id)" :size="12" class="text-primary shrink-0" />
                <span class="text-muted-foreground/60 text-xs mr-0.5">#{{ player.number ?? '–' }}</span>
                {{ player.nickname || player.name }}
              </button>
            </div>
          </div>
          <p v-if="allFieldPlayers.length === 0" class="text-xs text-muted-foreground italic">
            Nenhum jogador de linha encontrado.
          </p>
        </div>
      </div>

      <Button
        @click="handleShuffle"
        :disabled="selectedPlayerIds.size < teamCount || loading"
        variant="accent"
        class="w-full"
      >
        <Shuffle :size="14" />
        {{ loading ? 'Sorteando...' : 'Sortear e Criar Times' }}
      </Button>
    </div>

    <!-- Manual mode -->
    <div v-else class="space-y-4">
      <div class="space-y-1.5">
        <Label>Nome do Time</Label>
        <Input
          v-model="newTeamName"
          placeholder="Ex: Time Verde"
          @keydown.enter="handleAddTeam"
        />
      </div>

      <div>
        <Label class="mb-1.5">
          Jogadores do Time
          <Badge variant="secondary" class="ml-2 text-xs">{{ manualSelectedIds.size }} selecionados</Badge>
        </Label>
        <div class="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
          <div v-for="section in fieldPlayerSections" :key="section.label">
            <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              {{ section.label }}
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                v-for="player in section.players"
                :key="player.id"
                @click="toggleManualPlayer(player.id)"
                :class="[
                  manualSelectedIds.has(player.id)
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border text-muted-foreground hover:border-muted-foreground/50',
                  'px-3 py-2 rounded-lg border text-sm text-left transition-colors flex items-center gap-1.5',
                ]"
              >
                <Check v-if="manualSelectedIds.has(player.id)" :size="12" class="text-primary shrink-0" />
                <span class="text-muted-foreground/60 text-xs mr-0.5">#{{ player.number ?? '–' }}</span>
                {{ player.nickname || player.name }}
              </button>
            </div>
          </div>
          <p v-if="allFieldPlayers.length === 0" class="text-xs text-muted-foreground italic">
            Nenhum jogador de linha encontrado.
          </p>
        </div>
      </div>

      <Button
        @click="handleAddTeam"
        :disabled="!newTeamName.trim() || loading"
        variant="accent"
        class="w-full"
      >
        <Plus :size="14" /> Adicionar Time
      </Button>
    </div>
  </div>
</template>
