import { apiClient } from '@/api/client'
import type { PaginatedResponse } from '@/types'
import type {
  Goal,
  GoalCreate,
  Match,
  MatchCreate,
  MatchDay,
  MatchDayCreate,
  MatchDayGoalkeeper,
  MatchDayGoalkeeperCreate,
  MatchDayList,
  MatchDayTeam,
  MatchDayTeamCreate,
  MatchDayTeamUpdate,
  MatchDayUpdate,
  MatchGoalkeeper,
  MatchGoalkeeperCreate,
  MatchUpdate,
  ShuffleTeamsRequest,
} from './types'

// ─── Base URL helpers ────────────────────────────────────────────────────────

function matchdaysBase(communityId: string, leagueId: string) {
  return `/communities/${communityId}/leagues/${leagueId}/matchdays/`
}

function matchdayBase(communityId: string, leagueId: string, matchdayId: string) {
  return `/communities/${communityId}/leagues/${leagueId}/matchdays/${matchdayId}/`
}

function teamsBase(communityId: string, leagueId: string, matchdayId: string) {
  return `${matchdayBase(communityId, leagueId, matchdayId)}teams/`
}

function matchesBase(communityId: string, leagueId: string, matchdayId: string) {
  return `${matchdayBase(communityId, leagueId, matchdayId)}matches/`
}

function matchBase(communityId: string, leagueId: string, matchdayId: string, matchId: string) {
  return `${matchesBase(communityId, leagueId, matchdayId)}${matchId}/`
}

function goalsBase(
  communityId: string,
  leagueId: string,
  matchdayId: string,
  matchId: string,
) {
  return `${matchBase(communityId, leagueId, matchdayId, matchId)}goals/`
}

function goalkeepersBase(
  communityId: string,
  leagueId: string,
  matchdayId: string,
  matchId: string,
) {
  return `${matchBase(communityId, leagueId, matchdayId, matchId)}goalkeepers/`
}

function matchdayGoalkeepersBase(communityId: string, leagueId: string, matchdayId: string) {
  return `${matchdayBase(communityId, leagueId, matchdayId)}goalkeepers/`
}

// ─── MatchDay endpoints ──────────────────────────────────────────────────────

export const matchdaysApi = {
  /** List all matchdays for a league */
  getAll(communityId: string, leagueId: string): Promise<MatchDayList[]> {
    return apiClient
      .get<PaginatedResponse<MatchDayList>>(matchdaysBase(communityId, leagueId))
      .then((r) => r.data.results)
  },

  /** Get a single matchday with teams and matches */
  getById(communityId: string, leagueId: string, matchdayId: string): Promise<MatchDay> {
    return apiClient
      .get<MatchDay>(matchdayBase(communityId, leagueId, matchdayId))
      .then((r) => r.data)
  },

  /** Create a new matchday */
  create(communityId: string, leagueId: string, data: MatchDayCreate): Promise<MatchDay> {
    return apiClient
      .post<MatchDay>(matchdaysBase(communityId, leagueId), data)
      .then((r) => r.data)
  },

  /** Update a matchday (PATCH) */
  update(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    data: MatchDayUpdate,
  ): Promise<MatchDay> {
    return apiClient
      .patch<MatchDay>(matchdayBase(communityId, leagueId, matchdayId), data)
      .then((r) => r.data)
  },

  /** Delete a matchday */
  remove(communityId: string, leagueId: string, matchdayId: string): Promise<void> {
    return apiClient.delete(matchdayBase(communityId, leagueId, matchdayId)).then(() => undefined)
  },

  /**
   * CUP only — import league teams into this matchday as MatchDayTeams.
   * Copies players from each league team; source_team is populated.
   */
  importTeams(communityId: string, leagueId: string, matchdayId: string): Promise<MatchDayTeam[]> {
    return apiClient
      .post<MatchDayTeam[]>(`${matchdayBase(communityId, leagueId, matchdayId)}import-teams/`, {})
      .then((r) => r.data)
  },

  /**
   * Randomly distributes players into N teams within this matchday.
   * Deletes existing matchday teams before creating new ones.
   */
  shuffleTeams(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    payload: ShuffleTeamsRequest,
  ): Promise<MatchDayTeam[]> {
    return apiClient
      .post<MatchDayTeam[]>(
        `${matchdayBase(communityId, leagueId, matchdayId)}shuffle-teams/`,
        payload,
      )
      .then((r) => r.data)
  },
}

// ─── MatchDayTeam endpoints ──────────────────────────────────────────────────

