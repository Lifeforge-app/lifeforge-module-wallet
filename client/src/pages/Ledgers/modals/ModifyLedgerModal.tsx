import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import z from 'zod'

import {
  ColorField,
  FormModal,
  IconField,
  TextField,
  createDefaultValues,
  toast
} from '@lifeforge/ui'

import type { WalletLedger } from '@/hooks/useWalletData'
import { forgeAPI } from '@/manifest'

const schema = z.object({
  name: z.string().min(1, 'Ledger name is required'),
  icon: z.string().min(1, 'Ledger icon is required'),
  color: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      'Color must be a valid hex color (e.g. #FF0000)'
    )
})

function ModifyLedgerModal({
  data: { type, initialData },
  onClose
}: {
  data: {
    type: 'create' | 'update'
    initialData?: WalletLedger
  }
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const mutation = useMutation(
    (type === 'create'
      ? forgeAPI.ledgers.create
      : forgeAPI.ledgers.update.input({
          id: initialData?.id || ''
        })
    ).mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['wallet', 'ledgers']
        })
      },
      onError: error => {
        toast.error(
          `Failed to ${type === 'create' ? 'create' : 'update'} ledger: ${error.message}`
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
        title: `ledgers.${type}`,
        onClose
      }}
    >
      <TextField
        required
        control={form.control}
        icon="tabler:book"
        label="Ledger name"
        name="name"
        placeholder="My Ledgers"
      />
      <IconField
        required
        control={form.control}
        label="Ledger icon"
        name="icon"
      />
      <ColorField
        required
        control={form.control}
        label="Ledger color"
        name="color"
      />
    </FormModal>
  )
}

export default ModifyLedgerModal
