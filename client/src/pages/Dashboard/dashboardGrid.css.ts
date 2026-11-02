import { style } from '@vanilla-extract/css'

import { vars } from '@lifeforge/ui'

/**
 * The single source of truth for the wallet dashboard layout.
 *
 * The placement of every widget is defined here as a CSS grid template
 * (`grid-template-areas`), so individual widgets no longer declare
 * `gridColumnSpan` / `gridRowSpan` themselves.
 *
 * Every desktop row is exactly as tall as the income/expenses card. That height
 * is measured at runtime and exposed as `--wallet-dashboard-row-height` by the
 * dashboard, so a widget is as tall as the multiple of that card implied by the
 * template area it spans.
 */
export const dashboardGrid = style({
  display: 'grid',
  gap: vars.space.sm,
  gridTemplateColumns: '1fr',
  gridTemplateAreas: `
    "income"
    "expenses"
    "assetsBalance"
    "statisticChart"
    "activityCalendar"
    "categoriesBreakdown"
    "recentTransactions"
  `,
  '@media': {
    'screen and (min-width: 1280px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: `repeat(10, minmax(0, var(--wallet-dashboard-row-height, auto)))`,
      gridTemplateAreas: `
        "income expenses assetsBalance"
        "statisticChart statisticChart assetsBalance"
        "statisticChart statisticChart assetsBalance"
        "activityCalendar activityCalendar assetsBalance"
        "activityCalendar activityCalendar assetsBalance"
        "recentTransactions recentTransactions categoriesBreakdown"
        "recentTransactions recentTransactions categoriesBreakdown"
        "recentTransactions recentTransactions categoriesBreakdown"
        "recentTransactions recentTransactions categoriesBreakdown"
        "recentTransactions recentTransactions categoriesBreakdown"
      `
    }
  }
})
