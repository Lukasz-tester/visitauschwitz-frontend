import { LatLngExpression } from 'leaflet'
import { ReactNode } from 'react'
import MapLink from './MapLink'

export const carparkMuzeum: LatLngExpression = [50.02997, 19.20587]
export const carparkSzajny: LatLngExpression = [50.02717, 19.19931]
export const carparkBirkenau1: LatLngExpression = [50.03555, 19.18403]
export const carparkBirkenau2: LatLngExpression = [50.04003, 19.18164]
export const carparkImperiale: LatLngExpression = [50.02856, 19.1986]
export const carparkRide: LatLngExpression = [50.04275, 19.20224]
export const carparkJaracza: LatLngExpression = [50.03236, 19.19818]

export const carparkRadius = 25
export const carparkColor = 'blue'

export const getParkingLots = (
  t: (key: string) => string,
): { center: LatLngExpression; popupContent: ReactNode }[] => [
  {
    center: carparkMuzeum,
    popupContent: (
      <>
        {t('map-parking-museum-car')}
        <br />
        {t('map-parking-museum-minibus')}
        <br />
        {t('map-parking-museum-bus')}
        <br />
        {t('map-parking-museum-camper')}
        <br />
        {t('map-parking-museum-motorcycle')}
        <br />
        <br />
        <strong>
          <MapLink url="museum#main-entry">{t('map-parking-museum-link')}</MapLink>
        </strong>
      </>
    ),
  },
  {
    center: carparkSzajny,
    popupContent: <p>{t('map-parking-szajny')}</p>,
  },
  {
    center: carparkImperiale,
    popupContent: <p>{t('map-parking-imperiale')}</p>,
  },
  {
    center: carparkBirkenau1,
    popupContent: <p>{t('map-parking-birkenau1')}</p>,
  },
  {
    center: carparkBirkenau2,
    popupContent: (
      <>
        {t('map-parking-birkenau2-car')}
        <br />
        {t('map-parking-birkenau2-camper')}
        <br />
        {t('map-parking-birkenau2-bus')}
        <br />
        {t('map-parking-birkenau2-motorcycle')}
      </>
    ),
  },
  {
    center: carparkRide,
    popupContent: <p>{t('map-parking-ride')}</p>,
  },
  {
    center: carparkJaracza,
    popupContent: <p>{t('map-parking-jaracza')}</p>,
  },
]
