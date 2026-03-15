<script setup lang="ts">
import { computed } from 'vue'
import { useMatchDaysStore } from '../stores/matchdaysStore'
import { Badge } from '@/components/ui'
import { Trophy, Target, Crosshair, AlertCircle, Shield } from 'lucide-vue-next'
import type { Match } from '../types'

const store = useMatchDaysStore()

const matchday = computed(() => store.currentMatchDay)
const matches = computed(() => store.currentMatches)
const standings = computed(() => store.standings)

interface ScorerEntry {
  playerId: string
  name: string
  goals: number
  assists: number
}

const scorerMap = computed(() => {
  const map: Record<string, ScorerEntry> = {}
  for (const match of matches.value) {
    for (const goal of match.goals) {
      if (!goal.is_own_goal) {
        if (!map[goal.player]) {
          map[goal.player] = {
            playerId: goal.player,
            name: goal.player_detail?.nickname || goal.player_detail?.name || '?',
            goals: 0,
            assists: 0,
          }
        }
        map[goal.player]!.goals++
      }
      if (goal.assisted_by && goal.assisted_by_detail) {
        if (!map[goal.assisted_by]) {
          map[goal.assisted_by] = {
            playerId: goal.assisted_by,
            name: goal.assisted_by_detail.nickname || goal.assisted_by_detail.name || '?',
            goals: 0,
            assists: 0,
          }
        }
        map[goal.assisted_by]!.assists++
      }
    }
  }
  return map
})

const topScorers = computed(() =>
  Object.values(scorerMap.value)
    .filter((s) => s.goals > 0)
    .sort((a, b) => b.goals - a.goals),
)

const topAssists = computed(() =>
  Object.values(scorerMap.value)
    .filter((s) => s.assists > 0)
    .sort((a, b) => b.assists - a.assists),
)

interface OwnGoalEntry {
  player: string
  matchLabel: string
}

const ownGoals = computed<OwnGoalEntry[]>(() => {
  const result: OwnGoalEntry[] = []
  for (const match of matches.value) {
    for (const goal of match.goals) {
      if (goal.is_own_goal) {
        result.push({
          player: goal.player_detail?.nickname || goal.player_detail?.name || '?',
          matchLabel: `${match.home_team_detail?.name} × ${match.away_team_detail?.name}`,
        })
      }
    }
  }
  return result
})

interface GkEntry {
  matchLabel: string
  home: string | null
  away: string | null
}

function gkEntries(match: Match): GkEntry {
  const homeGk = match.goalkeepers.find((gk) => gk.team === match.home_team)
  const awayGk = match.goalkeepers.find((gk) => gk.team === match.away_team)
  return {
    matchLabel: `${match.home_team_detail?.name} × ${match.away_team_detail?.name}`,
    home: homeGk ? (homeGk.player_detail?.nickname || homeGk.player_detail?.name || '?') : null,
    away: awayGk ? (awayGk.player_detail?.nickname || awayGk.player_detail?.name || '?') : null,
  }
}

const goalkeepersPerMatch = computed(() => matches.value.map(gkEntries))

interface GoalkeeperRanking {
  playerId: string
  name: string
  gamesPlayed: number
  goalsConceded: number
}

const goalkeeperRanking = computed<GoalkeeperRanking[]>(() => {
  const map: Record<string, GoalkeeperRanking> = {}
  for (const match of matches.value) {
    const homeGk = match.goalkeepers.find((gk) => gk.team === match.home_team)
    const awayGk = match.goalkeepers.find((gk) => gk.team === match.away_team)
    if (homeGk?.player_detail) {
      if (!map[homeGk.player]) {
        map[homeGk.player] = {
          playerId: homeGk.player,
          name: homeGk.player_detail.nickname || homeGk.player_detail.name,
          gamesPlayed: 0,
          goalsConceded: 0,
        }
      }
      map[homeGk.player]!.gamesPlayed++
      map[homeGk.player]!.goalsConceded += match.away_score
    }
    if (awayGk?.player_detail) {
      if (!map[awayGk.player]) {
        map[awayGk.player] = {
          playerId: awayGk.player,
          name: awayGk.player_detail.nickname || awayGk.player_detail.name,
          gamesPlayed: 0,
          goalsConceded: 0,
        }
      }
      map[awayGk.player]!.gamesPlayed++
      map[awayGk.player]!.goalsConceded += match.home_score
    }
  }
  return Object.values(map).sort((a, b) => {
    if (a.goalsConceded !== b.goalsConceded) return a.goalsConceded - b.goalsConceded
    return b.gamesPlayed - a.gamesPlayed
  })
})
</script>

