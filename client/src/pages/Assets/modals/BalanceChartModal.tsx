import type { WalletAsset } from '@/hooks/useWalletData'
import forgeAPI from '@/utils/forgeAPI'
import { useQuery } from '@tanstack/react-query'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip
} from 'chart.js'
import dayjs from 'dayjs'
import {
  DateInput,
  ListboxInput,
  ListboxOption,
  ModalHeader,
  WithQuery
} from 'lifeforge-ui'
import { useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'
import { usePersonalization } from 'shared'
import tinycolor from 'tinycolor2'

import numberToCurrency from '../../../utils/numberToCurrency'

const RANGE_MODE = [
  'week',
  'month',
  'quarter',
  'year',
  'all',
  'custom'
] as const

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function BalanceChartModal({
  data: { initialData },
  onClose
}: {
  data: {
    initialData: WalletAsset
  }
  onClose: () => void
}) {
  const { t } = useTranslation('apps.wallet')

  const { derivedThemeColor } = usePersonalization()

  const [rangeMode, setRangeMode] =
    useState<(typeof RANGE_MODE)[number]>('month')

  const [startDate, setStartDate] = useState<Date | null>(
    dayjs().subtract(1, 'month').toDate()
  )

  const [endDate, setEndDate] = useState<Date | null>(new Date())

  const assetBalanceQuery = useQuery(
    forgeAPI.wallet.assets.getAssetAccumulatedBalance
      .input({
        id: initialData.id,
        rangeMode: rangeMode,
        startDate:
          rangeMode === 'custom'
            ? dayjs(startDate).format('YYYY-MM-DD')
            : undefined,
        endDate:
          rangeMode === 'custom'
            ? dayjs(endDate).format('YYYY-MM-DD')
            : undefined
      })
      .queryOptions()
  )

  const chartData = useMemo(() => {
    if (!assetBalanceQuery.data) return null

    const sortedEntries = Object.entries(assetBalanceQuery.data).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
    )

    const labels = sortedEntries.map(([date]) =>
      new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    )

    const data = sortedEntries.map(([, balance]) => balance)

    return {
      labels,
      datasets: [
        {
          label: 'Balance',
          data,
          borderColor: derivedThemeColor,
          backgroundColor: tinycolor(derivedThemeColor)
            .setAlpha(0.1)
            .toRgbString(),
          fill: true,
          borderWidth: 2,
          pointHoverBackgroundColor: derivedThemeColor,
          pointHoverBorderColor: derivedThemeColor,
          pointRadius: 0,
          pointHoverRadius: 6
        }
      ]
    }
  }, [assetBalanceQuery.data])

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
          callbacks: {
            label: (context: any) => `RM ${numberToCurrency(context.parsed.y)}`
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          border: {
            display: false
          }
        },
        y: {
          grid: {
            color: 'rgba(156, 163, 175, 0.2)'
          },
          border: {
            display: false
          },
          min: 0,
          ticks: {
            callback: (value: any) => `RM ${numberToCurrency(value)}`
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index' as const
      }
    }),
    []
  )

  return (
    <div className="min-w-[50vw]">
      <ModalHeader
        appendTitle={
          <p className="hidden truncate sm:block"> - {initialData.name}</p>
        }
        icon="tabler:chart-line"
        namespace="apps.wallet"
        title="assetsBalanceChart"
        onClose={onClose}
      />
      <div className="mb-6 space-y-4">
        <ListboxInput
          buttonContent={<span>{t(`rangeModes.${rangeMode}`)}</span>}
          icon="tabler:history"
          label="range mode"
          namespace="apps.wallet"
          value={rangeMode}
          onChange={setRangeMode}
        >
          {RANGE_MODE.map(mode => (
            <ListboxOption
              key={mode}
              label={t(`rangeModes.${mode}`)}
              value={mode}
            />
          ))}
        </ListboxInput>
        {rangeMode === 'custom' && (
          <div className="mt-4 flex w-full gap-3">
            <DateInput
              className="flex-1"
              icon="tabler:calendar-up"
              label="startDate"
              namespace="apps.wallet"
              value={startDate}
              onChange={(date: Date | null) => {
                setStartDate(date)

                if (endDate && date && dayjs(date).isAfter(dayjs(endDate))) {
                  setEndDate(date)
                }
              }}
            />
            <DateInput
              className="flex-1"
              icon="tabler:calendar-down"
              label="endDate"
              namespace="apps.wallet"
              value={endDate}
              onChange={(date: Date | null) => {
                setEndDate(date)

                if (
                  startDate &&
                  date &&
                  dayjs(date).isBefore(dayjs(startDate))
                ) {
                  setStartDate(date)
                }
              }}
            />
          </div>
        )}
      </div>
      <WithQuery query={assetBalanceQuery}>
        {assetBalance => (
          <div className="p-6">
            {chartData && Object.keys(assetBalance).length > 0 ? (
              <div className="h-96">
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="flex-center h-96 flex-col gap-3 text-gray-500">
                <div className="text-6xl">📊</div>
                <div className="text-lg font-medium">No Balance History</div>
                <div className="text-sm">
                  Balance data will appear here once transactions are recorded.
                </div>
              </div>
            )}
          </div>
        )}
      </WithQuery>
    </div>
  )
}

export default BalanceChartModal
