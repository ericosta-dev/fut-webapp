import { apiClient } from '@/api'
import type { Player, PlayerCreate, PaginatedResponse } from '@/types'

export const playersApi = {
  async list(communityId?: string): Promise<PaginatedResponse<Player>> {
    const params = communityId ? { community: communityId } : {}
    const response = await apiClient.get<PaginatedResponse<Player>>('/players/', { params })
    return response.data
  },

  async get(id: string): Promise<Player> {
    const response = await apiClient.get<Player>(`/players/${id}/`)
    return response.data
  },

  async create(data: PlayerCreate): Promise<Player> {
    const response = await apiClient.post<Player>('/players/', data)
    return response.data
  },

  async update(id: string, data: Partial<PlayerCreate>): Promise<Player> {
    const response = await apiClient.patch<Player>(`/players/${id}/`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/players/${id}/`)
  },
}
