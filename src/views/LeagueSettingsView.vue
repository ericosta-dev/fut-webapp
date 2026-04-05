<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import LeagueForm from '@/features/leagues/components/LeagueForm.vue'
import { useLeaguesStore } from '@/features/leagues/stores/leaguesStore'
import { useCommunitiesStore } from '@/stores/communities'
import { Card, CardContent } from '@/components/ui'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import type { League } from '@/features/leagues/types'

const route = useRoute()
const router = useRouter()
const communitiesStore = useCommunitiesStore()
const leaguesStore = useLeaguesStore()

const communityId = computed(() => route.params.communityId as string)
const leagueId = computed(() => route.params.leagueId as string)

const pageLoading = computed(
  () => leaguesStore.loading && leaguesStore.currentLeague?.id !== leagueId.value,
)

onMounted(async () => {
  await Promise.all([
    communitiesStore.fetchCommunity(communityId.value),
    leaguesStore.fetchLeagueById(communityId.value, leagueId.value),
  ])
})

function handleSuccess(league: League) {
  router.push({
    name: 'league-detail',
    params: { communityId: communityId.value, leagueId: league.id },
  })
}

function handleCancel() {
  router.push({
    name: 'community-competitions',
    params: { id: communityId.value },
  })
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl space-y-6 animate-fade-in">
      <router-link
        :to="{ name: 'community-competitions', params: { id: communityId } }"
        class="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft :size="18" />
        Voltar para Competições
      </router-link>

      <div>
        <h1 class="text-2xl font-bold text-foreground">Configurações da Liga</h1>
        <p class="mt-1 text-muted-foreground">
          {{ leaguesStore.currentLeague?.name || communitiesStore.currentCommunity?.name }}
        </p>
      </div>

      <div v-if="pageLoading" class="flex items-center justify-center py-24">
        <Loader2 :size="32" class="animate-spin text-primary" />
      </div>

      <Card v-else>
        <CardContent class="p-6">
          <LeagueForm
            :community-id="communityId"
            :league-id="leagueId"
            :initial-league="leaguesStore.currentLeague"
            mode="edit"
            @success="handleSuccess"
            @cancel="handleCancel"
          />
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>