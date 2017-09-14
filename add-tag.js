const colors = require('colors')
const chroma = require('chroma-js')
const readline = require('readline')
const fs = require('fs')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const createRange = (start, end, delta) => Array.from({length: (end - start) / delta}, (v, k) => (k * delta) + start)

function getRanges (array = []) {
  const len = array.length
  const ranges = []
  for (let i = 0; i < len; i++) {
    if (i + 1 < len) {
      ranges.push([array[i], array[i + 1]])
    }
  }
  return ranges
}

function generateColors (lightest = '#fafa6e', darkest = '#2A4858', steps = 6) {
  return chroma.scale([lightest, darkest])
    .mode('lch').colors(steps)
}

// Sample highlight layer
const highlights = [
  {
    'id': 'data-aggregated-highlight-0',
    'type': 'fill',
    'source': 'osm-data-aggregated',
    'source-layer': 'osm',
    'maxzoom': 12.01,
    'paint': {
      'fill-color': '#5CBAD8',
      'fill-antialias': false,
      'fill-opacity': {
        'base': 1,
        'stops': [[10, 0.1], [13, 1.0]]
      }
    },
    'filter': ['==', '_timestamp', -1],
    'densityFilter': ['all',
      ['<', '_count', 50]
    ]
  },
  {
    'id': 'data-aggregated-highlight-1',
    'type': 'fill',
    'source': 'osm-data-aggregated',
    'source-layer': 'osm',
    'maxzoom': 12.01,
    'paint': {
      'fill-color': '#5CBAD8',
      'fill-antialias': false,
      'fill-opacity': {
        'base': 1,
        'stops': [[8, 0.1], [11, 1.0], [12, 1.0]]
      }
    },
    'filter': ['==', '_timestamp', -1],
    'densityFilter': ['all',
      ['>=', '_count', 50],
      ['<', '_count', 200]
    ]
  },
  {
    'id': 'data-aggregated-highlight-2',
    'type': 'fill',
    'source': 'osm-data-aggregated',
    'source-layer': 'osm',
    'maxzoom': 12.01,
    'paint': {
      'fill-color': '#5CBAD8',
      'fill-antialias': false,
      'fill-opacity': {
        'base': 1,
        'stops': [[6, 0.1], [9, 1.0], [12, 1.0]]
      }
    },
    'filter': ['==', '_timestamp', -1],
    'densityFilter': ['all',
      ['>=', '_count', 200],
      ['<', '_count', 800]
    ]
  },
  {
    'id': 'data-aggregated-highlight-3',
    'type': 'fill',
    'source': 'osm-data-aggregated',
    'source-layer': 'osm',
    'maxzoom': 12.01,
    'paint': {
      'fill-color': '#5CBAD8',
      'fill-antialias': false,
      'fill-opacity': {
        'base': 1,
        'stops': [[4, 0.1], [7, 1.0], [12, 1.0]]
      }
    },
    'filter': ['==', '_timestamp', -1],
    'densityFilter': ['all',
      ['>=', '_count', 800],
      ['<', '_count', 3200]
    ]
  },
  {
    'id': 'data-aggregated-highlight-4',
    'type': 'fill',
    'source': 'osm-data-aggregated',
    'source-layer': 'osm',
    'maxzoom': 12.01,
    'paint': {
      'fill-color': '#5CBAD8',
      'fill-antialias': false,
      'fill-opacity': {
        'base': 1,
        'stops': [[2, 0.1], [5, 1.0], [12, 1.0]]
      }
    },
    'filter': ['==', '_timestamp', -1],
    'densityFilter': ['all',
      ['>=', '_count', 3200],
      ['<', '_count', 12800]
    ]
  },
  {
    'id': 'data-aggregated-highlight-5',
    'type': 'fill',
    'source': 'osm-data-aggregated',
    'source-layer': 'osm',
    'maxzoom': 12.01,
    'paint': {
      'fill-color': '#5CBAD8',
      'fill-antialias': false,
      'fill-opacity': {
        'base': 1,
        'stops': [[0, 0.1], [3, 1.0], [12, 1.0]]
      }
    },
    'filter': ['==', '_timestamp', -1],
    'densityFilter': ['all',
      ['>=', '_count', 12800],
      ['<', '_count', 51200]
    ]
  },
  {
    'id': 'data-aggregated-highlight-6',
    'type': 'fill',
    'source': 'osm-data-aggregated',
    'source-layer': 'osm',
    'maxzoom': 12.01,
    'paint': {
      'fill-color': '#5CBAD8',
      'fill-antialias': false,
      'fill-opacity': {
        'base': 1,
        'stops': [[0, 1.0], [12, 1.0]]
      }
    },
    'filter': ['==', '_timestamp', -1],
    'densityFilter': ['all',
      ['>=', '_count', 51200]
    ]
  }
]

