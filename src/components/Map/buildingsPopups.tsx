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

export const getBirkenauBuildings = (t: (key: string) => string): { [slug: string]: BuildingEntry } => ({
  woodenBarracksLatryny1: {
    positions: [
      [50.0352790, 19.1797150],
      [50.0351920, 19.1797140],
      [50.0351850, 19.1802850],
      [50.0352710, 19.1802860],
      [50.0352790, 19.1797150],
    ],
    popup: (
      <>
        <strong>{t('map-wooden-barracks-title')}</strong>
        <br />
        {t('map-wooden-barracks-desc')}
        <br /> <br />
        <strong>
          <MapLink url="tour#wooden-barracks">{t('map-wooden-barracks-link')}</MapLink>
        </strong>
      </>
    ),
  },
  woodenBarracksLatryny2: {
    positions: [
      [50.0354030, 19.1797190],
      [50.0353950, 19.1802900],
      [50.0354820, 19.1802930],
      [50.0354900, 19.1797230],
      [50.0354030, 19.1797190],
    ],
    popup: (
      <>
        <strong>{t('map-wooden-barracks-title')}</strong>
        <br />
        {t('map-wooden-barracks-desc')}
        <br /> <br />
        <strong>
          <MapLink url="tour#wooden-barracks">{t('map-wooden-barracks-link')}</MapLink>
        </strong>
      </>
    ),
  },
  woodenBarracksBlok16: {
    positions: [
      [50.0358470, 19.1797340],
      [50.0357600, 19.1797330],
      [50.0357510, 19.1803030],
      [50.0358370, 19.1803060],
      [50.0358470, 19.1797340],
    ],
    popup: (
      <>
        <strong>{t('map-wooden-barracks-title')}</strong>
        <br />
        {t('map-wooden-barracks-desc')}
        <br /> <br />
        <strong>
          <MapLink url="tour#wooden-barracks">{t('map-wooden-barracks-link')}</MapLink>
        </strong>
      </>
    ),
  },
  woodenBarracksBlok15: {
    positions: [
      [50.0359720, 19.1797400],
      [50.0359630, 19.1803100],
      [50.0360500, 19.1803130],
      [50.0360590, 19.1797430],
      [50.0359720, 19.1797400],
    ],
    popup: (
      <>
        <strong>{t('map-wooden-barracks-title')}</strong>
        <br />
        {t('map-wooden-barracks-desc')}
        <br /> <br />
        <strong>
          <MapLink url="tour#wooden-barracks">{t('map-wooden-barracks-link')}</MapLink>
        </strong>
      </>
    ),
  },
  krematoriumIII: {
    positions: [
      [50.0358421, 19.1694143],
      [50.0355428, 19.1694119],
      [50.0355453, 19.1686592],
      [50.0354676, 19.1686586],
      [50.0354643, 19.1696725],
      [50.0353304, 19.1696714],
      [50.0353297, 19.1699085],
      [50.0354509, 19.1699095],
      [50.0354501, 19.1701384],
      [50.0355856, 19.1701395],
      [50.0355874, 19.1695811],
      [50.0358415, 19.1695831],
      [50.0358421, 19.1694143],
    ],
    popup: (
      <>
        <strong>{t('map-krematorium-ii-iii-title')}</strong>
        <br />
        {t('map-krematorium-ii-iii-desc')}
        <br /> <br />
        <strong>
          <MapLink url="tour#II-and-III">{t('map-krematorium-ii-iii-link')}</MapLink>
        </strong>
      </>
    ),
  },
  krematoriumII: {
    positions: [
      [50.0340284, 19.1686082],
      [50.0339481, 19.1686056],
      [50.0339379, 19.1693727],
      [50.0336348, 19.1693630],
      [50.0336332, 19.1694826],
      [50.0339096, 19.1694915],
      [50.0339018, 19.1700776],
      [50.0340079, 19.1700810],
      [50.0340108, 19.1698631],
      [50.0341179, 19.1698666],
      [50.0341209, 19.1696435],
      [50.0340147, 19.1696401],
      [50.0340284, 19.1686082],
    ],
    popup: (
      <>
        <strong>{t('map-krematorium-ii-iii-title')}</strong>
        <br />
        {t('map-krematorium-ii-iii-desc')}
        <br /> <br />
        <strong>
          <MapLink url="tour#II-and-III">{t('map-krematorium-ii-iii-link')}</MapLink>
        </strong>
      </>
    ),
  },
  woodenBarracksBlok14: {
    positions: [
      [50.0361830, 19.1797480],
      [50.0361740, 19.1803180],
      [50.0362610, 19.1803210],
      [50.0362710, 19.1797500],
      [50.0361830, 19.1797480],
    ],
    popup: (
      <>
        <strong>{t('map-wooden-barracks-title')}</strong>
        <br />
        {t('map-wooden-barracks-desc')}
        <br /> <br />
        <strong>
          <MapLink url="tour#wooden-barracks">{t('map-wooden-barracks-link')}</MapLink>
        </strong>
      </>
    ),
  },
  brickBarracksBlok16: {
    positions: [
      [50.0325560, 19.1786860],
      [50.0325650, 19.1781790],
      [50.0324620, 19.1781750],
      [50.0324540, 19.1786820],
      [50.0325560, 19.1786860],
    ],
    popup: (
      <>
        <strong>{t('map-brick-barracks-title')}</strong>
        <br />
        {t('map-brick-barracks-desc')}
        <br /> <br />
        <strong>
          <MapLink url="tour#brick-barracks">{t('map-brick-barracks-link')}</MapLink>
        </strong>
      </>
    ),
  },
  brickBarracksBlok17: {
    positions: [
      [50.0327940, 19.1786960],
      [50.0328020, 19.1781890],
      [50.0326990, 19.1781850],
      [50.0326900, 19.1786910],
      [50.0327940, 19.1786960],
    ],
    popup: (
      <>
        <strong>{t('map-brick-barracks-title')}</strong>
        <br />
        {t('map-brick-barracks-desc')}
        <br /> <br />
        <strong>
          <MapLink url="tour#brick-barracks">{t('map-brick-barracks-link')}</MapLink>
        </strong>
      </>
    ),
  },
  brickBarracksBlok10: {
    positions: [
      [50.0327810, 19.1794810],
      [50.0327890, 19.1789730],
      [50.0326860, 19.1789690],
      [50.0326770, 19.1794760],
      [50.0327810, 19.1794810],
    ],
    popup: (
      <>
        <strong>{t('map-brick-barracks-title')}</strong>
        <br />
        {t('map-brick-barracks-desc')}
        <br /> <br />
        <strong>
          <MapLink url="tour#brick-barracks">{t('map-brick-barracks-link')}</MapLink>
        </strong>
      </>
    ),
  },
  brickBarracksBlok3: {
    positions: [
      [50.0327690, 19.1801960],
      [50.0327780, 19.1796880],
      [50.0326760, 19.1796840],
      [50.0326670, 19.1801910],
      [50.0327690, 19.1801960],
    ],
    popup: (
      <>
        <strong>{t('map-brick-barracks-title')}</strong>
        <br />
        {t('map-brick-barracks-desc')}
        <br /> <br />
        <strong>
          <MapLink url="tour#brick-barracks">{t('map-brick-barracks-link')}</MapLink>
        </strong>
      </>
    ),
  },
  brickBarracksBlok2: {
    positions: [
      [50.0325320, 19.1801860],
      [50.0325410, 19.1796780],
      [50.0324380, 19.1796750],
      [50.0324290, 19.1801820],
      [50.0325320, 19.1801860],
    ],
    popup: (
      <>
        <strong>{t('map-brick-barracks-title')}</strong>
        <br />
        {t('map-brick-barracks-desc')}
        <br /> <br />
        <strong>
          <MapLink url="tour#brick-barracks">{t('map-brick-barracks-link')}</MapLink>
        </strong>
      </>
    ),
  },
})
