import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import {
  ConfirmationModal,
  ContextMenu,
  ContextMenuItem,
  useModalStore
} from '@lifeforge/ui'

import type { WalletAsset } from '@/hooks/useWalletData'
import forgeAPI from '@/utils/forgeAPI'

import BalanceChartModal from '../modals/BalanceChartModal'
import ModifyAssetModal from '../modals/ModifyAssetModal'

function AssetContextMenu({ asset }: { asset: WalletAsset }) {
  const queryClient = useQueryClient()

  const { open } = useModalStore()

  const deleteMutation = useMutation(
    forgeAPI.assets.remove.input({ id: asset.id }).mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['wallet', 'assets'] })
      },
      onError: (error: Error) => {
        toast.error('Failed to delete asset: ' + error.message)
      }
    })
  )

  const handleDelete = () =>
    open(ConfirmationModal, {
      title: 'Delete Asset',
      description: `Are you sure you want to delete the asset "${asset.name}"? This action cannot be undone.`,
      confirmationButton: 'delete',
      confirmationPrompt: asset.name,
      onConfirm: async () => {
        await deleteMutation.mutateAsync(undefined)
      }
    })

  return (
    <ContextMenu>
      <ContextMenuItem
        icon="tabler:chart-line"
        label="View Balance Chart"
        namespace="apps.wallet"
        onClick={() => open(BalanceChartModal, { initialData: asset })}
      />
      <ContextMenuItem
        icon="tabler:pencil"
        label="Edit"
        onClick={() =>
          open(ModifyAssetModal, { type: 'update', initialData: asset })
        }
      />
      <ContextMenuItem
        dangerous
        icon="tabler:trash"
        label="Delete"
        onClick={handleDelete}
      />
    </ContextMenu>
  )
}

export default AssetContextMenu
