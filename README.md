Real-time financial service location planning 
=========================================

[![Join the chat at https://gitter.im/hotosm/osm-analytics](https://badges.gitter.im/hotosm/osm-analytics.svg)](https://gitter.im/hotosm/osm-analytics?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This repo contains code that improves the OSMA. [OSM-Analytics](https://osm-analytics.org) lets you analyse interactively how specific OpenStreetMap features are mapped in a specific region.

Summary
--------

The real-time financial service location planning and search System is composed of a web application that aims to support financial service providers in gathering information, and thus enabling more informed decision making, on matters such as network planning for mobile money agents, network/branch expansion for agency banking, and to provide (additional) information on risks for loans.

We therefore think that it will be a good idea to provide some guiding questions for the users’ that will be interacting with this web application as a way of enabling them to quickly familiarise themselves with how the web application works. The guiding questions will help the users apply the right filters and will have drop-downs, which are indicated using brackets in the list below. Below are the guiding questions that we shall use for the web application;


Guiding questions (features)
--------

1.	Show coverage of mobile money agents in relation to [population density, economic activity]
a.	As a financial service provider I can then decide to or not set up a mobile money agent within that radius. This decision will ofcourse be based on how many people are found in that radius as well as the type of economic activity.
•	Grid with population and economic activity weighted figure (determined by no. of buildings, commercial buildings and proximity to primary roads).
•	Users will drill down to identify cells that have specific populations and economic activity.

What this visualizes (UI):
•	How mobile money agents are distributed relative to population and economic activity
•	Initial view: mm agents per grid cell
•	Drill down using filters (range bars):
o	Persons per mobile money agent
o	Economic activity
o	Population count

2.	Show mobile money agents that are (at least) [--distance in km--] away from a [bank, of a certain provider, or other FSP type]
a.	As a financial service provider I can then decide to or not set up a bank branch closer to the mobile money agents for them to be able to deposit the money that they collect from the mobile money users.
•	Users can filter to identify areas with the number of MM agents at specified distances from a bank, no. within < 1km, 1-5, 5-10 km, and 10km+ (in addition to free form input for distance)
•	Display as heatmap; further away is colored more harshly?

What this visualizes (UI):
•	The overall distance from mobile money agents to a specific (operator) bank. Both the presence within [distance] is important, but also underserved mobile money agents; which are outside of [distance] of any/specific operator bank.
•	Initial View: Mobile Money agents heat map
•	Drill down using filters:
o	Distance to [FSP type] (range bars)
o	All banks by default. Narrow down (select/dropdown) to specific operator
3.	Where are the [--ATM/Branches--] of [--Financial Service Provider--] (in relation to population density and economic activity)
a.	As a financial service provider I can then decide to or not set up an atm or bank branch based on the presence of my competitor financial service providers.
•	Users can select the type of service (ATM/branch) and the FSP.
•	The map grid will show all grid cells in which the services for each selected FSP will appear.
•	Check `operator` key

What this visualizes (UI):
•	Grid view of all banks branch
•	Filter by FSP type and operator, population and economic activity

4.	I want to compare the presence of different (types of)  [-Financial service Providers--]
a.	As a financial service provider I can evaluate the areas with few competitors
•	Users can filter a gridded map to display areas with a specific number of people per MM Agent.
•	This can be split according to provider/network.

What this visualizes (UI):
•	Competition between different FSPs (relative to population)
•	Initial view:
o	Persons per FSP Type
o	This can then be split according to Persons per Operator (select/dropdown)

Data Sources
-------------
* Mobile money Agents >> amenity="mobile_money_agent" (OSM)
* Buildings >> tag="building" (OSM)
* Roads >> tag="road" (OSM)
* Population >> available in [geojson]() (OSM)
  the original data is from  [worldpop.org](http://www.worldpop.org.uk/data/summary/?doi=10.5258/SOTON/WP00283) 
  
* Economic Activity >> 
 
  ```log10(noOfbuldings, noOfRoads, population, noOfMMAgents)```


**Methodology for economic activity data**
 
 OSM data was downloaded.
 
 It was checked to identify the datasets to be used for the project. The point datasets that were used were amenity, craft, leisure, office, shop, tourism.
 Sport and man-made were not used because the data they contained was not relevant for this study. The polygon datasets that were used were
 
 - Building polygon polygon
 - Building polygon polygon polygon 1
 - Building polygon polygon polygon 2
 - Building polygon polygon polygon 3.
 
 The data was clipped to the extent of Uganda.
 
 All the available data selected for use was grouped into 5 categories
  - All buildings
  - Residential
  - Commercial
  - Mobile-money
  - Financial institutions
 
 All this data was linked to the World Pop population dataset for Uganda.
 
 Primary roads were integrated into the dataset. The distance between each cell and the nearest primary road was measured and recorded in the grid.
 Based on data quality it was decided the certain datasets would not be used as the data was only available for specific areas and would skew the results. The below datasets have been included in this analysis.
  - All buildings
  - Commercial buildings
  - Distance to a primary road
  - Population
  
 The buildings and roads datasets were assigned a value ranging from 1-10 based on their economic impact with 10 being the highest impact.
 These values were added together and divided by three to get an overall economic rank between 1 and 10.
 The webmap is available at [World Pop](https://geointelligence.carto.com/builder/4ed3393c-4440-11e7-9bdd-0e3ebc282e83)


 **Distance Computation**
 - Here we use turf.js to get the distances from all bank/atm features in the array, and retain the minimum.


Typical Crunching process
=============================

Filtering
-----------
 1. Specify the required tag eg building
 2. Iterate over all the tiles, filtering out features with the required tag in its properties
	This is done by tile-reduce,
	The filtering process generates geojson with a FeatureCollection per line
 2. The filtered data is then enriched with extra properties eg user experience, and other props to be used in client analysis
 3.	this is then piped to tippecanoe wich generates mbtiles of the filtered data.
	Parameters are passed to tipecanoe to generate mbtile with only zoomlevel 12
	
Aggregation/Binning
-------------------

 1. Iterate over the new mbtile zoom12,
    for every tile, create smaller (bins) boxes using a binning factor (eg 64, this splits the tile into 64x64 bins)
 2. Iterate over the features in the tile choosing which bin are clipped by the bin.
    increment a count if a bin appears in multiple features
	Keep track of the features that each bin index has.
 3. For each of the 64x64 bins, aggregate the features, and create a polygon(square) with agregated features
 4. The out-put is then piped to tippecanoe to generate z12 bins
 
 
Downscaling
------------

 1. Iterate over the new mbtile zoom12,
    for every tile , sample the bin and group into one, 
	aggregate the properties of the sample bin to get one bin. 
	pipe results to tippecanoe to generate tiles of next (lower) zoom level
 2. Do this up to zoom0
 
 Merging.
 ---------
  Merge z0 to z12 mbtiles files
  

Setting up the crucher
=============================

Make sure you are running on a linux environment, for a smooth setup

Install node Js
-----

 ```
 https://nodesource.com/blog/installing-node-js-tutorial-ubuntu/
 curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
 sudo apt-get install -y nodejs
 ```

Update NPM
----------

update npm version with the command:

 ```npm install -g npm@latest```
 
Install Tippecanoe
------------------

Setup environment to build tippecanoe

 ```
 sudo apt-get install build-essential libsqlite3-dev zlib1g-dev sqlite3 
 ```

Go to working directory and install node sqlite3

```npm install sqlite3 ```

  
Install from source

 ```
 git clone https://github.com/mapbox/tippecanoe.git 
 cd tippecanoe
 make 
 make install
 ```
 

Setting up the project
----------------------

Clone the server(Cruncher) from Github 
 `git clone https://github.com/ekastimo/osm-analytics-cruncher
 cd osm-analytics-cruncher`

make changes to the run file 
Update the Mbtiles path to download a smaller file instead of all the planet data
Download vecto tiles from
 
 `curl https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/uganda.mbtiles.gz --silent | gzip -d > planet.mbtiles`

Update Paths to point to your working directory
Set results directory to folder inside the working directory

Start crunching
 ./run.sh
 

Set up node mbtiles server
```
 cd server
 npm install
 node server.js # You can also start this as a background processs
 ```
 
 
The client
Clone the server(client) from Github 
```
 git clone https://github.com/ekastimo/osm-analytics-fsp
 cd osm-analytics-fsp
 ```
Edit the setting file and point the server to your local setup

Run the project in dev

 `npm start`

Build for production
 `npm run build`
 
Install htttp-server

 `npm install -g http-server`
 
 
Start process from background
  
  `http-server static/ -p 3000 2> /dev/null &`

Build the files for production 

 ` npm run build`