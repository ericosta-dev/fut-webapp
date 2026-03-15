<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { Bar, Radar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  LineController,
  RadarController,
  Filler,
  Tooltip,
  Legend,
  Title,
} from 'chart.js'
import { useCommunitiesStore } from '@/stores/communities'
import { playersApi } from '@/features/players/api'
import { leaguesApi } from '@/features/leagues/api'
import type { Player, PlayerStats } from '@/types'
import type { LeagueList } from '@/features/leagues/types'
import AppLayout from '@/components/AppLayout.vue'
import { Card, Badge, Select, SelectItem, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import {
  Zap,
  CalendarDays,
  Loader2,
  User,
  BarChart3,
  TrendingUp,
  Trophy,
  Handshake,
  Swords,
} from 'lucide-vue-next'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  LineController,
  RadarController,
  Filler,
  Tooltip,
  Legend,
  Title,
)

const communitiesStore = useCommunitiesStore()

const myPlayer = ref<Player | null>(null)
const playerStats = ref<PlayerStats | null>(null)
const statsLoading = ref(false)
const statsError = ref<string | null>(null)

const leagues = ref<LeagueList[]>([])
const leaguesLoading = ref(false)
const selectedLeagueId = ref<string>('all')

// ── Data loading ─────────────────────────────────────────────────────────────

async function loadLeagues(communityId: string) {
  leaguesLoading.value = true
  try {
    const result = await leaguesApi.getAll(communityId)
    leagues.value = result.results
  } catch {
    leagues.value = []
  } finally {
    leaguesLoading.value = false
  }
}

async function loadPlayerStats(communityId: string) {
  statsLoading.value = true
  statsError.value = null
  try {
    if (!myPlayer.value || myPlayer.value.community !== communityId) {
      myPlayer.value = await playersApi.me(communityId)
    }
    const leagueFilter = selectedLeagueId.value !== 'all' ? selectedLeagueId.value : undefined
    playerStats.value = await playersApi.stats(myPlayer.value.id, leagueFilter)
  } catch {
    statsError.value = 'Perfil de jogador não encontrado nesta comunidade.'
  } finally {
    statsLoading.value = false
  }
}

async function loadCommunityData(communityId: string) {
  selectedLeagueId.value = 'all'
  await Promise.all([loadLeagues(communityId), loadPlayerStats(communityId)])
}

onMounted(async () => {
  try {
    await communitiesStore.fetchCommunities()
  } catch {
    /* handled in store */
  }
  if (communitiesStore.currentCommunity) {
    await loadCommunityData(communitiesStore.currentCommunity.id)
  }
})

watch(
  () => communitiesStore.currentCommunity,
  async (community) => {
    if (community) {
      await loadCommunityData(community.id)
    } else {
      myPlayer.value = null
      playerStats.value = null
      leagues.value = []
      selectedLeagueId.value = 'all'
    }
  },
)

watch(selectedLeagueId, async () => {
  // Skip when loadCommunityData is already running (it resets selectedLeagueId internally)
  if (statsLoading.value) return
  if (communitiesStore.currentCommunity && myPlayer.value) {
    statsLoading.value = true
    statsError.value = null
    try {
      const leagueFilter = selectedLeagueId.value !== 'all' ? selectedLeagueId.value : undefined
      playerStats.value = await playersApi.stats(myPlayer.value.id, leagueFilter)
    } catch {
      statsError.value = 'Não foi possível carregar as estatísticas.'
    } finally {
      statsLoading.value = false
    }
  }
})

// ── Computed ──────────────────────────────────────────────────────────────────

const winRate = computed(() => {
  if (!playerStats.value || playerStats.value.matches_played === 0) return 0
  return Math.round((playerStats.value.wins / playerStats.value.matches_played) * 100)
})

const selectedLeagueName = computed(() => {
  if (selectedLeagueId.value === 'all') return 'Todas as Competições'
  return leagues.value.find((l) => l.id === selectedLeagueId.value)?.name ?? 'Competição'
})

const positionLabels: Record<string, string> = {
  FWD: 'Atacante', MID: 'Meio-Campo', DEF: 'Defensor', GK: 'Goleiro',
}

