import { useRef, useState } from 'react'
import { Link } from 'react-router'

import type { WidgetConfig } from '@lifeforge/configs'
import { useModuleTranslation } from '@lifeforge/localization'
import {
  Box,
  Button,
  Card,
  EmptyStateScreen,
  Flex,
  Grid,
  Icon,
  Scrollbar,
  Stack,
  TagChip,
  Text,
  Widget,
  WithQuery,
  surface,
  useDivSize
} from '@lifeforge/ui'

import LiabilityUtilisation from '../components/LiabilityUtilisation'
import NetWorthSummary from '../components/NetWorthSummary'
import { useWalletData } from '../hooks/useWalletData'
import numberToCurrency from '../utils/numberToCurrency'

export default function AssetsBalance() {
  const { assetsQuery } = useWalletData()
  const { t } = useModuleTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const { width } = useDivSize(ref)
  const [showBalance, setShowBalance] = useState(false)

  return (
    <Widget
      actionComponent={
        <Button
          icon={!showBalance ? 'tabler:eye-off' : 'tabler:eye'}
          p="xs"
          variant="plain"
          onClick={() => {
            setShowBalance(!showBalance)
          }}
        />
      }
      icon="tabler:wallet"
      title="Assets Balance"
    >
      <WithQuery query={assetsQuery}>
        {assets =>
          assets.length === 0 ? (
            <EmptyStateScreen
              smaller
              icon="tabler:wallet-off"
              message={{
                id: 'assets',
                tKey: 'widgets.assetsBalance'
              }}
            />
          ) : (
            <Stack height="100%" width="100%">
              <NetWorthSummary assets={assets} hidden={!showBalance} />
              <Scrollbar>
                <Grid
                  ref={ref}
                  gap="sm"
                  templateCols={
                    width > 400
                      ? 'repeat(auto-fill, minmax(240px, 1fr))'
                      : undefined
                  }
                >
                  {assets.map(asset => (
                    <Card
                      key={asset.id}
                      isInteractive
                      as={Link}
                      bg={surface.lightInteractive}
                      direction="row"
                      gap="md"
                      minWidth="0"
                      to="/wallet/assets"
                    >
                      <Flex align="center" gap="md" minWidth="0" width="100%">
                        <Box
                          bg={{ base: 'bg-200', dark: 'bg-700' }}
                          p="sm"
                          r="md"
                        >
                          <Icon
                            color={{ base: 'bg-500', dark: 'bg-100' }}
                            icon={asset.icon}
                            size="1.5rem"
                          />
                        </Box>
                        <Stack gap="xs" minWidth="0" width="100%">
                          <Flex align="center" gap="sm" minWidth="0">
                            <Text truncate weight="semibold">
                              {asset.name}
                            </Text>
                            {asset.is_liability && (
                              <TagChip
                                color="#ef4444"
                                icon="tabler:credit-card"
                                label={t('tags.liability')}
                              />
                            )}
                          </Flex>
                          <LiabilityUtilisation asset={asset} />
                          <Flex align="center" color="muted" gap="xs">
                            <Text color="muted" size="sm">
                              RM{' '}
                            </Text>
                            {showBalance ? (
                              <Text color="muted" size="sm">
                                {numberToCurrency(asset.current_balance)}
                              </Text>
                            ) : (
                              <Flex align="center">
                                {Array(4)
                                  .fill(0)
                                  .map((_, i) => (
                                    <Icon
                                      key={i}
                                      icon="uil:asterisk"
                                      size="0.75rem"
                                    />
                                  ))}
                              </Flex>
                            )}
                          </Flex>
                        </Stack>
                      </Flex>
                      <Icon
                        color={{ base: 'bg-300', dark: 'bg-700' }}
                        icon="tabler:chevron-right"
                      />
                    </Card>
                  ))}
                </Grid>
              </Scrollbar>
            </Stack>
          )
        }
      </WithQuery>
    </Widget>
  )
}

export const config: WidgetConfig = {
  id: 'assetsBalance',
  icon: 'tabler:coin'
}
