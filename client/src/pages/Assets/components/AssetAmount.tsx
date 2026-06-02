import type { ComponentProps } from 'react'

import { Flex, Icon, Text } from '@lifeforge/ui'

import { useWalletStore } from '@/stores/useWalletStore'
import numberToCurrency from '@/utils/numberToCurrency'

function AssetAmount({
  amount,
  display
}: {
  amount: number
  display?: ComponentProps<typeof Flex>['display']
}) {
  const { isAmountHidden } = useWalletStore()

  return (
    <Flex asChild align={isAmountHidden ? 'center' : 'end'} display={display}>
      <Text size={{ base: '3xl', sm: '5xl' }} weight="medium">
        <Text color="muted" mr="sm" size={{ base: 'xl', sm: '3xl' }}>
          RM
        </Text>
        {isAmountHidden ? (
          <Flex align="center">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Icon
                  key={i}
                  icon="uil:asterisk"
                  size={{ base: '1.5rem', sm: '2rem' }}
                />
              ))}
          </Flex>
        ) : (
          <Text truncate>{numberToCurrency(amount)}</Text>
        )}
      </Text>
    </Flex>
  )
}

export default AssetAmount
