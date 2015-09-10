## /search

The full text search endpoint that matches the name of a place to points on the planet.

#### Required Parameters
* `text`: the string to search for (eg `new york city` or `london`)

#### Optional Parameters
* `lat`, `lon`: the latitude/longitude coordinates to bias search results towards (may increase relevancy)
* `size` (default: `10`): the number of results to return
* `layers` (default: `poi,admin,address`): the comma-separated names of datasets you wish to query. Valid values are:
  * aliases for multiple datasets like `poi`, `admin` or `address`
    * `poi` expands internally to `geoname`, `osmnode`, `osmway`
    * `admin` expands to `admin0`, `admin1`, `admin2`, `neighborhood`, `locality`, `local_admin`
    * `address` expands to `osmaddress`, `openaddresses`
  * the name of one particular dataset, like `geoname` or `osmaddress`
* `bbox`: the bounding box from which you want all your results to come
  * can be one of the following comma separated string values
    * "southwest_lng,southwest_lat,northeast_lng,northeast_lat" `L.latLngBounds(southwestLatLng, northeastLatLng).toBBoxString()`
    * bottom left lon, bottom left lat, top right lon, top right lat
    * left, bottom, right, top
    * min longitude, min latitude, max longitude, max latitude
* `details` (default: `true`): indicates if results should contain detailed. Valid values:
  * `false`: results will only contain `id`, `layer`, and `text` properties
  * `true`: all available properties will be included in results


## /search/coarse

Like the `/search` endpoint, but performs a "coarse" search, meaning that it only searches administrative regions
(countries, states, counties, neighborhoods, etc.).

#### Required Parameters
Same as `/search`.

#### Optional Parameters
Same as `/search`.

## /suggest

The autocompletion endpoint that offers very fast response times; ideal for completing partial user input. Mixes
results from around the provided lat/lon coordinates and also from precision level 1 and 3.

#### Required Parameters
* `text`: query string
* `lat`, `lon`: The latitude/longitude coordinates to bias results towards.
  * `lat`/`lon` are currently **required** because of this [open issue](https://github.com/elasticsearch/elasticsearch/issues/6444)

#### Optional Parameters
* `size` (default: `10`): number of results requested
* `layers` (default: `poi,admin,address`): datasets you wish to query
* `details` (default: `true`)

## /suggest/coarse

Only queries the admin layers.

#### Required Parameters
Same as `/suggest`.

#### Optional Parameters
Same as `/suggest`.


## /suggest/nearby

Works as autocomplete for only the places located near a latitude/longitude; this endpoint is the same as `/suggest`
but the results are all from within 50 kilometers of the specified point.  Unlike `/suggest`, `/suggest/nearby` does
not mix results from different precision levels (500km, 1000km etc from lat/lon).

#### Required Parameters
Same as `/suggest`.

#### Optional Parameters
Same as `/suggest`.

## /reverse

The reverse geocoding endpoint; matches a point on the planet to the name of that place.

#### Required Parameters
* `lat`, `lon`: The coordinates of the point.

#### Optional Parameters
* `layers` (default: `poi,admin,address`)
* `details` (default: `true`)


## /place

The endpoint for retrieving one or more places with specific ids. These correspond
directly with Elasticsearch documents.

#### Required Parameters
* one of `id` or `ids`
  * `id`:
    * unique id of the places to be retrieved
    * should be in the form of type:id, for example: `geoname:4163334`
  * `ids`:
    * if multiple places are to be fetched in bulk, an array of ids
