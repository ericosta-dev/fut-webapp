<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCommunitiesStore } from '@/stores/communities'
import {
  LayoutDashboard,
  Users,
  Trophy,
  UserCircle,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Plus,
  Zap,
} from 'lucide-vue-next'
import Avatar from '@/components/ui/Avatar.vue'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import DropdownMenuItem from '@/components/ui/DropdownMenuItem.vue'
import DropdownMenuSeparator from '@/components/ui/DropdownMenuSeparator.vue'
import DropdownMenuLabel from '@/components/ui/DropdownMenuLabel.vue'
import Separator from '@/components/ui/Separator.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const communitiesStore = useCommunitiesStore()

const isSidebarOpen = ref(false)
const isSidebarCollapsed = ref(false)

onMounted(async () => {
  if (communitiesStore.communities.length === 0) {
    try {
      await communitiesStore.fetchCommunities()
    } catch {
      // silently fail
    }
  }
})

// Sync community from route params
watch(
  () => route.params.id || route.params.communityId,
  (routeCommunityId) => {
    if (routeCommunityId && typeof routeCommunityId === 'string') {
      const found = communitiesStore.communities.find((c) => c.id === routeCommunityId)
      if (found && communitiesStore.currentCommunity?.id !== found.id) {
        communitiesStore.setCurrentCommunity(found)
      }
    }
  },
  { immediate: true },
)

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// Community selector
function selectCommunity(communityId: string) {
  const found = communitiesStore.communities.find((c) => c.id === communityId) ?? null
  communitiesStore.setCurrentCommunity(found)
  if (found) {
    router.push(`/communities/${found.id}`)
  }
}

function clearCommunity() {
  communitiesStore.setCurrentCommunity(null)
}

// Sidebar nav
const communityId = computed(() => communitiesStore.currentCommunity?.id ?? null)
const communityLinksDisabled = computed(() => !communityId.value)

const playersPath = computed(() =>
  communityId.value ? `/communities/${communityId.value}/players` : '/communities',
)
const leaguesPath = computed(() =>
  communityId.value ? `/communities/${communityId.value}` : '/communities',
)