<template>
  <div v-if="matchday" class="space-y-6">

    <!-- Standings -->
    <section>
      <h3 class="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
        <Trophy :size="16" class="text-accent" /> Classificação
      </h3>
      <div class="overflow-x-auto rounded-xl border border-border">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-muted text-muted-foreground uppercase text-xs tracking-wide">
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
              :key="s.teamId"
              :class="[
                'border-t border-border transition-colors',
                idx === 0 ? 'bg-accent/5' : 'hover:bg-muted/40',
              ]"
            >
              <td class="px-4 py-2 text-foreground font-medium">
                <span v-if="idx === 0" class="text-accent mr-1">★</span>
                {{ s.name }}
              </td>
              <td class="px-3 py-2 text-center font-bold text-foreground tabular-nums">{{ s.points }}</td>
              <td class="px-3 py-2 text-center text-muted-foreground tabular-nums">{{ s.played }}</td>
              <td class="px-3 py-2 text-center text-accent tabular-nums">{{ s.wins }}</td>
              <td class="px-3 py-2 text-center text-muted-foreground tabular-nums">{{ s.draws }}</td>
              <td class="px-3 py-2 text-center text-destructive tabular-nums">{{ s.losses }}</td>
              <td class="px-3 py-2 text-center text-foreground/80 tabular-nums">{{ s.goalsFor }}</td>
              <td class="px-3 py-2 text-center text-foreground/80 tabular-nums">{{ s.goalsAgainst }}</td>
              <td
                class="px-3 py-2 text-center tabular-nums font-medium"
                :class="s.goalDifference > 0 ? 'text-accent' : s.goalDifference < 0 ? 'text-destructive' : 'text-muted-foreground'"
              >
                {{ s.goalDifference > 0 ? '+' : '' }}{{ s.goalDifference }}
              </td>
            </tr>
            <tr v-if="standings.length === 0">
              <td colspan="9" class="px-4 py-4 text-center text-muted-foreground text-sm italic">
                Nenhum jogo registrado ainda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Scores -->
    <section>
      <h3 class="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
        <Target :size="16" class="text-primary" /> Placares
      </h3>
      <div class="space-y-2">
        <div
          v-for="m in matches"
          :key="m.id"
          class="flex items-center gap-3 bg-muted/40 rounded-lg px-4 py-2.5 text-sm"
        >
          <span class="text-foreground/90 flex-1 text-right">{{ m.home_team_detail?.name }}</span>
          <span class="font-bold text-foreground tabular-nums bg-background px-2 py-0.5 rounded border border-border text-base">
            {{ m.home_score }} × {{ m.away_score }}
          </span>
          <span class="text-foreground/90 flex-1">{{ m.away_team_detail?.name }}</span>
        </div>
        <p v-if="matches.length === 0" class="text-sm text-muted-foreground italic">
          Nenhuma partida registrada.
        </p>
      </div>
    </section>

    <!-- Scorers & Assists -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <section>
        <h3 class="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Trophy :size="16" class="text-accent" /> Artilheiros
        </h3>
        <ol class="space-y-1.5">
          <li
            v-for="(s, idx) in topScorers"
            :key="s.playerId"
            class="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2 text-sm"
          >
            <span class="text-muted-foreground w-5 text-xs tabular-nums">{{ idx + 1 }}.</span>
            <span class="text-foreground/90 flex-1">{{ s.name }}</span>
            <Badge variant="accent" class="tabular-nums">{{ s.goals }} gol{{ s.goals !== 1 ? 's' : '' }}</Badge>
          </li>
          <li v-if="topScorers.length === 0" class="text-sm text-muted-foreground italic px-1">
            Nenhum gol registrado.
          </li>
        </ol>
      </section>

      <section>
        <h3 class="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Crosshair :size="16" class="text-primary" /> Assistências
        </h3>
        <ol class="space-y-1.5">
          <li
            v-for="(s, idx) in topAssists"
            :key="s.playerId"
            class="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2 text-sm"
          >
            <span class="text-muted-foreground w-5 text-xs tabular-nums">{{ idx + 1 }}.</span>
            <span class="text-foreground/90 flex-1">{{ s.name }}</span>
            <Badge variant="default" class="tabular-nums">{{ s.assists }}</Badge>
          </li>
          <li v-if="topAssists.length === 0" class="text-sm text-muted-foreground italic px-1">
            Nenhuma assistência registrada.
          </li>
        </ol>
      </section>
    </div>

    <!-- Own Goals -->
    <section v-if="ownGoals.length > 0">
      <h3 class="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
        <AlertCircle :size="16" class="text-destructive" /> Gols Contra
      </h3>
      <ul class="space-y-1.5">
        <li
          v-for="(og, idx) in ownGoals"
          :key="idx"
          class="flex items-center gap-3 bg-muted/40 rounded-lg px-3 py-2 text-sm"
        >
          <span class="text-destructive font-medium">{{ og.player }}</span>
          <span class="text-muted-foreground text-xs">em {{ og.matchLabel }}</span>
        </li>
      </ul>
    </section>

    <!-- Goalkeepers -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <section>
        <h3 class="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Shield :size="16" class="text-primary" /> Goleiros por Partida
        </h3>
        <div class="space-y-2">
          <div
            v-for="entry in goalkeepersPerMatch"
            :key="entry.matchLabel"
            class="bg-muted/40 rounded-lg px-4 py-2.5 text-sm"
          >
            <p class="text-muted-foreground text-xs mb-1">{{ entry.matchLabel }}</p>
            <div class="flex gap-4 text-foreground/90">
              <span>{{ entry.home ?? '—' }}</span>
              <span class="text-muted-foreground/40">•</span>
              <span>{{ entry.away ?? '—' }}</span>
            </div>
          </div>
          <p v-if="matches.length === 0" class="text-sm text-muted-foreground italic">
            Nenhuma partida registrada.
          </p>
        </div>
      </section>

      <section v-if="goalkeeperRanking.length > 0">
        <h3 class="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Shield :size="16" class="text-accent" /> Menos Vazados
        </h3>
        <ol class="space-y-1.5">
          <li
            v-for="(gk, idx) in goalkeeperRanking"
            :key="gk.playerId"
            class="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2 text-sm"
          >
            <span class="text-muted-foreground w-5 text-xs tabular-nums">{{ idx + 1 }}.</span>
            <span class="text-foreground/90 flex-1">{{ gk.name }}</span>
            <span class="text-xs text-muted-foreground mr-2">{{ gk.gamesPlayed }}J</span>
            <span
              class="font-bold tabular-nums"
              :class="gk.goalsConceded === 0 ? 'text-accent' : 'text-foreground/80'"
            >
              {{ gk.goalsConceded }} gc
            </span>
          </li>
        </ol>
      </section>
    </div>

  </div>

  <div v-else class="text-center py-8 text-muted-foreground">
    Carregando resumo...
  </div>
</template>
