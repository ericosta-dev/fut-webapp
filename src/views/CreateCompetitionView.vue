<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCommunitiesStore } from '@/stores/communities'
import AppLayout from '@/components/AppLayout.vue'
import LeagueForm from '@/features/leagues/components/LeagueForm.vue'
import { Card, CardContent } from '@/components/ui'
import { ArrowLeft } from 'lucide-vue-next'
import type { League } from '@/features/leagues/types'

const route = useRoute()
const router = useRouter()
const communitiesStore = useCommunitiesStore()

const communityId = computed(() => route.params.id as string)

function handleSuccess(_league: League) {
  router.push({ name: 'community-competitions', params: { id: communityId.value } })
}

function handleCancel() {
  router.push({ name: 'community-competitions', params: { id: communityId.value } })
}
</script>

<template>
  <AppLayout>
    <div class="space-y-6 animate-fade-in max-w-2xl">
      <!-- Back -->
      <router-link
        :to="{ name: 'community-competitions', params: { id: communityId } }"
        class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft :size="18" />
        Voltar para Competições
      </router-link>

      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-foreground">Nova Competição</h1>
        <p class="text-muted-foreground mt-1">
          {{ communitiesStore.currentCommunity?.name }}
        </p>
      </div>

      <!-- Form card -->
      <Card>
        <CardContent class="p-6">
          <LeagueForm
            :community-id="communityId"
            @success="handleSuccess"
            @cancel="handleCancel"
          />
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>
