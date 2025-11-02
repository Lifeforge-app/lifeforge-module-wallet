import type { WalletTransaction } from '@/hooks/useWalletData'
import forgeAPI from '@/utils/forgeAPI'
import { useQuery } from '@tanstack/react-query'
import { APIProvider, AdvancedMarker, Map } from '@vis.gl/react-google-maps'
import { EmptyStateScreen, WithQuery } from 'lifeforge-ui'

import DetailItem from './DetailItem'

function LocationSection({
  transaction
}: {
  transaction: WalletTransaction & {
    type: 'income' | 'expenses'
  }
}) {
  const googleMapAPIKey = useQuery(
    forgeAPI.apiKeys.entries.get
      .input({
        keyId: 'gcloud'
      })
      .queryOptions()
  )

  return (
    <DetailItem vertical icon="tabler:map-pin" label="location">
      <WithQuery query={googleMapAPIKey}>
        {key =>
          key ? (
            <APIProvider apiKey={key}>
              <Map
                className="h-96 overflow-hidden rounded-md"
                defaultCenter={{
                  lat: transaction.location_coords?.lat || 0,
                  lng: transaction.location_coords?.lon || 0
                }}
                defaultZoom={15}
                mapId="LocationMap"
              >
                <AdvancedMarker
                  position={{
                    lat: transaction.location_coords?.lat || 0,
                    lng: transaction.location_coords?.lon || 0
                  }}
                />
              </Map>
            </APIProvider>
          ) : (
            <EmptyStateScreen
              smaller
              icon="tabler:key-off"
              name="mapKey"
              namespace="apps.wallet"
            />
          )
        }
      </WithQuery>
    </DetailItem>
  )
}

export default LocationSection
