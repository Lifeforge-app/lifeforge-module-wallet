import { Icon } from '@iconify/react/dist/iconify.js'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  ConfirmationModal,
  ContextMenu,
  ContextMenuItem,
  useModalStore
} from 'lifeforge-ui'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import forgeAPI from '@/utils/forgeAPI'

import type { WalletCategory } from '../../..'
import ModifyCategoryModal from '../../ModifyCategoryModal'

function CategoryItem({ category }: { category: WalletCategory }) {
  const queryClient = useQueryClient()

  const { open } = useModalStore()

  const { t } = useTranslation('apps.wallet')

  const handleEditCategory = useCallback(() => {
    open(ModifyCategoryModal, {
      type: 'update',
      initialData: category
    })
  }, [category])

  const deleteMutation = useMutation(
    forgeAPI.categories.remove.input({ id: category.id }).mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['wallet', 'categories']
        })
      },
      onError: err => {
        toast.error(`Failed to delete category: ${err.message}`)
      }
    })
  )

  const handleDeleteCategory = useCallback(() => {
    open(ConfirmationModal, {
      title: 'Delete Category',
      description: 'Are you sure you want to delete this category?',
      confirmationButton: 'delete',
      onConfirm: async () => {
        await deleteMutation.mutateAsync({})
      }
    })
  }, [])

  return (
    <Card key={category.id} className="flex-between component-bg-lighter gap-3">
      <div className="flex w-full min-w-0 items-center gap-3">
        <div
          className="rounded-md p-2"
          style={{
            backgroundColor: category.color + '20'
          }}
        >
          <Icon
            className="size-7"
            icon={category.icon}
            style={{
              color: category.color
            }}
          />
        </div>
        <div className="w-full min-w-0">
          <p className="w-full min-w-0 truncate text-lg font-medium">
            {category.name}
          </p>
          <p className="text-bg-500 text-sm">
            {category.amount} {t('transactionCount')}
          </p>
        </div>
      </div>
      <ContextMenu>
        <ContextMenuItem
          icon="tabler:pencil"
          label="Edit"
          onClick={handleEditCategory}
        />
        <ContextMenuItem
          dangerous
          icon="tabler:trash"
          label="Delete"
          onClick={handleDeleteCategory}
        />
      </ContextMenu>
    </Card>
  )
}

export default CategoryItem
