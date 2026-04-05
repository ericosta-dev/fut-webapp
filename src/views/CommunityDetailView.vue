<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCommunitiesStore } from '@/stores/communities'
import { usePlayersStore } from '@/stores/players'
import { useLeaguesStore } from '@/features/leagues/stores/leaguesStore'
import { communitiesApi } from '@/features/communities/api'
import { leaguesApi } from '@/features/leagues/api'
import AppLayout from '@/components/AppLayout.vue'
import { Card, CardContent } from '@/components/ui'
import {
  Settings,
  Trophy,
  Loader2,
} from 'lucide-vue-next'
import CommunityRankings from '@/features/communities/components/CommunityRankings.vue'
import MensalistasCard from '@/features/communities/components/MensalistasCard.vue'
import MiniCalendar from '@/features/communities/components/MiniCalendar.vue'
import LeagueStandingsCard from '@/features/communities/components/LeagueStandingsCard.vue'
import LeagueResultsCard from '@/features/communities/components/LeagueResultsCard.vue'
import Badge from '@/components/ui/Badge.vue'
import Select from '@/components/ui/Select.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import type { CommunityRanking, CalendarMatchDay } from '@/types'
import type {
  LeagueList,
  CupTeamStanding,
  LeaguePlayerStandingEntry,
  MatchDaySummary,
} from '@/features/leagues/types'

const route = useRoute()
const router = useRouter()
const communitiesStore = useCommunitiesStore()
const playersStore = usePlayersStore()
const leaguesStore = useLeaguesStore()

const communityId = computed(() => route.params.id as string)

// ── League filter ────────────────────────────────────────────────────────────
const selectedLeagueId = ref<string>('all')

const activeOrOngoingLeagues = computed<LeagueList[]>(() =>
  leaguesStore.leagues.filter((l) => l.is_active || !l.is_finished),
)

const selectedLeague = computed<LeagueList | null>(() => {
  if (selectedLeagueId.value === 'all') return null
  return leaguesStore.leagues.find((l) => l.id === selectedLeagueId.value) ?? null
})

// ── Async data ───────────────────────────────────────────────────────────────
const rankings = ref<CommunityRanking>({ top_goals: [], top_assists: [], total_players: 0 })
const rankingsLoading = ref(false)
const calendarMatchdays = ref<CalendarMatchDay[]>([])
const calendarLoading = ref(false)

// Standings per league
const cupStandings = ref<CupTeamStanding[]>([])
const playerStandings = ref<LeaguePlayerStandingEntry[]>([])
const standingsMatchdays = ref<MatchDaySummary[]>([])
const standingsLoading = ref(false)

// ── Fetch helpers ────────────────────────────────────────────────────────────
async function fetchRankings() {
  rankingsLoading.value = true
  try {
    rankings.value = await communitiesApi.getRankings(
      communityId.value,
      selectedLeagueId.value === 'all' ? undefined : selectedLeagueId.value,
    )
  } catch {
    // silent
  } finally {
    rankingsLoading.value = false
  }
}

async function fetchCalendar() {
  calendarLoading.value = true
  try {
    calendarMatchdays.value = await communitiesApi.getCalendar(communityId.value)
  } catch {
    // silent
  } finally {
    calendarLoading.value = false
  }
}

async function fetchStandings() {
  // Need a specific league selected (or pick the first active one)
  const league = selectedLeague.value ?? activeOrOngoingLeagues.value[0] ?? null
  if (!league) {
    cupStandings.value = []
    playerStandings.value = []
    standingsMatchdays.value = []
    return
  }

  standingsLoading.value = true
  try {
    if (league.format === 'CUP') {
      const data = await leaguesApi.getStandings(communityId.value, league.id)
      cupStandings.value = data.standings
      standingsMatchdays.value = data.matchdays
      playerStandings.value = []
    } else {
      const data = await leaguesApi.getPlayerStandings(communityId.value, league.id)
      playerStandings.value = data.player_standings
      standingsMatchdays.value = data.matchdays
      cupStandings.value = []
    }
  } catch {
    cupStandings.value = []
    playerStandings.value = []
    standingsMatchdays.value = []
  } finally {
    standingsLoading.value = false
  }
}

// The league whose standings/results are shown
const standingsLeague = computed<LeagueList | null>(
  () => selectedLeague.value ?? activeOrOngoingLeagues.value[0] ?? null,
)

// ── Watch league filter ──────────────────────────────────────────────────────
watch(selectedLeagueId, () => {
  fetchRankings()
  fetchStandings()
})

// ── Init ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    communitiesStore.fetchCommunity(communityId.value),
    playersStore.fetchPlayers(communityId.value),
    leaguesStore.fetchLeagues(communityId.value),
    fetchRankings(),
    fetchCalendar(),
  ])
  // After leagues are loaded, fetch standings for default league
  await fetchStandings()
})

// ── Navigation ───────────────────────────────────────────────────────────────
function handleMatchdaySelect(md: CalendarMatchDay) {
  router.push(
    `/communities/${communityId.value}/leagues/${md.league_id}/matchdays/${md.id}`,
  )
}
</script>

