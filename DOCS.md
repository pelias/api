## /search

Full text search endpoint which queries the elasticsearch doc store, slightly slower than suggest.

#### Required Parameters
* **input**: query string

#### Optional Parameters
* **lat**: latitude
* **lon**: longitude
* **zoom**: zoom level from which you wish to view the world
* **size**: number of results requested (defaults to 10)
* **layers**: datasets you wish to query (defaults to ```poi,admin,address```). 
  * valid values are ```poi```, ```admin``` or ```address``` 
    * ```poi``` expands internally to ```geoname```, ```osmnode```, ```osmway``` 
    * ```admin``` expands to ```admin0```, ```admin1```, ```admin2```, ```neighborhood```, ```locality```, ```local_admin```
    * ```address``` expands to ```osmaddress```, ```openaddresses```
  * can also be specific to one particular dataset, for example ```geoname```
* **bbox**: the bounding box from which you want all your results to come
  * can be one of the following comma separated string values
    * bottom left lat, bottom left lon, top right lat, top right lon
    * left, bottom, right, top
    * min longitude, min latitude, max longitude, max latitude 


## /search/coarse

This is a coarse forward geocoder endpoint which only searches admin dataset layers.

#### Required Parameters
* **input**: query string

#### Optional Parameters
* **lat**: latitude
* **lon**: longitude
* **zoom**: zoom level from which you wish to view the world
* **bbox**: the bounding box frome which you want all your results to come
* **size**: (defaults to 10)
* **layers**: (defaults to ```admin```)


## /suggest

The autocomplete endpoint, it offers fast response time. Mixes results from around the provided lat/lon and also from precision level 1 and 3.

#### Required Parameters
* **input**: query string
* **lat**: latitude
* **lon**: longitude
  * lat/lon are **required** currently because of this [open issue](https://github.com/elasticsearch/elasticsearch/issues/6444)

#### Optional Parameters
* **zoom**: zoom level from which you wish to view the world
* **size**: number of results requested (defaults to 10)
* **layers**: datasets you wish to query (defaults to ```poi,admin,address```)


## /suggest/coarse

Only queries the admin layers.

#### Required Parameters
* **input**: query string
* **lat**: latitude from where you are searching
* **lon**: longitude
  * lat/lon are **required** currently because of this [open issue](https://github.com/elasticsearch/elasticsearch/issues/6444)

#### Optional Parameters
* **zoom**: zoom level from which you wish to view the world
* **size**: number of results requested (defaults to 10)
* **layers**: datasets you wish to query (defaults to ```admin```)


## /suggest/nearby

Works as autocomplete for places located near a latitude/longitude, this endpoint is the same as ```/suggest``` but the results are all from within 50 kilometers of the specified point.  Unlike ```/suggest```, ```/suggest/nearby``` does not mix results from different precision levels (500km, 1000km etc from lat/lon).

#### Required Parameters
* **input**: query string
* **lat**: latitude
* **lon**: longitude
  * lat/lon are **required** currently because of this [open issue](https://github.com/elasticsearch/elasticsearch/issues/6444)

#### Optional Parameters
* **zoom**: zoom level from which you wish to view the world
* **size**: number of results you need (defaults to 10)
* **layers**: datasets you wish to query (defaults to ```poi,admin,address```)


## /reverse

Reverse geocoding endpoint.

#### Required Parameters
* **lat**: latitude
* **lon**: longitude

#### Optional Parameters
* **zoom**: zoom level from which you wish to view the world
* **bbox**: bounding box
* **layers**: (defaults to ```poi,admin,address```)


## /doc

Retrieves a document or multiple documents at once.

#### Required Parameters
* one of **id** or **ids**
  * **id**:
    * unique id of the document to be retrieved
    * should be in the form of type:id, for example: ```geoname:4163334```
  * **ids**:
    * if multiple docs are to be fetched in bulk, an array of ids
