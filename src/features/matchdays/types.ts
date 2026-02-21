import type { BaseModel, Player } from '@/types'

export type MatchDayStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED'

export interface MatchDayTeam extends BaseModel {
  matchday: string
  community: string
  name: string
  players: string[]
  players_detail: Player[]
  player_count: number
  source_team: string | null
}

export interface MatchDayTeamCreate {
  name: string
  players?: string[]
}

export interface MatchDayTeamUpdate {
  name?: string
  players?: string[]
}

export interface Goal extends BaseModel {
  match: string
  community: string
  player: string
  player_detail: Player
  team: string
  is_own_goal: boolean
  assisted_by: string | null
  assisted_by_detail: Player | null
}

export interface GoalCreate {
  player: string
  team: string
  is_own_goal?: boolean
  assisted_by?: string | null
}

export interface MatchGoalkeeper extends BaseModel {
  match: string
  community: string
  player: string
  player_detail: Player
  team: string | null
}

export interface MatchGoalkeeperCreate {
  player: string
  team?: string | null
}

export interface MatchDayGoalkeeper extends BaseModel {
  matchday: string
  community: string
  player: string
  player_detail: Player
}

export interface MatchDayGoalkeeperCreate {
  player: string
}

export interface Match extends BaseModel {
  matchday: string
  community: string
  home_team: string
  away_team: string
  home_team_detail: MatchDayTeam
  away_team_detail: MatchDayTeam
  goals: Goal[]
  goalkeepers: MatchGoalkeeper[]
  home_score: number
  away_score: number
  order: number
}

export interface MatchCreate {
  home_team: string
  away_team: string
  order?: number
}

export interface MatchUpdate {
  home_team?: string
  away_team?: string
  order?: number
}

export interface MatchDay extends BaseModel {
  league: string
  community: string
  date: string
  label: string
  status: MatchDayStatus
  notes: string
  created_by: number
  created_by_username: string
  teams: MatchDayTeam[]
  matches: Match[]
  matchday_goalkeepers: MatchDayGoalkeeper[]
  team_count: number
  match_count: number
  total_goals: number
}

/** Lightweight version used in list views (no nested teams/matches) */
export interface MatchDayList extends BaseModel {
  league: string
  community: string
  date: string
  label: string
  status: MatchDayStatus
  notes: string
  created_by: number
  created_by_username: string
  team_count: number
  match_count: number
}

export interface MatchDayCreate {
  date: string
  label?: string
  notes?: string
}

export interface MatchDayUpdate {
  date?: string
  label?: string
  notes?: string
  status?: MatchDayStatus
}

export interface ShuffleTeamsRequest {
  player_ids: string[]
  team_count: number
  team_names?: string[]
}

/** Computed standing for a team within a MatchDay (calculated client-side) */
export interface TeamStanding {
  teamId: string
  name: string
  points: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  played: number
}
