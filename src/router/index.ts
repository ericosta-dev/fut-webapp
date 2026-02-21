import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/communities',
      name: 'communities',
      component: () => import('@/views/CommunitiesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/communities/:id',
      name: 'community-detail',
      component: () => import('@/views/CommunityDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/communities/:id/players',
      name: 'community-players',
      component: () => import('@/views/PlayersView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/communities/:communityId/leagues/:leagueId',
      name: 'league-detail',
      component: () => import('@/views/LeagueDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/communities/:communityId/leagues/:leagueId/matchdays/:matchdayId',
      name: 'matchday-detail',
      component: () => import('@/views/MatchDayDetailView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
