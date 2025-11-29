import forgeAPI from '@/utils/forgeAPI'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Alert,
  Button,
  EmptyStateScreen,
  ModalHeader,
  TextAreaInput,
  WithQuery
} from 'lifeforge-ui'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { usePromiseLoading } from 'shared'

function ManagePromptsModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('apps.wallet')

  const messagesQuery = useQuery(
    forgeAPI.wallet.transactions.prompts.get.queryOptions()
  )

  const openaiAPIKeyAvailabilityQuery = useQuery(
    forgeAPI.apiKeys.entries.checkKeys
      .input({
        keys: 'openai'
      })
      .queryOptions()
  )

  const [prompts, setPrompts] = useState<{ income: string; expenses: string }>({
    income: '',
    expenses: ''
  })

  const savePromptsMutation = useMutation(
    forgeAPI.wallet.transactions.prompts.update.mutationOptions({
      onSuccess: () => {
        toast.success('Prompts saved successfully')
        messagesQuery.refetch()
        onClose()
      },
      onError: () => {
        toast.error('Failed to save prompts')
      }
    })
  )

  const handleChange = (field: 'income' | 'expenses', value: string) => {
    setPrompts(prev => ({ ...prev, [field]: value }))
  }

  async function handleAutoGeneratePrompt(field: 'income' | 'expenses') {
    try {
      const response =
        await forgeAPI.wallet.transactions.prompts.autoGenerate.mutate({
          type: field,
          count: 50
        })

      setPrompts(prev => ({ ...prev, [field]: response }))
    } catch {
      toast.error('Failed to auto-generate prompt using AI')
    }
  }

  async function handleSavePrompts() {
    await savePromptsMutation.mutateAsync(prompts)
  }

  const [generateLoading, onAutoGenerate] = usePromiseLoading(
    handleAutoGeneratePrompt
  )

  const [saveLoading, onSave] = usePromiseLoading(handleSavePrompts)

  useEffect(() => {
    if (messagesQuery.data) {
      setPrompts({
        income: messagesQuery.data.income,
        expenses: messagesQuery.data.expenses
      })
    }
  }, [messagesQuery.data])

  return (
    <div className="min-w-[60vw]">
      <ModalHeader
        icon="tabler:robot"
        namespace="apps.wallet"
        title="Manage Prompts"
        onClose={onClose}
      />
      <Alert className="mb-4" type="note">
        {t('messages.promptAutoGeneration')}
      </Alert>
      <WithQuery query={openaiAPIKeyAvailabilityQuery}>
        {keyAvailable =>
          keyAvailable ? (
            <WithQuery query={messagesQuery}>
              {() => (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <TextAreaInput
                      icon="tabler:arrow-up-circle"
                      label="Income Prompt"
                      namespace="apps.wallet"
                      placeholder="Prompt used to generate particulars for income transactions."
                      value={prompts.income}
                      onChange={value => handleChange('income', value)}
                    />
                    <Button
                      className="w-full"
                      icon="mage:stars-c"
                      loading={generateLoading}
                      namespace="apps.wallet"
                      variant="secondary"
                      onClick={() => onAutoGenerate('income')}
                    >
                      Auto Generate
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <TextAreaInput
                      icon="tabler:arrow-down-circle"
                      label="Expenses Prompt"
                      namespace="apps.wallet"
                      placeholder="Prompt used to generate particulars for expenses transactions."
                      value={prompts.expenses}
                      onChange={value => handleChange('expenses', value)}
                    />
                    <Button
                      className="w-full"
                      icon="mage:stars-c"
                      loading={generateLoading}
                      namespace="apps.wallet"
                      variant="secondary"
                      onClick={() => onAutoGenerate('expenses')}
                    >
                      Auto Generate
                    </Button>
                  </div>
                  <Button
                    className="mt-4 w-full"
                    icon="tabler:device-floppy"
                    loading={saveLoading}
                    namespace="apps.wallet"
                    onClick={onSave}
                  >
                    Save Prompts
                  </Button>
                </div>
              )}
            </WithQuery>
          ) : (
            <EmptyStateScreen
              icon="tabler:robot-off"
              message={{
                id: 'openAIApiKeyRequired',
                namespace: 'apps.wallet'
              }}
            />
          )
        }
      </WithQuery>
    </div>
  )
}

export default ManagePromptsModal
