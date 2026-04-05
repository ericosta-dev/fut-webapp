import { apiClient } from '@/api'
import type {
  CalendarMatchDay,
  Community,
  CommunityCreate,
  CommunityRanking,
  CommunitySettings,
  PaginatedResponse,
} from '@/types'

export const communitiesApi = {
  async list(): Promise<PaginatedResponse<Community>> {
    const response = await apiClient.get<PaginatedResponse<Community>>('/communities/')
    return response.data
  },

  async get(id: string): Promise<Community> {
    const response = await apiClient.get<Community>(`/communities/${id}/`)
    return response.data
  },

  async create(data: CommunityCreate): Promise<Community> {
    const response = await apiClient.post<Community>('/communities/', data)
    return response.data
  },

  async update(id: string, data: Partial<CommunityCreate>): Promise<Community> {
    const response = await apiClient.patch<Community>(`/communities/${id}/`, data)
    return response.data
  },

  async updateSettings(id: string, data: CommunitySettings): Promise<Community> {
    const response = await apiClient.patch<Community>(`/communities/${id}/`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/communities/${id}/`)
  },

  async getRankings(
    id: string,
    leagueId?: string,
  ): Promise<CommunityRanking> {
    const params = leagueId ? { league: leagueId } : {}
    const response = await apiClient.get<CommunityRanking>(
      `/communities/${id}/rankings/`,
      { params },
    )
    return response.data
  },

  async getCalendar(id: string): Promise<CalendarMatchDay[]> {
    const response = await apiClient.get<CalendarMatchDay[]>(
      `/communities/${id}/calendar/`,
    )
    return response.data
  },
}
