import moment from 'moment'

export default function getDateRange(
  rangeMode: 'week' | 'month' | 'year' | 'all' | 'custom' | 'quarter',
  startDate?: string,
  endDate?: string
): { startDate: string | null; endDate: string | null } {
  let start: moment.Moment | null = null
  let end: moment.Moment | null = null

  const today = moment().endOf('day')

  switch (rangeMode) {
    case 'week':
      start = moment().subtract(7, 'days').startOf('day')
      end = today
      break
    case 'month':
      start = moment().subtract(1, 'month').startOf('day')
      end = today
      break
    case 'quarter':
      start = moment().subtract(3, 'months').startOf('day')
      end = today
      break
    case 'year':
      start = moment().subtract(1, 'year').startOf('day')
      end = today
      break
    case 'all':
      start = null
      end = null
      break
    case 'custom':
      if (startDate) {
        start = moment(startDate).startOf('day')
      }

      if (endDate) {
        end = moment(endDate).endOf('day')
      }
      break
  }

  return {
    startDate: start ? start.format('YYYY-MM-DD') : null,
    endDate: end ? end.format('YYYY-MM-DD') : null
  }
}
