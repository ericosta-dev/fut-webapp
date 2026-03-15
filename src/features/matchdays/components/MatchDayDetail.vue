<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMatchDaysStore } from '../stores/matchdaysStore'
import { usePlayersStore } from '@/stores/players'
import { useLeaguesStore } from '@/features/leagues/stores/leaguesStore'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import TeamSetup from './TeamSetup.vue'
import MatchForm from './MatchForm.vue'
import GoalTracker from './GoalTracker.vue'
import GoalkeeperSelect from './GoalkeeperSelect.vue'
import MatchDaySummary from './MatchDaySummary.vue'
import MatchDayGoalkeeperManager from './MatchDayGoalkeeperManager.vue'
import {
  ArrowLeft, Users, Swords, Info, BarChart3, Plus, Trash2, X,
  ChevronDown, ChevronUp, ClipboardCopy, Loader2, Target,
} from 'lucide-vue-next'

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

type Tab = 'teams' | 'matches' | 'info' | 'summary'
const activeTab = ref<Tab>('teams')

const showTeamSetup = ref(false)
const showMatchForm = ref(false)
const expandedMatchId = ref<string | null>(null)

const matchday = computed(() => matchdaysStore.currentMatchDay)
const league = computed(() => leaguesStore.currentLeague)
const teams = computed(() => matchdaysStore.currentTeams)
const matches = computed(() => matchdaysStore.currentMatches)
const players = computed(() => playersStore.activePlayers)
const isLoading = computed(() => matchdaysStore.loading)

const isCup = computed(() => league.value?.format === 'CUP')
const teamsAlreadyImported = computed(() => teams.value.length > 0)

const STATUS_CONFIG: Record<string, { label: string; variant: 'secondary' | 'warning' | 'success' }> = {
  DRAFT: { label: 'Rascunho', variant: 'secondary' },
  IN_PROGRESS: { label: 'Em Andamento', variant: 'warning' },
  COMPLETED: { label: 'Concluído', variant: 'success' },
}

