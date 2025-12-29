import { Icon } from '@iconify/react'
import { Card, useModalStore } from 'lifeforge-ui'

import type { Category } from '..'
import ModifyBudgetModal from '../modals/ModifyBudgetModal'

function NoBudgetCard({
  category,
  year,
  month
}: {
  category: Category
  year: number
  month: number
}) {
  const open = useModalStore(state => state.open)

  const handleCreate = () => {
    open(ModifyBudgetModal, {
      type: 'create',
      category,
      year,
      month
    })
  }

  return (
    <Card
      isInteractive
      className="flex items-center gap-3"
      onClick={handleCreate}
    >
      <span
        className="rounded-md p-3 in-[.bordered]:border-2"
        style={{
          backgroundColor: category.color + '20',
          borderColor: category.color + '20'
        }}
      >
        <Icon
          className="size-6"
          icon={category.icon}
          style={{ color: category.color }}
        />
      </span>
      <h3 className="w-full text-lg font-medium">{category.name}</h3>
      <Icon className="text-bg-500 mr-2 size-5" icon="tabler:plus" />
    </Card>
  )
}

export default NoBudgetCard
