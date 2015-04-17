## /search

Full text search endpoint (queries the elasticsearch doc store, slightly slower than suggest)

#### Parameters
* required:
  * **input**: query string
* optional:
  * **lat**: latitude from where you are searching
  * **lon**: longitude
  * **zoom**: zoom level at which you are viewing the world
  * **size**: number of results you need (defaults to 10)
  * **layers**: datasets you want to query upon (defaults to ```poi,admin,address```). 
    * It can be ```poi```, ```admin``` or ```address``` 
    * ```poi``` expands internally to ```geoname```, ```osmnode```, ```osmway``` 
    * ```admin``` expands to ```admin0```, ```admin1```, ```admin2```, ```neighborhood```, ```locality```, ```local_admin```
    * ```address``` expands to ```osmaddress```, ```openaddresses```
    * or it can also be specific to one particular dataset for example: ```geoname```
  * **bbox**: the bounding box where you want all your results to appear in. 
    * It can be one of the following comma separated string value
    * bottom_left lat, bottom_left lon, top_right lat, top_right lon
    * left,bottom,right,top
    * min Longitude , min Latitude , max Longitude , max Latitude 

## /search/coarse
This is a coarse forward geocoder endpoint: only searches admin dataset layers

#### Parameters
* required:
  * **input** 
* optional:
  * **lat**
  * **lon**
  * **zoom**
  * **bbox**: the bounding box where you want all your results to appear in. 
    * It can be one of the following comma separated string value
    * bottom_left lat, bottom_left lon, top_right lat, top_right lon
    * left,bottom,right,top
    * min Longitude , min Latitude , max Longitude , max Latitude 
  * **size** (defaults to 10)
  * **layers** (set to ```admin``` by default)

## /suggest

The autocomplete endpoint: fast response time. Mixes results from around the provided lat/lon and also from precision level 1 and 3

#### Parameters
* required:
  * **input**: query string
  * **lat**: latitude from where you are searching
  * **lon**: longitude
    * lat/lon are **required** currently because of this [open issue](https://github.com/elasticsearch/elasticsearch/issues/6444)
* optional:
  * **zoom**: zoom level at which you are viewing the world
  * **size**: number of results you need (defaults to 10)
  * **layers**: datasets you want to query upon (defaults to ```poi,admin,address```)

## /suggest/coarse

Only queries the admin layers

#### Parameters
* required:
  * **input**: query string
  * **lat**: latitude from where you are searching
  * **lon**: longitude
    * lat/lon are **required** currently because of this [open issue](https://github.com/elasticsearch/elasticsearch/issues/6444)
* optional:
  * **zoom**: zoom level at which you are viewing the world
  * **size**: number of results you need (defaults to 10)
  * **layers**: datasets you want to query upon (defaults to ```admin```)

## /suggest/nearby

* Works as autocomplete for places located nearby the lat/lon
* Its the same as ```/suggest``` but the results are all within 50kms of lat/lon thats passed
* Unlike ```/suggest```, ```/suggest/nearby``` does not mix results from different precision levels (500km, 1000km etc from lat/lon)

#### Parameters
* required:
  * **input**: query string
  * **lat**: latitude from where you are searching
  * **lon**: longitude
    * lat/lon are **required** currently because of this [open issue](https://github.com/elasticsearch/elasticsearch/issues/6444)
* optional:
  * **zoom**: zoom level at which you are viewing the world
  * **size**: number of results you need (defaults to 10)
  * **layers**: datasets you want to query upon (defaults to ```poi,admin,address```)

## /reverse

Reverse geocoding endpoint

#### Parameters
* required:
  * **lat**: latitude
  * **lon**: longitude
* optional:
  * **zoom**: zoom level
  * **bbox**: bounding box
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
