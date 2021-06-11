<p align="center">
  <img height="100" src="https://raw.githubusercontent.com/pelias/design/master/logo/pelias_github/Github_markdown_hero.png">
</p>
<h3 align="center">A modular, open-source search engine for our world.</h3>
<p align="center">Pelias is a geocoder powered completely by open data, available freely to everyone.</p>
<p align="center">
<a href="https://en.wikipedia.org/wiki/MIT_License"><img src="https://img.shields.io/github/license/pelias/api?style=flat&color=orange" /></a>
<a href="https://hub.docker.com/u/pelias"><img src="https://img.shields.io/docker/pulls/pelias/api?style=flat&color=informational" /></a>
<a href="https://gitter.im/pelias/pelias"><img src="https://img.shields.io/gitter/room/pelias/pelias?style=flat&color=yellow" /></a>
</p>
<p align="center">
	<a href="https://github.com/pelias/docker">Local Installation</a> ·
        <a href="https://geocode.earth">Cloud Webservice</a> ·
	<a href="https://github.com/pelias/documentation">Documentation</a> ·
	<a href="https://gitter.im/pelias/pelias">Community Chat</a>
</p>
<details open>
<summary>What is Pelias?</summary>
<br />
Pelias is a search engine for places worldwide, powered by open data. It turns addresses and place names into geographic coordinates, and turns geographic coordinates into places and addresses. With Pelias, you’re able to turn your users’ place searches into actionable geodata and transform your geodata into real places.
<br /><br />
We think open data, open source, and open strategy win over proprietary solutions at any part of the stack and we want to ensure the services we offer are in line with that vision. We believe that an open geocoder improves over the long-term only if the community can incorporate truly representative local knowledge.
</details>

# Pelias API Server

This is the API server for the Pelias project. It's the service that runs to process user HTTP requests and return results as GeoJSON by querying Elasticsearch and the other Pelias services.

## Documentation

