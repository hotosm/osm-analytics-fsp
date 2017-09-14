import { selectedBanks } from '../../settings/fspSettings'

const mmOps = [
  {name: 'MTN', tags: ['mtn']},
  {name: 'AIRTEL', tags: ['airtel']},
  {name: 'Africell', tags: ['africell']},
  {name: 'SMART', tags: ['smart']},
  {name: 'M-PESA', tags: ['safaricom', 'm-pesa', 'vodacom', 'vodafone']},
  {name: 'M-Sente', tags: ['m-sente']},
  {name: 'Ezee', tags: ['ezee', 'Easy money']},
  {name: 'K2', tags: ['k2']},
  {name: 'Payway', tags: ['payway']},
  {name: 'Payway', tags: ['payway']},
]

const poOps = [
  {name: 'DHL', tags: ['DHL']},
  {name: 'Post Office', tags: ['Post Office']},
  {name: 'Posta Uganda', tags: ['Posta Uganda']},
]

const Colors = {}
Colors.names = {
  aqua: '#00ffff',
  azure: '#f0ffff',
  beige: '#f5f5dc',
  black: '#000000',
  blue: '#0000ff',
  brown: '#a52a2a',
  cyan: '#00ffff',
  darkblue: '#00008b',
  darkcyan: '#008b8b',
  darkgrey: '#a9a9a9',
  darkgreen: '#006400',
  darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b',
  darkolivegreen: '#556b2f',
  darkorchid: '#9932cc',
  darkred: '#8b0000',
  darksalmon: '#e9967a',
  darkviolet: '#9400d3',
  fuchsia: '#ff00ff',
  green: '#008000',
  indigo: '#4b0082',
  khaki: '#f0e68c',
  lightblue: '#add8e6',
  lightcyan: '#e0ffff',
  lightgreen: '#90ee90',
  lightgrey: '#d3d3d3',
  lightpink: '#ffb6c1',
  lightyellow: '#ffffe0',
  lime: '#00ff00',
  magenta: '#ff00ff',
  maroon: '#800000',
  navy: '#000080',
  olive: '#808000',
  orange: '#ffa500',
  pink: '#ffc0cb',
  purple: '#800080',
  violet: '#800080',
  red: '#ff0000',
  silver: '#c0c0c0',
  white: '#ffffff',
  yellow: '#ffff00'
}

Colors.random = function () {
  let result
  let count = 0
  for (let prop in this.names)
    if (Math.random() < 1 / ++count)
      result = prop
  return result
}

export const getRandomColor = () => {
  return Colors.random()
}

export const generateBankColors = () => {
  const banks = {}
  for (let i = 0; i < selectedBanks.length; i++) {
    const bank = selectedBanks[i]
    banks[bank.name] = bank.color || getRandomColor()
  }
  return banks
}

Array.prototype.unique = function () {
  const unique = []
  for (let i = 0; i < this.length; i++) {
    if (unique.indexOf(this[i]) === -1) {
      unique.push(this[i])
    }
  }
  return unique
}

function countSorter (a, b) {
  if (a.count < b.count)
    return 1
  else if (a.count > b.count)
    return -1
  else
    return 0
}

function stringSorter (val1, val2) {
  const a = val1.toLowerCase()
  const b = val2.toLowerCase()
  if (a < b)
    return 1
  else if (a > b)
    return -1
  else
    return 0
}

function getOpName (rawName, configs) {
  for (let i = 0; i < configs.length; i++) {
    const op = configs[i]
    const tags = op.tags
    for (let j = 0; j < tags.length; j++) {
      const raw = rawName.toLowerCase()
      const tag = tags[j].toLowerCase()
      if (raw.indexOf(tag) >= 0)
        return op.name
    }
  }
  return 'Other'
}

export const getBankName = function (feature) {
  const rawName = feature.properties.name || feature.properties._name || 'unknown'
  return getOpName(rawName, selectedBanks)
}

const getMMName = function (feature) {
  const net = feature.properties.network || 'unknown'
  const nets = net.split(';').map(n => getOpName(n, mmOps)).unique()
  nets.sort(stringSorter)
  return nets.toString()
}

const getOperator = function (feature) {
  return feature.properties.operator || 'Other'
}

const getName = function (feature) {
  return feature.properties.name || 'Other'
}

const getPostOfficeName = function (feature) {
  const rawName = feature.properties.name || 'Other'
  return getOpName(rawName, poOps)
}

const classifiers = {
  bank: getBankName,
  atm: getBankName,
  mobile_money_agent: getMMName,
  credit_institution: getOperator,
  microfinance_bank: getOperator,
  microfinance: getOperator,
  sacco: getOperator,
  bureau_de_change: getOperator,
  money_transfer: getOperator,
  post_office: getPostOfficeName,
}

export function classifyData (data, fsp) {
  const classifier = classifiers[fsp]
  const counts = {}
  data.features.forEach(feature => {
    const name = classifier(feature)

    if (!counts[name])
      counts[name] = 1
    else
      counts[name] += 1
  })
  const countsArray = Object.keys(counts).map(key => { return {name: key, count: counts[key]} })
  countsArray.sort(countSorter)
  return countsArray
}

export function getFeatureName (feature, fsp) {
  const classifier = classifiers[fsp]
  return classifier(feature)
}
