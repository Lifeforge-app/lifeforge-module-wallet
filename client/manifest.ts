import { lazy } from 'react'
import type { ModuleConfig } from 'shared'

export default {
  subsection: [
    { label: 'Dashboard', icon: 'tabler:dashboard', path: '' },
    {
      label: 'Transactions',
      icon: 'tabler:arrows-exchange',
      path: 'transactions'
    },
    { label: 'Budgets', icon: 'tabler:chart-pie', path: 'budgets' },
    { label: 'Assets', icon: 'tabler:wallet', path: 'assets' },
    { label: 'Ledgers', icon: 'tabler:book', path: 'ledgers' },
    { label: 'Saving Goals', icon: 'tabler:target', path: 'saving-goals' },
    {
      label: 'Spending Heatmap',
      icon: 'tabler:map-pin',
      path: 'spending-heatmap'
    },
    {
      label: 'Financial Statements',
      icon: 'tabler:file-text',
      path: 'statements'
    }
  ],
  routes: {
    '/': lazy(() => import('@/pages/Dashboard')),
    '/transactions': lazy(() => import('@/pages/Transactions')),
    '/budgets': lazy(() => import('@/pages/Budgets')),
    '/saving-goals': lazy(() => import('@/pages/SavingGoals')),
    '/assets': lazy(() => import('@/pages/Assets')),
    '/ledgers': lazy(() => import('@/pages/Ledgers')),
    '/spending-heatmap': lazy(() => import('@/pages/SpendingHeatmap')),
    '/statements': lazy(() => import('@/pages/Statements'))
  },
  widgets: [() => import('@/widgets/AssetsBalance')]
} satisfies ModuleConfig
