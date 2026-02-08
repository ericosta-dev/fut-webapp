<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLeaguesStore } from '../stores/leaguesStore'
import TeamForm from './TeamForm.vue'

interface Props {
  communityId: string
  leagueId: string
}

const props = defineProps<Props>()

const leaguesStore = useLeaguesStore()

const showTeamForm = ref(false)
const activeTab = ref<'info' | 'teams'>('info')

// Computed
const league = computed(() => leaguesStore.currentLeague)
const teams = computed(() => leaguesStore.currentTeams)

const statusBadge = computed(() => {
  if (!league.value) return { text: '', class: '' }
  if (league.value.is_active) {
    return {
      text: 'Ativa',
      class: 'bg-emerald-500/20 text-emerald-400',
    }
  } else if (league.value.is_finished) {
    return {
      text: 'Finalizada',
      class: 'bg-slate-500/20 text-slate-400',
    }
  } else {
    return {
      text: 'Aguardando',
      class: 'bg-amber-500/20 text-amber-400',
    }
  }
})

const formatBadge = computed(() => {
  if (!league.value) return { text: '', class: '' }
  return league.value.format === 'CUP'
    ? {
        text: 'Copa',
        class: 'bg-blue-500/20 text-blue-400',
      }
    : {
        text: 'Liga',
        class: 'bg-purple-500/20 text-purple-400',
      }
})

const formattedStartDate = computed(() => {
  if (!league.value) return ''
  return new Date(league.value.start_date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const formattedEndDate = computed(() => {
  if (!league.value) return ''
  return new Date(league.value.end_date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const canAddTeams = computed(() => {
  return league.value?.format === 'CUP' && !league.value?.is_finished
})

// Methods
onMounted(async () => {
  await loadLeagueData()
})

async function loadLeagueData() {
  await leaguesStore.fetchLeagueById(props.communityId, props.leagueId)
  if (league.value?.format === 'CUP') {
    await leaguesStore.fetchTeams(props.communityId, props.leagueId)
    activeTab.value = 'teams'
  }
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
</script>

<template>
  <div v-if="league" class="space-y-6">
    <!-- Header -->
    <div class="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-500/20 p-6">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h1 class="text-3xl font-bold text-white">{{ league.name }}</h1>
          <p class="text-slate-400 mt-2">{{ league.description }}</p>
        </div>
        <div class="flex gap-2">
          <span
            :class="formatBadge.class"
            class="px-3 py-1 text-sm font-medium rounded-full"
          >
            {{ formatBadge.text }}
          </span>
          <span
            :class="statusBadge.class"
            class="px-3 py-1 text-sm font-medium rounded-full"
          >
            {{ statusBadge.text }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div class="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <p class="text-sm text-slate-400">Data de Início</p>
          <p class="text-lg font-semibold text-white">{{ formattedStartDate }}</p>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <p class="text-sm text-slate-400">Data de Fim</p>
          <p class="text-lg font-semibold text-white">{{ formattedEndDate }}</p>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <p class="text-sm text-slate-400">Criado por</p>
          <p class="text-lg font-semibold text-white">
            {{ league.created_by_username }}
          </p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-slate-800/50 rounded-xl border border-slate-700/50">
      <div class="border-b border-slate-700/50">
        <nav class="flex -mb-px">
          <button
            @click="activeTab = 'info'"
            :class="[
              activeTab === 'info'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600',
              'px-6 py-3 border-b-2 font-medium text-sm',
            ]"
          >
            Informações
          </button>
          <button
            v-if="league.format === 'CUP'"
            @click="activeTab = 'teams'"
            :class="[
              activeTab === 'teams'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600',
              'px-6 py-3 border-b-2 font-medium text-sm',
            ]"
          >
            Times ({{ teams.length }})
          </button>
        </nav>
      </div>

      <div class="p-6">
        <!-- Info Tab -->
        <div v-if="activeTab === 'info'" class="space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-white mb-2">Sobre a Liga</h3>
            <p class="text-slate-400">
              {{ league.description || 'Sem descrição disponível.' }}
            </p>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-white mb-2">Formato</h3>
            <p class="text-slate-400">
              {{
                league.format === 'CUP'
                  ? 'Copa - Times fixos que competem ao longo da temporada. Pontos acumulam para os times.'
                  : 'Liga - Ranking individual de jogadores. Times são formados dinamicamente em cada MatchDay. Pontos acumulam para jogadores individuais.'
              }}
            </p>
          </div>
        </div>

        <!-- Teams Tab (COPA) -->
        <div v-if="activeTab === 'teams'" class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-white">Times</h3>
            <button
              v-if="canAddTeams && !showTeamForm"
              @click="showTeamForm = true"
              class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
            >
              + Adicionar Time
            </button>
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
              class="bg-slate-700/30 border border-slate-600 rounded-lg p-4"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-semibold text-white">{{ team.name }}</h4>
                  <p class="text-sm text-slate-400 mt-1">
                    {{ team.player_count }} jogador(es)
                  </p>
                  <div v-if="team.players_detail.length > 0" class="mt-2">
                    <p class="text-xs text-slate-500 mb-1">Jogadores:</p>
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="player in team.players_detail"
                        :key="player.id"
                        class="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded"
                      >
                        {{ player.nickname || player.name }}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  v-if="!league.is_finished"
                  @click="handleDeleteTeam(team.id)"
                  class="text-red-400 hover:text-red-300 text-sm"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
          <p v-else-if="!showTeamForm" class="text-slate-400 text-center py-8">
            Nenhum time cadastrado ainda.
          </p>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="flex justify-center items-center h-64">
    <p class="text-slate-400">Carregando...</p>
  </div>
</template>
