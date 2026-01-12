import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Player, PlayerCreate } from '@/types'
import { playersApi } from '@/features/players/api'

export const usePlayersStore = defineStore('players', () => {
  // State
  const players = ref<Player[]>([])
  const currentPlayer = ref<Player | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activePlayers = computed(() => players.value.filter((p) => p.is_active))

  const playersByPosition = computed(() => {
    return {
      FWD: players.value.filter((p) => p.position === 'FWD'),
      MID: players.value.filter((p) => p.position === 'MID'),
      DEF: players.value.filter((p) => p.position === 'DEF'),
      GK: players.value.filter((p) => p.position === 'GK'),
    }
  })

  // Actions
  async function fetchPlayers(communityId?: string) {
    loading.value = true
    error.value = null
    try {
      const response = await playersApi.list(communityId)
      players.value = response.results
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch players'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchPlayer(id: string) {
    loading.value = true
    error.value = null
    try {
      currentPlayer.value = await playersApi.get(id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch player'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createPlayer(data: PlayerCreate) {
    loading.value = true
    error.value = null
    try {
      const player = await playersApi.create(data)
      players.value.push(player)
      return player
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create player'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updatePlayer(id: string, data: Partial<PlayerCreate>) {
    loading.value = true
    error.value = null
    try {
      const updated = await playersApi.update(id, data)
      const index = players.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        players.value[index] = updated
      }
      if (currentPlayer.value?.id === id) {
        currentPlayer.value = updated
      }
      return updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update player'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deletePlayer(id: string) {
    loading.value = true
    error.value = null
    try {
      await playersApi.delete(id)
      players.value = players.value.filter((p) => p.id !== id)
      if (currentPlayer.value?.id === id) {
        currentPlayer.value = null
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete player'
      throw e
    } finally {
      loading.value = false
    }
  }

  function clearPlayers() {
    players.value = []
    currentPlayer.value = null
  }

  return {
    // State
    players,
    currentPlayer,
    loading,
    error,
    // Getters
    activePlayers,
    playersByPosition,
    // Actions
    fetchPlayers,
    fetchPlayer,
    createPlayer,
    updatePlayer,
    deletePlayer,
    clearPlayers,
  }
})
