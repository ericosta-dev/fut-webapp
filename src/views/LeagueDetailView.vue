<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import LeagueDetail from '@/features/leagues/components/LeagueDetail.vue'
import { ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const communityId = computed(() => route.params.communityId as string)
const leagueId = computed(() => route.params.leagueId as string)

function goBack() {
  router.push(`/communities/${communityId.value}`)
}
</script>

<template>
  <AppLayout>
    <div class="space-y-6 animate-fade-in">
      <button
        @click="goBack"
        class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft :size="18" />
        Voltar para Comunidade
      </button>

      <LeagueDetail :community-id="communityId" :league-id="leagueId" />
    </div>
  </AppLayout>
</template>