const userName = computed(
  () => authStore.user?.first_name || authStore.user?.username || 'Usuário',
)
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Mobile backdrop -->
    <Transition name="fade">
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        @click="isSidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 z-50 h-full border-r border-border bg-card transform transition-all duration-200 lg:translate-x-0 flex flex-col',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        isSidebarCollapsed ? 'w-16' : 'w-60',
      ]"
    >
      <!-- Logo -->
      <div class="h-14 flex items-center px-4 border-b border-border shrink-0">
        <router-link to="/dashboard" class="flex items-center gap-2.5 overflow-hidden">
          <span
            class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0"
          >
            <Zap :size="18" class="text-accent" />
          </span>
          <span v-if="!isSidebarCollapsed" class="text-base font-bold text-foreground whitespace-nowrap">
            <span class="text-primary">Fut</span><span class="text-accent">Engine</span>
          </span>
        </router-link>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-3 space-y-1">
        <!-- Dashboard -->
        <router-link
          to="/dashboard"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
            isSidebarCollapsed ? 'justify-center' : '',
          ]"
          active-class="!bg-primary/10 !text-primary border-l-2 border-primary"
          class="text-muted-foreground hover:bg-muted hover:text-foreground"
          @click="isSidebarOpen = false"
        >
          <LayoutDashboard :size="20" class="shrink-0" />
          <span v-if="!isSidebarCollapsed">Dashboard</span>
        </router-link>

        <!-- Communities -->
        <router-link
          to="/communities"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
            isSidebarCollapsed ? 'justify-center' : '',
          ]"
          active-class="!bg-primary/10 !text-primary border-l-2 border-primary"
          class="text-muted-foreground hover:bg-muted hover:text-foreground"
          @click="isSidebarOpen = false"
        >
          <Users :size="20" class="shrink-0" />
          <span v-if="!isSidebarCollapsed">Comunidades</span>
        </router-link>

        <!-- Context Divider -->
        <template v-if="!isSidebarCollapsed">
          <div class="pt-4 pb-1">
            <p class="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              {{ communitiesStore.currentCommunity?.name ?? 'Comunidade' }}
            </p>
          </div>
        </template>
        <template v-else>
          <Separator class="my-2" />
        </template>

        <!-- Players -->
        <router-link
          :to="playersPath"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isSidebarCollapsed ? 'justify-center' : '',
            communityLinksDisabled
              ? 'text-muted opacity-40 cursor-default pointer-events-none'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          ]"
          :active-class="communityLinksDisabled ? '' : '!bg-primary/10 !text-primary border-l-2 border-primary'"
          @click="isSidebarOpen = false"
        >
          <UserCircle :size="20" class="shrink-0" />
          <span v-if="!isSidebarCollapsed">Jogadores</span>
        </router-link>

        <!-- Leagues -->
        <router-link
          :to="leaguesPath"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isSidebarCollapsed ? 'justify-center' : '',
            communityLinksDisabled
              ? 'text-muted opacity-40 cursor-default pointer-events-none'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          ]"
          :active-class="communityLinksDisabled ? '' : '!bg-primary/10 !text-primary border-l-2 border-primary'"
          @click="isSidebarOpen = false"
        >
          <Trophy :size="20" class="shrink-0" />
          <span v-if="!isSidebarCollapsed">Competições</span>
        </router-link>
      </nav>

      <!-- Sidebar footer: collapse toggle -->
      <div class="p-3 border-t border-border shrink-0 hidden lg:block">
        <button
          @click="isSidebarCollapsed = !isSidebarCollapsed"
          class="w-full flex items-center justify-center px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <ChevronDown
            :size="18"
            :class="['transition-transform', isSidebarCollapsed ? '-rotate-90' : 'rotate-90']"
          />
        </button>
      </div>
    </aside>

    <!-- Main content area -->
    <div
      :class="['transition-all duration-200', isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60']"
    >
      <!-- Top bar -->
      <header
        class="h-14 bg-card/80 backdrop-blur-md border-b border-border flex items-center gap-3 px-4 lg:px-6 sticky top-0 z-30"
      >
        <!-- Mobile hamburger -->
        <button
          @click="isSidebarOpen = true"
          class="p-2 text-muted-foreground hover:text-foreground lg:hidden cursor-pointer"
        >
          <Menu :size="20" />
        </button>

        <!-- Community switcher -->
        <DropdownMenu>
          <template #trigger>
            <button
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted border border-border text-sm transition-colors cursor-pointer max-w-[220px]"
            >
              <span
                v-if="communitiesStore.currentCommunity"
                class="w-5 h-5 rounded-md bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0"
              >
                {{ communitiesStore.currentCommunity.name[0].toUpperCase() }}
              </span>
              <Users v-else :size="14" class="text-muted-foreground shrink-0" />
              <span class="truncate text-foreground">
                {{ communitiesStore.currentCommunity?.name ?? 'Selecionar comunidade' }}
              </span>
              <ChevronDown :size="14" class="text-muted-foreground shrink-0" />
            </button>
          </template>

          <DropdownMenuLabel>Comunidades</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            v-for="community in communitiesStore.communities"
            :key="community.id"
            @click="selectCommunity(community.id)"
          >
            <span
              class="w-5 h-5 rounded-md bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0"
            >
              {{ community.name[0].toUpperCase() }}
            </span>
            <span class="truncate">{{ community.name }}</span>
            <span
              v-if="communitiesStore.currentCommunity?.id === community.id"
              class="ml-auto w-1.5 h-1.5 rounded-full bg-accent"
            />
          </DropdownMenuItem>
          <DropdownMenuSeparator v-if="communitiesStore.currentCommunity" />
          <DropdownMenuItem v-if="communitiesStore.currentCommunity" @click="clearCommunity">
            <X :size="14" class="text-muted-foreground" />
            <span class="text-muted-foreground">Limpar seleção</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="router.push('/communities')">
            <Plus :size="14" class="text-accent" />
            <span class="text-accent">Nova comunidade</span>
          </DropdownMenuItem>
        </DropdownMenu>

        <!-- Spacer -->
        <div class="flex-1" />

        <!-- User menu -->
        <DropdownMenu>
          <template #trigger>
            <button class="flex items-center gap-2 cursor-pointer group">
              <Avatar :fallback="userName" size="sm" class="ring-2 ring-border group-hover:ring-primary/50 transition-all" />
              <span class="hidden sm:block text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {{ userName }}
              </span>
              <ChevronDown :size="14" class="text-muted-foreground hidden sm:block" />
            </button>
          </template>

          <DropdownMenuLabel>
            <div class="flex flex-col">
              <span>{{ userName }}</span>
              <span class="text-xs font-normal text-muted-foreground">{{ authStore.user?.email }}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="router.push('/profile')">
            <UserCircle :size="16" class="text-muted-foreground" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="handleLogout">
            <LogOut :size="16" class="text-destructive" />
            <span class="text-destructive">Sair</span>
          </DropdownMenuItem>
        </DropdownMenu>
      </header>

      <!-- Page content -->
      <main class="p-4 lg:p-8 max-w-7xl mx-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
