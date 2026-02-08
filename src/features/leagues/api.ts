import { apiClient } from '@/api/client'
import type { PaginatedResponse } from '@/types'
import type {
  League,
  LeagueCreate,
  LeagueList,
  LeagueUpdate,
  Team,
  TeamCreate,
  TeamUpdate,
} from './types'

export const leaguesApi = {
  // League endpoints
  async getAll(communityId: string): Promise<PaginatedResponse<LeagueList>> {
    const response = await apiClient.get<PaginatedResponse<LeagueList>>(
      `/communities/${communityId}/leagues/`
    )
    return response.data
  },

  async getById(communityId: string, leagueId: string): Promise<League> {
    const response = await apiClient.get<League>(
      `/communities/${communityId}/leagues/${leagueId}/`
    )
    return response.data
  },

  async create(communityId: string, data: LeagueCreate): Promise<League> {
    const response = await apiClient.post<League>(
      `/communities/${communityId}/leagues/`,
      data
    )
    return response.data
  },

  async update(
    communityId: string,
    leagueId: string,
    data: LeagueUpdate
  ): Promise<League> {
    const response = await apiClient.patch<League>(
      `/communities/${communityId}/leagues/${leagueId}/`,
      data
    )
    return response.data
  },

  async delete(communityId: string, leagueId: string): Promise<void> {
    await apiClient.delete(`/communities/${communityId}/leagues/${leagueId}/`)
  },

  // Team endpoints
  async getAllTeams(
    communityId: string,
    leagueId: string
  ): Promise<PaginatedResponse<Team>> {
    const response = await apiClient.get<PaginatedResponse<Team>>(
      `/communities/${communityId}/leagues/${leagueId}/teams/`
    )
    return response.data
  },

  async getTeamById(
    communityId: string,
    leagueId: string,
    teamId: string
  ): Promise<Team> {
    const response = await apiClient.get<Team>(
      `/communities/${communityId}/leagues/${leagueId}/teams/${teamId}/`
    )
    return response.data
  },

  async createTeam(
    communityId: string,
    leagueId: string,
    data: TeamCreate
  ): Promise<Team> {
    const response = await apiClient.post<Team>(
      `/communities/${communityId}/leagues/${leagueId}/teams/`,
      data
    )
    return response.data
  },

  async updateTeam(
    communityId: string,
    leagueId: string,
    teamId: string,
    data: TeamUpdate
  ): Promise<Team> {
    const response = await apiClient.patch<Team>(
      `/communities/${communityId}/leagues/${leagueId}/teams/${teamId}/`,
      data
    )
    return response.data
  },

  async deleteTeam(
    communityId: string,
    leagueId: string,
    teamId: string
  ): Promise<void> {
    await apiClient.delete(
      `/communities/${communityId}/leagues/${leagueId}/teams/${teamId}/`
    )
  },
}
