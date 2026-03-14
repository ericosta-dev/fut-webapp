<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCommunitiesStore } from '@/stores/communities'
import AppLayout from '@/components/AppLayout.vue'
import type { CommunitySettings, CommunityCurrency } from '@/types'

const route = useRoute()
const router = useRouter()
const communitiesStore = useCommunitiesStore()

const communityId = computed(() => route.params.id as string)

const isSubmitting = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

const formData = ref<CommunitySettings>({
  max_mensalistas: 0,
  monthly_fee: 0,
  currency: 'BRL',
})

const currencies: { value: CommunityCurrency; label: string; symbol: string }[] = [
  { value: 'BRL', label: 'Reais', symbol: 'R$' },
  { value: 'USD', label: 'Dólar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
]

onMounted(async () => {
  await communitiesStore.fetchCommunity(communityId.value)
  const community = communitiesStore.currentCommunity
  if (community) {
    formData.value = {
      max_mensalistas: community.max_mensalistas,
      monthly_fee: parseFloat(community.monthly_fee) || 0,
      currency: community.currency,
    }
  }
})

const handleSubmit = async () => {
  isSubmitting.value = true
  successMessage.value = null
  errorMessage.value = null
  try {
    await communitiesStore.updateSettings(communityId.value, formData.value)
    successMessage.value = 'Configurações salvas com sucesso!'
  } catch {
    errorMessage.value = 'Erro ao salvar as configurações. Tente novamente.'
  } finally {
    isSubmitting.value = false
  }
}

const currentCurrencySymbol = computed(() => {
  return currencies.find((c) => c.value === formData.value.currency)?.symbol ?? 'R$'
})
</script>

<template>
  <AppLayout>
    <div class="space-y-6 max-w-2xl">
      <!-- Back Button -->
      <router-link
        :to="`/communities/${communityId}`"
        class="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Voltar para {{ communitiesStore.currentCommunity?.name || 'Comunidade' }}
      </router-link>

      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white">Configurações da Comunidade</h1>
        <p class="text-slate-400 mt-1">
          {{ communitiesStore.currentCommunity?.name }}
        </p>
      </div>

      <!-- Loading -->
      <div v-if="communitiesStore.loading" class="flex items-center justify-center py-24">
        <svg class="animate-spin w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>

      <template v-else>
        <!-- Success / Error banners -->
        <div
          v-if="successMessage"
          class="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ successMessage }}
        </div>
        <div
          v-if="errorMessage"
          class="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {{ errorMessage }}
        </div>

        <!-- Settings Form -->
        <form
          @submit.prevent="handleSubmit"
          class="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 space-y-6"
        >
          <div>
            <h2 class="text-lg font-semibold text-white mb-1">Mensalistas</h2>
            <p class="text-sm text-slate-400 mb-4">
              Configure o limite e o valor da mensalidade para jogadores mensalistas.
            </p>

            <div class="space-y-4">
              <!-- Max mensalistas -->
              <div>
                <label for="max_mensalistas" class="block text-sm font-medium text-slate-300 mb-2">
                  Número máximo de mensalistas
                </label>
                <input
                  id="max_mensalistas"
                  v-model.number="formData.max_mensalistas"
                  type="number"
                  min="0"
                  class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  placeholder="0"
                />
                <p class="text-xs text-slate-500 mt-1">
                  Defina 0 para não ter limite de mensalistas.
                </p>
              </div>

              <!-- Currency + Monthly fee side by side -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="currency" class="block text-sm font-medium text-slate-300 mb-2">
                    Moeda
                  </label>
                  <select
                    id="currency"
                    v-model="formData.currency"
                    class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  >
                    <option v-for="c in currencies" :key="c.value" :value="c.value">
                      {{ c.symbol }} — {{ c.label }}
                    </option>
                  </select>
                </div>

                <div>
                  <label for="monthly_fee" class="block text-sm font-medium text-slate-300 mb-2">
                    Valor da Mensalidade
                  </label>
                  <div class="relative">
                    <span
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none"
                    >
                      {{ currentCurrencySymbol }}
                    </span>
                    <input
                      id="monthly_fee"
                      v-model.number="formData.monthly_fee"
                      type="number"
                      min="0"
                      step="0.01"
                      class="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="router.push(`/communities/${communityId}`)"
              class="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-slate-900 font-medium rounded-xl transition-colors"
            >
              {{ isSubmitting ? 'Salvando...' : 'Salvar Configurações' }}
            </button>
          </div>
        </form>
      </template>
    </div>
  </AppLayout>
</template>
