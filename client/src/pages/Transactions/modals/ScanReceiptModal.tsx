import { Icon } from '@iconify/react'
import { Button, FileInput, ModalHeader, Switch } from 'lifeforge-ui'
import { useModalStore } from 'lifeforge-ui'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { usePromiseLoading } from 'shared'

import forgeAPI from '@/utils/forgeAPI'

import ManagePromptsModal from './ManagePromptsModal'
import ModifyTransactionsModal from './ModifyTransactionsModal'

function ScanReceiptModal({ onClose }: { onClose: () => void }) {
  const { open } = useModalStore()

  const { t } = useTranslation('apps.wallet')

  const [file, setFile] = useState<File | string | null>(null)

  const [preview, setPreview] = useState<string | null>(null)

  const [keepReceiptAfterScan, setKeepReceiptAfterScan] = useState(true)

  async function handleSubmit() {
    if (file === null) {
      toast.error('Please select a file')

      return
    }

    try {
      const data = await forgeAPI.transactions.scanReceipt.mutate({
        file
      })

      onClose()
      open(ModifyTransactionsModal, {
        type: 'create',
        initialData: {
          ...data,
          type: data.type ?? 'expenses',
          receipt: (keepReceiptAfterScan ? file : '') as never
        }
      })
    } catch {
      toast.error('Failed to scan receipt')
    }
  }

  const [loading, onSubmit] = usePromiseLoading(handleSubmit)

  useEffect(() => {
    if (!open) {
      setFile(null)
      setPreview(null)
    }
  }, [open])

  return (
    <div className="min-w-[50vw]">
      <ModalHeader
        hasAI
        actionButtonProps={{
          icon: 'tabler:message',
          onClick: () => {
            open(ManagePromptsModal, {
              onClose: () => {}
            })
          }
        }}
        icon="tabler:scan"
        namespace="apps.wallet"
        title="receipts.scan"
        onClose={onClose}
      />
      <FileInput
        acceptedMimeTypes={{
          image: ['jpeg', 'png', 'jpg'],
          application: ['pdf']
        }}
        file={file}
        icon="tabler:receipt"
        label="receipt"
        namespace="apps.wallet"
        preview={preview}
        setData={({ file, preview }) => {
          setFile(file)
          setPreview(preview)
        }}
      />
      <div className="flex-between mt-4 gap-3">
        <div className="flex w-full min-w-0 items-center gap-2">
          <Icon className="size-5 shrink-0" icon="tabler:file-check" />
          <span className="w-full min-w-0 truncate">
            {t('receipts.keepAfterScan')}
          </span>
        </div>
        <Switch
          value={keepReceiptAfterScan}
          onChange={() => {
            setKeepReceiptAfterScan(!keepReceiptAfterScan)
          }}
        />
      </div>
      <Button
        className="mt-6 w-full"
        icon="tabler:arrow-right"
        iconPosition="end"
        loading={loading}
        onClick={() => {
          onSubmit().catch(console.error)
        }}
      >
        proceed
      </Button>
    </div>
  )
}

export default ScanReceiptModal
