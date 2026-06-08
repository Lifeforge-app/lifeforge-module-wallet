import { type FunctionComponent, lazy } from 'react'
import { type Control, type FieldValues } from 'react-hook-form'
import z from 'zod'

import { Box, ListboxField, TAILWIND_PALETTE } from '@lifeforge/ui'

export const CREATE_ANOTHER_VALUES = [
  'form',
  'scan_receipt',
  'natural_language',
  'none'
] as const

export type CreateAnotherValue = (typeof CREATE_ANOTHER_VALUES)[number]

export const createAnotherSchema = z.enum(CREATE_ANOTHER_VALUES)

const ModifyTransactionsModal = lazy(
  () => import('../modals/ModifyTransactionsModal')
)

const ScanReceiptModal = lazy(() => import('../modals/ScanReceiptModal'))

const NaturalLanguageModal = lazy(
  () => import('../modals/NaturalLanguageModal')
)

type CreateAnotherOption = {
  text: string
  value: CreateAnotherValue
  icon: string
  color: string
  component?: FunctionComponent<{ data: never; onClose: () => void }>
  data?: unknown
}

export const CREATE_ANOTHER_OPTIONS: CreateAnotherOption[] = [
  {
    text: 'No',
    value: 'none',
    icon: 'tabler:x',
    color: TAILWIND_PALETTE.red[500]
  },
  {
    text: 'Form',
    value: 'form',
    icon: 'tabler:forms',
    color: TAILWIND_PALETTE.blue[500],
    component: ModifyTransactionsModal,
    data: { type: 'create' }
  },
  {
    text: 'Scan Receipt',
    value: 'scan_receipt',
    icon: 'tabler:camera',
    color: TAILWIND_PALETTE.purple[500],
    component: ScanReceiptModal,
    data: {}
  },
  {
    text: 'Natural Language',
    value: 'natural_language',
    icon: 'tabler:brain',
    color: TAILWIND_PALETTE.green[500],
    component: NaturalLanguageModal,
    data: {}
  }
]

export default function CreateAnotherField<T extends FieldValues>({
  control
}: {
  control: Control<T>
}) {
  return (
    <Box mt="md">
      <ListboxField
        control={control as never}
        icon="tabler:refresh"
        label="Create Another"
        name="createAnother"
        options={CREATE_ANOTHER_OPTIONS}
      />
    </Box>
  )
}
