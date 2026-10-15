import { useContext } from 'react'

import { Box, Flex, Text } from '@lifeforge/ui'

import { BreakdownContext } from '..'

function BreakdownChartLegend() {
  const { entities } = useContext(BreakdownContext)

  return (
    <Flex align="center" gapX="lg" gapY="sm" justify="center" wrap="wrap">
      {entities.map(entity => (
        <Flex key={entity.id} align="center" gap="sm">
          <Box
            height="0.75rem"
            r="full"
            style={{
              backgroundColor: entity.color + '30',
              border: `1px solid ${entity.color}`
            }}
            width="0.75rem"
          />
          <Text size="sm">{entity.name}</Text>
        </Flex>
      ))}
    </Flex>
  )
}

export default BreakdownChartLegend
