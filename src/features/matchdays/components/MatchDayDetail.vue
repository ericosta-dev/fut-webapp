<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMatchDaysStore } from '../stores/matchdaysStore'
import { usePlayersStore } from '@/stores/players'
import { useLeaguesStore } from '@/features/leagues/stores/leaguesStore'
import TeamSetup from './TeamSetup.vue'
import MatchForm from './MatchForm.vue'
import GoalTracker from './GoalTracker.vue'
import GoalkeeperSelect from './GoalkeeperSelect.vue'
import MatchDaySummary from './MatchDaySummary.vue'
import MatchDayGoalkeeperManager from './MatchDayGoalkeeperManager.vue'

interface Props {
  communityId: string
  leagueId: string
  matchdayId: string
}

const props = defineProps<Props>()
const router = useRouter()

const matchdaysStore = useMatchDaysStore()
const playersStore = usePlayersStore()
const leaguesStore = useLeaguesStore()

// ─── Tabs ─────────────────────────────────────────────────────────────────────
type Tab = 'teams' | 'matches' | 'info' | 'summary'
const activeTab = ref<Tab>('teams')

// ─── UI state ─────────────────────────────────────────────────────────────────
const showTeamSetup = ref(false)
const showMatchForm = ref(false)
const expandedMatchId = ref<string | null>(null)

// ─── Computed ─────────────────────────────────────────────────────────────────
const matchday = computed(() => matchdaysStore.currentMatchDay)
const league = computed(() => leaguesStore.currentLeague)
const teams = computed(() => matchdaysStore.currentTeams)
const matches = computed(() => matchdaysStore.currentMatches)
const players = computed(() => playersStore.activePlayers)
const isLoading = computed(() => matchdaysStore.loading)

const isCup = computed(() => league.value?.format === 'CUP')
const teamsAlreadyImported = computed(() => teams.value.length > 0)

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  DRAFT: { label: 'Rascunho', class: 'bg-slate-500/20 text-slate-400' },
  IN_PROGRESS: { label: 'Em Andamento', class: 'bg-amber-500/20 text-amber-400' },
  COMPLETED: { label: 'Concluído', class: 'bg-emerald-500/20 text-emerald-400' },
}

const statusBadge = computed(() => {
  if (!matchday.value) return { label: '', class: '' }
  return STATUS_CONFIG[matchday.value.status] ?? { label: '', class: '' }
})

const formattedDate = computed(() => {
  if (!matchday.value) return ''
  return new Date(matchday.value.date + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
})

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    matchdaysStore.fetchMatchDayById(props.communityId, props.leagueId, props.matchdayId),
    playersStore.fetchPlayers(props.communityId),
    leaguesStore.fetchLeagueById(props.communityId, props.leagueId),
  ])
})

// ─── Status cycling ───────────────────────────────────────────────────────────
async function cycleStatus() {
  if (!matchday.value) return
  const next: Record<string, 'IN_PROGRESS' | 'COMPLETED' | 'DRAFT'> = {
    DRAFT: 'IN_PROGRESS',
    IN_PROGRESS: 'COMPLETED',
    COMPLETED: 'DRAFT',
  }
  await matchdaysStore.updateMatchDay(props.communityId, props.leagueId, props.matchdayId, {
    status: next[matchday.value.status],
  })
}

// ─── Team actions ─────────────────────────────────────────────────────────────
async function handleImportTeams() {
  await matchdaysStore.importTeams(props.communityId, props.leagueId, props.matchdayId)
  showTeamSetup.value = false
}

async function handleShuffle(playerIds: string[], count: number, names: string[]) {
  await matchdaysStore.shuffleTeams(props.communityId, props.leagueId, props.matchdayId, {
    player_ids: playerIds,
    team_count: count,
    team_names: names,
  })
  showTeamSetup.value = false
}

async function handleAddTeam(name: string, playerIds: string[]) {
  await matchdaysStore.createTeam(props.communityId, props.leagueId, props.matchdayId, {
    name,
    players: playerIds,
  })
}

async function handleDeleteTeam(teamId: string) {
  if (!confirm('Remover este time da súmula?')) return
  await matchdaysStore.deleteTeam(props.communityId, props.leagueId, props.matchdayId, teamId)
}

