import { useContext } from 'react'
import { AutoSizer } from 'react-virtualized'

import { Flex, Scrollbar, Stack } from '@lifeforge/ui'

import { BreakdownContext } from '..'
import BreakdownEntityItem from './BreakdownEntityItem'

function BreakdownDetails() {
  const { entities } = useContext(BreakdownContext)

  return (
    <Flex
      flex={{ xl: '1' }}
      height="100%"
      minHeight={{ base: '24em', xl: '0' }}
      width="100%"
    >
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
