import { parseAsString, useQueryState } from 'nuqs'
import { createContext, useCallback, useContext, useMemo } from 'react'

export type DashboardRange =
  | 'week'
  | 'month'
  | 'mtd'
  | 'quarter'
  | 'year'
  | 'ytd'
  | 'all'
  | 'custom'

interface DashboardRangeContextValue {
  range: DashboardRange
  setRange: (range: DashboardRange) => void
  startDate: string
  endDate: string
  setStartDate: (value: string) => void
  setEndDate: (value: string) => void
  queryInput: {
    range: DashboardRange
    startDate?: string
    endDate?: string
  }
}

const DashboardRangeContext =
  createContext<DashboardRangeContextValue | null>(null)

export function DashboardRangeProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [range, setRangeQuery] = useQueryState(
    'range',
    parseAsString.withDefault('mtd')
  )

  const [startDate, setStartDateQuery] = useQueryState(
    'startDate',
    parseAsString.withDefault('')
  )

  const [endDate, setEndDateQuery] = useQueryState(
    'endDate',
    parseAsString.withDefault('')
  )

  const setRange = useCallback(
    (value: DashboardRange) => {
      setRangeQuery(value)
    },
    [setRangeQuery]
  )

  const setStartDate = useCallback(
    (value: string) => {
      setStartDateQuery(value)
    },
    [setStartDateQuery]
  )

  const setEndDate = useCallback(
    (value: string) => {
      setEndDateQuery(value)
    },
    [setEndDateQuery]
  )

  const queryInput = useMemo<DashboardRangeContextValue['queryInput']>(() => {
    const rangeValue = range as DashboardRange

    return rangeValue === 'custom'
      ? {
          range: rangeValue,
          startDate: startDate || undefined,
          endDate: endDate || undefined
        }
      : { range: rangeValue }
  }, [range, startDate, endDate])

  const value = useMemo(
    () => ({
      range: range as DashboardRange,
      setRange,
      startDate,
      endDate,
      setStartDate,
      setEndDate,
      queryInput
    }),
    [range, setRange, startDate, endDate, setStartDate, setEndDate, queryInput]
  )

  return (
    <DashboardRangeContext value={value}>
      {children}
    </DashboardRangeContext>
  )
}

export function useDashboardRange() {
  const context = useContext(DashboardRangeContext)

  if (!context) {
    throw new Error(
      'useDashboardRange must be used within a DashboardRangeProvider'
    )
  }

  return context
}
