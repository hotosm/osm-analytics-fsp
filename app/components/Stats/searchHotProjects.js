import { intersect, extent } from 'turf'
import { polygon as lineclipPoly } from 'lineclip'
import hotProjects from '../../data/hotprojects.js'

export default function searchHotProjectsInRegion(region) {
  const regionBbox = extent(region)
  return hotProjects().features
    .filter(project =>
      lineclipPoly(project.geometry.coordinates[0], regionBbox).length > 0
    ).filter(project =>
      intersect(project, region) !== undefined
    )
}
