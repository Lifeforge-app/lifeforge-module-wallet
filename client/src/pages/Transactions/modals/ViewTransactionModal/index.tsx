import { ModalHeader, WithQueryData } from 'lifeforge-ui'

import forgeAPI from '@/utils/forgeAPI'

import Details from './components/Details'
import Header from './components/Header'

function ViewTransactionModal({
  data: { id },
  onClose
}: {
  data: {
    id: string
  }
  onClose: () => void
}) {
  return (
    <div className="min-w-[30vw] space-y-3">
      <ModalHeader
        icon="tabler:eye"
        namespace="apps.wallet"
        title="transactions.view"
        onClose={onClose}
      />
      <WithQueryData
        controller={forgeAPI.transactions.getById.input({
          id
        })}
      >
        {transaction => (
          <>
            <Header transaction={transaction} />
            <Details transaction={transaction} />
          </>
        )}
      </WithQueryData>
    </div>
  )
}

export default ViewTransactionModal
