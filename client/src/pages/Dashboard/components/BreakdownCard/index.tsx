import { createContext, useState } from 'react'
import { Link } from 'react-router'

import type { InferOutput } from '@lifeforge/api'
import { Button, Icon, Widget } from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import type { WalletRange } from '@/providers/RangeProvider'

import BreakdownContent from './components/BreakdownContent'

export type BreakdownGroupBy =
  | 'categories'
  | 'assets'
  | 'platforms'
  | 'ledgers'

export type BreakdownEntity = {
  id: string
  name: string
  icon: string
  color: string
}

type Breakdown = InferOutput<typeof forgeAPI.analytics.getCategoriesBreakdown>[
  | 'income'
  | 'expenses']

export const BreakdownContext = createContext<{
  breakdown: Breakdown
  entities: BreakdownEntity[]
  type: 'income' | 'expenses'
  groupBy: BreakdownGroupBy
  range: WalletRange
  startDate: string
  endDate: string
}>({
  breakdown: {},
  entities: [],
  type: 'expenses',
  groupBy: 'categories',
  range: 'mtd',
  startDate: '',
  endDate: ''
})

function BreakdownCard() {
  const [selectedType, setSelectedType] = useState<'income' | 'expenses'>(
    'expenses'
  )

  const [selectedGroupBy, setSelectedGroupBy] =
    useState<BreakdownGroupBy>('categories')

  return (
    <Widget
      actionComponent={
        <Button
          as={Link}
          p="xs"
          to={`/wallet/transactions?type=${selectedType}`}
          variant="plain"
        >
          <Icon icon="tabler:chevron-right" />
        </Button>
      }
      icon="tabler:chart-donut-3"
      title="Breakdown"
    >
      <BreakdownContent
        selectedGroupBy={selectedGroupBy}
        selectedType={selectedType}
        setSelectedGroupBy={setSelectedGroupBy}
        setSelectedType={setSelectedType}
      />
    </Widget>
  )
}

export default BreakdownCard