async function handleTogglePlayer(teamId: string, playerId: string, inTeam: boolean) {
  const team = teams.value.find((t) => t.id === teamId)
  if (!team) return
  const current = team.players
  const updated = inTeam ? current.filter((id) => id !== playerId) : [...current, playerId]
  await matchdaysStore.updateTeam(props.communityId, props.leagueId, props.matchdayId, teamId, {
    players: updated,
  })
}

// ─── Match actions ────────────────────────────────────────────────────────────
async function handleCreateMatch(homeTeamId: string, awayTeamId: string) {
  await matchdaysStore.createMatch(props.communityId, props.leagueId, props.matchdayId, {
    home_team: homeTeamId,
    away_team: awayTeamId,
    order: matches.value.length,
  })
  showMatchForm.value = false
}

async function handleDeleteMatch(matchId: string) {
  if (!confirm('Remover esta partida?')) return
  await matchdaysStore.deleteMatch(props.communityId, props.leagueId, props.matchdayId, matchId)
  if (expandedMatchId.value === matchId) expandedMatchId.value = null
}

function toggleMatchExpand(matchId: string) {
  expandedMatchId.value = expandedMatchId.value === matchId ? null : matchId
}

function goBack() {
  router.push(`/communities/${props.communityId}/leagues/${props.leagueId}`)
}
</script>

