import { bboxPolygon, polygon, flip } from 'turf'
import hotProjects from '../../data/hotprojects.js'

export default function regionToCoords(region, latLngOrder) {
  var coords
  if (region.type === 'hot') {
    let projectId = region.id
    let project = hotProjects().features.filter(p => p.id === projectId)[0]
    if (!project) {
      throw new Error('unknown hot project', projectId)
    }
    coords = project.geometry.coordinates
  } else if (region.type === 'bbox') {
    coords = bboxPolygon(region.coords).geometry.coordinates
  } else if (region.type === 'polygon') {
    coords = [region.coords.concat([region.coords[0]])]
  } else {
    throw new Error('unknown region', region)
  }
  if (latLngOrder) {
    coords = flip(polygon(coords)).geometry.coordinates
  }
  return coords
}
