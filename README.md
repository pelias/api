>This repository is part of the [Pelias](https://github.com/pelias/pelias)
>project. Pelias is an open-source, open-data geocoder originally sponsored by
>[Mapzen](https://www.mapzen.com/). Our official user documentation is
>[here](https://github.com/pelias/documentation).

# Pelias API Server

This is the API server for the Pelias project. It's the service that runs to process user HTTP requests and return results as GeoJSON by querying Elasticsearch and the other Pelias services.

[![NPM](https://nodei.co/npm/pelias-api.png?downloads=true&stars=true)](https://nodei.co/npm/pelias-api)

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/pelias/pelias)

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
The API recognizes the following properties under the top-level `api` key in your `pelias.json` config file:

|parameter|required|default|description|
|---|---|---|---|
|`services`|*no*||service definitions for [point-in-polygon](https://github.com/pelias/pip-service), [libpostal](https://github.com/whosonfirst/go-whosonfirst-libpostal), [placeholder](https://github.com/pelias/placeholder), and [interpolation](https://github.com/pelias/interpolation) services.  If missing (which is not recommended), the services will not be called.|
|`defaultParameters.focus.point.lon` <br> `defaultParameters.focus.point.lat`|no | |default coordinates for focus point
|`targets.layers_by_source` <br> `targets.source_aliases` <br> `targets.layer_aliases`|no | |custom values for which `sources` and `layers` the API accepts ([more info](https://github.com/pelias/api/pull/1131)).
|`customBoosts` | no | `{}` | Allows configuring boosts for specific sources and layers, in order to influence result order. See [Configurable Boosts](#custom-boosts) below for details |
|`autocomplete.exclude_address_length` | no | 0 | As a performance optimization, this optional parameter allows excluding address results for queries below the configured length. Addresses are usually the bulk of the records in Elasticsearch, and searching across all of them for very short text inputs can be slow, with little benefit. Consider setting this to 1 or 2 if you have several million addresses in Pelias. |
|`indexName`|*no*|*pelias*|name of the Elasticsearch index to be used when building queries|
|`attributionURL`|no| (autodetected)|The full URL to use for the attribution link returned in all Pelias responses. Pelias will attempt to autodetect this host, but it will often be correct if, for example, there is a proxy between Pelias and its users. This parameter allows setting a specific URL to avoid any such issues|
|`accessLog`|*no*||name of the format to use for access logs; may be any one of the [predefined values](https://github.com/expressjs/morgan#predefined-formats) in the `morgan` package. Defaults to `"common"`; if set to `false`, or an otherwise falsy value, disables access-logging entirely.|
|`relativeScores`|*no*|true|if set to true, confidence scores will be normalized, realistically at this point setting this to false is not tested or desirable

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


### Versioning

We rely on semantic-release and Greenkeeper to maintain our module and dependency versions.

[![Greenkeeper badge](https://badges.greenkeeper.io/pelias/api.svg)](https://greenkeeper.io/)
