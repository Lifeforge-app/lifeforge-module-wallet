import { useEffect } from 'react'
import { AutoSizer } from 'react-virtualized'

import type { InferOutput } from '@lifeforge/api'
import { Box, EmptyStateScreen, Flex, Scrollbar, Stack } from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import { TemplatesTabbedView } from '../constants/tabbed_view'
import TemplateItem from './Templateitem'

function TemplateList({
  templates,
  choosing,
  searchQuery,
  onClose
}: {
  templates: InferOutput<typeof forgeAPI.templates.list>
  choosing: boolean | undefined
  searchQuery: string
  onClose: () => void
}) {
  const { currentTab, setAmounts } = TemplatesTabbedView.useContext()

  useEffect(() => {
    if (!templates) return

    setAmounts({
      income: templates.income.length,
      expenses: templates.expenses.length
    })
  }, [templates?.income?.length, templates?.expenses?.length, setAmounts])

  const list = templates[currentTab]

  if (list.length === 0) {
    return (
      <Flex centered flex="1">
        <EmptyStateScreen
          icon="tabler:template-off"
          message={{
            id: 'templates'
          }}
        />
      </Flex>
    )
  }

  const query = searchQuery.trim().toLowerCase()

  const filtered = query
    ? list.filter(
        template =>
          template.name.toLowerCase().includes(query) ||
          template.particulars.toLowerCase().includes(query)
      )
    : list

  if (filtered.length === 0) {
    return (
      <Flex centered flex="1">
        <EmptyStateScreen
          icon="tabler:search-off"
          message={{
            id: 'results'
          }}
        />
      </Flex>
    )
  }

  return (
    <Box flex="1" height="100%">
      <AutoSizer>
        {({ width, height }) => (
          <Scrollbar style={{ width, height }}>
            <Stack>
              {filtered.map(template => (
                <TemplateItem
                  key={template.id}
                  choosing={!!choosing}
                  template={template}
                  onClose={onClose}
                />
              ))}
            </Stack>
          </Scrollbar>
        )}
      </AutoSizer>
    </Box>
  )
}

export default TemplateList
