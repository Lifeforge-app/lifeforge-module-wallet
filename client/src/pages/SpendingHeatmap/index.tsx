import { useQuery } from '@tanstack/react-query'
import { APIProvider, AdvancedMarker, Map } from '@vis.gl/react-google-maps'
import { EmptyStateScreen, ModuleHeader, WithQuery } from 'lifeforge-ui'
import { useMemo } from 'react'
import { type InferOutput, useNavigate } from 'shared'
import colors from 'tailwindcss/colors'

import forgeAPI from '@/utils/forgeAPI'
import numberToCurrency from '@/utils/numberToCurrency'

import '../../index.css'

type SpendingLocationData = InferOutput<
  typeof forgeAPI.analytics.getSpendingByLocation
>[number]

function SpendingHeatmap() {
  const spendingDataQuery = useQuery(
    forgeAPI.analytics.getSpendingByLocation.queryOptions()
  )

  const googleMapAPIKeyQuery = useQuery(
    forgeAPI
      .getAPIKeys({
        keyId: 'gcloud'
      })
      .queryOptions({
        retry: false
      })
  )

  const navigate = useNavigate()

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
    if (amount <= 100) return colors.green[500]
    if (amount <= 500) return colors.yellow[500]
    if (amount <= 1000) return colors.orange[500]

    return colors.red[500]
  }

  const centerPoint = useMemo(() => {
    if (spendingData.length === 0) {
      return { lat: 0, lng: 0 }
    }

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
        namespace="apps.wallet"
        title="Spending Heatmap"
        tKey="subsectionsTitleAndDesc"
      />
      <WithQuery query={googleMapAPIKeyQuery} showRetryButton={false}>
        {googleMapAPIKey =>
          googleMapAPIKey ? (
            <WithQuery query={spendingDataQuery}>
              {() =>
                spendingData.length > 0 ? (
                  <APIProvider apiKey={googleMapAPIKey}>
                    <Map
                      className="mb-8 h-full w-full flex-1 overflow-hidden rounded-lg"
                      defaultCenter={centerPoint}
                      defaultZoom={8}
                      mapId="SpendingHeatmap"
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
                            <div
                              className="relative cursor-pointer rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110"
                              style={{
                                backgroundColor: getMarkerColor(
                                  locationData.amount
                                ),
                                width: getMarkerSize(locationData.count),
                                height: getMarkerSize(locationData.count)
                              }}
                              title={`${locationData.locationName}: ${numberToCurrency(locationData.amount)}`}
                            >
                              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                                {locationData.count}
                              </div>
                            </div>
                          </AdvancedMarker>
                        )
                      )}
                    </Map>
                  </APIProvider>
                ) : (
                  <EmptyStateScreen
                    icon="tabler:map-pin-off"
                    message={{
                      id: 'location',
                      namespace: 'apps.wallet'
                    }}
                  />
                )
              }
            </WithQuery>
          ) : (
            <EmptyStateScreen
              icon="tabler:key-off"
              message={{
                id: 'mapKey',
                namespace: 'apps.wallet'
              }}
            />
          )
        }
      </WithQuery>
    </>
  )
}

export default SpendingHeatmap
