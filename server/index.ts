import { forgeRouter } from '@lifeforge/server-utils'

import * as analyticsRouter from './routes/analytics'
import * as assetsRouter from './routes/assets'
import * as budgetsRouter from './routes/budgets'
import * as categoriesRouter from './routes/categories'
import * as ledgersRouter from './routes/ledgers'
import * as promptsRouter from './routes/prompts'
import * as savingsGoalsRouter from './routes/savings-goals'
import * as templatesRouter from './routes/templates'
import * as transactionsRouter from './routes/transactions'

export default forgeRouter({
  transactions: {
    ...transactionsRouter,
    prompts: promptsRouter
  },
  categories: categoriesRouter,
  assets: assetsRouter,
  ledgers: ledgersRouter,
  templates: templatesRouter,
  analytics: analyticsRouter,
  budgets: budgetsRouter,
  savingsGoals: savingsGoalsRouter
})