export const matchdayTeamsApi = {
  getAll(communityId: string, leagueId: string, matchdayId: string): Promise<MatchDayTeam[]> {
    return apiClient
      .get<PaginatedResponse<MatchDayTeam>>(teamsBase(communityId, leagueId, matchdayId))
      .then((r) => r.data.results)
  },

  create(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    data: MatchDayTeamCreate,
  ): Promise<MatchDayTeam> {
    return apiClient
      .post<MatchDayTeam>(teamsBase(communityId, leagueId, matchdayId), data)
      .then((r) => r.data)
  },

  update(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    teamId: string,
    data: MatchDayTeamUpdate,
  ): Promise<MatchDayTeam> {
    return apiClient
      .patch<MatchDayTeam>(`${teamsBase(communityId, leagueId, matchdayId)}${teamId}/`, data)
      .then((r) => r.data)
  },

  remove(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    teamId: string,
  ): Promise<void> {
    return apiClient
      .delete(`${teamsBase(communityId, leagueId, matchdayId)}${teamId}/`)
      .then(() => undefined)
  },
}

// ─── Match endpoints ─────────────────────────────────────────────────────────

export const matchesApi = {
  getAll(communityId: string, leagueId: string, matchdayId: string): Promise<Match[]> {
    return apiClient
      .get<PaginatedResponse<Match>>(matchesBase(communityId, leagueId, matchdayId))
      .then((r) => r.data.results)
  },

  create(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    data: MatchCreate,
  ): Promise<Match> {
    return apiClient
      .post<Match>(matchesBase(communityId, leagueId, matchdayId), data)
      .then((r) => r.data)
  },

  update(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    matchId: string,
    data: MatchUpdate,
  ): Promise<Match> {
    return apiClient
      .patch<Match>(matchBase(communityId, leagueId, matchdayId, matchId), data)
      .then((r) => r.data)
  },

  remove(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    matchId: string,
  ): Promise<void> {
    return apiClient
      .delete(matchBase(communityId, leagueId, matchdayId, matchId))
      .then(() => undefined)
  },
}

// ─── Goal endpoints ──────────────────────────────────────────────────────────

export const goalsApi = {
  getAll(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    matchId: string,
  ): Promise<Goal[]> {
    return apiClient
      .get<Goal[]>(goalsBase(communityId, leagueId, matchdayId, matchId))
      .then((r) => r.data)
  },

  create(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    matchId: string,
    data: GoalCreate,
  ): Promise<Goal> {
    return apiClient
      .post<Goal>(goalsBase(communityId, leagueId, matchdayId, matchId), data)
      .then((r) => r.data)
  },

  remove(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    matchId: string,
    goalId: string,
  ): Promise<void> {
    return apiClient
      .delete(`${goalsBase(communityId, leagueId, matchdayId, matchId)}${goalId}/`)
      .then(() => undefined)
  },
}

// ─── MatchGoalkeeper endpoints ────────────────────────────────────────────────

export const goalkeepersApi = {
  getAll(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    matchId: string,
  ): Promise<MatchGoalkeeper[]> {
    return apiClient
      .get<MatchGoalkeeper[]>(goalkeepersBase(communityId, leagueId, matchdayId, matchId))
      .then((r) => r.data)
  },

  create(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    matchId: string,
    data: MatchGoalkeeperCreate,
  ): Promise<MatchGoalkeeper> {
    return apiClient
      .post<MatchGoalkeeper>(goalkeepersBase(communityId, leagueId, matchdayId, matchId), data)
      .then((r) => r.data)
  },

  remove(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    matchId: string,
    goalkeeperId: string,
  ): Promise<void> {
    return apiClient
      .delete(
        `${goalkeepersBase(communityId, leagueId, matchdayId, matchId)}${goalkeeperId}/`,
      )
      .then(() => undefined)
  },
}

// ─── MatchDay Goalkeeper pool endpoints ──────────────────────────────────────

export const matchdayGoalkeepersApi = {
  getAll(
    communityId: string,
    leagueId: string,
    matchdayId: string,
  ): Promise<MatchDayGoalkeeper[]> {
    return apiClient
      .get<MatchDayGoalkeeper[]>(matchdayGoalkeepersBase(communityId, leagueId, matchdayId))
      .then((r) => r.data)
  },

  create(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    data: MatchDayGoalkeeperCreate,
  ): Promise<MatchDayGoalkeeper> {
    return apiClient
      .post<MatchDayGoalkeeper>(
        matchdayGoalkeepersBase(communityId, leagueId, matchdayId),
        data,
      )
      .then((r) => r.data)
  },

  remove(
    communityId: string,
    leagueId: string,
    matchdayId: string,
    goalkeeperId: string,
  ): Promise<void> {
    return apiClient
      .delete(`${matchdayGoalkeepersBase(communityId, leagueId, matchdayId)}${goalkeeperId}/`)
      .then(() => undefined)
  },
}
