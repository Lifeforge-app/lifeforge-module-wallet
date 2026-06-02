import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import z from 'zod'

import {
  Button,
  CheckboxField,
  FileField,
  FormModal,
  useModalStore
} from '@lifeforge/ui'
import type { FileValue } from '@lifeforge/ui'

import type { CreateAnotherValue } from '@/pages/Transactions/CreateAnotherFIeld'
import CreateAnotherField, {
  createAnotherSchema
} from '@/pages/Transactions/CreateAnotherFIeld'
import forgeAPI from '@/utils/forgeAPI'

import ManagePromptsModal from './ManagePromptsModal'
import ModifyTransactionsModal from './ModifyTransactionsModal'

const schema = z.object({
  receipt: z.any(),
  keepReceiptAfterScan: z.boolean(),
  createAnother: createAnotherSchema
})

function ScanReceiptModal({
  onClose,
  data: { createAnother = 'none' }
}: {
  onClose: () => void
  data: {
    createAnother?: CreateAnotherValue
  }
}) {
  const { open } = useModalStore()

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      receipt: { type: 'empty' } as FileValue,
      keepReceiptAfterScan: true,
      createAnother
    }
  })

  useEffect(() => {
    if (!open) {
      form.setValue('receipt', { type: 'empty' })
    }
  }, [open])

  return (
    <FormModal
      form={form}
      submissionConfig={{
        label: 'proceed',
        icon: 'tabler:arrow-right',
        handler: async values => {
          const fileValue = values.receipt

          if (fileValue.type === 'empty' || fileValue.type === 'existing') {
            toast.error('Please select a file')

            return
          }

          const theFile =
            fileValue.type === 'upload'
              ? fileValue.file
              : fileValue.type === 'url'
                ? fileValue.url
                : null

          if (!theFile) {
            toast.error('Please select a file')

            return
          }

          const data = await forgeAPI.transactions.scanReceipt.mutate({
            file: theFile
          })

          onClose()

          open(ModifyTransactionsModal, {
            type: 'create',
            createAnother: values.createAnother,
            initialData: {
              ...data,
              type: data.type ?? 'expenses',
              receipt: (values.keepReceiptAfterScan ? theFile : '') as never
            }
          })
        }
      }}
      uiConfig={{
        icon: 'tabler:scan',
        namespace: 'apps.wallet',
        title: 'receipts.scan',
        headerActions: (
          <Button
            icon="tabler:message"
            variant="plain"
            onClick={() => open(ManagePromptsModal, { onClose: () => {} })}
          />
        ),
        onClose
      }}
    >
      <FileField
        control={form.control}
        icon="tabler:receipt"
        label="receipt"
        mimeTypes={{
          image: ['jpeg', 'png', 'jpg'],
          application: ['pdf']
        }}
        name="receipt"
      />
      <CheckboxField
        control={form.control}
        icon="tabler:file-check"
        label="keepAfterScan"
        name="keepReceiptAfterScan"
      />
      <CreateAnotherField control={form.control} />
    </FormModal>
  )
}

export default ScanReceiptModal