// ── Ranking leaderboard helpers ───────────────────────────────────────────────

const myPlayerId = computed(() => playerStats.value?.player_id ?? null)

const myGoalsInTop10 = computed(() =>
  playerStats.value?.ranking.top_goals.some((e) => e.player_id === myPlayerId.value) ?? false,
)
const myAssistsInTop10 = computed(() =>
  playerStats.value?.ranking.top_assists.some((e) => e.player_id === myPlayerId.value) ?? false,
)

const rankBadgeClass = (rank: number) => {
  if (rank === 1) return 'bg-warning/20 text-warning border border-warning/30'
  if (rank === 2) return 'bg-muted-foreground/20 text-muted-foreground border border-muted-foreground/30'
  if (rank === 3) return 'bg-accent/10 text-accent border border-accent/30'
  return 'bg-muted text-muted-foreground'
}

// ── Bar chart ─────────────────────────────────────────────────────────────────

const barChartData = computed(() => ({
  labels: ['Gols', 'Assistências', 'G. Contra', 'Vitórias', 'Empates', 'Derrotas'],
  datasets: [{
    label: myPlayer.value?.name ?? 'Jogador',
    data: playerStats.value
      ? [playerStats.value.goals, playerStats.value.assists, playerStats.value.own_goals,
         playerStats.value.wins, playerStats.value.draws, playerStats.value.losses]
      : [0, 0, 0, 0, 0, 0],
    backgroundColor: [
      'rgba(125, 57, 235, 0.75)',
      'rgba(198, 255, 51, 0.75)',
      'rgba(239, 68, 68, 0.75)',
      'rgba(34, 197, 94, 0.75)',
      'rgba(161, 161, 170, 0.35)',
      'rgba(239, 68, 68, 0.35)',
    ],
    borderColor: [
      'rgb(125, 57, 235)',
      'rgb(198, 255, 51)',
      'rgb(239, 68, 68)',
      'rgb(34, 197, 94)',
      'rgb(161, 161, 170)',
      'rgb(239, 68, 68)',
    ],
    borderWidth: 2,
    borderRadius: 6,
  }],
}))

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(161,161,170,0.08)' }, ticks: { color: 'rgb(161,161,170)', font: { size: 11 as number } } },
    y: { grid: { color: 'rgba(161,161,170,0.08)' }, ticks: { color: 'rgb(161,161,170)', stepSize: 1 }, beginAtZero: true },
  },
}

// ── Radar chart ───────────────────────────────────────────────────────────────

const radarChartData = computed(() => {
  const s = playerStats.value
  const maxM = s?.matches_played || 1
  return {
    labels: ['Gols', 'Assistências', 'Partidas', 'G/Partida', 'Aproveit.'],
    datasets: [{
      label: myPlayer.value?.name ?? 'Jogador',
      data: s
        ? [Math.min(s.goals, 20), Math.min(s.assists, 20), Math.min(s.matches_played, 20),
           parseFloat(((s.goals / maxM) * 10).toFixed(1)),
           parseFloat((winRate.value / 5).toFixed(1))]
        : [0, 0, 0, 0, 0],
      backgroundColor: 'rgba(125, 57, 235, 0.12)',
      borderColor: 'rgb(125, 57, 235)',
      pointBackgroundColor: 'rgb(125, 57, 235)',
      pointBorderColor: '#fafafa',
      borderWidth: 2,
    }],
  }
})

const radarChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    r: {
      grid: { color: 'rgba(161,161,170,0.12)' },
      angleLines: { color: 'rgba(161,161,170,0.12)' },
      pointLabels: { color: 'rgb(161,161,170)', font: { size: 11 as number } },
      ticks: { display: false },
      suggestedMin: 0,
      suggestedMax: 20,
    },
  },
}

// ── Line chart (evolution per matchday) ───────────────────────────────────────

const hasHistory = computed(() => (playerStats.value?.history?.length ?? 0) >= 2)

