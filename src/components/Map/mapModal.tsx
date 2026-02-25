'use client'

import 'leaflet-arrowheads'
import 'leaflet/dist/leaflet.css'
import {
  Circle,
  CircleMarker,
  LayerGroup,
  LayersControl,
  MapContainer,
  Marker,
  Polygon,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'

import { LatLngExpression } from 'leaflet'
import { getBuildings } from './buildingsPopups'
import { routes } from './routes'
import { LocateMeButton } from './LocateMeButton'
import { getParkingLots, carparkRadius, carparkColor } from './parkingLots'
import { RouteWithArrows } from './RouteWithArrows'
import { placeholderIcon } from './customIcons'
import MapLink from './MapLink'
import { useTranslations } from 'next-intl'

const entranceAuschwitz: LatLngExpression = [50.0294894, 19.2053725]
const entranceBirkenau: LatLngExpression = [50.0343937, 19.1809423]

const CustomAttribution = () => {
  const map = useMap()
  map.attributionControl.setPrefix(false)
  return null
}

export default function MapModal() {
  const t = useTranslations()

  const buildings = getBuildings(t)
  const parkingLots = getParkingLots(t)

  const layers = [
    {
      name: t('map-layer-buildings'),
      defaultChecked: true,
      markers: Object.keys(buildings).map((slug) => {
        const building = buildings[slug]
        const isPoint = building.positions.length === 1

        if (isPoint) {
          return (
            <Circle
              key={slug}
              center={building.positions[0] as [number, number]}
              radius={8}
              pathOptions={{ color: 'green', fillColor: '', fillOpacity: 0.5 }}
            >
              {building.popup && <Popup>{building.popup}</Popup>}
            </Circle>
          )
        } else {
          return (
            <Polygon
              key={slug}
              positions={building.positions}
              pathOptions={{ color: 'green', weight: 2, fillOpacity: 0.5 }}
            >
              {building.popup && <Popup>{building.popup}</Popup>}
            </Polygon>
          )
        }
      }),
    },
    {
      name: t('map-layer-routes'),
      defaultChecked: true,
      markers: Object.keys(routes).map((slug) => (
        <RouteWithArrows key={slug} positions={routes[slug].path} />
      )),
    },
    {
      name: t('map-layer-entrances'),
      defaultChecked: true,
      markers: (
        <>
          <Marker position={entranceAuschwitz} icon={placeholderIcon}>
            <Popup>
              <strong>{t('map-entrance-auschwitz-title')}</strong>
              <br />
              {t('map-entrance-auschwitz-desc')} <br />
              <br />
              <strong>
                <MapLink url="arrival#get-to-birkenau">
                  {t('map-entrance-auschwitz-link')}
                </MapLink>
              </strong>
            </Popup>
          </Marker>
          <Marker position={entranceBirkenau} icon={placeholderIcon}>
            <Popup>
              <strong>{t('map-entrance-birkenau-title')}</strong>
              <br />
              {t('map-entrance-birkenau-desc')}
              <br />
              <br />
              <strong>
                <MapLink url="tour#birkenau-gate">{t('map-entrance-birkenau-link')}</MapLink>
              </strong>
            </Popup>
          </Marker>
        </>
      ),
    },
    {
      name: t('map-layer-parking'),
      defaultChecked: false,
      markers: parkingLots.map((lot, index) => (
        <CircleMarker
          key={index}
          center={lot.center}
          pathOptions={{ color: carparkColor, fillColor: carparkColor }}
          radius={carparkRadius}
        >
          <Popup>{lot.popupContent}</Popup>
        </CircleMarker>
      )),
    },
  ]

  return (
    <div className="w-full h-full relative z-40">
      <MapContainer
        center={[50.027063, 19.20411]}
        zoom={16}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a target='_blank' rel='noopener noreferrer' href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />
        <LayersControl position="topright" collapsed={true}>
          {layers.map((layer) => (
            <LayersControl.Overlay
              name={layer.name}
              key={layer.name}
              checked={layer.defaultChecked}
            >
              <LayerGroup>{layer.markers}</LayerGroup>
              <CustomAttribution />
            </LayersControl.Overlay>
          ))}
        </LayersControl>
        <LocateMeButton />
      </MapContainer>
    </div>
  )
}
