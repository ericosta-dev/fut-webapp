<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { Bar, Radar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from 'chart.js'
import { useAuthStore } from '@/stores/auth'
import { useCommunitiesStore } from '@/stores/communities'
import { playersApi } from '@/features/players/api'
import type { Player, PlayerStats } from '@/types'
import AppLayout from '@/components/AppLayout.vue'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
)

const authStore = useAuthStore()
const communitiesStore = useCommunitiesStore()

const myPlayer = ref<Player | null>(null)
const playerStats = ref<PlayerStats | null>(null)
const statsLoading = ref(false)
const statsError = ref<string | null>(null)

async function loadPlayerStats(communityId: string) {
  statsLoading.value = true
  statsError.value = null
  myPlayer.value = null
  playerStats.value = null
  try {
    const player = await playersApi.me(communityId)
    myPlayer.value = player
    const stats = await playersApi.stats(player.id)
    playerStats.value = stats
  } catch {
    statsError.value = 'Perfil de jogador não encontrado nesta comunidade.'
  } finally {
    statsLoading.value = false
  }
}

onMounted(async () => {
  try {
    await communitiesStore.fetchCommunities()
  } catch {
    // handled by store
  }
  if (communitiesStore.currentCommunity) {
    await loadPlayerStats(communitiesStore.currentCommunity.id)
  }
})

watch(
  () => communitiesStore.currentCommunity,
  async (community) => {
    if (community) {
      await loadPlayerStats(community.id)
    } else {
      myPlayer.value = null
      playerStats.value = null
    }
  },
)

// ── Chart data ───────────────────────────────────────────────────────────────
const barChartData = computed(() => ({
  labels: ['Gols', 'Assistências', 'Gols Contra', 'Partidas'],
  datasets: [
    {
      label: myPlayer.value?.name ?? 'Jogador',
      data: playerStats.value
        ? [
            playerStats.value.goals,
            playerStats.value.assists,
            playerStats.value.own_goals,
            playerStats.value.matches_played,
          ]
        : [0, 0, 0, 0],
      backgroundColor: [
        'rgba(52, 211, 153, 0.7)',
        'rgba(96, 165, 250, 0.7)',
        'rgba(251, 113, 133, 0.7)',
        'rgba(251, 191, 36, 0.7)',
      ],
      borderColor: [
        'rgb(52, 211, 153)',
        'rgb(96, 165, 250)',
        'rgb(251, 113, 133)',
        'rgb(251, 191, 36)',
      ],
      borderWidth: 2,
      borderRadius: 8,
    },
  ],
}))

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    x: {
      grid: { color: 'rgba(148,163,184,0.1)' },
      ticks: { color: 'rgb(148,163,184)' },
    },
    y: {
      grid: { color: 'rgba(148,163,184,0.1)' },
      ticks: { color: 'rgb(148,163,184)', stepSize: 1 },
      beginAtZero: true,
    },
  },
}

const radarChartData = computed(() => {
  const s = playerStats.value
  const maxMatches = s?.matches_played || 1
  return {
    labels: ['Gols', 'Assistências', 'Partidas', 'G/Partida', 'A/Partida'],
    datasets: [
      {
        label: myPlayer.value?.name ?? 'Jogador',
        data: s
          ? [
              Math.min(s.goals, 20),
              Math.min(s.assists, 20),
              Math.min(s.matches_played, 20),
              parseFloat(((s.goals / maxMatches) * 10).toFixed(1)),
              parseFloat(((s.assists / maxMatches) * 10).toFixed(1)),
            ]
          : [0, 0, 0, 0, 0],
        backgroundColor: 'rgba(52, 211, 153, 0.15)',
        borderColor: 'rgb(52, 211, 153)',
        pointBackgroundColor: 'rgb(52, 211, 153)',
        pointBorderColor: '#fff',
        borderWidth: 2,
      },
    ],
  }
})

const radarChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    r: {
      grid: { color: 'rgba(148,163,184,0.15)' },
      angleLines: { color: 'rgba(148,163,184,0.15)' },
      pointLabels: { color: 'rgb(148,163,184)', font: { size: 11 } },
      ticks: { display: false },
      suggestedMin: 0,
      suggestedMax: 20,
    },
  },
}

const positionLabels: Record<string, string> = {
  FWD: 'Atacante',
  MID: 'Meio-Campo',
  DEF: 'Defensor',
  GK: 'Goleiro',
}
</script>

