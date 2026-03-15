<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCommunitiesStore } from '@/stores/communities'
import AppLayout from '@/components/AppLayout.vue'
import {
  Card,
  CardContent,
  Button,
  Input,
  Textarea,
  Label,
  Badge,
  Skeleton,
} from '@/components/ui'
import Dialog from '@/components/ui/Dialog.vue'
import type { CommunityCreate } from '@/types'
import { Plus, Users, Loader2 } from 'lucide-vue-next'

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

const handleSubmit = async () => {
  if (!formData.value.name) return

  isSubmitting.value = true
  try {
    await communitiesStore.createCommunity(formData.value)
    showModal.value = false
  } catch {
    // Error handled by store
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Comunidades</h1>
          <p class="text-sm text-muted-foreground mt-1">Gerencie suas peladas e grupos</p>
        </div>
        <Button variant="accent" @click="openModal">
          <Plus :size="16" />
          Nova Comunidade
        </Button>
      </div>

      <!-- Loading -->
      <div v-if="communitiesStore.loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="i in 3" :key="i">
          <CardContent class="pt-6 space-y-3">
            <Skeleton class="h-5 w-2/3" />
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>

      <!-- Empty State -->
      <div v-else-if="communitiesStore.communities.length === 0" class="text-center py-20">
        <div class="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Users :size="28" class="text-muted-foreground" />
        </div>
        <h3 class="text-lg font-semibold text-foreground">Nenhuma comunidade ainda</h3>
        <p class="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          Crie sua primeira comunidade para começar a organizar suas peladas.
        </p>
        <Button variant="accent" class="mt-6" @click="openModal">
          <Plus :size="16" />
          Criar comunidade
        </Button>
      </div>

      <!-- Communities Grid -->
      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-for="community in communitiesStore.communities"
          :key="community.id"
          :to="`/communities/${community.id}`"
          class="group"
        >
          <Card class="h-full hover:border-primary/30 transition-all duration-200 group-hover:bg-card-hover">
            <CardContent class="pt-6">
              <div class="flex items-start gap-3">
                <span class="w-10 h-10 rounded-lg bg-primary/20 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                  {{ community.name.charAt(0).toUpperCase() || '?' }}
                </span>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {{ community.name }}
                  </h3>
                  <p class="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {{ community.description || 'Sem descrição' }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                <Badge variant="secondary">
                  <Users :size="10" class="mr-1" />
                  {{ community.is_active ? 'Ativa' : 'Inativa' }}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </router-link>
      </div>

      <!-- Create Dialog -->
      <Dialog
        v-model:open="showModal"
        title="Nova Comunidade"
        description="Crie uma comunidade para organizar suas peladas."
      >
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Nome</Label>
            <Input
              id="name"
              v-model="formData.name"
              placeholder="Ex: Pelada de sábado"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="description">Descrição</Label>
            <Textarea
              id="description"
              v-model="formData.description"
              placeholder="Descreva sua comunidade..."
            />
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" @click="showModal = false">Cancelar</Button>
            <Button variant="accent" type="submit" :disabled="isSubmitting || !formData.name">
              <Loader2 v-if="isSubmitting" :size="16" class="animate-spin" />
              Criar
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  </AppLayout>
</template>
