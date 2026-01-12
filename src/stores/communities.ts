import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Community, CommunityCreate } from '@/types'
import { communitiesApi } from '@/features/communities/api'

export const useCommunitiesStore = defineStore('communities', () => {
  // State
  const communities = ref<Community[]>([])
  const currentCommunity = ref<Community | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeCommunities = computed(() => communities.value.filter((c) => c.is_active))

  // Actions
  async function fetchCommunities() {
    loading.value = true
    error.value = null
    try {
      const response = await communitiesApi.list()
      communities.value = response.results
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
    deleteCommunity,
    setCurrentCommunity,
  }
})