<template>
  <AppLayout>
    <div class="space-y-6 animate-fade-in">
      <!-- Loading -->
      <div v-if="communitiesStore.loading" class="flex items-center justify-center py-24">
        <Loader2 :size="32" class="animate-spin text-primary" />
      </div>

      <template v-else-if="communitiesStore.currentCommunity">
        <!-- ── Header Card (dashboard-style) ──────────────────────────── -->
        <Card class="p-6 bg-gradient-to-r from-primary/10 via-transparent to-accent/5 border-primary/20">
          <div class="flex items-center gap-5">
            <!-- Community avatar -->
            <div class="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
              <span class="text-primary text-2xl font-bold">
                {{ communitiesStore.currentCommunity.name[0].toUpperCase() }}
              </span>
            </div>

            <!-- Name & description -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <h1 class="text-xl font-bold text-foreground truncate">
                  {{ communitiesStore.currentCommunity.name }}
                </h1>
                <Badge variant="outline" class="text-xs border-primary/40 text-primary shrink-0">
                  {{ leaguesStore.leagues.length }} competições
                </Badge>
              </div>
              <p class="text-muted-foreground text-sm truncate">
                {{ communitiesStore.currentCommunity.description || 'Comunidade de futebol' }}
              </p>
            </div>

            <!-- Quick stats -->
            <div class="flex flex-wrap items-center gap-4 sm:gap-6 text-center">
              <div>
                <p class="text-2xl font-bold text-primary">{{ playersStore.players.length }}</p>
                <p class="text-xs text-muted-foreground">Jogadores</p>
              </div>
              <div>
                <p class="text-2xl font-bold" style="color: rgb(198,255,51)">{{ leaguesStore.leagues.length }}</p>
                <p class="text-xs text-muted-foreground">Competições</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-warning">{{ calendarMatchdays.length }}</p>
                <p class="text-xs text-muted-foreground">Próximas</p>
              </div>
              <router-link
                :to="`/communities/${communityId}/settings`"
                class="hidden sm:flex items-center gap-1 text-xs font-semibold rounded-lg bg-muted px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings :size="14" />
                Config.
              </router-link>
            </div>
          </div>
        </Card>

        <!-- ── Filter row ─────────────────────────────────────────────── -->
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-base font-semibold text-foreground">
            Visão geral
            <span v-if="selectedLeagueId !== 'all'" class="text-muted-foreground font-normal ml-1">
              — {{ selectedLeague?.name }}
            </span>
          </h2>
          <div class="flex items-center gap-3 shrink-0">
            <div v-if="leaguesStore.leagues.length > 0" class="w-52">
              <Select
                v-model="selectedLeagueId"
                placeholder="Todas as competições"
                :disabled="leaguesStore.loading"
              >
                <SelectItem value="all">Todas as competições</SelectItem>
                <SelectItem v-for="league in leaguesStore.leagues" :key="league.id" :value="league.id">
                  {{ league.name }}
                </SelectItem>
              </Select>
            </div>
            <router-link
              :to="`/communities/${communityId}/competitions`"
              class="inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg bg-muted px-3 py-2 text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              <Trophy :size="13" />
              Ver todas
            </router-link>
          </div>
        </div>

        <!-- ── Main + Sidebar layout ─────────────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- ── Main content (2/3) ─────────────────────────────────── -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Rankings -->
            <CommunityRankings :rankings="rankings" :loading="rankingsLoading" />

            <!-- Standings + Results -->
            <template v-if="standingsLeague">
              <LeagueStandingsCard
                :format="standingsLeague.format"
                :cup-standings="cupStandings"
                :player-standings="playerStandings"
                :loading="standingsLoading"
              />
              <LeagueResultsCard
                :matchdays="standingsMatchdays"
                :loading="standingsLoading"
              />
            </template>

            <div
              v-else-if="!leaguesStore.loading && leaguesStore.leagues.length === 0"
              class="rounded-xl border border-border px-4 py-8 text-center text-muted-foreground text-sm"
            >
              <Trophy :size="28" class="mx-auto mb-3 text-muted-foreground/40" />
              <p class="mb-3">Nenhuma competição cadastrada.</p>
              <button
                class="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                @click="router.push({ name: 'competition-create', params: { id: communityId } })"
              >
                Criar Primeira Competição
              </button>
            </div>
          </div>

          <!-- ── Sidebar (1/3) ──────────────────────────────────────── -->
          <div class="space-y-6">
            <MiniCalendar
              :matchdays="calendarMatchdays"
              :loading="calendarLoading"
              @select-matchday="handleMatchdaySelect"
            />
            <MensalistasCard
              :players="playersStore.players"
              :max-mensalistas="communitiesStore.currentCommunity.max_mensalistas"
              :loading="playersStore.loading"
            />
          </div>
        </div>

      </template>
    </div>
  </AppLayout>
</template>
