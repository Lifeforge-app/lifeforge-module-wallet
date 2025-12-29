import forgeAPI from '@/utils/forgeAPI'
import { Icon } from '@iconify/react'
import { Widget } from 'lifeforge-ui'
import { createContext, useState } from 'react'
import { Link } from 'shared'
import type { InferOutput } from 'shared'

import type { WalletCategory } from '../../../Transactions'
import BreakdownContent from './components/BreakdownContent'

type CategoryBreakdown = InferOutput<
  typeof forgeAPI.wallet.analytics.getCategoriesBreakdown
>['income']

export const CategoriesBreakdownContext = createContext<{
  breakdown: CategoryBreakdown
  categories: WalletCategory[]
  type: 'income' | 'expenses'
}>({
  breakdown: {},
  categories: [],
  type: 'expenses'
})

function CategoriesBreakdownCard() {
  const [selectedType, setSelectedType] = useState<'income' | 'expenses'>(
    'expenses'
  )

  return (
    <Widget
      actionComponent={
        <Link
          className="text-bg-500 hover:bg-bg-100 hover:text-bg-800 dark:hover:bg-bg-700/30 dark:hover:text-bg-50 flex items-center gap-2 rounded-lg p-2 font-medium transition-all"
          to={`/wallet/transactions?type=${selectedType}`}
        >
          <Icon className="text-xl" icon="tabler:chevron-right" />
        </Link>
      }
      className="col-span-1 row-span-6 h-full min-h-0"
      icon="tabler:chart-donut-3"
      namespace="apps.wallet"
      title="Categories Breakdown"
    >
      <BreakdownContent
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />
    </Widget>
  )
}

export default CategoriesBreakdownCard