Full documentation for the Pelias API lives in the [pelias/documentation](https://github.com/pelias/documentation) repository.

## Install Dependencies

The Pelias API has no dependencies beyond Node.js

See [Pelias Software requirements](https://github.com/pelias/documentation/blob/master/requirements.md) for the supported and recommended versions.

```bash
npm install
```

## scripts

The API ships with several convenience commands (runnable via `npm`):

  * `npm start`: start the server
  * `npm test`: run unit tests
  * `npm run ciao`: run functional tests (this requires that the server be running)
  * `npm run docs`: generate API documentation
  * `npm run coverage`: generate code coverage reports
  * `npm run config`: dump the configuration to the command line, which is useful for debugging configuration issues

## Configuration via pelias-config
To run the API with your custom config, specify the location of the config file in the environment variable PELIAS_CONFIG like so:

```PELIAS_CONFIG=/path/to/pelias.json npm run start```

The API recognizes the following properties under the top-level `api` key in your `pelias.json` config file:

|parameter|required|default|description|
|---|---|---|---|
|`services`|*no*||Service definitions for [point-in-polygon](https://github.com/pelias/pip-service), [libpostal](https://github.com/whosonfirst/go-whosonfirst-libpostal), [placeholder](https://github.com/pelias/placeholder), and [interpolation](https://github.com/pelias/interpolation) services. For a description of when different Pelias services are recommended or required, see our [services documentation](https://github.com/pelias/documentation/blob/master/services.md).|
|`defaultParameters.focus.point.lon` <br> `defaultParameters.focus.point.lat`|no | |default coordinates for focus point
|`targets.auto_discover`|no|true|Should `sources` and `layers` be automatically discovered by querying Elasticsearch at process startup. (See more info in the [Custom sources and layers](#custom-sources-and-layers) section below).
|`targets.layers_by_source` <br> `targets.source_aliases` <br> `targets.layer_aliases`|no | |custom values for which `sources` and `layers` the API accepts (See more info in the [Custom sources and layers](#custom-sources-and-layers) section below). We recommend using the `targets.auto_discover:true` configuration instead of setting these manually.
|`customBoosts` | no | `{}` | Allows configuring boosts for specific sources and layers, in order to influence result order. See [Configurable Boosts](#custom-boosts) below for details |
|`autocomplete.exclude_address_length` | no | 0 | As a performance optimization, this optional filter excludes results from the 'address' layer for any queries where the character length of the 'subject' portion of the parsed_text is equal to or less than this many characters in length. Addresses are usually the bulk of the records in Elasticsearch, and searching across all of them for very short text inputs can be slow, with little benefit. Consider setting this to 1 or 2 if you have several million addresses in Pelias. |
|`indexName`|*no*|*pelias*|name of the Elasticsearch index to be used when building queries|
|`attributionURL`|no| (autodetected)|The full URL to use for the attribution link returned in all Pelias responses. Pelias will attempt to autodetect this host, but it will often be incorrect if, for example, there is a proxy between Pelias and its users. This parameter allows setting a specific URL to avoid any such issues|
|`accessLog`|*no*||name of the format to use for access logs; may be any one of the [predefined values](https://github.com/expressjs/morgan#predefined-formats) in the `morgan` package. Defaults to `"common"`; if set to `false`, or an otherwise falsy value, disables access-logging entirely.|
|`relativeScores`|*no*|true|if set to true, confidence scores will be normalized, realistically at this point setting this to false is not tested or desirable
|`exposeInternalDebugTools`|*no*|true|Exposes several debugging tools, such as the ability to enable Elasticsearch explain mode, that may come at a performance cost or expose sensitive infrastructure details. Not recommended if the Pelias API is open to the public.

A good starting configuration file includes this section (fill in the service and Elasticsearch hosts as needed):

```
{
  "esclient": {
    "hosts": [{
      "host": "elasticsearch"
    }]
  },
  "api": {
    "services": {
      "placeholder": {
        "url": "http://placeholder:4100"
      },
      "libpostal": {
        "url": "http://libpostal:8080"
      },
      "pip": {
        "url": "http://pip-service:4200",
        "timeout": 1000,
        "retries": 2
      },
      "interpolation": {
        "url": "http://interpolation:4300"
      }
    }
  },
  "logger": {
    "level": "debug"
  }
}
```

The `timeout` and `retry` values, as show in in the `pip` service section, are optional but configurable for all services (see [pelias/microservice-wrapper](https://github.com/pelias/microservice-wrapper) for more details).

### Custom sources and layers

Pelias allows importing your own data with custom values for `source` and `layer`.

Custom sources and layers are automatically detected on startup of the API. To disable this behavior (not recommended), set `targets.auto_discover` to `false` in your `pelias.json`.

The `auto_discover` functionality sends a request to Elasticsearch in order to automatically discover sources and layers from Elasticsearch when the API server starts-up.

In setups with lots of data (hundreds of millions of records loaded), and low CPU resources, the query sent to Elasticsearch can take several seconds to execute, potentially impacting the performance of other queries hitting Elasticsearch at the same time. The query is cached in Elasticsearch for subsequent requests.

In the rare event this causes issues, the following configuration options can be set to configure sources and layers by hand.

#### `layers_by_source`

This parameter tells Pelias what type of records it can expect a given datasource to have. Anything put here will extend the default configuration which handles all the open data project Pelias supports out of the box. The parameter is an object where your custom source names are the keys, and the list of layers in that source are the values in an array. For example, if you have two custom sources, `mysource` which contains addresses and countries, and `mysource2` containing neighbourhoods, the following would work well:

```
"api": {
  "targets": {
    "layers_by_source": {
      "mysource": ["address", "country"],
      "mysource2": ["neighbourhood"]
    }
  }
}
```

#### `source_aliases`

An optional list of alternate names for sources. These 'aliases' are a convenient way to
provide a short alias for a more verbose source name. An alias may refer to one
or more sources. The keys on the left side represent a previously undefined
'alias', while the values in the array on the right refer to sources previously
defined in "layers_by_source".

For example, to create an alias that allows conveniently searching the two open
data projects who's name starts with "Open", use the following configuration:
```
{
  "api": {
    "targets": {
      "source_aliases": {
        "opensomething": [ "openstreetmap", "openaddresses" ]
    }
  }
}
```

#### `layer_aliases`

An optional list of alternate names for layers. These 'aliases' are a convenient way to
provide a short alias for a more verbose layer name. An alias may refer to one
or more layers. The keys on the left side represent a previously undefined
'alias', while the values in the array on the right refer to layers previously
defined in "layers_by_source"

For example, to create a layer alias `water` that represents all the water layer types supported by Pelias:
```
{
  "api": {
    "targets": {
      "layer_aliases": {
        "water": [ "ocean", "marinearea" ]
    }
  }
}
```

### Custom Boosts

The `customBoosts` config section allows influencing the sorting of results returned from most Pelias queries. Every Pelias record has a `source` and `layer` value, and this section allows prioritizing certain `sources` and `layers`.

First, keep in mind:
1. This will not affect _all_ Pelias queries. In particular, when using the `/v1/search` endpoint, queries for administrative areas (cities, countries, etc) will likely not be affected
2. Custom boosts allow _influencing_ results, but not completely controlling them. Very good matches that aren't in a boosted `source` or `layer` may still be returned first.

The basic form of the configuration looks like this:

```js
{
  "api":
    "customBoosts": {
      "layer": {
        "layername": 5,
        "layername2": 3
      },
      "source": {
        "sourcename": 5
      }
    }
  }
}
```

There are subsections for both `layer` and `source`, and each subsection must be an object. Keys in those objects represent the sources and layers to be boosted, and the value associated with those keys must be a numeric value.

Boost values are essentially multipliers, so values greater than `1` will cause a source or layer to be returned more often, and higher in results. Boosts of the value `1` are the same as no boost, and boosts between `0` and `1` will de-prioritize matching records.

Recommended boost values are between 1 and 5. Higher boosts are likely to cause unexpected impact without really improving results much.

## Configuration via Environment variable

Most Pelias configuration is done through pelias-config, however the API has additional environment variables that affect its operation:

| environment variable | default | description |
| --- | --- | --- |
| HOST | `undefined` | The network interface the Pelias API will bind to. Defaults to whatever the current Node.js default is, which is currently to listen on all interfaces. See the [Node.js Net documentation](https://nodejs.org/api/net.html#net_server_listen_port_host_backlog_callback) for more info. |
| PORT | 3100 | The TCP port the Pelias API will use for incoming network connections. |

## Contributing

Please fork and pull request against upstream master on a feature branch. Pretty please; provide unit tests and script
fixtures in the `test` directory.

## Unit tests

You can run the unit test suite using the command:

```bash
$ npm test
```

## HTTP tests

We have another set of tests which are used to test the HTTP API layer, these tests send expected HTTP requests and then
assert that the responses coming back have the correct geoJSON format and HTTP status codes.

You can run the HTTP test suite using the command:

```bash
$ npm run ciao
```

Note: some of the tests in this suite fail when no data is present in the index, there is a small set of test documents
provided in `./test/ciao_test_data` which can be inserted in order to avoid these errors.

To inject dummy data in to your local index:

```bash
$ node test/ciao_test_data.js
```

You can confirm the dummy data has been inserted with the command:

```bash
$ curl localhost:9200/pelias/_count?pretty
{
  "count" : 9,
  ...
}
```

### Continuous Integration

Travis tests every release against all supported Node.js versions.

[![Build Status](https://travis-ci.org/pelias/api.png?branch=master)](https://travis-ci.org/pelias/api)
