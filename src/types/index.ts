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
export interface Community extends BaseModel {
  name: string
  description: string
  owner: number
}

export interface CommunityCreate {
  name: string
  description: string
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
