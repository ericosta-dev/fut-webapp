<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCommunitiesStore } from '@/stores/communities'
import AppLayout from '@/components/AppLayout.vue'
import { Input, Label, Button } from '@/components/ui'
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-vue-next'
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
    <div class="space-y-6 max-w-2xl animate-fade-in">
      <!-- Back -->
      <router-link
        :to="`/communities/${communityId}`"
        class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft :size="18" />
        Voltar para {{ communitiesStore.currentCommunity?.name || 'Comunidade' }}
      </router-link>

      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-foreground">Configurações da Comunidade</h1>
        <p class="text-muted-foreground mt-1">{{ communitiesStore.currentCommunity?.name }}</p>
      </div>

      <!-- Loading -->
      <div v-if="communitiesStore.loading" class="flex items-center justify-center py-24">
        <Loader2 :size="32" class="animate-spin text-primary" />
      </div>

      <template v-else>
        <!-- Banners -->
        <div
          v-if="successMessage"
          class="flex items-center gap-3 px-4 py-3 rounded-xl bg-success/10 border border-success/30 text-success text-sm"
        >
          <CheckCircle :size="18" class="shrink-0" />
          {{ successMessage }}
        </div>
        <div
          v-if="errorMessage"
          class="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm"
        >
          <XCircle :size="18" class="shrink-0" />
          {{ errorMessage }}
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="rounded-2xl border border-border bg-card p-6 space-y-6">
          <div>
            <h2 class="text-lg font-semibold text-foreground mb-1">Mensalistas</h2>
            <p class="text-sm text-muted-foreground mb-4">
              Configure o limite e o valor da mensalidade para jogadores mensalistas.
            </p>

            <div class="space-y-4">
              <div class="space-y-1.5">
                <Label for="max_mensalistas">Número máximo de mensalistas</Label>
                <Input
                  id="max_mensalistas"
                  v-model.number="formData.max_mensalistas"
                  type="number"
                  min="0"
                  placeholder="0"
                />
                <p class="text-xs text-muted-foreground">Defina 0 para não ter limite de mensalistas.</p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <Label for="currency">Moeda</Label>
                  <select
                    id="currency"
                    v-model="formData.currency"
                    class="flex h-10 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
                  >
                    <option v-for="c in currencies" :key="c.value" :value="c.value">
                      {{ c.symbol }} — {{ c.label }}
                    </option>
                  </select>
                </div>

                <div class="space-y-1.5">
                  <Label for="monthly_fee">Valor da Mensalidade</Label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
                      {{ currentCurrencySymbol }}
                    </span>
                    <Input
                      id="monthly_fee"
                      v-model.number="formData.monthly_fee"
                      type="number"
                      min="0"
                      step="0.01"
                      class="pl-10"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <Button type="button" variant="outline" class="flex-1" @click="router.push(`/communities/${communityId}`)">
              Cancelar
            </Button>
            <Button type="submit" :disabled="isSubmitting" class="flex-1">
              <Loader2 v-if="isSubmitting" :size="14" class="animate-spin mr-1" />
              {{ isSubmitting ? 'Salvando...' : 'Salvar Configurações' }}
            </Button>
          </div>
        </form>
      </template>
    </div>
  </AppLayout>
</template>
