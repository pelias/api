## /suggest
* this is the autocomplete endpoint (fast response time/ straight from the memory)
* takes the following params
  * **input**: query string (required)
  * **lat**: latitude from where you are searching (required)
  * **lon**: longitude (required)
  * **zoom**: zoom level at which you are viewing the world (optional)
  * **size**: number of results you need (optional, defaults to 10)
  * **layers**: datasets you want to query upon (optional, defaults to ```poi,admin,address```). It can be ```poi```, ```admin``` or ```address``` 
    * ```poi``` expands internally to ```geoname```, ```osmnode```, ```osmway``` 
    * ```admin``` expands to ```admin0```, ```admin1```, ```admin2```, ```neighborhood```, ```locality```, ```local_admin```
    * ```address``` expands to ```osmaddress```, ```openaddresses```
    * or it can also be specific to one particular dataset for example: ```geoname```
* Lat/Lon is **required** currently because of this [open issue](https://github.com/elasticsearch/elasticsearch/issues/6444)

## /suggest/coarse
* Only queries the admin layers
* Its the same as ```/suggest``` with layers param set to ```admin```
* ```/suggest/coarse``` takes all other params that ```/suggest``` takes

## /search
* this is the full text search endpoint (looks up elasticsearch doc store, slightly slower than suggest)
* takes the following params (same as suggest)
  * **input** (required)
  * **lat** (optional)
  * **lon** (optional)
  * **zoom** (optional)
  * **bbox**: (optional) the bounding box where you want all your results to appear and be contained within that bbox. it can be one of the following comma separated string (they are all different ways of saying the same thing)
    * bottom_left lat, bottom_left lon, top_right lat, top_right lon
    * left,bottom,right,top
    * min Longitude , min Latitude , max Longitude , max Latitude 
  * **size** (optional, defaults to 10)
  * **layers** (optional, defaults to ```poi,admin,address```)

## /search/coarse
* Similar to its suggest counterpart 
* Its /search with layers param set to ```admin```
* ```/search/coarse``` takes all other params that /search takes

## /reverse
* Does reverse geocoding
* It takes the following params
  * **lat** (required)
  * **lon** (required)
  * **zoom** (optional)
  * **bbox** (optional)
  * **layers** (optional, defaults to ```poi,admin,address```)

## /doc
* retrieve a document or multiple documents at once
* it takes just one param
  * **id**: (required) unique id of the document that need to be retrieved (should be in the form of type:id for example: ```geoname:4163334```
  * **ids**: (if multiple docs are to be fetched in bulk) an array of ids