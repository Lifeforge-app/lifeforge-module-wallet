import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import z from 'zod'

import {
  FormModal,
  TextAreaField,
  createDefaultValues,
  useModalStore
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import CreateAnotherField, {
  type CreateAnotherValue,
  createAnotherSchema
} from '../components/CreateAnotherFIeld'
import ModifyTransactionsModal from './ModifyTransactionsModal'

const schema = z.object({
  description: z.string().min(1, 'Description is required'),
  createAnother: createAnotherSchema
})

function NaturalLanguageModal({
  onClose,
  data: { createAnother = 'none' }
}: {
  onClose: () => void
  data: {
    createAnother?: CreateAnotherValue
  }
}) {
  const { open } = useModalStore()

  const { t } = useTranslation('apps.wallet')

  const mutation = useMutation(
    forgeAPI.transactions.fromNaturalLanguage.mutationOptions()
  )

  const form = useForm({
    defaultValues: {
      ...createDefaultValues(schema),
      createAnother
    },
    resolver: zodResolver(schema)
  })

  return (
    <FormModal
      form={form}
      submissionConfig={{
        handler: async values => {
          const data = await mutation.mutateAsync({
            description: values.description
          })

          const cv = values.createAnother

          onClose()

          setTimeout(() => {
            open(ModifyTransactionsModal, {
              type: 'create',
              createAnother: cv,
              initialData: {
                ...(data as any)
              }
            })
          }, 300)
        },
        label: t('buttons.fromNaturalLanguage'),
        icon: 'tabler:brain'
      }}
      uiConfig={{
        icon: 'tabler:brain',
        namespace: 'apps.wallet',
        title: 'naturalLanguage.title',
        onClose
      }}
    >
      <TextAreaField
        required
        control={form.control}
        icon="tabler:message"
        label={t('inputs.description.label')}
        name="description"
        placeholder={t('inputs.description.placeholder')}
      />
      <CreateAnotherField control={form.control} />
    </FormModal>
  )
}

export default NaturalLanguageModal
