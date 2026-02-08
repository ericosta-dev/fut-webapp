import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { leaguesApi } from '../api'
import type {
  League,
  LeagueCreate,
  LeagueList,
  LeagueUpdate,
  Team,
  TeamCreate,
  TeamUpdate,
} from '../types'

export const useLeaguesStore = defineStore('leagues', () => {
  // State
  const leagues = ref<LeagueList[]>([])
  const currentLeague = ref<League | null>(null)
  const currentTeams = ref<Team[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeLeagues = computed(() => {
    return leagues.value.filter((league) => league.is_active)
  })

  const finishedLeagues = computed(() => {
    return leagues.value.filter((league) => league.is_finished)
  })

  const upcomingLeagues = computed(() => {
    return leagues.value.filter(
      (league) => !league.is_active && !league.is_finished
    )
  })

  const leaguesByCommunity = computed(() => {
    return (communityId: string) =>
      leagues.value.filter((league) => league.community === communityId)
  })

  // Actions - Leagues
  async function fetchLeagues(communityId: string) {
    loading.value = true
    error.value = null
    try {
      const response = await leaguesApi.getAll(communityId)
      leagues.value = response.results
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch leagues'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchLeagueById(communityId: string, leagueId: string) {
    loading.value = true
    error.value = null
    try {
      currentLeague.value = await leaguesApi.getById(communityId, leagueId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch league'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createLeague(communityId: string, data: LeagueCreate) {
    loading.value = true
    error.value = null
    try {
      const newLeague = await leaguesApi.create(communityId, data)
      // Add to leagues list (convert to LeagueList format)
      leagues.value.unshift({
        id: newLeague.id,
        community: newLeague.community,
        name: newLeague.name,
        description: newLeague.description,
        format: newLeague.format,
        start_date: newLeague.start_date,
        end_date: newLeague.end_date,
        created_by: newLeague.created_by,
        created_by_username: newLeague.created_by_username,
        is_active: newLeague.is_active,
        is_finished: newLeague.is_finished,
        team_count: newLeague.team_count,
        created_at: newLeague.created_at,
        updated_at: newLeague.updated_at,
      })
      return newLeague
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create league'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateLeague(
    communityId: string,
    leagueId: string,
    data: LeagueUpdate
  ) {
    loading.value = true
    error.value = null
    try {
      const updatedLeague = await leaguesApi.update(communityId, leagueId, data)
      // Update in leagues list
      const index = leagues.value.findIndex((l) => l.id === leagueId)
      if (index !== -1) {
        leagues.value[index] = {
          ...leagues.value[index],
          ...updatedLeague,
        }
      }
      // Update current league if it's the same
      if (currentLeague.value?.id === leagueId) {
        currentLeague.value = updatedLeague
      }
      return updatedLeague
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update league'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteLeague(communityId: string, leagueId: string) {
    loading.value = true
    error.value = null
    try {
      await leaguesApi.delete(communityId, leagueId)
      // Remove from leagues list
      leagues.value = leagues.value.filter((l) => l.id !== leagueId)
      // Clear current league if it's the same
      if (currentLeague.value?.id === leagueId) {
        currentLeague.value = null
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete league'
      throw e
    } finally {
      loading.value = false
    }
  }

  // Actions - Teams
  async function fetchTeams(communityId: string, leagueId: string) {
    loading.value = true
    error.value = null
    try {
      const response = await leaguesApi.getAllTeams(communityId, leagueId)
      currentTeams.value = response.results
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch teams'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createTeam(
    communityId: string,
    leagueId: string,
    data: TeamCreate
  ) {
    loading.value = true
    error.value = null
    try {
      const newTeam = await leaguesApi.createTeam(communityId, leagueId, data)
      currentTeams.value.push(newTeam)
      return newTeam
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create team'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateTeam(
    communityId: string,
    leagueId: string,
    teamId: string,
    data: TeamUpdate
  ) {
    loading.value = true
    error.value = null
    try {
      const updatedTeam = await leaguesApi.updateTeam(
        communityId,
        leagueId,
        teamId,
        data
      )
      const index = currentTeams.value.findIndex((t) => t.id === teamId)
      if (index !== -1) {
        currentTeams.value[index] = updatedTeam
      }
      return updatedTeam
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update team'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteTeam(
    communityId: string,
    leagueId: string,
    teamId: string
  ) {
    loading.value = true
    error.value = null
    try {
      await leaguesApi.deleteTeam(communityId, leagueId, teamId)
      currentTeams.value = currentTeams.value.filter((t) => t.id !== teamId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete team'
      throw e
    } finally {
      loading.value = false
    }
  }

  function $reset() {
    leagues.value = []
    currentLeague.value = null
    currentTeams.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    leagues,
    currentLeague,
    currentTeams,
    loading,
    error,
    // Getters
    activeLeagues,
    finishedLeagues,
    upcomingLeagues,
    leaguesByCommunity,
    // Actions - Leagues
    fetchLeagues,
    fetchLeagueById,
    createLeague,
    updateLeague,
    deleteLeague,
    // Actions - Teams
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    // Reset
    $reset,
  }
})
