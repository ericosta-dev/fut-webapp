// Base types
export interface BaseModel {
  id: string
  created_at: string
  updated_at: string
  is_active: boolean
}

// User types
export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
}

// Community types
export type CommunityCurrency = 'BRL' | 'USD' | 'EUR'

export interface Community extends BaseModel {
  name: string
  description: string
  owner: number
  max_mensalistas: number
  monthly_fee: string
  currency: CommunityCurrency
}

export interface CommunityCreate {
  name: string
  description: string
}

export interface CommunitySettings {
  max_mensalistas?: number
  monthly_fee?: number | string
  currency?: CommunityCurrency
}

// Player types
export type PlayerPosition = 'FWD' | 'MID' | 'DEF' | 'GK'
export type PlayerRole = 'ADMIN' | 'MODERATOR' | 'MEMBER'
export type PlayerStatus = 'MONTHLY' | 'ONE_TIME'

export interface Player extends BaseModel {
  community: string
  user: number | null
  role: PlayerRole
  status: PlayerStatus
  name: string
  nickname: string | null
  position: PlayerPosition
  number: number | null
}

export interface PlayerCreate {
  community: string
  name: string
  nickname?: string
  position: PlayerPosition
  number?: number
  role?: PlayerRole
  status?: PlayerStatus
}

export interface MatchDayHistory {
  matchday_id: string
  matchday_date: string
  matchday_label: string
  league_id: string
  league_name: string
  goals: number
  assists: number
  own_goals: number
  matches: number
  wins: number
  draws: number
  losses: number
}

export interface RankingEntry {
  rank: number
  player_id: string
  player_name: string
  total: number
}

export interface PlayerRanking {
  goals_rank: number
  goals_total: number
  assists_rank: number
  assists_total: number
  total_players: number
  top_goals: RankingEntry[]
  top_assists: RankingEntry[]
}

export interface PlayerStats {
  player_id: string
  player_name: string
  goals: number
  assists: number
  own_goals: number
  matches_played: number
  wins: number
  draws: number
  losses: number
  goalkeeper_duties: number
  history: MatchDayHistory[]
  ranking: PlayerRanking
}

// Community ranking types
export interface CommunityRanking {
  top_goals: RankingEntry[]
  top_assists: RankingEntry[]
  total_players: number
}

export interface CalendarMatchDay {
  id: string
  date: string
  label: string
  league_id: string
  league_name: string
  status: string
}

// Auth types
export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
}

// API Response types
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiError {
  detail?: string
  message?: string
  [key: string]: unknown
}