const lineChartData = computed(() => {
  const history = playerStats.value?.history ?? []
  return {
    labels: history.map((h) => h.matchday_label || h.matchday_date),
    datasets: [
      {
        label: 'Gols',
        data: history.map((h) => h.goals),
        borderColor: 'rgb(125, 57, 235)',
        backgroundColor: 'rgba(125, 57, 235, 0.08)',
        pointBackgroundColor: 'rgb(125, 57, 235)',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Assistências',
        data: history.map((h) => h.assists),
        borderColor: 'rgb(198, 255, 51)',
        backgroundColor: 'rgba(198, 255, 51, 0.06)',
        pointBackgroundColor: 'rgb(198, 255, 51)',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0.35,
        fill: true,
      },
    ],
  }
})

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      labels: { color: 'rgb(161,161,170)', font: { size: 12 as number }, boxWidth: 12, padding: 16 },
    },
  },
  scales: {
    x: { grid: { color: 'rgba(161,161,170,0.08)' }, ticks: { color: 'rgb(161,161,170)', font: { size: 11 as number }, maxRotation: 45 } },
    y: { grid: { color: 'rgba(161,161,170,0.08)' }, ticks: { color: 'rgb(161,161,170)', stepSize: 1 }, beginAtZero: true },
  },
}
</script>

