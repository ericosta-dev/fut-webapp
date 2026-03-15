<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCommunitiesStore } from '@/stores/communities'
import { usePlayersStore } from '@/stores/players'
import { useLeaguesStore } from '@/features/leagues/stores/leaguesStore'
import AppLayout from '@/components/AppLayout.vue'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import { ArrowLeft, Settings, Users, ClipboardList, FileText, BarChart3, Plus, Loader2 } from 'lucide-vue-next'
import LeagueCard from '@/features/leagues/components/LeagueCard.vue'
import LeagueForm from '@/features/leagues/components/LeagueForm.vue'
import type { League } from '@/features/leagues/types'

const route = useRoute()
const router = useRouter()
const communitiesStore = useCommunitiesStore()
const playersStore = usePlayersStore()
const leaguesStore = useLeaguesStore()

const communityId = computed(() => route.params.id as string)
const showLeagueForm = ref(false)

onMounted(async () => {
  await Promise.all([
    communitiesStore.fetchCommunity(communityId.value),
    playersStore.fetchPlayers(communityId.value),
    leaguesStore.fetchLeagues(communityId.value),
  ])
})

const positionLabels: Record<string, string> = {
  FWD: 'Atacante',
  MID: 'Meio-Campo',
  DEF: 'Defensor',
  GK: 'Goleiro',
}

const positionVariant = (pos: string) => {
  const map: Record<string, string> = { FWD: 'destructive', MID: 'default', DEF: 'warning', GK: 'success' }
  return (map[pos] ?? 'secondary') as 'destructive' | 'default' | 'warning' | 'success' | 'secondary'
}

function handleLeagueCreated(league: League) {
  showLeagueForm.value = false
  router.push(`/communities/${communityId.value}/leagues/${league.id}`)
}

function handleLeagueClick(leagueId: string) {
  router.push(`/communities/${communityId.value}/leagues/${leagueId}`)
}
</script>

<template>
  <AppLayout>
    <div class="space-y-6 animate-fade-in">
      <!-- Back -->
      <router-link
        to="/communities"
        class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft :size="18" />
        Voltar
      </router-link>

      <!-- Loading -->
      <div v-if="communitiesStore.loading" class="flex items-center justify-center py-24">
        <Loader2 :size="32" class="animate-spin text-primary" />
      </div>

      <template v-else-if="communitiesStore.currentCommunity">
        <!-- Header -->
        <div class="bg-gradient-to-r from-primary/10 via-transparent to-accent/5 rounded-2xl border border-primary/20 p-6">
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-2xl font-bold text-foreground mb-2">{{ communitiesStore.currentCommunity.name }}</h1>
              <p class="text-muted-foreground">{{ communitiesStore.currentCommunity.description }}</p>
            </div>
            <router-link
              :to="`/communities/${communityId}/settings`"
              class="p-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Configurações da comunidade"
            >
              <Settings :size="20" />
            </router-link>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <router-link
            :to="`/communities/${communityId}/players`"
            class="group"
          >
            <Card class="hover:border-primary/50 transition-colors text-center p-4">
              <div class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <Users :size="20" class="text-primary" />
              </div>
              <p class="text-sm font-medium text-foreground">Jogadores</p>
              <p class="text-xs text-muted-foreground">{{ playersStore.players.length }} cadastrados</p>
            </Card>
          </router-link>

          <Card class="text-center p-4 opacity-60">
            <div class="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mx-auto mb-3">
              <ClipboardList :size="20" class="text-accent-foreground" />
            </div>
            <p class="text-sm font-medium text-foreground">Lista Semanal</p>
            <p class="text-xs text-muted-foreground">Em breve</p>
          </Card>

          <Card class="text-center p-4 opacity-60">
            <div class="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center mx-auto mb-3">
              <FileText :size="20" class="text-warning" />
            </div>
            <p class="text-sm font-medium text-foreground">Súmulas</p>
            <p class="text-xs text-muted-foreground">Em breve</p>
          </Card>

          <Card class="text-center p-4 opacity-60">
            <div class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-3">
              <BarChart3 :size="20" class="text-primary" />
            </div>
            <p class="text-sm font-medium text-foreground">Estatísticas</p>
            <p class="text-xs text-muted-foreground">Em breve</p>
          </Card>
        </div>

        <!-- Leagues -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-foreground">Ligas e Competições</h2>
            <Button @click="showLeagueForm = !showLeagueForm" size="sm">
              {{ showLeagueForm ? 'Cancelar' : '+ Nova Liga' }}
            </Button>
          </div>

          <!-- League Form -->
          <Card v-if="showLeagueForm" class="mb-4">
            <CardContent class="p-6">
              <h3 class="text-lg font-semibold text-foreground mb-4">Criar Nova Liga</h3>
              <LeagueForm
                :community-id="communityId"
                @success="handleLeagueCreated"
                @cancel="showLeagueForm = false"
              />
            </CardContent>
          </Card>

          <!-- Loading -->
          <div v-if="leaguesStore.loading" class="flex items-center justify-center py-8">
            <Loader2 :size="24" class="animate-spin text-primary" />
          </div>

          <!-- Empty -->
          <Card v-else-if="leaguesStore.leagues.length === 0 && !showLeagueForm" class="text-center py-8">
            <p class="text-muted-foreground">Nenhuma liga cadastrada ainda.</p>
            <button
              @click="showLeagueForm = true"
              class="inline-flex items-center gap-2 mt-4 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              <Plus :size="16" />
              Criar Primeira Liga
            </button>
          </Card>

          <!-- Grid -->
          <div v-else-if="!showLeagueForm" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="league in leaguesStore.leagues.slice(0, 4)" :key="league.id" @click="handleLeagueClick(league.id)">
              <LeagueCard :league="league" />
            </div>
          </div>

          <div v-if="leaguesStore.leagues.length > 4 && !showLeagueForm" class="text-center mt-4">
            <button
              @click="router.push(`/communities/${communityId}/leagues`)"
              class="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              Ver todas as ligas &rarr;
            </button>
          </div>
        </div>

        <!-- Recent Players -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-foreground">Jogadores Recentes</h2>
            <router-link
              :to="`/communities/${communityId}/players`"
              class="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              Ver todos &rarr;
            </router-link>
          </div>

          <div v-if="playersStore.loading" class="flex items-center justify-center py-8">
            <Loader2 :size="24" class="animate-spin text-primary" />
          </div>

          <Card v-else-if="playersStore.players.length === 0" class="text-center py-8">
            <p class="text-muted-foreground">Nenhum jogador cadastrado ainda.</p>
            <router-link
              :to="`/communities/${communityId}/players`"
              class="inline-flex items-center gap-2 mt-4 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              <Plus :size="16" />
              Adicionar Jogador
            </router-link>
          </Card>

          <div v-else class="grid gap-3">
            <Card
              v-for="player in playersStore.players.slice(0, 5)"
              :key="player.id"
              class="flex items-center gap-4 p-4"
            >
              <div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <span class="text-sm font-medium text-foreground">
                  {{ (player.nickname || player.name || '?')[0]!.toUpperCase() }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-foreground truncate">
                  {{ player.number ? `(${player.number}) ` : '' }}{{ player.nickname || player.name }}
                </p>
                <p class="text-sm text-muted-foreground">{{ positionLabels[player.position] }}</p>
              </div>
              <Badge :variant="positionVariant(player.position)">{{ player.position }}</Badge>
            </Card>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>
