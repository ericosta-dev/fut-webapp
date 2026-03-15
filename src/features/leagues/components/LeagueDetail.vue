<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLeaguesStore } from '../stores/leaguesStore'
import { useMatchDaysStore } from '@/features/matchdays/stores/matchdaysStore'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import { Info, Users, CalendarDays, Plus, Trash2, Loader2 } from 'lucide-vue-next'
import TeamForm from './TeamForm.vue'
import MatchDayCard from '@/features/matchdays/components/MatchDayCard.vue'
import MatchDayForm from '@/features/matchdays/components/MatchDayForm.vue'

interface Props {
  communityId: string
  leagueId: string
}

const props = defineProps<Props>()
const router = useRouter()

const leaguesStore = useLeaguesStore()
const matchdaysStore = useMatchDaysStore()

const showTeamForm = ref(false)
const showMatchDayForm = ref(false)
const activeTab = ref<'info' | 'teams' | 'matchdays'>('info')

const league = computed(() => leaguesStore.currentLeague)
const teams = computed(() => leaguesStore.currentTeams)
const matchdays = computed(() => matchdaysStore.matchdays)

const statusVariant = computed(() => {
  if (!league.value) return 'secondary'
  if (league.value.is_active) return 'success'
  if (league.value.is_finished) return 'secondary'
  return 'warning'
})
const statusText = computed(() => {
  if (!league.value) return ''
  if (league.value.is_active) return 'Ativa'
  if (league.value.is_finished) return 'Finalizada'
  return 'Aguardando'
})
const formatVariant = computed(() =>
  league.value?.format === 'CUP' ? 'default' : 'accent',
)
const formatText = computed(() =>
  league.value?.format === 'CUP' ? 'Copa' : 'Liga',
)

const formattedStartDate = computed(() => {
  if (!league.value) return ''
  return new Date(league.value.start_date).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
})
const formattedEndDate = computed(() => {
  if (!league.value) return ''
  return new Date(league.value.end_date).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
})

const canAddTeams = computed(() => league.value?.format === 'CUP' && !league.value?.is_finished)

onMounted(async () => { await loadLeagueData() })

async function loadLeagueData() {
  await leaguesStore.fetchLeagueById(props.communityId, props.leagueId)
  await Promise.all([
    leaguesStore.currentLeague?.format === 'CUP'
      ? leaguesStore.fetchTeams(props.communityId, props.leagueId)
      : Promise.resolve(),
    matchdaysStore.fetchMatchDays(props.communityId, props.leagueId),
  ])
  activeTab.value = league.value?.format === 'CUP' ? 'teams' : 'matchdays'
}

function handleTeamCreated() {
  showTeamForm.value = false
  leaguesStore.fetchTeams(props.communityId, props.leagueId)
}

async function handleDeleteTeam(teamId: string) {
  if (confirm('Tem certeza que deseja excluir este time?')) {
    await leaguesStore.deleteTeam(props.communityId, props.leagueId, teamId)
  }
}

function handleMatchDayCreated(matchdayId: string) {
  showMatchDayForm.value = false
  router.push(`/communities/${props.communityId}/leagues/${props.leagueId}/matchdays/${matchdayId}`)
}

async function handleDeleteMatchDay(matchdayId: string) {
  if (confirm('Tem certeza que deseja excluir esta súmula?')) {
    await matchdaysStore.deleteMatchDay(props.communityId, props.leagueId, matchdayId)
  }
}

function openMatchDay(matchdayId: string) {
  router.push(`/communities/${props.communityId}/leagues/${props.leagueId}/matchdays/${matchdayId}`)
}
</script>

