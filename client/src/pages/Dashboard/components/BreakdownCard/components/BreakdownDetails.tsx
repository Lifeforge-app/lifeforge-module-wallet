import { useContext } from 'react'
import { AutoSizer } from 'react-virtualized'

import { Flex, Scrollbar, Stack } from '@lifeforge/ui'

import { BreakdownContext } from '..'
import BreakdownEntityItem from './BreakdownEntityItem'

function BreakdownDetails() {
  const { entities } = useContext(BreakdownContext)

  return (
    <Flex height="100%" minHeight="24em" width="100%">
      <AutoSizer>
        {({ width, height }) => (
          <Scrollbar
            style={{
              width,
              height
            }}
          >
            <Stack>
              {entities.map(entity => (
                <BreakdownEntityItem key={entity.id} entity={entity} />
              ))}
            </Stack>
          </Scrollbar>
        )}
      </AutoSizer>
    </Flex>
  )
}

export default BreakdownDetails
