import settings from '../../../settings/settings'

const style = {
  'version': 8,
  'sources': {
    'osm-fspdistribution-raw': {
      'type': 'vector',
      'tiles': [
        `${settings['vt-source']}/fspdistribution/{z}/{x}/{y}.pbf`
      ],
      'minzoom': 0,
      'maxzoom': 14
    }
  },
  'layers': []
}

const makeStyle = (id, base, start, end, color, fsp = 'mobile_money_agent') => {
  const field = `_${fsp}Count`
  return {
    ...base,
    id: `${base.id}-${id}`,
    'paint': {
      'fill-color': color
    },
    'filter': [
      'all', ['>=', field, start], ['<', field, end]
    ]
  }
}

const base = {
  'id': 'fspdistribution-aggregated',
  'type': 'fill',
  'source': 'osm-fspdistribution-raw',
  'source-layer': 'osm',
  'maxzoom': 12.01,
  'paint': {'fill-color': '#eee8f3'},
  'filter': [
    'all',
    ['>=', '_mobile_money_agentCount', 1],
    ['<', '_mobile_money_agentCount', 25]
  ]
}

export function createStyle (fsp) {
  const _style = {...style, layers: []}
  _style.layers.push(
    makeStyle(1, base, 1, 5, '#ffe4b2', fsp),
    makeStyle(2, base, 5, 25, '#ffd27f', fsp),
    makeStyle(3, base, 25, 50, '#ffae19', fsp),
    makeStyle(4, base, 50, 100, '#ffa500', fsp),
    makeStyle(5, base, 100, 500, '#cc8400', fsp),
    makeStyle(6, base, 500, 10000, '#996300', fsp)
  )
  return _style
}

const _baseStyle = createStyle('mobile_money_agent')
export default _baseStyle