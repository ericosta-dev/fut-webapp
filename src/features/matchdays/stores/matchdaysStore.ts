import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  goalkeepersApi,
  goalsApi,
  matchdayGoalkeepersApi,
  matchdayTeamsApi,
  matchdaysApi,
  matchesApi,
} from '../api'
import type {
  GoalCreate,
  Match,
  MatchCreate,
  MatchDay,
  MatchDayCreate,
  MatchDayGoalkeeperCreate,
  MatchDayList,
  MatchDayTeam,
  MatchDayTeamCreate,
  MatchDayTeamUpdate,
  MatchDayUpdate,
  MatchGoalkeeperCreate,
  MatchUpdate,
  ShuffleTeamsRequest,
  TeamStanding,
} from '../types'

export const useMatchDaysStore = defineStore('matchdays', () => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const matchdays = ref<MatchDayList[]>([])
  const currentMatchDay = ref<MatchDay | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ─── Getters ─────────────────────────────────────────────────────────────────
  const draftMatchDays = computed(() =>
    matchdays.value.filter((md) => md.status === 'DRAFT'),
  )
  const inProgressMatchDays = computed(() =>
    matchdays.value.filter((md) => md.status === 'IN_PROGRESS'),
  )
  const completedMatchDays = computed(() =>
    matchdays.value.filter((md) => md.status === 'COMPLETED'),
  )

  const currentTeams = computed<MatchDayTeam[]>(() => currentMatchDay.value?.teams ?? [])
  const currentMatches = computed<Match[]>(() => currentMatchDay.value?.matches ?? [])

  /**
   * Compute teams standings from the current matchday's matches and goals.
   * Sorted by: points desc → wins desc → goal difference desc → goals for desc → goals against asc.
   */
  const standings = computed<TeamStanding[]>(() => {
    const teams = currentMatchDay.value?.teams ?? []
    const matches = currentMatchDay.value?.matches ?? []

    const standingMap: Record<string, TeamStanding> = {}
    for (const team of teams) {
      standingMap[team.id] = {
        teamId: team.id,
        name: team.name,
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        played: 0,
      }
    }

    for (const match of matches) {
      const home = standingMap[match.home_team]
      const away = standingMap[match.away_team]
      if (!home || !away) continue

      const hs = match.home_score
      const as_ = match.away_score

      home.played++
      away.played++
      home.goalsFor += hs
      home.goalsAgainst += as_
      away.goalsFor += as_
      away.goalsAgainst += hs

      if (hs > as_) {
        home.wins++
        home.points += 3
        away.losses++
      } else if (hs < as_) {
        away.wins++
        away.points += 3
        home.losses++
      } else {
        home.draws++
        away.draws++
        home.points++
        away.points++
      }
    }

    return Object.values(standingMap)
      .map((s) => ({ ...s, goalDifference: s.goalsFor - s.goalsAgainst }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.wins !== a.wins) return b.wins - a.wins
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
        return a.goalsAgainst - b.goalsAgainst
      })
  })

  // ─── MatchDay CRUD ───────────────────────────────────────────────────────────

  async function fetchMatchDays(communityId: string, leagueId: string) {
    loading.value = true
    error.value = null
    try {
      matchdays.value = await matchdaysApi.getAll(communityId, leagueId)
    } catch (e) {
      error.value = 'Erro ao carregar súmulas.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchMatchDayById(communityId: string, leagueId: string, matchdayId: string) {
    loading.value = true
    error.value = null
    try {
      currentMatchDay.value = await matchdaysApi.getById(communityId, leagueId, matchdayId)
    } catch (e) {
      error.value = 'Erro ao carregar súmula.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createMatchDay(
    communityId: string,
    leagueId: string,
    data: MatchDayCreate,
  ): Promise<MatchDay> {
    loading.value = true
    error.value = null
    try {
      const created = await matchdaysApi.create(communityId, leagueId, data)
      await fetchMatchDays(communityId, leagueId)
      return created
    } catch (e) {
      error.value = 'Erro ao criar súmula.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateMatchDay(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    data: MatchDayUpdate,
  ) {
    loading.value = true
    error.value = null
    try {
      const updated = await matchdaysApi.update(communityId, leagueId, matchdayId, data)
      if (currentMatchDay.value?.id === matchdayId) {
        currentMatchDay.value = { ...currentMatchDay.value, ...updated }
      }
      await fetchMatchDays(communityId, leagueId)
    } catch (e) {
      error.value = 'Erro ao atualizar súmula.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteMatchDay(communityId: string, leagueId: string, matchdayId: string) {
    loading.value = true
    error.value = null
    try {
      await matchdaysApi.remove(communityId, leagueId, matchdayId)
      matchdays.value = matchdays.value.filter((md) => md.id !== matchdayId)
      if (currentMatchDay.value?.id === matchdayId) currentMatchDay.value = null
    } catch (e) {
      error.value = 'Erro ao excluir súmula.'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ─── Team actions (import/shuffle) ─────────────────────────────────────────

  async function importTeams(communityId: string, leagueId: string, matchdayId: string) {
    loading.value = true
    error.value = null
    try {
      await matchdaysApi.importTeams(communityId, leagueId, matchdayId)
      await fetchMatchDayById(communityId, leagueId, matchdayId)
    } catch (e) {
      error.value = 'Erro ao importar times.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function shuffleTeams(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    payload: ShuffleTeamsRequest,
  ) {
    loading.value = true
    error.value = null
    try {
      await matchdaysApi.shuffleTeams(communityId, leagueId, matchdayId, payload)
      await fetchMatchDayById(communityId, leagueId, matchdayId)
    } catch (e) {
      error.value = 'Erro ao sortear times.'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ─── MatchDayTeam CRUD ────────────────────────────────────────────────────

  async function createTeam(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    data: MatchDayTeamCreate,
  ) {
    loading.value = true
    error.value = null
    try {
      await matchdayTeamsApi.create(communityId, leagueId, matchdayId, data)
      await fetchMatchDayById(communityId, leagueId, matchdayId)
    } catch (e) {
      error.value = 'Erro ao criar time.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateTeam(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    teamId: string,
    data: MatchDayTeamUpdate,
  ) {
    loading.value = true
    error.value = null
    try {
      await matchdayTeamsApi.update(communityId, leagueId, matchdayId, teamId, data)
      await fetchMatchDayById(communityId, leagueId, matchdayId)
    } catch (e) {
      error.value = 'Erro ao atualizar time.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteTeam(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    teamId: string,
  ) {
    loading.value = true
    error.value = null
    try {
      await matchdayTeamsApi.remove(communityId, leagueId, matchdayId, teamId)
      await fetchMatchDayById(communityId, leagueId, matchdayId)
    } catch (e) {
      error.value = 'Erro ao excluir time.'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ─── Match CRUD ──────────────────────────────────────────────────────────────

  async function createMatch(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    data: MatchCreate,
  ) {
    loading.value = true
    error.value = null
    try {
      await matchesApi.create(communityId, leagueId, matchdayId, data)
      await fetchMatchDayById(communityId, leagueId, matchdayId)
    } catch (e) {
      error.value = 'Erro ao criar partida.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateMatch(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    matchId: string,
    data: MatchUpdate,
  ) {
    loading.value = true
    error.value = null
    try {
      await matchesApi.update(communityId, leagueId, matchdayId, matchId, data)
      await fetchMatchDayById(communityId, leagueId, matchdayId)
    } catch (e) {
      error.value = 'Erro ao atualizar partida.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteMatch(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    matchId: string,
  ) {
    loading.value = true
    error.value = null
    try {
      await matchesApi.remove(communityId, leagueId, matchdayId, matchId)
      await fetchMatchDayById(communityId, leagueId, matchdayId)
    } catch (e) {
      error.value = 'Erro ao excluir partida.'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ─── Reset ────────────────────────────────────────────────────────────────────

  function $reset() {
    matchdays.value = []
    currentMatchDay.value = null
    loading.value = false
    error.value = null
  }

  // ─── Goal CRUD ──────────────────────────────────────────────────────────────

  async function createGoal(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    matchId: string,
    data: GoalCreate,
  ) {
    loading.value = true
    error.value = null
    try {
      await goalsApi.create(communityId, leagueId, matchdayId, matchId, data)
      await fetchMatchDayById(communityId, leagueId, matchdayId)
    } catch (e) {
      error.value = 'Erro ao registrar gol.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteGoal(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    matchId: string,
    goalId: string,
  ) {
    loading.value = true
    error.value = null
    try {
      await goalsApi.remove(communityId, leagueId, matchdayId, matchId, goalId)
      await fetchMatchDayById(communityId, leagueId, matchdayId)
    } catch (e) {
      error.value = 'Erro ao remover gol.'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ─── Goalkeeper CRUD ─────────────────────────────────────────────────────────

  async function addGoalkeeper(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    matchId: string,
    data: MatchGoalkeeperCreate,
  ) {
    loading.value = true
    error.value = null
    try {
      await goalkeepersApi.create(communityId, leagueId, matchdayId, matchId, data)
      await fetchMatchDayById(communityId, leagueId, matchdayId)
    } catch (e) {
      error.value = 'Erro ao adicionar goleiro.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function removeGoalkeeper(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    matchId: string,
    goalkeeperId: string,
  ) {
    loading.value = true
    error.value = null
    try {
      await goalkeepersApi.remove(communityId, leagueId, matchdayId, matchId, goalkeeperId)
      await fetchMatchDayById(communityId, leagueId, matchdayId)
    } catch (e) {
      error.value = 'Erro ao remover goleiro.'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ─── MatchDay Goalkeeper pool CRUD ────────────────────────────────────────

  async function addMatchDayGoalkeeper(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    data: MatchDayGoalkeeperCreate,
  ) {
    loading.value = true
    error.value = null
    try {
      await matchdayGoalkeepersApi.create(communityId, leagueId, matchdayId, data)
      await fetchMatchDayById(communityId, leagueId, matchdayId)
    } catch (e) {
      error.value = 'Erro ao adicionar goleiro na s\u00famula.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function removeMatchDayGoalkeeper(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    goalkeeperId: string,
  ) {
    loading.value = true
    error.value = null
    try {
      await matchdayGoalkeepersApi.remove(communityId, leagueId, matchdayId, goalkeeperId)
      await fetchMatchDayById(communityId, leagueId, matchdayId)
    } catch (e) {
      error.value = 'Erro ao remover goleiro da s\u00famula.'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    matchdays,
    currentMatchDay,
    loading,
    error,
    // Getters
    draftMatchDays,
    inProgressMatchDays,
    completedMatchDays,
    currentTeams,
    currentMatches,
    standings,
    // MatchDay
    fetchMatchDays,
    fetchMatchDayById,
    createMatchDay,
    updateMatchDay,
    deleteMatchDay,
    // Teams
    importTeams,
    shuffleTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    // Matches
    createMatch,
    updateMatch,
    deleteMatch,
    // Goals
    createGoal,
    deleteGoal,
    // Match Goalkeepers
    addGoalkeeper,
    removeGoalkeeper,
    // MatchDay Goalkeeper pool
    addMatchDayGoalkeeper,
    removeMatchDayGoalkeeper,
    $reset,
  }
})
