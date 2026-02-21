<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import MatchDayDetail from '@/features/matchdays/components/MatchDayDetail.vue'

const route = useRoute()

const communityId = computed(() => route.params.communityId as string)
const leagueId = computed(() => route.params.leagueId as string)
const matchdayId = computed(() => route.params.matchdayId as string)
</script>

<template>
  <AppLayout>
    <MatchDayDetail
      :community-id="communityId"
      :league-id="leagueId"
      :matchday-id="matchdayId"
    />
  </AppLayout>
</template>
