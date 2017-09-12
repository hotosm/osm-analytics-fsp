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

function createFeature (data, colorRange, _prop, geometry) {
  const colors = generateColors(colorRange[0], colorRange[1], 6)
  const range = [[0, 50], [50, 200], [200, 500], [500, 1000], [1000, 5000], [5000, 10000]]//createRange(0, max, max / steps)
  const style = generateStyle(data.id, colors, getRanges(range), _prop, geometry)
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
    console.log(`Copy '${dir}/${data.id}.json' to './app/components/glstyles/'`.magenta)
    console.log('\n')
  })
}

function generateStyle (feature, colors, ranges, _prop, geometry) {
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
    'id': 'pois-raw',
    'type': 'circle',
    'source': 'osm-data-raw',
    '_description': feature.description,
    'source-layer': 'osm',
    'paint': {
      'circle-color': fColor,
      'circle-opacity': 1
    }
  }

  const style = {
    'version': 8,
    'sources': {
      'osm-data-raw': {
        'type': 'vector',
        'tiles': [
          `{{server}}/${feature}/{z}/{x}/{y}.pbf`
        ],
        'minzoom': 13,
        'maxzoom': 14
      },
      'osm-data-aggregated': {
        'type': 'vector',
        'tiles': [
          `{{server}}/${feature}/{z}/{x}/{y}.pbf`
        ],
        'minzoom': 0,
        'maxzoom': 12
      }
    },
    'layers': [baseLayer]
  }

  const makeStyle = (id, base, start, end, color) => {
    const obj = {}
    Object.assign(obj, base)
    obj['id'] = `${base.id}-${id}`
    obj['source'] = 'osm-data-aggregated'
    obj['paint'] = {
      'fill-color': color, 'fill-opacity': 0.8,
    }
    obj['filter'] = [
      'all', ['>=', _prop, start], ['<', _prop, end]
    ]
    return obj
  }

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i]
    const color = colors[i]
    const id = i + 1
    style.layers.push(
      makeStyle(id, baseLayer, range[0], range[1], color)
    )
  }
  return style
}

const defaultColors = '#fafa6e,#2A4858'
const defaultGeometry = 'Point'
const defaultProperty = '_count'
const props = {}
rl.question('Enter Feature/tag name: '.cyan, function (tag) {
  props['id'] = tag
  rl.question(`Enter description: `.cyan, function (desc) {
    props['description'] = desc || tag
    rl.question(`Enter altText: `.cyan, function (desc) {
      props['altText'] = desc || tag
      rl.question(`Enter geometry type: ( Point | LineString | Polygon) : `.cyan, function (_geometry) {
        const geometry = _geometry | defaultGeometry
        rl.question(`Enter color range: |${defaultColors}`.cyan, function (_range) {
          const range = (_range || defaultColors).split(',')
          rl.question(`Enter color steps: | ${defaultProperty}`.cyan, function (_steps) {
            const _prop = _steps || defaultProperty
            createFeature(props, range, _prop, geometry)
            rl.close()
          })
        })
      })
    })
  })
})
