import { useState } from 'react'

import {
  Box,
  ModalHeader,
  Scrollbar,
  SearchInput,
  Stack,
  WithQueryData,
  surface
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'
import { TemplatesTabbedView } from '@/pages/Manage/constants/templates_tabbed_view'
import TemplateList from '@/pages/Manage/tabs/templates/TemplateList'

function ChooseTemplateModal({ onClose }: { onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <Stack height="80vh" minWidth="40vw">
      <ModalHeader
        icon="tabler:template"
        title="templates.choose"
        onClose={onClose}
      />
      <TemplatesTabbedView.Root>
        <TemplatesTabbedView.Selector />
        <SearchInput
          bg={surface.lightInteractive}
          debounceMs={300}
          my="md"
          searchTarget="template"
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <Box flex="1" minHeight="0">
          <WithQueryData contract={forgeAPI.templates.list}>
            {templates => (
              <Scrollbar>
                <TemplateList
                  choosing
                  searchQuery={searchQuery}
                  templates={templates}
                  onClose={onClose}
                />
              </Scrollbar>
            )}
          </WithQueryData>
        </Box>
      </TemplatesTabbedView.Root>
    </Stack>
  )
}

export default ChooseTemplateModal
