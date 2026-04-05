<script setup lang="ts">
import { ref } from 'vue'
import { Medal } from 'lucide-vue-next'
import type { CommunityRanking } from '@/types'

defineProps<{
  rankings: CommunityRanking
  loading?: boolean
}>()

const activeTab = ref<'goals' | 'assists'>('goals')
</script>

<template>
  <section class="rounded-xl border border-border bg-card overflow-hidden">
    <div class="px-4 py-3 border-b border-border flex items-center gap-2">
      <Medal :size="16" class="text-accent" />
      <h3 class="text-sm font-semibold text-foreground">Rankings</h3>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-border">
      <button
        class="flex-1 px-4 py-2 text-xs font-medium transition-colors"
        :class="
          activeTab === 'goals'
            ? 'text-accent border-b-2 border-accent bg-accent/5'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="activeTab = 'goals'"
      >
        Artilharia
      </button>
      <button
        class="flex-1 px-4 py-2 text-xs font-medium transition-colors"
        :class="
          activeTab === 'assists'
            ? 'text-accent border-b-2 border-accent bg-accent/5'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="activeTab = 'assists'"
      >
        Assistências
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="px-4 py-6 text-center">
      <div class="animate-pulse space-y-2">
        <div v-for="i in 5" :key="i" class="h-6 bg-muted rounded-lg" />
      </div>
    </div>

    <!-- Goals ranking -->
    <div v-else-if="activeTab === 'goals'" class="divide-y divide-border">
      <div
        v-for="entry in rankings.top_goals"
        :key="entry.player_id"
        class="flex items-center px-4 py-2 gap-3"
        :class="entry.rank === 1 ? 'bg-accent/5' : 'hover:bg-muted/40'"
      >
        <span class="w-6 text-xs tabular-nums text-muted-foreground">
          <span v-if="entry.rank === 1" class="text-accent font-bold">★</span>
          <span v-else>{{ entry.rank }}</span>
        </span>
        <span class="flex-1 text-sm text-foreground font-medium truncate">
          {{ entry.player_name }}
        </span>
        <span class="text-sm font-bold text-foreground tabular-nums">
          {{ entry.total }}
        </span>
      </div>
      <div
        v-if="rankings.top_goals.length === 0"
        class="px-4 py-6 text-center text-muted-foreground text-sm italic"
      >
        Nenhum gol registrado ainda.
      </div>
    </div>

    <!-- Assists ranking -->
    <div v-else class="divide-y divide-border">
      <div
        v-for="entry in rankings.top_assists"
        :key="entry.player_id"
        class="flex items-center px-4 py-2 gap-3"
        :class="entry.rank === 1 ? 'bg-accent/5' : 'hover:bg-muted/40'"
      >
        <span class="w-6 text-xs tabular-nums text-muted-foreground">
          <span v-if="entry.rank === 1" class="text-accent font-bold">★</span>
          <span v-else>{{ entry.rank }}</span>
        </span>
        <span class="flex-1 text-sm text-foreground font-medium truncate">
          {{ entry.player_name }}
        </span>
        <span class="text-sm font-bold text-foreground tabular-nums">
          {{ entry.total }}
        </span>
      </div>
      <div
        v-if="rankings.top_assists.length === 0"
        class="px-4 py-6 text-center text-muted-foreground text-sm italic"
      >
        Nenhuma assistência registrada ainda.
      </div>
    </div>
  </section>
</template>
