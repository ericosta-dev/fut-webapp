<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCommunitiesStore } from '@/stores/communities'
import AppLayout from '@/components/AppLayout.vue'
import { Card, CardContent, CardHeader, CardTitle, Avatar, Badge, Separator } from '@/components/ui'
import {
  Users,
  Trophy,
  Target,
  Award,
  CalendarDays,
  Shield,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const communitiesStore = useCommunitiesStore()

const userName = computed(
  () =>
    [authStore.user?.first_name, authStore.user?.last_name].filter(Boolean).join(' ') ||
    authStore.user?.username ||
    'Usuário',
)

const stats = [
  { label: 'Comunidades', value: communitiesStore.communities.length, icon: Users },
  { label: 'Partidas', value: '—', icon: Trophy },
  { label: 'Gols', value: '—', icon: Target },
  { label: 'Assistências', value: '—', icon: Award },
]

const badges = [
  { name: 'Veterano', description: 'Membro há 6+ meses', unlocked: true },
  { name: 'Artilheiro', description: 'Artilheiro em uma rodada', unlocked: false },
  { name: 'Hat-trick', description: '3 gols em uma partida', unlocked: false },
  { name: 'Muralha', description: 'Clean sheet como goleiro', unlocked: false },
  { name: '100 Gols', description: 'Marcar 100 gols no total', unlocked: false },
  { name: 'Garçom', description: 'Maior assistente em uma rodada', unlocked: false },
]
</script>

<template>
  <AppLayout>
    <div class="space-y-6 animate-fade-in">
      <!-- Profile Header -->
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-start gap-5">
            <Avatar
              :fallback="userName"
              size="xl"
              class="ring-4 ring-primary/20"
            />
            <div class="flex-1 min-w-0">
              <h1 class="text-2xl font-bold text-foreground">{{ userName }}</h1>
              <p class="text-sm text-muted-foreground mt-0.5">
                {{ authStore.user?.email }}
              </p>
              <p class="text-xs text-muted-foreground mt-1">
                @{{ authStore.user?.username }}
              </p>
              <div class="flex items-center gap-2 mt-3">
                <Badge variant="accent">
                  <CalendarDays :size="10" class="mr-1" />
                  Membro ativo
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card v-for="stat in stats" :key="stat.label">
          <CardContent class="pt-4 pb-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <component :is="stat.icon" :size="18" class="text-primary" />
            </div>
            <div>
              <p class="text-xl font-bold text-accent">{{ stat.value }}</p>
              <p class="text-xs text-muted-foreground">{{ stat.label }}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Communities & Badges -->
      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Communities -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Shield :size="18" class="text-primary" />
              Comunidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="communitiesStore.communities.length === 0" class="text-sm text-muted-foreground text-center py-6">
              Nenhuma comunidade ainda.
            </div>
            <div v-else class="space-y-3">
              <router-link
                v-for="community in communitiesStore.communities"
                :key="community.id"
                :to="`/communities/${community.id}`"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
              >
                <span class="w-8 h-8 rounded-md bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {{ community.name[0].toUpperCase() }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {{ community.name }}
                  </p>
                  <p class="text-xs text-muted-foreground truncate">
                    {{ community.description || 'Sem descrição' }}
                  </p>
                </div>
              </router-link>
            </div>
          </CardContent>
        </Card>

        <!-- Badges / Achievements -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Award :size="18" class="text-accent" />
              Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="badge in badges"
                :key="badge.name"
                :class="[
                  'p-3 rounded-lg border text-center transition-colors',
                  badge.unlocked
                    ? 'border-accent/30 bg-accent/5'
                    : 'border-border bg-muted/30 opacity-50',
                ]"
              >
                <p :class="['text-sm font-semibold', badge.unlocked ? 'text-accent' : 'text-muted-foreground']">
                  {{ badge.name }}
                </p>
                <p class="text-[10px] text-muted-foreground mt-0.5">{{ badge.description }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </AppLayout>
</template>