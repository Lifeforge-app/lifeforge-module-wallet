import { useWalletData } from '@/hooks/useWalletData'
import dayjs from 'dayjs'
import { useMemo } from 'react'

export function useChartData(range: 'week' | 'month' | 'ytd') {
  const { transactionsQuery } = useWalletData()

  const transactions = transactionsQuery.data ?? []

  return useMemo(() => {
    const now = dayjs()

    const labels: string[] = []

    switch (range) {
      case 'week': {
        const startOfWeek = now.startOf('week')

        for (let i = 0; i <= 6; i++) {
          labels.push(startOfWeek.add(i, 'day').format('MMM DD'))
        }
        break
      }

      case 'month': {
        const startOfMonth = now.startOf('month')

        const endOfMonth = now.endOf('month')

        for (let i = 0; i <= endOfMonth.date() - 1; i++) {
          labels.push(startOfMonth.add(i, 'day').format('MMM DD'))
        }
        break
      }

      case 'ytd': {
        for (let i = 0; i <= now.month(); i++) {
          labels.push(dayjs().month(i).format('MMM'))
        }
        break
      }
    }

    const getTransactions = (date: string, type: 'income' | 'expenses') => {
      if (range === 'ytd') {
        return transactions
          .filter(
            transaction => dayjs(transaction.date).year() === dayjs().year()
          )
          .filter(transaction => transaction.type === type)
          .filter(transaction => dayjs(transaction.date).format('MMM') === date)
          .reduce((acc, curr) => acc + curr.amount, 0)
      } else {
        return transactions
          .filter(
            transaction => dayjs(transaction.date).year() === dayjs().year()
          )
          .filter(transaction => transaction.type === type)
          .filter(
            transaction => dayjs(transaction.date).format('MMM DD') === date
          )
          .reduce((acc, curr) => acc + curr.amount, 0)
      }
    }

    return labels.map(date => {
      const income = getTransactions(date, 'income')

      const expenses = getTransactions(date, 'expenses')

      return {
        date,
        income: income,
        expenses: expenses > 0 ? -expenses : 0
      }
    })
  }, [transactions, range])
}
