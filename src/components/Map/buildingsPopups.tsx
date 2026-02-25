import { LatLngExpression } from 'leaflet'
import { ReactNode } from 'react'
import MapLink from './MapLink'

type BuildingEntry = {
  positions: LatLngExpression[] | LatLngExpression[][]
  popup?: ReactNode
}

export const getBuildings = (t: (key: string) => string): { [slug: string]: BuildingEntry } => ({
  blok4: {
    positions: [
      [50.0266800, 19.2048963],
      [50.0266301, 19.2048382],
      [50.0265800, 19.2047798],
      [50.0263392, 19.2052778],
      [50.0264394, 19.2053944],
      [50.0266800, 19.2048963],
    ],
    popup: (
      <>
        <strong>{t('map-blok4-title')}</strong>
        <br />
        {t('map-blok4-desc')}
        <br /> <br />
        <strong>
          <MapLink url="tour#block-4">{t('map-blok4-link')}</MapLink>
        </strong>
      </>
    ),
  },
  blok5: {
    positions: [
      [50.0264938, 19.2046798],
      [50.0264453, 19.2046223],
      [50.0263953, 19.2045632],
      [50.0262722, 19.2048144],
      [50.0261502, 19.2050631],
      [50.0262489, 19.2051795],
      [50.0264938, 19.2046798],
    ],
    popup: (
      <>
        <strong>{t('map-blok5-title')}</strong>
        <br />
        {t('map-blok5-desc')}
        <br /> <br />
        <strong>
          <MapLink url="tour#block-5">{t('map-blok5-link')}</MapLink>
        </strong>
      </>
    ),
  },
  blok8: {
    positions: [
      [50.0257346, 19.2042246],
      [50.0257470, 19.2042243],
      [50.0257586, 19.2042021],
      [50.0257547, 19.2041827],
      [50.0258666, 19.2039484],
      [50.0258187, 19.2038931],
      [50.0257675, 19.2038347],
      [50.0255244, 19.2043409],
      [50.0256236, 19.2044554],
      [50.0257346, 19.2042246],
    ],
    popup: (
      <>
        <strong>{t('map-blok8-title')}</strong>
        <br />
        {t('map-blok8-desc')}
        <br /> <br />
        <strong>
          <MapLink url="tour#block-8">{t('map-blok8-link')}</MapLink>
        </strong>
      </>
    ),
  },
  blok11wewnetrznewiezieniebloksmierci: {
    positions: [
      [50.0253112, 19.2033089],
      [50.0252638, 19.2032555],
      [50.0252132, 19.2031973],
      [50.0251002, 19.2034267],
      [50.0250838, 19.2034195],
      [50.0250739, 19.2034407],
      [50.0250828, 19.2034631],
      [50.0249707, 19.2036943],
      [50.0250687, 19.2038088],
      [50.0251795, 19.2035803],
      [50.0253112, 19.2033089],
    ],
    popup: (
      <>
        <strong>{t('map-blok11-title')}</strong>
        <br />
        {t('map-blok11-desc')}
        <br /> <br />
        <strong>
          <MapLink url="tour#block-11">{t('map-blok11-link')}</MapLink>
        </strong>
      </>
    ),
  },
  komoragazowakrematoriumi: {
    positions: [
      [50.0282422, 19.204818],
      [50.0281888, 19.2047573],
      [50.0281385, 19.2047001],
      [50.0279994, 19.2049968],
      [50.0281031, 19.2051147],
      [50.0282422, 19.204818],
    ],
    popup: (
      <>
        <strong>{t('map-gas-chamber-title')}</strong>
        <br />
        {t('map-gas-chamber-desc')}
        <br /> <br />
        <strong>
          <MapLink url="tour#gas-chamber">{t('map-gas-chamber-link')}</MapLink>
        </strong>
      </>
    ),
  },
  mainGate: {
    positions: [[50.027448, 19.203385]],
    popup: (
      <>
        <strong>{t('map-main-gate-title')}</strong>
        <br />
        {t('map-main-gate-desc')}
        <br /> <br />
        <strong>
          <MapLink url="tour#auschwitz-gate">{t('map-main-gate-link')}</MapLink>
        </strong>
      </>
    ),
  },
  rollCallSquare: {
    positions: [[50.026673, 19.203565]],
    popup: (
      <>
        <strong>{t('map-roll-call-title')}</strong>
        <br />
        {t('map-roll-call-desc')}
        <br /> <br />
        <strong>
          <MapLink url="tour#roll-call">{t('map-roll-call-link')}</MapLink>
        </strong>
      </>
    ),
  },
})