<template>
  <div v-if="league" class="space-y-6">
    <!-- Header -->
    <div class="bg-gradient-to-r from-primary/10 via-transparent to-accent/5 rounded-2xl border border-primary/20 p-6">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h1 class="text-3xl font-bold text-foreground">{{ league.name }}</h1>
          <p class="text-muted-foreground mt-2">{{ league.description }}</p>
        </div>
        <div class="flex gap-2">
          <Badge :variant="formatVariant">{{ formatText }}</Badge>
          <Badge :variant="statusVariant">{{ statusText }}</Badge>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div class="bg-card rounded-lg p-4 border border-border">
          <p class="text-sm text-muted-foreground">Data de Início</p>
          <p class="text-lg font-semibold text-foreground">{{ formattedStartDate }}</p>
        </div>
        <div class="bg-card rounded-lg p-4 border border-border">
          <p class="text-sm text-muted-foreground">Data de Fim</p>
          <p class="text-lg font-semibold text-foreground">{{ formattedEndDate }}</p>
        </div>
        <div class="bg-card rounded-lg p-4 border border-border">
          <p class="text-sm text-muted-foreground">Criado por</p>
          <p class="text-lg font-semibold text-foreground">{{ league.created_by_username }}</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <Card>
      <div class="border-b border-border">
        <nav class="flex -mb-px">
          <button
            @click="activeTab = 'info'"
            :class="[
              activeTab === 'info'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
              'px-6 py-3 border-b-2 font-medium text-sm flex items-center gap-2',
            ]"
          >
            <Info :size="16" />
            Informações
          </button>
          <button
            v-if="league.format === 'CUP'"
            @click="activeTab = 'teams'"
            :class="[
              activeTab === 'teams'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
              'px-6 py-3 border-b-2 font-medium text-sm flex items-center gap-2',
            ]"
          >
            <Users :size="16" />
            Times ({{ teams.length }})
          </button>
          <button
            @click="activeTab = 'matchdays'"
            :class="[
              activeTab === 'matchdays'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
              'px-6 py-3 border-b-2 font-medium text-sm flex items-center gap-2',
            ]"
          >
            <CalendarDays :size="16" />
            Súmulas ({{ matchdays.length }})
          </button>
        </nav>
      </div>

      <CardContent class="p-6">
        <!-- Info Tab -->
        <div v-if="activeTab === 'info'" class="space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-foreground mb-2">Sobre a Liga</h3>
            <p class="text-muted-foreground">{{ league.description || 'Sem descrição disponível.' }}</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-foreground mb-2">Formato</h3>
            <p class="text-muted-foreground">
              {{ league.format === 'CUP'
                ? 'Copa - Times fixos que competem ao longo da temporada. Pontos acumulam para os times.'
                : 'Liga - Ranking individual de jogadores. Times são formados dinamicamente em cada Súmula. Pontos acumulam para jogadores individuais.'
              }}
            </p>
          </div>
        </div>

        <!-- Teams Tab -->
        <div v-if="activeTab === 'teams'" class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-foreground">Times</h3>
            <Button
              v-if="canAddTeams && !showTeamForm"
              @click="showTeamForm = true"
              size="sm"
            >
              <Plus :size="16" class="mr-1" />
              Adicionar Time
            </Button>
          </div>

          <TeamForm
            v-if="showTeamForm"
            :community-id="communityId"
            :league-id="leagueId"
            @success="handleTeamCreated"
            @cancel="showTeamForm = false"
          />

          <div v-if="teams.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="team in teams"
              :key="team.id"
              class="bg-muted/30 border border-border rounded-lg p-4"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-semibold text-foreground">{{ team.name }}</h4>
                  <p class="text-sm text-muted-foreground mt-1">{{ team.player_count }} jogador(es)</p>
                  <div v-if="team.players_detail.length > 0" class="mt-2">
                    <p class="text-xs text-muted-foreground mb-1">Jogadores:</p>
                    <div class="flex flex-wrap gap-1">
                      <Badge
                        v-for="player in team.players_detail"
                        :key="player.id"
                        variant="secondary"
                      >
                        {{ player.nickname || player.name }}
                      </Badge>
                    </div>
                  </div>
                </div>
                <button
                  v-if="!league.is_finished"
                  @click="handleDeleteTeam(team.id)"
                  class="text-destructive hover:text-destructive/80 text-sm"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>
          </div>
          <p v-else-if="!showTeamForm" class="text-muted-foreground text-center py-8">
            Nenhum time cadastrado ainda.
          </p>
        </div>

        <!-- MatchDays Tab -->
        <div v-if="activeTab === 'matchdays'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-foreground">Súmulas</h3>
            <Button
              v-if="!showMatchDayForm"
              @click="showMatchDayForm = true"
              size="sm"
            >
              <Plus :size="16" class="mr-1" />
              Nova Súmula
            </Button>
          </div>

          <MatchDayForm
            v-if="showMatchDayForm"
            :community-id="communityId"
            :league-id="leagueId"
            @success="handleMatchDayCreated"
            @cancel="showMatchDayForm = false"
          />

          <div v-if="matchdays.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MatchDayCard
              v-for="md in matchdays"
              :key="md.id"
              :matchday="md"
              @click="openMatchDay(md.id)"
              @delete="handleDeleteMatchDay(md.id)"
            />
          </div>

          <div v-else-if="!showMatchDayForm" class="text-center py-12 text-muted-foreground">
            <CalendarDays :size="40" class="mx-auto mb-3 opacity-40" />
            <p class="font-medium">Nenhuma súmula registrada ainda</p>
            <p class="text-sm mt-1">Crie a primeira súmula para começar a registrar partidas.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <div v-else class="flex justify-center items-center h-64">
    <Loader2 :size="24" class="animate-spin text-primary" />
  </div>
</template>
