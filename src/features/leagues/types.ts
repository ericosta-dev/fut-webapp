import type { BaseModel, Player } from '@/types'

// League format types
export type LeagueFormat = 'CUP' | 'LEAGUE'

// League types
export interface League extends BaseModel {
  community: string
  name: string
  description: string
  format: LeagueFormat
  start_date: string
  end_date: string
  created_by: number
  created_by_username: string
  teams: Team[]
  is_active: boolean
  is_finished: boolean
  team_count: number
}

export interface LeagueCreate {
  name: string
  description?: string
  format: LeagueFormat
  start_date: string
  end_date: string
}

export interface LeagueUpdate {
  name?: string
  description?: string
  format?: LeagueFormat
  start_date?: string
  end_date?: string
}

// Team types
export interface Team extends BaseModel {
  community: string
  league: string
  name: string
  players: string[]
  players_detail: Player[]
  player_count: number
}

export interface TeamCreate {
  name: string
  players: string[]
}

export interface TeamUpdate {
  name?: string
  players?: string[]
}

// List response types
export interface LeagueList extends BaseModel {
  community: string
  name: string
  description: string
  format: LeagueFormat
  start_date: string
  end_date: string
  created_by: number
  created_by_username: string
  is_active: boolean
  is_finished: boolean
  team_count: number
}
