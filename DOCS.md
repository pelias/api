## /search

Full text search endpoint (queries the elasticsearch doc store, slightly slower than suggest)

#### Parameters
* required:
  * **input**
* optional:
  * **lat**
  * **lon**
  * **zoom**
  * **bbox**
    * the bounding box where you want all your results to appear and be contained within that bbox, it can be one of the following comma separated strings, all of which are different ways of saying the same thing:
      * bottom_left lat, bottom_left lon, top_right lat, top_right lon
      * left, bottom, right, top
      * min Longitude, min Latitude, max Longitude, max Latitude 
  * **size** (defaults to 10)
  * **layers** (defaults to ```poi,admin,address```)

## /suggest

The autocomplete endpoint: fast response time, served from memory

#### Parameters
* required:
  * **input**: query string
  * **lat**: latitude from where you are searching
  * **lon**: longitude
    * lat/lon are **required** currently because of this [open issue](https://github.com/elasticsearch/elasticsearch/issues/6444)
* optional:
  * **zoom**: zoom level at which you are viewing the world
  * **size**: number of results you need (defaults to 10)
  * **layers**: datasets you want to query upon (defaults to ```poi,admin,address```). It can be ```poi```, ```admin``` or ```address``` 
    * ```poi``` expands internally to ```geoname```, ```osmnode```, ```osmway``` 
    * ```admin``` expands to ```admin0```, ```admin1```, ```admin2```, ```neighborhood```, ```locality```, ```local_admin```
    * ```address``` expands to ```osmaddress```, ```openaddresses```
    * or it can also be specific to one particular dataset for example: ```geoname```

## /suggest/coarse

Only queries the admin layers

#### Parameters
* this endpoint is the equivalent of ```/suggest``` with the layers param set to ```admin```
* takes all other params that ```/suggest``` takes

## /search/coarse

Similar to the suggest endpoint 

#### Parameters
* the equivalent of /search with the layers param set to ```admin```
* ```/search/coarse``` takes all other params that /search takes

## /reverse

Reverse geocoding endpoint

#### Parameters
* required:
  * **lat**
  * **lon**
* optional:
  * **zoom**
  * **bbox**
  * **layers** (defaults to ```poi,admin,address```)

## /doc

Retrieves a document or multiple documents at once

#### Parameters
* required:
  * one of **id** or **ids**
    * **id**:
      * unique id of the document that to be retrieved
      * should be in the form of type:id, for example: ```geoname:4163334```
    * **ids**
      * if multiple docs are to be fetched in bulk, an array of ids
