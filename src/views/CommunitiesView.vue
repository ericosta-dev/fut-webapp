<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCommunitiesStore } from '@/stores/communities'
import AppLayout from '@/components/AppLayout.vue'
import type { CommunityCreate } from '@/types'

const communitiesStore = useCommunitiesStore()

const showModal = ref(false)
const isSubmitting = ref(false)
const formData = ref<CommunityCreate>({
  name: '',
  description: '',
})

onMounted(async () => {
  await communitiesStore.fetchCommunities()
})

const openModal = () => {
  formData.value = { name: '', description: '' }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  if (!formData.value.name) return

  isSubmitting.value = true
  try {
    await communitiesStore.createCommunity(formData.value)
    closeModal()
  } catch {
    // Error handled by store
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Comunidades</h1>
          <p class="text-slate-400 mt-1">Gerencie suas peladas e grupos de futebol</p>
        </div>
        <button
          @click="openModal"
          class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-medium rounded-lg transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nova Comunidade
        </button>
      </div>

      <!-- Loading -->
      <div v-if="communitiesStore.loading" class="flex items-center justify-center py-24">
        <svg class="animate-spin w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>

      <!-- Empty State -->
      <div v-else-if="communitiesStore.communities.length === 0" class="text-center py-24">
        <div
          class="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-6"
        >
          <svg
            class="w-10 h-10 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 class="text-xl font-medium text-white mb-2">Nenhuma comunidade encontrada</h3>
        <p class="text-slate-400 mb-6 max-w-md mx-auto">
          Crie sua primeira comunidade para começar a organizar suas peladas e gerenciar jogadores.
        </p>
        <button
          @click="openModal"
          class="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-medium rounded-xl transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Criar Comunidade
        </button>
      </div>

      <!-- Communities Grid -->
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link
          v-for="community in communitiesStore.communities"
          :key="community.id"
          :to="`/communities/${community.id}`"
          class="group bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 hover:border-emerald-500/50 transition-all duration-200"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <svg
                class="w-6 h-6 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <svg
              class="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">{{ community.name }}</h3>
          <p class="text-slate-400 text-sm line-clamp-2">{{ community.description }}</p>
        </router-link>
      </div>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60" @click="closeModal" />
        <div class="relative bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md p-6">
          <h2 class="text-xl font-bold text-white mb-6">Nova Comunidade</h2>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-slate-300 mb-2">
                Nome da Comunidade
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                placeholder="Ex: Pelada dos Amigos"
              />
            </div>

            <div>
              <label for="description" class="block text-sm font-medium text-slate-300 mb-2">
                Descrição
              </label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="3"
                class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors resize-none"
                placeholder="Descreva sua comunidade..."
              />
            </div>

            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isSubmitting || !formData.name"
                class="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-slate-900 font-medium rounded-xl transition-colors"
              >
                {{ isSubmitting ? 'Criando...' : 'Criar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>
