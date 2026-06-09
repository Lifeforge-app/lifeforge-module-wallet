import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import z from 'zod'

import {
  CurrencyField,
  FormModal,
  IconField,
  TextField,
  createDefaultValues
} from '@lifeforge/ui'

import type { WalletAsset } from '@/hooks/useWalletData'
import { forgeAPI } from '@/manifest'

const schema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  icon: z.string().min(1, 'Asset icon is required'),
  starting_balance: z.number()
})

function ModifyAssetModal({
  data: { type, initialData },
  onClose
}: {
  data: {
    type: 'create' | 'update'
    initialData?: WalletAsset
  }
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const mutation = useMutation(
    (type === 'create'
      ? forgeAPI.assets.create
      : forgeAPI.assets.update.input({
          id: initialData?.id || ''
        })
    ).mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['wallet', 'assets']
        })
      },
      onError: error => {
        toast.error(
          `Failed to ${type === 'create' ? 'create' : 'update'} asset: ${error.message}`
        )
      }
    })
  )

  const form = useForm({
    defaultValues: {
      ...createDefaultValues(schema),
      ...initialData
    },
    mode: 'all',
    resolver: zodResolver(schema)
  })

  return (
    <FormModal
      form={form}
      submissionConfig={{
        handler: async data => {
          await mutation.mutateAsync(data)
        },
        template: type
      }}
      uiConfig={{
        icon: type === 'create' ? 'tabler:plus' : 'tabler:pencil',
        namespace: 'apps.lifeforge--wallet',
        title: `assets.${type}`,
        onClose
      }}
    >
      <TextField
        required
        control={form.control}
        icon="tabler:wallet"
        label="Asset name"
        name="name"
        placeholder="My assets"
      />
      <IconField
        required
        control={form.control}
        label="Asset icon"
        name="icon"
      />
      <CurrencyField
        required
        control={form.control}
        icon="tabler:currency-dollar"
        label="Initial Balance"
        name="starting_balance"
      />
    </FormModal>
  )
}

export default ModifyAssetModal
