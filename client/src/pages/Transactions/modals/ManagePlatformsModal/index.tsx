import {
  Button,
  ModalHeader,
  Stack,
  WithQueryData,
  useModalStore
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import ModifyPlatformModal from '../ModifyPlatformModal'
import PlatformList from './components/PlatformList'

function ManagePlatformsModal({ onClose }: { onClose: () => void }) {
  const { open } = useModalStore()

  return (
    <Stack minHeight="80vh" minWidth="40vw">
      <ModalHeader
        icon="tabler:building-store"
        title="platforms.manage"
        trailing={
          <Button
            icon="tabler:plus"
            variant="plain"
            onClick={() => open(ModifyPlatformModal, { type: 'create' })}
          />
        }
        onClose={onClose}
      />
      <WithQueryData contract={forgeAPI.platforms.list}>
        {platforms => <PlatformList platforms={platforms} />}
      </WithQueryData>
    </Stack>
  )
}

export default ManagePlatformsModal
