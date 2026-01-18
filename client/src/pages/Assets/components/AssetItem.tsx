import { Icon } from '@iconify/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  ConfirmationModal,
  ContextMenu,
  ContextMenuItem,
  WithQuery,
  useModalStore
} from 'lifeforge-ui'
import { useMemo } from 'react'
import { toast } from 'react-toastify'
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts'
import { usePersonalization } from 'shared'

import type { WalletAsset } from '@/hooks/useWalletData'
import forgeAPI from '@/utils/forgeAPI'
import getChartScale from '@/utils/getChartScale'

import BalanceChartModal from '../modals/BalanceChartModal'
import ModifyAssetModal from '../modals/ModifyAssetModal'
import Amount from './Amount'

function AssetItem({ asset }: { asset: WalletAsset }) {
  const queryClient = useQueryClient()

  const { open } = useModalStore()

  const { derivedThemeColor } = usePersonalization()

  const assetBalanceQuery = useQuery(
    forgeAPI.assets.getAssetAccumulatedBalance
      .input({
        id: asset.id,
        rangeMode: 'month'
      })
      .queryOptions()
  )

  const chartData = useMemo(() => {
    if (!assetBalanceQuery.data) return []

    const sortedEntries = Object.entries(assetBalanceQuery.data).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
    )

    // Check if data spans multiple years
    const years = new Set(
      sortedEntries.map(([date]) => new Date(date).getFullYear())
    )

    const includeYear = years.size > 1

    return sortedEntries.map(([date, balance]) => ({
      date: new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(includeYear && { year: '2-digit' })
      }),
      balance
    }))
  }, [assetBalanceQuery.data])

  const chartScale = useMemo(
    () => getChartScale(chartData.map(d => d.balance)),
    [chartData]
  )

  const chartDomain = useMemo(() => {
    if (chartScale === 'log') {
      // Log scale can't start from 0, use the minimum value or 1
      const minValue = Math.min(...chartData.map(d => d.balance))

      return [Math.max(minValue * 0.9, 1), 'auto'] as [number, 'auto']
    }

    return [0, 'auto'] as [number, 'auto']
  }, [chartScale, chartData])

  const deleteMutation = useMutation(
    forgeAPI.assets.remove
      .input({
        id: asset.id
      })
      .mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['wallet', 'assets']
          })
        },
        onError: (error: Error) => {
          toast.error('Failed to delete asset: ' + error.message)
        }
      })
  )

  const handleEditAsset = () =>
    open(ModifyAssetModal, {
      type: 'update',
      initialData: asset
    })

  const handleOpenBalanceChart = () =>
    open(BalanceChartModal, {
      initialData: asset
    })

  const handleDeleteAsset = () =>
    open(ConfirmationModal, {
      title: 'Delete Asset',
      description: `Are you sure you want to delete the asset "${asset.name}"? This action cannot be undone.`,
      confirmationButton: 'delete',
      confirmationPrompt: asset.name,
      onConfirm: async () => {
        await deleteMutation.mutateAsync({})
      }
    })

  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="bg-bg-200 text-bg-500 dark:bg-bg-800 w-min rounded-md p-2">
          <Icon className="size-5" icon={asset.icon} />
        </span>
        <h2 className="text-xl font-medium">{asset.name}</h2>
      </div>
      <Amount amount={asset.current_balance} />
      <div className="mt-4 h-16">
        <WithQuery query={assetBalanceQuery} showRetryButton={false}>
          {() =>
            chartData.length === 0 ? (
              <p className="flex-center text-bg-500 size-full">
                No data available
              </p>
            ) : (
              <ResponsiveContainer height="100%" minHeight={64} width="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id={`colorBalance-${asset.id}`}
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={derivedThemeColor}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor={derivedThemeColor}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <YAxis hide domain={chartDomain} scale={chartScale} />
                  <Area
                    dataKey="balance"
                    dot={false}
                    fill={`url(#colorBalance-${asset.id})`}
                    stroke={derivedThemeColor}
                    strokeWidth={2}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )
          }
        </WithQuery>
      </div>
      <ContextMenu
        classNames={{
          wrapper: 'absolute right-4 top-4'
        }}
      >
        <ContextMenuItem
          icon="tabler:chart-line"
          label="View Balance Chart"
          namespace="apps.wallet"
          onClick={handleOpenBalanceChart}
        />
        <ContextMenuItem
          icon="tabler:pencil"
          label="Edit"
          onClick={handleEditAsset}
        />
        <ContextMenuItem
          dangerous
          icon="tabler:trash"
          label="Delete"
          onClick={handleDeleteAsset}
        />
      </ContextMenu>
    </Card>
  )
}

export default AssetItem
