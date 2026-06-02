import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { usePromiseLoading } from '@lifeforge/shared'
import {
  Box,
  Button,
  FileInput,
  Flex,
  Icon,
  ModalHeader,
  Switch,
  Text,
  useModalStore
} from '@lifeforge/ui'
import type { FileValue } from '@lifeforge/ui'

import forgeAPI from '@/utils/forgeAPI'

import ManagePromptsModal from './ManagePromptsModal'
import ModifyTransactionsModal from './ModifyTransactionsModal'

function ScanReceiptModal({ onClose }: { onClose: () => void }) {
  const { open } = useModalStore()

  const { t } = useTranslation('apps.wallet')

  const [fileValue, setFileValue] = useState<FileValue>({ type: 'empty' })

  const [keepReceiptAfterScan, setKeepReceiptAfterScan] = useState(true)

  async function handleSubmit() {
    if (fileValue.type === 'empty') {
      toast.error('Please select a file')

      return
    }

    try {
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
        initialData: {
          ...data,
          type: data.type ?? 'expenses',
          receipt: (keepReceiptAfterScan ? theFile : '') as never
        }
      })
    } catch {
      toast.error('Failed to scan receipt')
    }
  }

  const [loading, onSubmit] = usePromiseLoading(handleSubmit)

  useEffect(() => {
    if (!open) {
      setFileValue({ type: 'empty' })
    }
  }, [open])

  return (
    <Box minWidth="50vw">
      <ModalHeader
        hasAI
        headerActions={
          <Button
            icon="tabler:message"
            variant="plain"
            onClick={() => open(ManagePromptsModal, { onClose: () => {} })}
          />
        }
        icon="tabler:scan"
        namespace="apps.wallet"
        title="receipts.scan"
        onClose={onClose}
      />
      <FileInput
        icon="tabler:receipt"
        label="receipt"
        mimeTypes={{
          image: ['jpeg', 'png', 'jpg'],
          application: ['pdf']
        }}
        namespace="apps.wallet"
        value={fileValue}
        onChange={setFileValue}
      />
      <Flex align="center" gap="md" justify="between" mt="md">
        <Flex align="center" gap="sm" minWidth="0" width="100%">
          <Icon icon="tabler:file-check" size="1.25rem" />
          <Text truncate>{t('receipts.keepAfterScan')}</Text>
        </Flex>
        <Switch
          value={keepReceiptAfterScan}
          onChange={() => setKeepReceiptAfterScan(!keepReceiptAfterScan)}
        />
      </Flex>
      <Button
        icon="tabler:arrow-right"
        iconPosition="end"
        loading={loading}
        mt="lg"
        width="100%"
        onClick={() => onSubmit().catch(console.error)}
      >
        proceed
      </Button>
    </Box>
  )
}

export default ScanReceiptModal
