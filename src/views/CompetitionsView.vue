<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCommunitiesStore } from '@/stores/communities'
import { useLeaguesStore } from '@/features/leagues/stores/leaguesStore'
import AppLayout from '@/components/AppLayout.vue'
import LeagueCard from '@/features/leagues/components/LeagueCard.vue'
import { Button } from '@/components/ui'
import { ArrowLeft, Plus, Trophy, Loader2 } from 'lucide-vue-next'
import type { LeagueFormat } from '@/features/leagues/types'

const route = useRoute()
const router = useRouter()
const communitiesStore = useCommunitiesStore()
const leaguesStore = useLeaguesStore()

const communityId = computed(() => route.params.id as string)

const activeStatus = ref<'all' | 'active' | 'upcoming' | 'finished'>('all')
const activeFormat = ref<LeagueFormat | 'all'>('all')

const statusFilters: { value: 'all' | 'active' | 'upcoming' | 'finished'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Em progresso' },
  { value: 'upcoming', label: 'Futuras' },
  { value: 'finished', label: 'Finalizadas' },
]

const formatFilters: { value: LeagueFormat | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos os formatos' },
  { value: 'CUP', label: 'Copa' },
  { value: 'LEAGUE', label: 'Liga' },
]

const filteredLeagues = computed(() => {
  return leaguesStore.leagues.filter((l) => {
    const statusMatch =
      activeStatus.value === 'all' ||
      (activeStatus.value === 'active' && l.is_active) ||
      (activeStatus.value === 'upcoming' && !l.is_active && !l.is_finished) ||
      (activeStatus.value === 'finished' && l.is_finished)

    const formatMatch = activeFormat.value === 'all' || l.format === activeFormat.value

    return statusMatch && formatMatch
  })
})

const activeCount = computed(() => leaguesStore.activeLeagues.length)
const upcomingCount = computed(() => leaguesStore.upcomingLeagues.length)
const finishedCount = computed(() => leaguesStore.finishedLeagues.length)

const hasActiveFilters = computed(
  () => activeStatus.value !== 'all' || activeFormat.value !== 'all',
)

function clearFilters() {
  activeStatus.value = 'all'
  activeFormat.value = 'all'
}

function goToCreate() {
  router.push({ name: 'competition-create', params: { id: communityId.value } })
}

function handleCardClick(leagueId: string) {
  router.push({
    name: 'league-detail',
    params: { communityId: communityId.value, leagueId },
  })
}

function goToLeagueSettings(leagueId: string) {
  router.push({
    name: 'league-settings',
    params: { communityId: communityId.value, leagueId },
  })
}

onMounted(async () => {
  await Promise.all([
    communitiesStore.fetchCommunity(communityId.value),
    leaguesStore.fetchLeagues(communityId.value),
  ])
})
</script>

<template>
  <AppLayout>
    <div class="space-y-6 animate-fade-in">
      <!-- Back -->
      <router-link
        :to="`/communities/${communityId}`"
        class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft :size="18" />
        Voltar para {{ communitiesStore.currentCommunity?.name || 'Comunidade' }}
      </router-link>

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Competições</h1>
          <p class="text-muted-foreground mt-1">
            {{ leaguesStore.leagues.length }}
            {{ leaguesStore.leagues.length === 1 ? 'competição cadastrada' : 'competições cadastradas' }}
          </p>
        </div>
        <Button @click="goToCreate">
          <Plus :size="18" class="mr-1" />
          Nova Competição
        </Button>
      </div>

      <!-- Summary chips (status counts) -->
      <div
        v-if="!leaguesStore.loading && leaguesStore.leagues.length > 0"
        class="flex flex-wrap gap-2 text-sm"
      >
        <span
          v-if="activeCount > 0"
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success font-medium"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-success" />
          {{ activeCount }} em progresso
        </span>
        <span
          v-if="upcomingCount > 0"
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 text-warning font-medium"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-warning" />
          {{ upcomingCount }} {{ upcomingCount === 1 ? 'futura' : 'futuras' }}
        </span>
        <span
          v-if="finishedCount > 0"
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium"
        >
          {{ finishedCount }} {{ finishedCount === 1 ? 'finalizada' : 'finalizadas' }}
        </span>
      </div>

      <!-- Filters -->
      <div v-if="!leaguesStore.loading && leaguesStore.leagues.length > 0" class="space-y-3">
        <!-- Status pills -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="f in statusFilters"
            :key="f.value"
            @click="activeStatus = f.value"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeStatus === f.value
                ? 'bg-primary/20 text-primary'
                : 'bg-card text-muted-foreground hover:text-foreground',
            ]"
          >
            {{ f.label }}
            <span
              v-if="f.value === 'active' && activeCount > 0"
              class="ml-1 opacity-70"
            >({{ activeCount }})</span>
            <span
              v-else-if="f.value === 'upcoming' && upcomingCount > 0"
              class="ml-1 opacity-70"
            >({{ upcomingCount }})</span>
            <span
              v-else-if="f.value === 'finished' && finishedCount > 0"
              class="ml-1 opacity-70"
            >({{ finishedCount }})</span>
          </button>

          <div class="w-px bg-border self-stretch mx-1" />

          <!-- Format pills -->
          <button
            v-for="f in formatFilters"
            :key="f.value"
            @click="activeFormat = f.value"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeFormat === f.value
                ? 'bg-primary/20 text-primary'
                : 'bg-card text-muted-foreground hover:text-foreground',
            ]"
          >
            {{ f.label }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="leaguesStore.loading" class="flex items-center justify-center py-24">
        <Loader2 :size="32" class="animate-spin text-primary" />
      </div>

      <!-- Empty — no competitions at all -->
      <div
        v-else-if="leaguesStore.leagues.length === 0"
        class="text-center py-24"
      >
        <div class="w-20 h-20 rounded-2xl bg-card flex items-center justify-center mx-auto mb-6">
          <Trophy :size="40" class="text-muted-foreground" />
        </div>
        <h3 class="text-xl font-medium text-foreground mb-2">Nenhuma competição cadastrada</h3>
        <p class="text-muted-foreground mb-6 max-w-md mx-auto">
          Crie a primeira competição desta comunidade para começar a organizar os jogos.
        </p>
        <Button @click="goToCreate" size="lg">
          <Plus :size="18" class="mr-1" />
          Criar Primeira Competição
        </Button>
      </div>

      <!-- Empty — no results for active filter -->
      <div
        v-else-if="filteredLeagues.length === 0"
        class="text-center py-16"
      >
        <p class="text-muted-foreground text-sm mb-3">
          Nenhuma competição encontrada para os filtros selecionados.
        </p>
        <button
          @click="clearFilters"
          class="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
        >
          Limpar filtros
        </button>
      </div>

      <!-- League grid -->
      <div v-else class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="league in filteredLeagues"
          :key="league.id"
          class="cursor-pointer"
          @click="handleCardClick(league.id)"
        >
          <LeagueCard :league="league" @configure="goToLeagueSettings" />
        </div>
      </div>
    </div>
  </AppLayout>
</template>
