import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Community, CommunityCreate, CommunitySettings } from '@/types'
import { communitiesApi } from '@/features/communities/api'

const STORAGE_KEY = 'futengine_current_community'

export const useCommunitiesStore = defineStore('communities', () => {
  // State
  const communities = ref<Community[]>([])

  // Restore currentCommunity from localStorage on init
  const storedCommunity = localStorage.getItem(STORAGE_KEY)
  const currentCommunity = ref<Community | null>(
    storedCommunity ? (JSON.parse(storedCommunity) as Community) : null,
  )
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Persist currentCommunity to localStorage whenever it changes
  watch(currentCommunity, (val) => {
    if (val) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  })

  // Getters
  const activeCommunities = computed(() => communities.value.filter((c) => c.is_active))

  // Actions
  async function fetchCommunities() {
    loading.value = true
    error.value = null
    try {
      const response = await communitiesApi.list()
      communities.value = response.results
      // Sync stored currentCommunity with fresh data
      if (currentCommunity.value) {
        const fresh = response.results.find((c) => c.id === currentCommunity.value!.id)
        currentCommunity.value = fresh ?? null
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch communities'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchCommunity(id: string) {
    loading.value = true
    error.value = null
    try {
      currentCommunity.value = await communitiesApi.get(id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch community'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createCommunity(data: CommunityCreate) {
    loading.value = true
    error.value = null
    try {
      const community = await communitiesApi.create(data)
      communities.value.push(community)
      return community
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create community'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateCommunity(id: string, data: Partial<CommunityCreate>) {
    loading.value = true
    error.value = null
    try {
      const updated = await communitiesApi.update(id, data)
      const index = communities.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        communities.value[index] = updated
      }
      if (currentCommunity.value?.id === id) {
        currentCommunity.value = updated
      }
      return updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update community'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateSettings(id: string, data: CommunitySettings) {
    loading.value = true
    error.value = null
    try {
      const updated = await communitiesApi.updateSettings(id, data)
      const index = communities.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        communities.value[index] = updated
      }
      if (currentCommunity.value?.id === id) {
        currentCommunity.value = updated
      }
      return updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update community settings'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteCommunity(id: string) {
    loading.value = true
    error.value = null
    try {
      await communitiesApi.delete(id)
      communities.value = communities.value.filter((c) => c.id !== id)
      if (currentCommunity.value?.id === id) {
        currentCommunity.value = null
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete community'
      throw e
    } finally {
      loading.value = false
    }
  }

  function setCurrentCommunity(community: Community | null) {
    currentCommunity.value = community
  }

  return {
    // State
    communities,
    currentCommunity,
    loading,
    error,
    // Getters
    activeCommunities,
    // Actions
    fetchCommunities,
    fetchCommunity,
    createCommunity,
    updateCommunity,
    updateSettings,
    deleteCommunity,
    setCurrentCommunity,
  }
})
