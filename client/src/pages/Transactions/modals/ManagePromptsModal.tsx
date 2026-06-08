import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { usePromiseLoading } from '@lifeforge/shared'
import {
  Alert,
  Box,
  Button,
  EmptyStateScreen,
  ModalHeader,
  Stack,
  TextAreaInput,
  WithQuery
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

function ManagePromptsModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('apps.wallet')

  const messagesQuery = useQuery(
    forgeAPI.transactions.prompts.get.queryOptions()
  )

  const openaiAPIKeyAvailabilityQuery = useQuery(
    forgeAPI.checkAPIKeys({ keys: 'openai' }).queryOptions()
  )

  const [prompts, setPrompts] = useState<{ income: string; expenses: string }>({
    income: '',
    expenses: ''
  })

  const savePromptsMutation = useMutation(
    forgeAPI.transactions.prompts.update.mutationOptions({
      onSuccess: () => {
        toast.success('Prompts saved successfully')
        messagesQuery.refetch()
        onClose()
      },
      onError: () => toast.error('Failed to save prompts')
    })
  )

  async function handleAutoGeneratePrompt(field: 'income' | 'expenses') {
    try {
      const response = await forgeAPI.transactions.prompts.autoGenerate.mutate({
        type: field,
        count: 50
      })

      setPrompts(prev => ({ ...prev, [field]: response }))
    } catch {
      toast.error('Failed to auto-generate prompt using AI')
    }
  }

  const [generateLoading, onAutoGenerate] = usePromiseLoading(
    handleAutoGeneratePrompt
  )

  const [saveLoading, onSave] = usePromiseLoading(async function () {
    await savePromptsMutation.mutateAsync(prompts)
  })

  useEffect(() => {
    if (messagesQuery.data) {
      setPrompts({
        income: messagesQuery.data.income,
        expenses: messagesQuery.data.expenses
      })
    }
  }, [messagesQuery.data])

  return (
    <Box minWidth="60vw">
      <ModalHeader
        icon="tabler:robot"
        namespace="apps.wallet"
        title="Manage Prompts"
        onClose={onClose}
      />
      <Alert mb="lg" type="note">
        {t('messages.promptAutoGeneration')}
      </Alert>
      <WithQuery query={openaiAPIKeyAvailabilityQuery}>
        {keyAvailable =>
          keyAvailable ? (
            <WithQuery query={messagesQuery}>
              {() => (
                <Stack gap="xl">
                  <Stack gap="md">
                    <TextAreaInput
                      icon="tabler:arrow-up-circle"
                      label="Income Prompt"
                      namespace="apps.wallet"
                      placeholder="Prompt used to generate particulars for income transactions."
                      value={prompts.income}
                      onChange={value =>
                        setPrompts(prev => ({ ...prev, income: value }))
                      }
                    />
                    <Button
                      icon="mage:stars-c"
                      loading={generateLoading}
                      namespace="apps.wallet"
                      variant="secondary"
                      width="100%"
                      onClick={() => onAutoGenerate('income')}
                    >
                      Auto Generate
                    </Button>
                  </Stack>
                  <Stack gap="md">
                    <TextAreaInput
                      icon="tabler:arrow-down-circle"
                      label="Expenses Prompt"
                      namespace="apps.wallet"
                      placeholder="Prompt used to generate particulars for expenses transactions."
                      value={prompts.expenses}
                      onChange={value =>
                        setPrompts(prev => ({ ...prev, expenses: value }))
                      }
                    />
                    <Button
                      icon="mage:stars-c"
                      loading={generateLoading}
                      namespace="apps.wallet"
                      variant="secondary"
                      width="100%"
                      onClick={() => onAutoGenerate('expenses')}
                    >
                      Auto Generate
                    </Button>
                  </Stack>
                  <Button
                    icon="tabler:device-floppy"
                    loading={saveLoading}
                    mt="md"
                    namespace="apps.wallet"
                    width="100%"
                    onClick={onSave}
                  >
                    Save Prompts
                  </Button>
                </Stack>
              )}
            </WithQuery>
          ) : (
            <EmptyStateScreen
              icon="tabler:robot-off"
              message={{ id: 'openAIApiKeyRequired', namespace: 'apps.wallet' }}
            />
          )
        }
      </WithQuery>
    </Box>
  )
}

export default ManagePromptsModal
