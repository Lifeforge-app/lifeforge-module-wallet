import { forgeRouter } from '@functions/routes'

import assetsRouter from './routes/assets'
import categoriesRouter from './routes/categories'
import ledgersRouter from './routes/ledgers'
import promptsRouter from './routes/prompts'
import templatesRouter from './routes/templates'
import transactionsRouter from './routes/transactions'
import utilsRouter from './routes/utils'

export default forgeRouter({
  transactions: {
    ...transactionsRouter,
    prompts: promptsRouter
  },
  categories: categoriesRouter,
  assets: assetsRouter,
  ledgers: ledgersRouter,
  templates: templatesRouter,
  utils: utilsRouter
})
