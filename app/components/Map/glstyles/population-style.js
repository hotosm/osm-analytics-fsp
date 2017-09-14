const style = {
  'version': 8,
  'sources': {
    'osm-population-raw': {
      'type': 'vector',
      'tiles': [
        '{{server}}/population/{z}/{x}/{y}.pbf'
      ],
      'minzoom': 0,
      'maxzoom': 14
    }
  },
  'layers': [
    {
      'id': 'population-raw-aggregated',
      '_description': 'Building',
      'type': 'fill',
      'source': 'osm-population-raw',
      'source-layer': 'population',
      'paint': {'fill-color': '#eee8f3', 'fill-opacity': 0.5, 'fill-outline-color': '#ffffff'},
      'filter': ['all', ['>=', 'Popn_count', 0], ['<', 'Popn_count', 5]]
    }
  ]
}

const makeStyle =(id, base, start, end, color) =>{
  return {
    ...base,
    id: `${base.id}-${id}`,
    'paint': {
      'fill-color': color, 'fill-opacity': 0.8, 'fill-outline-color': '#ffffff'
    },
    'filter': [
      'all', ['>=', 'Popn_count', start], ['<', 'Popn_count', end]
    ]
  }
}

const base = style.layers[0]
style.layers.push(
  makeStyle(1, base, 5, 100, '#eee8f3'),
  makeStyle(2, base, 100, 200, '#ccbadc'),
  makeStyle(3, base, 200, 300, '#aa8cc5'),
  makeStyle(4, base, 300, 400, '#885ead'),
  makeStyle(5, base, 400, 500, '#663096'),
  makeStyle(6, base, 500, 10000, '#44146f')
)

export default style;