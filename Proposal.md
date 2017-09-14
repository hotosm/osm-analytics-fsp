# Proposal: Adding Thematic Analysis to OSMA [OSM Analytics](http://osm-analytics.org/)

Author(s): Timothy Kasasa, Co-Author Name

Last updated: 14th Sept 2017

Discussion on [Gitter](https://gitter.im/hotosm/osm-analytics).

## Abstract
[OSM Analytics](http://osm-analytics.org/) is a web based data analysis tool that lets you analyze interactively how 
specific OpenStreetMap features are mapped in a specific region. The tool lets you select the geographical region of 
interest and shows a graph of the mapping activity in the region. The tool also gives a side by side comparison of the 
map state at different points in time and lets you view which HOT projects may have includenced the mapping of a region.

The goal of this project is to enhance the current web based application to allow advanced analytical features based on 
a variety of data sources in OSM including Financial Service Provider(FSP) related information available in OpenStreetMap.

The web based dashboard aims to support FSPs in gathering information, and thus enabling more informed decision making, 
on matters such as network planning for mobile money agents, network/branch expansion for agency banking, and to provide
(additional) information on risks for loans. This dashboard incorporates data on FSP geographic distribution, population density, 
economic activity (shops, businesses) and hazards for risk analysis.

## Proposal


The  changes are based on [OpenStreetMap Analytics (OSMA)](http://osm-analytics.org/), and make use
of the existing codebase. The OSMA codebase consists of two major parts: the
[frontend](https://github.com/hotosm/osm-analytics) and the data-crunching [backend](https://github.com/hotosm/osm-analytics-cruncher/). 
The interface should allows the filtering and changing of parameters for (the combination of) a number of datasources.

### Front End
This is an extension to the current OSMA web frontend (the “generic web frontend”); this has been created as a template 
that could be used for future thematic frontends on top of the OSMA backend.

### Back End
This is also an extension to the current data-crunching backend, we have done minimal changes to the current code 
and rearranged some of the moving parts to allow for a very simplistic approach to adding new tags to the cruncher 
(improving the process from 5 steps to 1). We also added a population dataset from from  [worldpop.org](http://www.worldpop.org.uk/data/summary/?doi=10.5258/SOTON/WP00283) 
to allow for analysis against population data.

## Rationale

[A discussion of alternate approaches and the trade offs, advantages, and disadvantages of the specified approach.]


## Generic OSMA Implementation

### Backend
The current cruncher overview diagram can be found [here](https://github.com/GFDRR/osm-analytics-cruncher/blob/master/documentation/diagram.pdf)

#### Old Implementation
In the old implementation, to add anew Tag, these are the steps to take. let us use waterways as an example
as seen [here](https://github.com/hotosm/osm-analytics-cruncher/commit/3afb607856cf981ce59593d1f2c0404b206e1761)
1. Create a filter configuration for the Tag
2. Add Code to the run.sh script to enable crunching
3. Edit  `oqt-user-experience/map.js` file to add static experience initial value
4. Edit  `oqt-user-experience/index.js` file to add static experience initial value


#### New Implementation
With the new implementation one only needs to edit one place and the rest of the process is automated, i.e.
Simply create the config file , and place it in `fsp-config` folder
```json
{
    "geometry": "LineString",
    "tag": "waterway",
    "foctor": 32,
    "experience": {
        "file": "./experiences.json",
        "field": "waterways"
    }
}
```
This bring down the steps from 4 to 1


### Front end

#### Old Implementation
In the old implementation, to add anew Tag, you need 4 steps. let us use waterways as an example
as seen [here](https://github.com/hotosm/osm-analytics/commit/356880577938e05ddaa47f47dd031b7748064a10)
1. Add tag configuration to filters in `app/settings/options.js`
2. The most complex part is genrating a style file based on the  [Mapbox Style Specification](https://www.mapbox.com/mapbox-gl-js/style-spec/)
3. Add the Tag to exclusion in `app/settings/options.js`
3. Add the Tag to exclusions in `app/components/Stats/index.js`
4. Import the style file in `app/components/Map/glstyles/index.js` and add it to the filters
5. Finally creat cusom CSS for the legend in `app/components/Legend/style.css`

#### New Implementation
With the new implementation one only needs to run a script which in turn asks the user a coupleof question and then generates
most of the boiler plate(including the mapbox style) needed to add the Tag. The npm script however does not eddit the code but guides the user on where to put the code
```bash
npm run add-tag
```


## FSP OSMA Implementation

### Backend

### Frontend


## Open issues

The pending issue is on the feature dropping algorithm during aggregation, please see [here](https://github.com/hotosm/osm-analytics-fsp/issues/27)