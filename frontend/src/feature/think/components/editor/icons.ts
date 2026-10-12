import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { IconChevronRight, IconPointFilled, type Icon, type IconProps } from '@tabler/icons-react'
import { ICON_REGISTRY } from './markerCatalog'

// TablerのReactアイコンをSVG文字列にして使い回す
const cache = new Map<string, string>()

function toSvg(cacheKey: string, icon: Icon, props: IconProps): string {
  let svg = cache.get(cacheKey)
  if (svg === undefined) {
    svg = renderToStaticMarkup(createElement(icon, props))
    cache.set(cacheKey, svg)
  }
  return svg
}

export const markerSvg = (iconName: string): string =>
  toSvg(`marker:${iconName}`, ICON_REGISTRY[iconName] ?? IconPointFilled, { size: 18 })

export const chevronSvg = (collapsed: boolean): string =>
  toSvg(`chevron:${collapsed}`, IconChevronRight, {
    size: 16,
    className: `pointer-events-none transition-transform duration-150 ${
      collapsed ? '' : 'rotate-90'
    }`,
  })