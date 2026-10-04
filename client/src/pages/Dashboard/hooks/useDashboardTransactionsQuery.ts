import { useQuery } from '@tanstack/react-query'

import { forgeAPI } from '@/manifest'

import { useDashboardRange } from '../providers/DashboardRangeProvider'

export default function useDashboardTransactionsQuery() {
  const { queryInput } = useDashboardRange()

  return useQuery(forgeAPI.transactions.list.input(queryInput).queryOptions())
}