const statusBadge = computed(() => {
  if (!matchday.value) return { label: '', variant: 'secondary' as const }
  return STATUS_CONFIG[matchday.value.status] ?? { label: '', variant: 'secondary' as const }
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

onMounted(async () => {
  await Promise.all([
    matchdaysStore.fetchMatchDayById(props.communityId, props.leagueId, props.matchdayId),
    playersStore.fetchPlayers(props.communityId),
    leaguesStore.fetchLeagueById(props.communityId, props.leagueId),
  ])
})

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
  <div v-if="isLoading && !matchday" class="flex justify-center items-center h-64">
    <Loader2 :size="24" class="animate-spin text-primary" />
  </div>

  <div v-else-if="matchday" class="space-y-6 animate-fade-in">
    <!-- Back button -->
    <button
      @click="goBack"
      class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
    >
      <ArrowLeft :size="16" />
      Voltar para a Liga
    </button>

    <!-- Header card -->
    <div class="relative overflow-hidden rounded-2xl border border-primary/20 p-6 bg-gradient-to-br from-primary/10 via-transparent to-accent/5">
      <div class="absolute -top-20 -right-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 relative">
        <div>
          <p class="text-sm text-muted-foreground font-medium capitalize">{{ formattedDate }}</p>
          <h1 class="text-2xl font-bold text-foreground mt-1">
            {{ matchday.label || 'Súmula sem título' }}
          </h1>
          <p v-if="matchday.notes" class="text-muted-foreground text-sm mt-2">
            {{ matchday.notes }}
          </p>
        </div>

        <div class="flex flex-col items-start sm:items-end gap-2">
          <Badge :variant="statusBadge.variant">{{ statusBadge.label }}</Badge>
          <button
            @click="cycleStatus"
            class="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Alterar status
          </button>
        </div>
      </div>

      <!-- Summary counters -->
      <div class="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent class="py-3 px-4 text-center">
            <p class="text-2xl font-bold text-foreground">{{ teams.length }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">Times</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="py-3 px-4 text-center">
            <p class="text-2xl font-bold text-foreground">{{ matches.length }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">Partidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="py-3 px-4 text-center">
            <p class="text-2xl font-bold text-foreground">
              {{ teams.reduce((sum, t) => sum + t.player_count, 0) }}
            </p>
            <p class="text-xs text-muted-foreground mt-0.5">Jogadores</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="py-3 px-4 text-center">
            <p class="text-2xl font-bold text-accent">{{ matchday.total_goals }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">Gols</p>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Tabs -->
    <Card>
      <div class="border-b border-border">
        <nav class="flex -mb-px">
          <button
            @click="activeTab = 'teams'"
            :class="[
              activeTab === 'teams' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
              'px-6 py-3 border-b-2 font-medium text-sm transition-colors',
            ]"
          >
            <Users :size="14" class="inline mr-1.5 -mt-0.5" />
            Times ({{ teams.length }})
          </button>
          <button
            @click="activeTab = 'matches'"
            :class="[
              activeTab === 'matches' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
              'px-6 py-3 border-b-2 font-medium text-sm transition-colors',
            ]"
          >
            <Swords :size="14" class="inline mr-1.5 -mt-0.5" />
            Partidas ({{ matches.length }})
          </button>
          <button
            @click="activeTab = 'info'"
            :class="[
              activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
              'px-6 py-3 border-b-2 font-medium text-sm transition-colors',
            ]"
          >
            <Info :size="14" class="inline mr-1.5 -mt-0.5" />
            Info
          </button>
          <button
            @click="activeTab = 'summary'"
            :class="[
              activeTab === 'summary' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
              'px-6 py-3 border-b-2 font-medium text-sm transition-colors',
            ]"
          >
            <BarChart3 :size="14" class="inline mr-1.5 -mt-0.5" />
            Resumo
          </button>
        </nav>
      </div>

      <CardContent class="pt-6">
        <!-- TEAMS TAB -->
        <div v-if="activeTab === 'teams'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-foreground font-semibold">Times da Súmula</h3>
            <div class="flex gap-2">
              <Button
                v-if="isCup && !teamsAlreadyImported"
                @click="handleImportTeams"
                :disabled="isLoading"
                variant="secondary"
                size="sm"
              >
                <ClipboardCopy :size="14" /> Importar Times da Liga
              </Button>
              <Button
                @click="showTeamSetup = !showTeamSetup"
                :variant="showTeamSetup ? 'outline' : 'accent'"
                size="sm"
              >
                {{ showTeamSetup ? 'Cancelar' : '+ Adicionar Time' }}
              </Button>
            </div>
          </div>

          <div v-if="showTeamSetup">
            <TeamSetup
              :players="players"
              :league-format="league?.format ?? 'LEAGUE'"
              :loading="isLoading"
              @shuffle="handleShuffle"
              @add-team="handleAddTeam"
            />
          </div>

          <div v-if="teams.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card v-for="team in teams" :key="team.id">
              <CardContent class="py-4 px-4 space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="font-semibold text-foreground">{{ team.name }}</h4>
                  <button
                    @click="handleDeleteTeam(team.id)"
                    class="text-xs text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>

                <div v-if="team.players_detail.length > 0" class="space-y-1">
                  <div
                    v-for="player in team.players_detail"
                    :key="player.id"
                    class="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/40 group"
                  >
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-muted-foreground w-5 text-right">#{{ player.number ?? '–' }}</span>
                      <span class="text-sm text-foreground/90">{{ player.nickname || player.name }}</span>
                      <Badge variant="secondary" class="text-xs">{{ player.position }}</Badge>
                    </div>
                    <button
                      @click="handleTogglePlayer(team.id, player.id, true)"
                      class="text-transparent group-hover:text-destructive hover:text-destructive/80 text-xs transition-all"
                    >
                      <X :size="12" />
                    </button>
                  </div>
                </div>

                <div class="pt-1">
                  <select
                    class="w-full bg-muted/40 border border-border text-muted-foreground rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
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
              </CardContent>
            </Card>
          </div>

          <div v-else-if="!showTeamSetup" class="text-center py-12 text-muted-foreground">
            <Target :size="32" class="mx-auto mb-3 text-muted-foreground/50" />
            <p class="font-medium">Nenhum time cadastrado ainda</p>
            <p class="text-sm mt-1">
              {{ isCup ? 'Importe os times da liga ou adicione manualmente.' : 'Sorteie ou monte os times manualmente.' }}
            </p>
          </div>

          <MatchDayGoalkeeperManager
            :community-id="communityId"
            :league-id="leagueId"
            :matchday-id="matchdayId"
          />
        </div>

        <!-- MATCHES TAB -->
        <div v-if="activeTab === 'matches'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-foreground font-semibold">Partidas</h3>
            <Button
              v-if="teams.length >= 2 && !showMatchForm"
              @click="showMatchForm = true"
              variant="accent"
              size="sm"
            >
              <Plus :size="14" /> Nova Partida
            </Button>
          </div>

          <MatchForm
            v-if="showMatchForm"
            :teams="teams"
            @create="handleCreateMatch"
            @cancel="showMatchForm = false"
          />

          <div
            v-if="teams.length < 2 && !showMatchForm"
            class="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-border"
          >
            <p class="text-sm">Adicione pelo menos 2 times antes de criar partidas.</p>
          </div>

          <div v-if="matches.length > 0" class="space-y-3">
            <Card
              v-for="(match, index) in matches"
              :key="match.id"
              class="overflow-hidden"
            >
              <div
                class="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                @click="toggleMatchExpand(match.id)"
              >
                <span class="text-muted-foreground text-xs font-medium w-5 text-center flex-shrink-0">
                  {{ index + 1 }}
                </span>

                <div class="flex-1 flex items-center justify-between gap-3">
                  <div class="flex-1 text-right">
                    <span class="text-foreground font-semibold text-sm">{{ match.home_team_detail.name }}</span>
                    <div class="text-xs text-muted-foreground mt-0.5">{{ match.home_team_detail.player_count }} jog.</div>
                  </div>

                  <div class="flex items-center gap-2 bg-background rounded-lg px-4 py-2 border border-border flex-shrink-0">
                    <span class="text-primary font-bold text-lg tabular-nums">{{ match.home_score }}</span>
                    <span class="text-muted-foreground text-sm">×</span>
                    <span class="text-primary font-bold text-lg tabular-nums">{{ match.away_score }}</span>
                  </div>

                  <div class="flex-1">
                    <span class="text-foreground font-semibold text-sm">{{ match.away_team_detail.name }}</span>
                    <div class="text-xs text-muted-foreground mt-0.5">{{ match.away_team_detail.player_count }} jog.</div>
                  </div>
                </div>

                <div class="flex items-center gap-2 flex-shrink-0">
                  <ChevronUp v-if="expandedMatchId === match.id" :size="14" class="text-muted-foreground" />
                  <ChevronDown v-else :size="14" class="text-muted-foreground" />
                  <button @click.stop="handleDeleteMatch(match.id)" class="text-destructive hover:text-destructive/80">
                    <X :size="14" />
                  </button>
                </div>
              </div>

              <div v-if="expandedMatchId === match.id" class="border-t border-border p-4 space-y-4">
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
            </Card>
          </div>

          <div v-else-if="!showMatchForm && teams.length >= 2" class="text-center py-12 text-muted-foreground">
            <Swords :size="32" class="mx-auto mb-3 text-muted-foreground/50" />
            <p class="font-medium">Nenhuma partida registrada ainda</p>
            <p class="text-sm mt-1">Clique em "+ Nova Partida" para começar.</p>
          </div>
        </div>

        <!-- INFO TAB -->
        <div v-if="activeTab === 'info'" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent class="py-3 px-4">
                <p class="text-xs text-muted-foreground uppercase tracking-wide mb-1">Data</p>
                <p class="text-foreground font-medium">{{ formattedDate }}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent class="py-3 px-4">
                <p class="text-xs text-muted-foreground uppercase tracking-wide mb-1">Status</p>
                <p class="text-foreground font-medium">{{ statusBadge.label }}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent class="py-3 px-4">
                <p class="text-xs text-muted-foreground uppercase tracking-wide mb-1">Criado por</p>
                <p class="text-foreground font-medium">{{ matchday.created_by_username }}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent class="py-3 px-4">
                <p class="text-xs text-muted-foreground uppercase tracking-wide mb-1">Liga</p>
                <p class="text-foreground font-medium">{{ league?.name ?? '—' }}</p>
              </CardContent>
            </Card>
          </div>
          <Card v-if="matchday.notes">
            <CardContent class="py-3 px-4">
              <p class="text-xs text-muted-foreground uppercase tracking-wide mb-1">Observações</p>
              <p class="text-foreground/80 text-sm whitespace-pre-line">{{ matchday.notes }}</p>
            </CardContent>
          </Card>
        </div>

        <!-- SUMMARY TAB -->
        <div v-if="activeTab === 'summary'">
          <MatchDaySummary />
        </div>
      </CardContent>
    </Card>
  </div>
</template>
