<script setup lang="ts">
import { Trophy } from 'lucide-vue-next'
import type { CupTeamStanding } from '../types'

defineProps<{
  standings: CupTeamStanding[]
}>()
</script>

<template>
  <section>
    <h3 class="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
      <Trophy :size="16" class="text-accent" /> Classificação
    </h3>

    <div class="overflow-x-auto rounded-xl border border-border">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-muted text-muted-foreground uppercase text-xs tracking-wide">
            <th class="text-left px-4 py-2 font-medium">#</th>
            <th class="text-left px-4 py-2 font-medium">Time</th>
            <th class="px-3 py-2 font-medium text-center">P</th>
            <th class="px-3 py-2 font-medium text-center">J</th>
            <th class="px-3 py-2 font-medium text-center">V</th>
            <th class="px-3 py-2 font-medium text-center">E</th>
            <th class="px-3 py-2 font-medium text-center">D</th>
            <th class="px-3 py-2 font-medium text-center">GM</th>
            <th class="px-3 py-2 font-medium text-center">GS</th>
            <th class="px-3 py-2 font-medium text-center">SG</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(s, idx) in standings"
            :key="s.team_id"
            :class="[
              'border-t border-border transition-colors',
              idx === 0 ? 'bg-accent/5' : 'hover:bg-muted/40',
            ]"
          >
            <td class="px-4 py-2 text-muted-foreground tabular-nums text-xs">
              <span v-if="idx === 0" class="text-accent font-bold">★</span>
              <span v-else>{{ idx + 1 }}</span>
            </td>
            <td class="px-4 py-2 text-foreground font-medium">{{ s.team_name }}</td>
            <td class="px-3 py-2 text-center font-bold text-foreground tabular-nums">{{ s.points }}</td>
            <td class="px-3 py-2 text-center text-muted-foreground tabular-nums">{{ s.played }}</td>
            <td class="px-3 py-2 text-center text-accent tabular-nums">{{ s.wins }}</td>
            <td class="px-3 py-2 text-center text-muted-foreground tabular-nums">{{ s.draws }}</td>
            <td class="px-3 py-2 text-center text-destructive tabular-nums">{{ s.losses }}</td>
            <td class="px-3 py-2 text-center text-foreground/80 tabular-nums">{{ s.goals_for }}</td>
            <td class="px-3 py-2 text-center text-foreground/80 tabular-nums">{{ s.goals_against }}</td>
            <td
              class="px-3 py-2 text-center tabular-nums font-medium"
              :class="
                s.goal_difference > 0
                  ? 'text-accent'
                  : s.goal_difference < 0
                    ? 'text-destructive'
                    : 'text-muted-foreground'
              "
            >
              {{ s.goal_difference > 0 ? '+' : '' }}{{ s.goal_difference }}
            </td>
          </tr>

          <tr v-if="standings.length === 0">
            <td colspan="10" class="px-4 py-4 text-center text-muted-foreground text-sm italic">
              Nenhum jogo registrado ainda.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
