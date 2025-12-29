import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { useMemo } from 'react'

import type { WalletTransaction } from '../pages/Transactions'
import { useWalletStore } from '../stores/useWalletStore'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

export function useFilteredTransactions(transactions: WalletTransaction[]) {
  const {
    selectedType,
    selectedCategory,
    selectedAsset,
    selectedLedger,
    startDate,
    endDate,
    searchQuery
  } = useWalletStore()

  return useMemo(() => {
    return transactions
      .filter(tx => (selectedType ? tx.type === selectedType : true))
      .filter(tx => {
        if (!selectedCategory) return true
        if (tx.type === 'transfer') return false

        return tx.category === selectedCategory
      })
      .filter(tx => {
        if (!selectedAsset) return true

        if (tx.type === 'transfer')
          return tx.from === selectedAsset || tx.to === selectedAsset

        return tx.asset === selectedAsset
      })
      .filter(tx => {
        if (!selectedLedger) return true

        if (tx.type === 'transfer') return false

        return tx.ledgers.includes(selectedLedger)
      })
      .filter(
        tx =>
          searchQuery === '' ||
          (tx.type !== 'transfer'
            ? tx.particulars
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              tx.location_name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
            : false)
      )
      .filter(tx => {
        const start = (
          startDate && dayjs(startDate).isValid()
            ? dayjs(startDate)
            : dayjs('1900-01-01')
        ).startOf('day')

        const end = (
          endDate && dayjs(endDate).isValid() ? dayjs(endDate) : dayjs()
        ).endOf('day')

        const date = dayjs(tx.date)

        return date.isSameOrAfter(start) && date.isSameOrBefore(end)
      })
  }, [
    transactions,
    selectedType,
    selectedCategory,
    selectedAsset,
    selectedLedger,
    startDate,
    endDate,
    searchQuery
  ])
}
