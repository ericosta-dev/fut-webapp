<script setup lang="ts">
import { computed } from 'vue'
import { useMatchDaysStore } from '../stores/matchdaysStore'
import type { Match } from '../types'

const store = useMatchDaysStore()

const matchday = computed(() => store.currentMatchDay)
const matches = computed(() => store.currentMatches)
const standings = computed(() => store.standings)

// ─── Top Scorers ──────────────────────────────────────────────────────────────
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
            name:
              goal.assisted_by_detail.nickname || goal.assisted_by_detail.name || '?',
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

// ─── Own Goals ─────────────────────────────────────────────────────────────────
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

// ─── Goalkeepers per match ─────────────────────────────────────────────────────
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

// ─── Goalkeeper Ranking (least goals conceded) ────────────────────────────────
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

    <!-- ── Tabela de Classificação ── -->
    <section>
      <h3 class="text-base font-semibold text-white mb-3 flex items-center gap-2">
        🏆 Classificação
      </h3>
      <div class="overflow-x-auto rounded-xl border border-slate-700/50">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-800/80 text-slate-400 uppercase text-xs tracking-wide">
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
                'border-t border-slate-700/30 transition-colors',
                idx === 0 ? 'bg-emerald-500/5' : 'hover:bg-slate-800/40',
              ]"
            >
              <td class="px-4 py-2 text-slate-200 font-medium">
                <span v-if="idx === 0" class="text-emerald-400 mr-1">★</span>
                {{ s.name }}
              </td>
              <td class="px-3 py-2 text-center font-bold text-white tabular-nums">{{ s.points }}</td>
              <td class="px-3 py-2 text-center text-slate-400 tabular-nums">{{ s.played }}</td>
              <td class="px-3 py-2 text-center text-emerald-400 tabular-nums">{{ s.wins }}</td>
              <td class="px-3 py-2 text-center text-slate-400 tabular-nums">{{ s.draws }}</td>
              <td class="px-3 py-2 text-center text-red-400 tabular-nums">{{ s.losses }}</td>
              <td class="px-3 py-2 text-center text-slate-300 tabular-nums">{{ s.goalsFor }}</td>
              <td class="px-3 py-2 text-center text-slate-300 tabular-nums">{{ s.goalsAgainst }}</td>
              <td
                class="px-3 py-2 text-center tabular-nums font-medium"
                :class="s.goalDifference > 0 ? 'text-emerald-400' : s.goalDifference < 0 ? 'text-red-400' : 'text-slate-400'"
              >
                {{ s.goalDifference > 0 ? '+' : '' }}{{ s.goalDifference }}
              </td>
            </tr>
            <tr v-if="standings.length === 0">
              <td colspan="9" class="px-4 py-4 text-center text-slate-500 text-sm italic">
                Nenhum jogo registrado ainda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ── Placares ── -->
    <section>
      <h3 class="text-base font-semibold text-white mb-3">⚽ Placares</h3>
      <div class="space-y-2">
        <div
          v-for="m in matches"
          :key="m.id"
          class="flex items-center gap-3 bg-slate-800/40 rounded-lg px-4 py-2.5 text-sm"
        >
          <span class="text-slate-200 flex-1 text-right">{{ m.home_team_detail?.name }}</span>
          <span class="font-bold text-white tabular-nums bg-slate-900/60 px-2 py-0.5 rounded text-base">
            {{ m.home_score }} × {{ m.away_score }}
          </span>
          <span class="text-slate-200 flex-1">{{ m.away_team_detail?.name }}</span>
        </div>
        <p v-if="matches.length === 0" class="text-sm text-slate-500 italic">
          Nenhuma partida registrada.
        </p>
      </div>
    </section>

    <!-- ── Artilheiros & Assistências ── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Artilheiros -->
      <section>
        <h3 class="text-base font-semibold text-white mb-3">🥇 Artilheiros</h3>
        <ol class="space-y-1.5">
          <li
            v-for="(s, idx) in topScorers"
            :key="s.playerId"
            class="flex items-center justify-between bg-slate-800/40 rounded-lg px-3 py-2 text-sm"
          >
            <span class="text-slate-400 w-5 text-xs tabular-nums">{{ idx + 1 }}.</span>
            <span class="text-slate-200 flex-1">{{ s.name }}</span>
            <span class="text-emerald-400 font-bold tabular-nums">{{ s.goals }} gol{{ s.goals !== 1 ? 's' : '' }}</span>
          </li>
          <li v-if="topScorers.length === 0" class="text-sm text-slate-500 italic px-1">
            Nenhum gol registrado.
          </li>
        </ol>
      </section>

      <!-- Assistências -->
      <section>
        <h3 class="text-base font-semibold text-white mb-3">🎯 Assistências</h3>
        <ol class="space-y-1.5">
          <li
            v-for="(s, idx) in topAssists"
            :key="s.playerId"
            class="flex items-center justify-between bg-slate-800/40 rounded-lg px-3 py-2 text-sm"
          >
            <span class="text-slate-400 w-5 text-xs tabular-nums">{{ idx + 1 }}.</span>
            <span class="text-slate-200 flex-1">{{ s.name }}</span>
            <span class="text-blue-400 font-bold tabular-nums">{{ s.assists }}</span>
          </li>
          <li v-if="topAssists.length === 0" class="text-sm text-slate-500 italic px-1">
            Nenhuma assistência registrada.
          </li>
        </ol>
      </section>
    </div>

    <!-- ── Gols Contra ── -->
    <section v-if="ownGoals.length > 0">
      <h3 class="text-base font-semibold text-white mb-3">🔴 Gols Contra</h3>
      <ul class="space-y-1.5">
        <li
          v-for="(og, idx) in ownGoals"
          :key="idx"
          class="flex items-center gap-3 bg-slate-800/40 rounded-lg px-3 py-2 text-sm"
        >
          <span class="text-red-400 font-medium">{{ og.player }}</span>
          <span class="text-slate-500 text-xs">em {{ og.matchLabel }}</span>
        </li>
      </ul>
    </section>

    <!-- ── Goleiros ── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Goleiros por partida -->
      <section>
        <h3 class="text-base font-semibold text-white mb-3">🧤 Goleiros por Partida</h3>
        <div class="space-y-2">
          <div
            v-for="entry in goalkeepersPerMatch"
            :key="entry.matchLabel"
            class="bg-slate-800/40 rounded-lg px-4 py-2.5 text-sm"
          >
            <p class="text-slate-400 text-xs mb-1">{{ entry.matchLabel }}</p>
            <div class="flex gap-4 text-slate-200">
              <span>{{ entry.home ?? '—' }}</span>
              <span class="text-slate-600">•</span>
              <span>{{ entry.away ?? '—' }}</span>
            </div>
          </div>
          <p v-if="matches.length === 0" class="text-sm text-slate-500 italic">
            Nenhuma partida registrada.
          </p>
        </div>
      </section>

      <!-- Ranking de goleiros menos vazados -->
      <section v-if="goalkeeperRanking.length > 0">
        <h3 class="text-base font-semibold text-white mb-3">🛡️ Menos Vazados</h3>
        <ol class="space-y-1.5">
          <li
            v-for="(gk, idx) in goalkeeperRanking"
            :key="gk.playerId"
            class="flex items-center justify-between bg-slate-800/40 rounded-lg px-3 py-2 text-sm"
          >
            <span class="text-slate-400 w-5 text-xs tabular-nums">{{ idx + 1 }}.</span>
            <span class="text-slate-200 flex-1">{{ gk.name }}</span>
            <span class="text-xs text-slate-500 mr-2">{{ gk.gamesPlayed }}J</span>
            <span
              class="font-bold tabular-nums"
              :class="gk.goalsConceded === 0 ? 'text-emerald-400' : 'text-slate-300'"
            >
              {{ gk.goalsConceded }} gc
            </span>
          </li>
        </ol>
      </section>
    </div>

  </div>

  <div v-else class="text-center py-8 text-slate-500">
    Carregando resumo...
  </div>
</template>
