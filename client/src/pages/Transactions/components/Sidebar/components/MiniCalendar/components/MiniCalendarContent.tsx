import forgeAPI from '@/utils/forgeAPI'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { usePersonalization } from 'shared'

import MiniCalendarDateItem from './MiniCalendarDateItem'

function MiniCalendarContent({
  currentMonth,
  currentYear,
  viewsFilter
}: {
  currentMonth: number
  currentYear: number
  viewsFilter: ('income' | 'expenses' | 'transfer')[]
}) {
  const { language } = usePersonalization()

  const [nextToSelect, setNextToSelect] = useState<'start' | 'end'>('start')

  const transactionCountQuery = useQuery(
    forgeAPI.wallet.utils.getTransactionCountByDay
      .input({
        year: currentYear.toString(),
        month: currentMonth.toString()
      })
      .queryOptions()
  )

  const firstDateOfMonth = useMemo(
    () => dayjs(`${currentYear}-${currentMonth + 1}-01`, 'YYYY-M-DD').toDate(),
    [currentMonth, currentYear]
  )

  // Filter the count map based on viewsFilter (client-side filtering for view toggle)
  const transactionCountMap = useMemo(() => {
    const data = transactionCountQuery.data ?? {}

    if (viewsFilter.length === 3) return data // All types selected, no filtering needed

    const filtered: typeof data = {}

    for (const [dateKey, counts] of Object.entries(data)) {
      filtered[dateKey] = {
        income: viewsFilter.includes('income') ? counts.income : 0,
        expenses: viewsFilter.includes('expenses') ? counts.expenses : 0,
        transfer: viewsFilter.includes('transfer') ? counts.transfer : 0,
        total: 0,
        count: 0
      }

      // Recalculate total and count based on filtered types
      if (viewsFilter.includes('income')) {
        filtered[dateKey].total += counts.income
        filtered[dateKey].count += counts.income > 0 ? 1 : 0
      }

      if (viewsFilter.includes('expenses')) {
        filtered[dateKey].total += counts.expenses
        filtered[dateKey].count += counts.expenses > 0 ? 1 : 0
      }

      if (viewsFilter.includes('transfer')) {
        filtered[dateKey].total += counts.transfer
        filtered[dateKey].count += counts.transfer > 0 ? 1 : 0
      }
    }

    return filtered
  }, [transactionCountQuery.data, viewsFilter])

  return (
    <div className="grid grid-cols-7 gap-y-2">
      {{
        en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        'zh-CN': ['一', '二', '三', '四', '五', '六', '日'],
        'zh-TW': ['一', '二', '三', '四', '五', '六', '日'],
        ms: ['Is', 'Se', 'Ra', 'Kh', 'Ju', 'Sa', 'Ah']
      }[language ?? 'en']?.map(day => (
        <div key={day} className="flex-center text-bg-500 text-sm">
          {day}
        </div>
      ))}
      {Array(
        Math.ceil(
          (dayjs().year(currentYear).month(currentMonth).daysInMonth() +
            dayjs()
              .year(currentYear)
              .month(currentMonth - 1)
              .endOf('month')
              .day()) /
            7
        ) * 7
      )
        .fill(0)
        .map((_, index) => (
          <MiniCalendarDateItem
            key={index}
            date={firstDateOfMonth}
            index={index}
            nextToSelect={nextToSelect}
            setNextToSelect={setNextToSelect}
            transactionCountMap={transactionCountMap}
          />
        ))}
    </div>
  )
}

export default MiniCalendarContent