<template>
  <!-- Loading state -->
  <div v-if="isLoading && !matchday" class="flex justify-center items-center h-64">
    <div class="text-slate-400">Carregando...</div>
  </div>

  <div v-else-if="matchday" class="space-y-6">
    <!-- Back button -->
    <button
      @click="goBack"
      class="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
      Voltar para a Liga
    </button>

    <!-- Header card -->
    <div
      class="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-500/20 p-6"
    >
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p class="text-sm text-slate-400 font-medium capitalize">{{ formattedDate }}</p>
          <h1 class="text-2xl font-bold text-white mt-1">
            {{ matchday.label || 'Súmula sem título' }}
          </h1>
          <p v-if="matchday.notes" class="text-slate-400 text-sm mt-2">
            {{ matchday.notes }}
          </p>
        </div>

        <!-- Status + change button -->
        <div class="flex flex-col items-start sm:items-end gap-2">
          <span
            :class="statusBadge.class"
            class="px-3 py-1 text-sm font-medium rounded-full"
          >
            {{ statusBadge.label }}
          </span>
          <button
            @click="cycleStatus"
            class="text-xs text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2"
          >
            Alterar status
          </button>
        </div>
      </div>

      <!-- Summary counters -->
      <div class="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 text-center">
          <p class="text-2xl font-bold text-white">{{ teams.length }}</p>
          <p class="text-xs text-slate-400 mt-0.5">Times</p>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 text-center">
          <p class="text-2xl font-bold text-white">{{ matches.length }}</p>
          <p class="text-xs text-slate-400 mt-0.5">Partidas</p>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 text-center">
          <p class="text-2xl font-bold text-white">
            {{ teams.reduce((sum, t) => sum + t.player_count, 0) }}
          </p>
          <p class="text-xs text-slate-400 mt-0.5">Jogadores</p>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 text-center">
          <p class="text-2xl font-bold text-emerald-400">{{ matchday.total_goals }}</p>
          <p class="text-xs text-slate-400 mt-0.5">Gols</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-slate-800/50 rounded-xl border border-slate-700/50">
      <div class="border-b border-slate-700/50">
        <nav class="flex -mb-px">
          <button
            @click="activeTab = 'teams'"
            :class="[
              activeTab === 'teams'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white',
              'px-6 py-3 border-b-2 font-medium text-sm transition-colors',
            ]"
          >
            Times ({{ teams.length }})
          </button>
          <button
            @click="activeTab = 'matches'"
            :class="[
              activeTab === 'matches'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white',
              'px-6 py-3 border-b-2 font-medium text-sm transition-colors',
            ]"
          >
            Partidas ({{ matches.length }})
          </button>
          <button
            @click="activeTab = 'info'"
            :class="[
              activeTab === 'info'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white',
              'px-6 py-3 border-b-2 font-medium text-sm transition-colors',
            ]"
          >
            Info
          </button>
          <button
            @click="activeTab = 'summary'"
            :class="[
              activeTab === 'summary'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white',
              'px-6 py-3 border-b-2 font-medium text-sm transition-colors',
            ]"
          >
            Resumo
          </button>
        </nav>
      </div>

      <div class="p-5">
        <!-- ── TEAMS TAB ─────────────────────────────────────────────────── -->
        <div v-if="activeTab === 'teams'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-white font-semibold">Times da Súmula</h3>
            <div class="flex gap-2">
              <!-- CUP: import button -->
              <button
                v-if="isCup && !teamsAlreadyImported"
                @click="handleImportTeams"
                :disabled="isLoading"
                class="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                📋 Importar Times da Liga
              </button>

              <!-- Toggle team setup panel -->
              <button
                @click="showTeamSetup = !showTeamSetup"
                class="px-4 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                {{ showTeamSetup ? 'Cancelar' : '+ Adicionar Time' }}
              </button>
            </div>
          </div>

          <!-- Team setup panel -->
          <div v-if="showTeamSetup">
            <TeamSetup
              :players="players"
              :league-format="league?.format ?? 'LEAGUE'"
              :loading="isLoading"
              @shuffle="handleShuffle"
              @add-team="handleAddTeam"
            />
          </div>

          <!-- Teams list -->
          <div v-if="teams.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="team in teams"
              :key="team.id"
              class="bg-slate-700/30 border border-slate-600 rounded-xl p-4 space-y-3"
            >
              <!-- Team header -->
              <div class="flex items-center justify-between">
                <h4 class="font-semibold text-white">{{ team.name }}</h4>
                <button
                  @click="handleDeleteTeam(team.id)"
                  class="text-xs text-red-400 hover:text-red-300"
                >
                  Remover
                </button>
              </div>

              <!-- Players list -->
              <div v-if="team.players_detail.length > 0" class="space-y-1">
                <div
                  v-for="player in team.players_detail"
                  :key="player.id"
                  class="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-800/50 group"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-slate-500 w-5 text-right"
                      >#{{ player.number ?? '–' }}</span
                    >
                    <span class="text-sm text-slate-200">
                      {{ player.nickname || player.name }}
                    </span>
                    <span class="text-xs text-slate-500">{{ player.position }}</span>
                  </div>
                  <button
                    @click="handleTogglePlayer(team.id, player.id, true)"
                    class="text-red-400/0 group-hover:text-red-400 hover:text-red-300 text-xs transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <!-- Add player from pool -->
              <div class="pt-1">
                <select
                  class="w-full bg-slate-800/50 border border-slate-600/50 text-slate-400 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  @change="
                    (e) => {
                      const val = (e.target as HTMLSelectElement).value
                      if (val) handleTogglePlayer(team.id, val, false);
                      (e.target as HTMLSelectElement).value = ''
                    }
                  "
                >
                  <option value="">+ Adicionar jogador...</option>
                  <option
                    v-for="player in players.filter((p) => !team.players.includes(p.id))"
                    :key="player.id"
                    :value="player.id"
                  >
                    #{{ player.number ?? '–' }} {{ player.nickname || player.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-else-if="!showTeamSetup"
            class="text-center py-12 text-slate-400"
          >
            <div class="text-4xl mb-3">⚽</div>
            <p class="font-medium">Nenhum time cadastrado ainda</p>
            <p class="text-sm mt-1">
              {{
                isCup
                  ? 'Importe os times da liga ou adicione manualmente.'
                  : 'Sorteie ou monte os times manualmente.'
              }}
            </p>
          </div>

          <!-- Goalkeeper pool for this matchday -->
          <MatchDayGoalkeeperManager
            :community-id="communityId"
            :league-id="leagueId"
            :matchday-id="matchdayId"
          />
        </div>

        <!-- ── MATCHES TAB ────────────────────────────────────────────────── -->
        <div v-if="activeTab === 'matches'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-white font-semibold">Partidas</h3>
            <button
              v-if="teams.length >= 2 && !showMatchForm"
              @click="showMatchForm = true"
              class="px-4 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              + Nova Partida
            </button>
          </div>

          <!-- Match form -->
          <MatchForm
            v-if="showMatchForm"
            :teams="teams"
            @create="handleCreateMatch"
            @cancel="showMatchForm = false"
          />

          <!-- No teams warning -->
          <div
            v-if="teams.length < 2 && !showMatchForm"
            class="text-center py-8 text-slate-400 bg-slate-700/20 rounded-xl border border-slate-700/50"
          >
            <p class="text-sm">Adicione pelo menos 2 times antes de criar partidas.</p>
          </div>

          <!-- Matches list -->
          <div v-if="matches.length > 0" class="space-y-3">
            <div
              v-for="(match, index) in matches"
              :key="match.id"
              class="bg-slate-700/30 border border-slate-600 rounded-xl overflow-hidden"
            >
              <!-- Match header row (clickable to expand) -->
              <div
                class="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-slate-700/20 transition-colors"
                @click="toggleMatchExpand(match.id)"
              >
                <!-- Order badge -->
                <span class="text-slate-500 text-xs font-medium w-5 text-center flex-shrink-0">
                  {{ index + 1 }}
                </span>

                <!-- Match teams + score -->
                <div class="flex-1 flex items-center justify-between gap-3">
                  <!-- Home team -->
                  <div class="flex-1 text-right">
                    <span class="text-white font-semibold text-sm">{{ match.home_team_detail.name }}</span>
                    <div class="text-xs text-slate-500 mt-0.5">
                      {{ match.home_team_detail.player_count }} jog.
                    </div>
                  </div>

                  <!-- Score -->
                  <div
                    class="flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-2 border border-slate-600 flex-shrink-0"
                  >
                    <span class="text-emerald-400 font-bold text-lg tabular-nums">{{ match.home_score }}</span>
                    <span class="text-slate-500 text-sm">×</span>
                    <span class="text-emerald-400 font-bold text-lg tabular-nums">{{ match.away_score }}</span>
                  </div>

                  <!-- Away team -->
                  <div class="flex-1">
                    <span class="text-white font-semibold text-sm">{{ match.away_team_detail.name }}</span>
                    <div class="text-xs text-slate-500 mt-0.5">
                      {{ match.away_team_detail.player_count }} jog.
                    </div>
                  </div>
                </div>

                <!-- Expand indicator + Delete -->
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="text-slate-500 text-xs">
                    {{ expandedMatchId === match.id ? '▲' : '▼' }}
                  </span>
                  <button
                    @click.stop="handleDeleteMatch(match.id)"
                    class="text-red-400 hover:text-red-300 text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <!-- Expanded panel: GoalTracker + GoalkeeperSelect -->
              <div
                v-if="expandedMatchId === match.id"
                class="border-t border-slate-700/50 p-4 space-y-4"
              >
                <GoalkeeperSelect
                  :match="match"
                  :community-id="communityId"
                  :league-id="leagueId"
                  :matchday-id="matchdayId"
                />
                <GoalTracker
                  :match="match"
                  :community-id="communityId"
                  :league-id="leagueId"
                  :matchday-id="matchdayId"
                />
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-else-if="!showMatchForm && teams.length >= 2"
            class="text-center py-12 text-slate-400"
          >
            <div class="text-4xl mb-3">🏆</div>
            <p class="font-medium">Nenhuma partida registrada ainda</p>
            <p class="text-sm mt-1">Clique em "+ Nova Partida" para começar.</p>
          </div>
        </div>

        <!-- ── INFO TAB ───────────────────────────────────────────────────── -->
        <div v-if="activeTab === 'info'" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-slate-700/20 rounded-lg p-4 border border-slate-700/50">
              <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Data</p>
              <p class="text-white font-medium">{{ formattedDate }}</p>
            </div>
            <div class="bg-slate-700/20 rounded-lg p-4 border border-slate-700/50">
              <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Status</p>
              <p class="text-white font-medium">{{ statusBadge.label }}</p>
            </div>
            <div class="bg-slate-700/20 rounded-lg p-4 border border-slate-700/50">
              <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Criado por</p>
              <p class="text-white font-medium">{{ matchday.created_by_username }}</p>
            </div>
            <div class="bg-slate-700/20 rounded-lg p-4 border border-slate-700/50">
              <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Liga</p>
              <p class="text-white font-medium">{{ league?.name ?? '—' }}</p>
            </div>
          </div>
          <div
            v-if="matchday.notes"
            class="bg-slate-700/20 rounded-lg p-4 border border-slate-700/50"
          >
            <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Observações</p>
            <p class="text-slate-300 text-sm whitespace-pre-line">{{ matchday.notes }}</p>
          </div>
        </div>
        <!-- ── SUMMARY TAB ─────────────────────────────────────────────── -->
        <div v-if="activeTab === 'summary'">
          <MatchDaySummary />
        </div>

      </div>
    </div>
  </div>
</template>
