import { useQuery } from '@tanstack/react-query'
import { APIProvider, AdvancedMarker, Map } from '@vis.gl/react-google-maps'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'

import { type InferOutput } from '@lifeforge/api'
import {
  EmptyStateScreen,
  Flex,
  ModuleHeader,
  TAILWIND_PALETTE,
  Text,
  WithQuery,
  usePersonalization
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'
import numberToCurrency from '@/utils/numberToCurrency'

type SpendingLocationData = InferOutput<
  typeof forgeAPI.analytics.getSpendingByLocation
>[number]

function SpendingHeatmap() {
  const navigate = useNavigate()
  const { derivedTheme } = usePersonalization()

  const spendingDataQuery = useQuery(
    forgeAPI.analytics.getSpendingByLocation.queryOptions()
  )

  const googleMapAPIKeyQuery = useQuery(
    forgeAPI.getAPIKeys({ keyId: 'gcloud' }).queryOptions({ retry: false })
  )

  const spendingData = spendingDataQuery.data ?? []

  const maxCount = useMemo(() => {
    return Math.max(
      ...spendingData.map((data: SpendingLocationData) => data.count),
      0
    )
  }, [spendingData])

  const getMarkerSize = (count: number) => {
    if (count === 0) return 30

    const ratio = count / maxCount

    return Math.max(30, 30 + ratio * 40)
  }

  const getMarkerColor = (amount: number) => {
    if (amount <= 100) return TAILWIND_PALETTE.green[500]
    if (amount <= 500) return TAILWIND_PALETTE.yellow[500]
    if (amount <= 1000) return TAILWIND_PALETTE.orange[500]

    return TAILWIND_PALETTE.red[500]
  }

  const centerPoint = useMemo(() => {
    if (spendingData.length === 0) return { lat: 0, lng: 0 }

    const avgLat =
      spendingData.reduce(
        (sum, data: SpendingLocationData) => sum + data.lat,
        0
      ) / spendingData.length

    const avgLng =
      spendingData.reduce(
        (sum, data: SpendingLocationData) => sum + data.lng,
        0
      ) / spendingData.length

    return { lat: avgLat, lng: avgLng }
  }, [spendingData])

  return (
    <>
      <ModuleHeader
        icon="uil:map-marker"
        title="Spending Heatmap"
      />
      <WithQuery query={googleMapAPIKeyQuery} showRetryButton={false}>
        {googleMapAPIKey =>
          googleMapAPIKey ? (
            <WithQuery query={spendingDataQuery}>
              {() =>
                spendingData.length > 0 ? (
                  <APIProvider apiKey={googleMapAPIKey}>
                    <Map
                      colorScheme={derivedTheme === 'dark' ? 'DARK' : 'LIGHT'}
                      defaultCenter={centerPoint}
                      defaultZoom={8}
                      mapId="SpendingHeatmap"
                      style={{
                        width: '100%',
                        height: '100%',
                        flex: 1,
                        borderRadius: 'var(--radius-lg)'
                      }}
                    >
                      {spendingData.map(
                        (locationData: SpendingLocationData, index) => (
                          <AdvancedMarker
                            key={index}
                            position={{
                              lat: locationData.lat,
                              lng: locationData.lng
                            }}
                            onClick={() => {
                              navigate(
                                `/wallet/transactions?query=${encodeURIComponent(
                                  locationData.locationName
                                )}`
                              )
                            }}
                          >
                            <Flex
                              centered
                              align="center"
                              height={`${getMarkerSize(locationData.count)}px`}
                              position="relative"
                              r="full"
                              style={{
                                backgroundColor: getMarkerColor(
                                  locationData.amount
                                ),
                                border: '2px solid white',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                              }}
                              title={`${locationData.locationName}: ${numberToCurrency(locationData.amount)}`}
                              width={`${getMarkerSize(locationData.count)}px`}
                            >
                              <Text
                                align="center"
                                color="bg-100"
                                size="xs"
                                weight="bold"
                              >
                                {locationData.count}
                              </Text>
                            </Flex>
                          </AdvancedMarker>
                        )
                      )}
                    </Map>
                  </APIProvider>
                ) : (
                  <EmptyStateScreen
                    icon="tabler:map-pin-off"
                    message={{
                      id: 'location'
                    }}
                  />
                )
              }
            </WithQuery>
          ) : (
            <EmptyStateScreen
              icon="tabler:key-off"
              message={{
                id: 'mapKey'
              }}
            />
          )
        }
      </WithQuery>
    </>
  )
}

export default SpendingHeatmap