function createFeature (data, colorRange, _prop, geometry) {
  const colors = generateColors(colorRange[0], colorRange[1], 6)
  const ranges = [[0, 50], [50, 200], [200, 800], [800, 3200], [1000, 5000], [5000, 10000], [10000]]//createRange(0, max, max / steps)
  const stops = [
    [[10, 0.1], [13, 1]],
    [[8, 0.1], [11, 1], [12, 1]],
    [[6, 0.1], [9, 1], [12, 1]],
    [[4, 0.1], [7, 1], [12, 1]],
    [[2, 0.1], [5, 1], [12, 1]],
    [[0, 0.1], [3, 1], [12, 1]],
    [[0, 1], [12, 1]]
  ]
  const style = generateStyle(data, colors, ranges, stops, _prop, geometry)
  console.log('\n')
  console.log('***Operation Successful***'.green)
  console.log('\n')
  console.log('TODO'.cyan)
  console.log('Add this to "filters" in ./app/settings/options.js'.magenta)
  console.log(JSON.stringify(data, null, 2).green)
  const dir = './tmp'
  if (!fs.existsSync(dir)) {
    fs.mkdir(dir)
  }
  fs.writeFile(`${dir}/${data.id}.json`, JSON.stringify(style, null, 2), function (err) {
    if (err) {
      return console.log(err.red)
    }
    console.log('\n')
    console.log('TODO'.cyan)
    console.log(`Copy '${dir}/${data.id}.json' to './app/components/Map/glstyles/'`.magenta)
    console.log('\n')
  })
}

function generateStyle (feature, colors, ranges, stops, _prop, geometry) {
  const fColor = colors[3]
  const baseLayer = (geometry === 'LineString') ? {
    'id': 'layer-raw',
    'type': 'line',
    'source': 'osm-data-raw',
    '_description': feature.description,
    'source-layer': 'osm',
    'paint': {
      'line-width': 1,
      'line-color': fColor,
      'line-opacity': 1
    }
  } : (geometry === 'Polygon') ? {
    'id': 'layer-raw',
    'type': 'fill',
    'source': 'osm-data-raw',
    '_description': feature.description,
    'source-layer': 'osm',
    'paint': {'fill-color': fColor, 'fill-opacity': 1}
  } : {
    'id': 'layer-raw',
    'type': 'circle',
    'source': 'osm-data-raw',
    '_description': feature.description,
    'source-layer': 'osm',
    'paint': {
      'circle-color': fColor,
      'circle-opacity': 1
    }
  }
  console.log({geometry, baseLayer})
  const style = {
    'version': 8,
    'sources': {
      'osm-data-raw': {
        'type': 'vector',
        'tiles': [
          `{{server}}/${feature.id}/{z}/{x}/{y}.pbf`
        ],
        'minzoom': 13,
        'maxzoom': 14
      },
      'osm-data-aggregated': {
        'type': 'vector',
        'tiles': [
          `{{server}}/${feature.id}/{z}/{x}/{y}.pbf`
        ],
        'minzoom': 0,
        'maxzoom': 12
      }
    },
    'layers': [baseLayer]
  }

  const makeStyle = (id, base, start, end, color, stop, isLast) => {
    const obj = {}
    Object.assign(obj, base)
    obj['type'] = 'fill'
    obj['maxzoom'] = 12.01
    obj['id'] = `data-aggregated-${id}`
    obj['source'] = 'osm-data-aggregated'
    obj['paint'] = {
      'fill-color': color, 'fill-opacity': {
        'base': 1, 'stops': stop
      },"fill-antialias": false,
    }
    if (isLast)
      obj['filter'] = [
        'all', ['>', _prop, start]
      ]
    else
      obj['filter'] = [
        'all', ['>=', _prop, start], ['<', _prop, end]
      ]
    return obj
  }

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i]
    const color = colors[i]
    const stop = stops[i]
    const id = i + 1
    //Track last layer
    const isLast = id === ranges.length
    style.layers.push(
      makeStyle(id, baseLayer, range[0], range[1], color, stop, isLast)
    )
  }
  highlights.forEach(layer => {
    style.layers.push(layer)
  })
  return style
}

const defaultColors = '#fafa6e,#2A4858'
const defaultGeometry = 'Point'
const defaultProperty = '_count'
const props = {}
rl.question('Enter Feature/tag name: '.cyan, function (tag) {
  props['id'] = tag.trim()
  rl.question(`Enter description:  will default to '${tag}': `.cyan, function (desc) {
    props['description'] = (desc || tag).trim()
    rl.question(`Enter altText: will default to '${tag}':  `.cyan, function (altText) {
      props['altText'] = altText || tag
      rl.question(`Enter geometry type: ( Point | LineString | Polygon): will default to '${defaultGeometry}': `.cyan, function (_geometry) {
        const geometry = (_geometry || defaultGeometry).trim()
        rl.question(`Enter color range: will default to '${defaultColors}': `.cyan, function (_range) {
          const range = (_range || defaultColors).trim().split(',')
          rl.question(`Enter property : will default to '${defaultProperty}': `.cyan, function (_steps) {
            const _prop = (_steps || defaultProperty).trim()
            createFeature(props, range, _prop, geometry)
            rl.close()
          })
        })
      })
    })
  })
})
