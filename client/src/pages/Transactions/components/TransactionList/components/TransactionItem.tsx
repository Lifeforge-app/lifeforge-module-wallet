import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import {
  Card,
  ConfirmationModal,
  ContextMenu,
  ContextMenuItem,
  useModalStore
} from '@lifeforge/ui'

import forgeAPI from '@/utils/forgeAPI'

import type { WalletTransaction } from '../../..'
import ModifyTransactionsModal from '../../../modals/ModifyTransactionsModal'
import ViewTransactionModal from '../../../modals/ViewTransactionModal'
import TransactionIncomeExpensesItem from './TransactionIncomeExpensesItem'
import TransactionTransferItem from './TransactionTransferItem'

function TransactionItem({
  transaction,
  viewOnly
}: {
  transaction: WalletTransaction
  viewOnly?: boolean
}) {
  const queryClient = useQueryClient()

  const { open } = useModalStore()

  const deleteMutation = useMutation(
    forgeAPI.transactions.remove.input({ id: transaction.id }).mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['wallet'] })
      },
      onError: () => {
        toast.error('Failed to delete transaction')
      }
    })
  )

  return (
    <Card
      isInteractive
      align="center"
      direction="row"
      gap="md"
      justify="between"
      onClick={() => open(ViewTransactionModal, { id: transaction.id })}
    >
      {transaction.type === 'transfer' ? (
        <TransactionTransferItem transaction={transaction} />
      ) : (
        <TransactionIncomeExpensesItem transaction={transaction} />
      )}
      {!viewOnly && (
        <ContextMenu>
          {transaction.type !== 'transfer' && (
            <ContextMenuItem
              icon="tabler:copy"
              label="Copy"
              onClick={() => {
                navigator.clipboard.writeText(transaction.particulars)
                toast.success('Transaction particulars copied to clipboard')
              }}
            />
          )}
          <ContextMenuItem
            icon="tabler:pencil"
            label="Edit"
            onClick={() =>
              open(ModifyTransactionsModal, {
                type: 'update',
                initialData: transaction
              })
            }
          />
          <ContextMenuItem
            dangerous
            icon="tabler:trash"
            label="Delete"
            onClick={() => {
              open(ConfirmationModal, {
                title: 'Delete Transaction',
                description:
                  'Are you sure you want to delete this transaction?',
                confirmationButton: 'delete',
                onConfirm: async () => {
                  await deleteMutation.mutateAsync(undefined)
                }
              })
            }}
          />
        </ContextMenu>
      )}
    </Card>
  )
}

export default TransactionItem
