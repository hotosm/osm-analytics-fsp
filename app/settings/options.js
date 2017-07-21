export const filters = [
  {
    id: 'buildings',
    description: 'Buildings',
    altText: 'Polygons with a building=* tag'
  },
  {
    id: 'highways',
    description: 'Roads',
    altText: 'Lines with a highway=* tag (highways & roads, but also tracks and paths)'
  },
  {
    id: 'waterways',
    description: 'Rivers',
    altText: 'Lines with a waterway=* tag (waterways, rivers & streams)'
  },
  {
    id: 'pois',
    description: 'POIs',
    altText: 'Points with an amenity=* tag (e.g. schools, restaurants,  places of worship, drinking water, banks, fuel stations, etc.)',
    hidden: true
  }
]

export const overlays = [
  {
    id: 'recency',
    description: 'Recency of Edits'
  },
  {
    id: 'experience',
    description: 'Editor Level of Experience'
  },
]

export const compareTimes = [
  { id: '2007', timestamp: new Date('2007-01-01'), except: ['pois'] },
  { id: '2008', timestamp: new Date('2008-01-01'), except: ['pois'] },
  { id: '2009', timestamp: new Date('2009-01-01'), except: ['pois'] },
  { id: '2010', timestamp: new Date('2010-01-01'), except: ['pois'] },
  { id: '2011', timestamp: new Date('2011-01-01'), except: ['pois'] },
  { id: '2012', timestamp: new Date('2012-01-01'), except: ['pois'] },
  { id: '2013', timestamp: new Date('2013-01-01'), except: ['waterways', 'pois'] },
  { id: '2014', timestamp: new Date('2014-01-01'), except: ['waterways', 'pois'] },
  { id: '2015', timestamp: new Date('2015-01-01'), except: ['highways', 'waterways', 'pois'] },
  { id: '2016', timestamp: new Date('2016-01-01'), except: ['highways', 'waterways', 'pois'] },
  { id: 'now',  timestamp: new Date() }
]
