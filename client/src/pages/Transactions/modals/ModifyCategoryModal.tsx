import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useModuleTranslation } from '@lifeforge/localization'
import z from 'zod'

import {
  ColorField,
  FormModal,
  IconField,
  ListboxField,
  TAILWIND_PALETTE,
  TextField,
  createDefaultValues,
  toast
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import type { WalletCategory } from '..'

const schema = z.object({
  type: z.enum(['income', 'expenses']),
  name: z.string().min(1, 'Category name is required'),
  icon: z.string().min(1, 'Category icon is required'),
  color: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      'Color must be a valid hex color (e.g. #FF0000)'
    )
})

function ModifyCategoryModal({
  data: { type, initialData },
  onClose
}: {
  data: {
    type: 'create' | 'update'
    initialData?: Partial<WalletCategory>
  }
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const { t } = useModuleTranslation()

  const mutation = useMutation(
    (type === 'create'
      ? forgeAPI.categories.create
      : forgeAPI.categories.update.input({
          id: initialData?.id || ''!
        })
    ).mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['wallet', 'categories']
        })
      },
      onError: error => {
        toast.error(
          `Failed to ${type === 'create' ? 'create' : 'update'} category: ${error.message}`
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
        handler: mutation.mutateAsync,
        template: type === 'update' ? 'update' : 'create'
      }}
      uiConfig={{
        icon: type === 'update' ? 'tabler:pencil' : 'tabler:plus',
        namespace: 'apps.lifeforge--wallet',
        title: `categories.${type === 'update' ? 'update' : 'create'}`,
        onClose
      }}
    >
      <ListboxField
        required
        control={form.control}
        disabled={type === 'update'}
        icon="tabler:apps"
        label={t('categoryType')}
        name="type"
        options={[
          {
            value: 'income',
            text: t('transactionTypes.income'),
            icon: 'tabler:login-2',
            color: TAILWIND_PALETTE.green[500]
          },
          {
            value: 'expenses',
            text: t('transactionTypes.expenses'),
            icon: 'tabler:logout',
            color: TAILWIND_PALETTE.red[500]
          }
        ]}
      />
      <TextField
        required
        control={form.control}
        icon="tabler:pencil"
        label={t('categoryName')}
        name="name"
        placeholder={t('inputs.categoryName.placeholder')}
      />
      <IconField
        required
        control={form.control}
        label={t('categoryIcon')}
        name="icon"
      />
      <ColorField
        required
        control={form.control}
        label={t('categoryColor')}
        name="color"
      />
    </FormModal>
  )
}

export default ModifyCategoryModal