<template>
  <AppLayout>
    <div class="space-y-8">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-500/20 p-6">
        <h1 class="text-2xl font-bold text-white mb-1">
          Olá, {{ authStore.user?.first_name || authStore.user?.username || 'Jogador' }}!
        </h1>
        <p class="text-slate-400">
          <span v-if="communitiesStore.currentCommunity">
            Visualizando dados de
            <span class="text-emerald-400 font-medium">{{ communitiesStore.currentCommunity.name }}</span>.
          </span>
          <span v-else>Selecione uma comunidade na barra superior para ver seus dados.</span>
        </p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p class="text-slate-400 text-sm">Comunidades</p>
              <p class="text-2xl font-bold text-white">{{ communitiesStore.communities.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p class="text-slate-400 text-sm">Partidas Jogadas</p>
              <p class="text-2xl font-bold text-white">{{ playerStats?.matches_played ?? '—' }}</p>
            </div>
          </div>
        </div>

        <div class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p class="text-slate-400 text-sm">Gols Marcados</p>
              <p class="text-2xl font-bold text-white">{{ playerStats?.goals ?? '—' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Section -->
      <div>
        <h2 class="text-xl font-semibold text-white mb-6">Minha Performance</h2>

        <!-- No community selected -->
        <div
          v-if="!communitiesStore.currentCommunity"
          class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-10 text-center"
        >
          <div class="w-14 h-14 rounded-2xl bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p class="text-slate-400 text-sm">Selecione uma comunidade no seletor acima para ver seus gráficos de performance.</p>
        </div>

        <!-- Loading -->
        <div v-else-if="statsLoading" class="flex items-center justify-center py-16">
          <svg class="animate-spin w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>

        <!-- No player profile -->
        <div
          v-else-if="statsError"
          class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-10 text-center"
        >
          <div class="w-14 h-14 rounded-2xl bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p class="text-slate-400 text-sm">{{ statsError }}</p>
          <p class="text-slate-500 text-xs mt-1">Peça ao administrador para vincular seu usuário a um jogador desta comunidade.</p>
        </div>

        <!-- Charts -->
        <div v-else-if="playerStats" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Player Card -->
          <div class="lg:col-span-2 bg-slate-800/50 rounded-xl border border-slate-700/50 p-5 flex items-center gap-5">
            <div class="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <span class="text-2xl font-bold text-emerald-400">
                {{ myPlayer?.number ?? '?' }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-lg font-semibold text-white truncate">{{ playerStats.player_name }}</p>
              <p class="text-sm text-slate-400">{{ positionLabels[myPlayer?.position ?? ''] ?? myPlayer?.position }}</p>
            </div>
            <div class="hidden sm:flex items-center gap-6 text-center">
              <div>
                <p class="text-2xl font-bold text-emerald-400">{{ playerStats.goals }}</p>
                <p class="text-xs text-slate-500">Gols</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-blue-400">{{ playerStats.assists }}</p>
                <p class="text-xs text-slate-500">Assistências</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-amber-400">{{ playerStats.matches_played }}</p>
                <p class="text-xs text-slate-500">Partidas</p>
              </div>
            </div>
          </div>

          <!-- Bar Chart -->
          <div class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <h3 class="text-sm font-semibold text-slate-300 mb-4">Estatísticas por categoria</h3>
            <div class="h-52">
              <Bar :data="barChartData" :options="barChartOptions" />
            </div>
          </div>

          <!-- Radar Chart -->
          <div class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <h3 class="text-sm font-semibold text-slate-300 mb-4">Perfil do jogador</h3>
            <div class="h-52">
              <Radar :data="radarChartData" :options="radarChartOptions" />
            </div>
          </div>
        </div>
      </div>

      <!-- Communities List -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-white">Suas Comunidades</h2>
          <router-link
            to="/communities"
            class="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
          >
            Ver todas &rarr;
          </router-link>
        </div>

        <div v-if="communitiesStore.loading" class="flex items-center justify-center py-12">
          <svg class="animate-spin w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>

        <div v-else-if="communitiesStore.communities.length === 0" class="text-center py-12">
          <div class="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-white mb-2">Nenhuma comunidade</h3>
          <p class="text-slate-400 mb-4">Você ainda não faz parte de nenhuma comunidade.</p>
          <router-link
            to="/communities"
            class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-medium rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Criar Comunidade
          </router-link>
        </div>

        <div v-else class="grid gap-4">
          <router-link
            v-for="community in communitiesStore.communities.slice(0, 3)"
            :key="community.id"
            :to="`/communities/${community.id}`"
            class="block bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 hover:border-emerald-500/50 transition-colors group"
            @click="communitiesStore.setCurrentCommunity(community)"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-white mb-1">{{ community.name }}</h3>
                <p class="text-slate-400 text-sm line-clamp-1">{{ community.description }}</p>
              </div>
              <svg class="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
