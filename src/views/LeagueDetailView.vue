<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import LeagueDetail from '@/features/leagues/components/LeagueDetail.vue'

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
    <div class="space-y-6">
      <!-- Back Button -->
      <button
        @click="goBack"
        class="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Voltar para Comunidade
      </button>

      <!-- League Detail Component -->
      <LeagueDetail :community-id="communityId" :league-id="leagueId" />
    </div>
  </AppLayout>
</template>