<template>
  <AppLayout>
    <div class="space-y-6 animate-fade-in">
      <!-- No community selected -->
      <Card v-if="!communitiesStore.currentCommunity" class="p-10 text-center">
        <div class="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <BarChart3 :size="28" class="text-muted-foreground" />
        </div>
        <p class="text-foreground font-medium mb-1">Selecione uma comunidade</p>
        <p class="text-muted-foreground text-sm">
          Use o seletor no topo para visualizar seus dados de jogador.
        </p>
      </Card>

      <template v-else>
        <!-- ── Initial loading ────────────────────────────────────────────── -->
        <div v-if="statsLoading && !playerStats && !statsError" class="flex items-center justify-center py-20">
          <Loader2 :size="32" class="animate-spin text-primary" />
        </div>

        <!-- ── No player profile ──────────────────────────────────────────── -->
        <Card v-else-if="statsError" class="p-10 text-center">
          <div class="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <User :size="28" class="text-muted-foreground" />
          </div>
          <p class="text-foreground font-medium mb-1">Jogador não encontrado</p>
          <p class="text-muted-foreground text-sm">{{ statsError }}</p>
          <p class="text-muted-foreground/60 text-xs mt-1">
            Peça ao administrador para vincular seu usuário a um jogador desta comunidade.
          </p>
        </Card>

        <template v-else-if="myPlayer">
          <!-- ── Player Card ──────────────────────────────────────────────── -->
          <Card class="p-6">
            <div class="flex flex-wrap items-center gap-5">
              <!-- Number badge -->
              <div class="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <span class="text-2xl font-bold text-primary">{{ myPlayer.number ?? '?' }}</span>
              </div>

              <!-- Name & position -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-1">
                  <h1 class="text-xl font-bold text-foreground truncate">
                    {{ myPlayer.nickname ? `(${myPlayer.number}) ${myPlayer.nickname}` : myPlayer.name }}
                  </h1>
                  <Badge variant="outline" class="text-xs border-primary/40 text-primary shrink-0">
                    {{ communitiesStore.currentCommunity?.name }}
                  </Badge>
                </div>
                <p class="text-muted-foreground text-sm">
                  {{ positionLabels[myPlayer.position] ?? myPlayer.position }}
                </p>
              </div>

              <!-- Quick stats -->
              <div class="flex flex-wrap items-center gap-4 sm:gap-6 text-center">
                <div>
                  <p class="text-2xl font-bold text-primary">{{ playerStats?.goals ?? '—' }}</p>
                  <p class="text-xs text-muted-foreground">Gols</p>
                </div>
                <div>
                  <p class="text-2xl font-bold" style="color: rgb(198,255,51)">{{ playerStats?.assists ?? '—' }}</p>
                  <p class="text-xs text-muted-foreground">Assist.</p>
                </div>
                <div>
                  <p class="text-2xl font-bold text-warning">{{ playerStats?.matches_played ?? '—' }}</p>
                  <p class="text-xs text-muted-foreground">Partidas</p>
                </div>
                <div v-if="playerStats" class="hidden sm:flex items-center gap-1 text-xs font-semibold rounded-lg bg-muted px-3 py-2">
                  <span class="text-success">{{ playerStats.wins }}V</span>
                  <span class="text-muted-foreground mx-1">·</span>
                  <span class="text-muted-foreground">{{ playerStats.draws }}E</span>
                  <span class="text-muted-foreground mx-1">·</span>
                  <span class="text-destructive">{{ playerStats.losses }}D</span>
                </div>
              </div>
            </div>
          </Card>

          <!-- ── Filter row ──────────────────────────────────────────────── -->
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-base font-semibold text-foreground">
              Performance
              <span v-if="selectedLeagueId !== 'all'" class="text-muted-foreground font-normal ml-1">— {{ selectedLeagueName }}</span>
            </h2>
            <div class="w-52 shrink-0">
              <Select
                v-model="selectedLeagueId"
                placeholder="Todas as competições"
                :disabled="leaguesLoading"
              >
                <SelectItem value="all">Todas as competições</SelectItem>
                <SelectItem v-for="league in leagues" :key="league.id" :value="league.id">
                  {{ league.name }}
                </SelectItem>
              </Select>
            </div>
          </div>

          <!-- Re-loading stats (initial: no data yet) -->
          <div v-if="statsLoading && !playerStats" class="flex items-center justify-center py-10">
            <Loader2 :size="28" class="animate-spin text-primary" />
          </div>

          <template v-if="playerStats">
            <!-- Faded overlay while re-fetching after league change -->
            <div :class="statsLoading ? 'opacity-40 pointer-events-none select-none' : ''" class="space-y-6 transition-opacity duration-150">
            <!-- ── Stats Cards ────────────────────────────────────────────── -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card class="p-5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <Zap :size="20" class="text-primary" />
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs">Gols</p>
                    <p class="text-2xl font-bold text-foreground">{{ playerStats.goals }}</p>
                  </div>
                </div>
              </Card>

              <Card class="p-5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Handshake :size="20" style="color: rgb(198,255,51)" />
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs">Assistências</p>
                    <p class="text-2xl font-bold text-foreground">{{ playerStats.assists }}</p>
                  </div>
                </div>
              </Card>

              <Card class="p-5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center shrink-0">
                    <CalendarDays :size="20" class="text-warning" />
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs">Partidas</p>
                    <p class="text-2xl font-bold text-foreground">{{ playerStats.matches_played }}</p>
                  </div>
                </div>
              </Card>

              <Card class="p-5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                    <TrendingUp :size="20" class="text-success" />
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs">Aproveitamento</p>
                    <p class="text-2xl font-bold text-foreground">
                      {{ winRate }}<span class="text-base font-normal text-muted-foreground ml-0.5">%</span>
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <!-- ── Bar + Radar ────────────────────────────────────────────── -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card class="p-6">
                <h3 class="text-sm font-semibold text-foreground mb-4">Estatísticas por categoria</h3>
                <div class="h-52">
                  <Bar :data="barChartData" :options="barChartOptions" />
                </div>
              </Card>

              <Card class="p-6">
                <h3 class="text-sm font-semibold text-foreground mb-4">Perfil do jogador</h3>
                <div class="h-52">
                  <Radar :data="radarChartData" :options="radarChartOptions" />
                </div>
              </Card>
            </div>

            <!-- ── Evolution line chart ───────────────────────────────────── -->
            <Card class="p-6">
              <h3 class="text-sm font-semibold text-foreground mb-1">Evolução por rodada</h3>
              <p class="text-xs text-muted-foreground mb-4">Gols e assistências ao longo das rodadas</p>

              <div v-if="!hasHistory" class="h-40 flex flex-col items-center justify-center gap-2">
                <Swords :size="28" class="text-muted-foreground/40" />
                <p class="text-muted-foreground text-sm">
                  {{ (playerStats.history?.length ?? 0) === 0
                    ? 'Nenhuma rodada registrada nesta competição.'
                    : 'Participe de mais rodadas para ver a evolução.' }}
                </p>
              </div>
              <div v-else class="h-56">
                <Line :data="lineChartData" :options="lineChartOptions" />
              </div>
            </Card>

            <!-- ── Ranking ────────────────────────────────────────────────── -->
            <Card class="p-6">
              <div class="flex items-center gap-2 mb-5">
                <Trophy :size="18" class="text-warning" />
                <h3 class="text-sm font-semibold text-foreground">Ranking na comunidade</h3>
                <span class="text-xs text-muted-foreground ml-auto">
                  {{ playerStats.ranking.total_players }} jogadores
                </span>
              </div>

              <Tabs default-value="goals">
                <TabsList class="w-full mb-4">
                  <TabsTrigger value="goals" class="flex-1">Artilharia</TabsTrigger>
                  <TabsTrigger value="assists" class="flex-1">Assistências</TabsTrigger>
                </TabsList>

                <!-- Goals leaderboard -->
                <TabsContent value="goals">
                  <div class="space-y-1.5">
                    <div
                      v-for="entry in playerStats.ranking.top_goals"
                      :key="entry.player_id"
                      class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                      :class="entry.player_id === myPlayerId ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'"
                    >
                      <span
                        class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        :class="rankBadgeClass(entry.rank)"
                      >#{{ entry.rank }}</span>
                      <span class="flex-1 text-sm font-medium text-foreground truncate">{{ entry.player_name }}</span>
                      <span class="text-sm font-semibold text-primary shrink-0">{{ entry.total }} gols</span>
                    </div>

                    <!-- Current player if outside top 10 -->
                    <template v-if="!myGoalsInTop10">
                      <div class="flex items-center gap-2 py-1 px-1">
                        <div class="flex-1 border-t border-dashed border-border" />
                        <span class="text-xs text-muted-foreground shrink-0">você</span>
                        <div class="flex-1 border-t border-dashed border-border" />
                      </div>
                      <div class="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                        <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 bg-primary/20 text-primary border border-primary/30">
                          #{{ playerStats.ranking.goals_rank }}
                        </span>
                        <span class="flex-1 text-sm font-medium text-foreground truncate">{{ playerStats.player_name }}</span>
                        <span class="text-sm font-semibold text-primary shrink-0">{{ playerStats.ranking.goals_total }} gols</span>
                      </div>
                    </template>
                  </div>
                </TabsContent>

                <!-- Assists leaderboard -->
                <TabsContent value="assists">
                  <div class="space-y-1.5">
                    <div
                      v-for="entry in playerStats.ranking.top_assists"
                      :key="entry.player_id"
                      class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                      :class="entry.player_id === myPlayerId ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'"
                    >
                      <span
                        class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        :class="rankBadgeClass(entry.rank)"
                      >#{{ entry.rank }}</span>
                      <span class="flex-1 text-sm font-medium text-foreground truncate">{{ entry.player_name }}</span>
                      <span class="text-sm font-semibold shrink-0" style="color:rgb(198,255,51)">{{ entry.total }} assist.</span>
                    </div>

                    <!-- Current player if outside top 10 -->
                    <template v-if="!myAssistsInTop10">
                      <div class="flex items-center gap-2 py-1 px-1">
                        <div class="flex-1 border-t border-dashed border-border" />
                        <span class="text-xs text-muted-foreground shrink-0">você</span>
                        <div class="flex-1 border-t border-dashed border-border" />
                      </div>
                      <div class="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                        <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 bg-primary/20 text-primary border border-primary/30">
                          #{{ playerStats.ranking.assists_rank }}
                        </span>
                        <span class="flex-1 text-sm font-medium text-foreground truncate">{{ playerStats.player_name }}</span>
                        <span class="text-sm font-semibold shrink-0" style="color:rgb(198,255,51)">{{ playerStats.ranking.assists_total }} assist.</span>
                      </div>
                    </template>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
            </div> <!-- end opacity wrapper -->
          </template>
        </template>
      </template>
    </div>
  </AppLayout>
</template>