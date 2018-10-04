>This repository is part of the [Pelias](https://github.com/pelias/pelias)
>project. Pelias is an open-source, open-data geocoder originally sponsored by
>[Mapzen](https://www.mapzen.com/). Our official user documentation is
>[here](https://github.com/pelias/documentation).

# Pelias API Server

This is the API server for the Pelias project. It's the service that runs to process user HTTP requests and return results as GeoJSON by querying Elasticsearch and the other Pelias services.

[![NPM](https://nodei.co/npm/pelias-api.png?downloads=true&stars=true)](https://nodei.co/npm/pelias-api)

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/pelias/api?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Documentation

Full documentation for the Pelias API lives in the [pelias/documentation](https://github.com/pelias/documentation) repository.

## Install Dependencies

Note: Pelias requires Node.js v6 or newer

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

## pelias-config
The API recognizes the following properties under the top-level `api` key in your `pelias.json` config file:

|parameter|required|default|description|
|---|---|---|---|
|`host`|*yes*||specifies the url under which the http service is to run|
|`indexName`|*no*|*pelias*|name of the Elasticsearch index to be used when building queries|
|`relativeScores`|*no*|true|if set to true, confidence scores will be normalized, realistically at this point setting this to false is not tested or desirable
|`accessLog`|*no*||name of the format to use for access logs; may be any one of the [predefined values](https://github.com/expressjs/morgan#predefined-formats) in the `morgan` package. Defaults to `"common"`; if set to `false`, or an otherwise falsy value, disables access-logging entirely.|
|`services`|*no*||service definitions for [point-in-polygon](https://github.com/pelias/pip-service), [libpostal](https://github.com/whosonfirst/go-whosonfirst-libpostal), [placeholder](https://github.com/pelias/placeholder), and [interpolation](https://github.com/pelias/interpolation) services.  If missing (which is not recommended), the services will not be called.|
|`defaultParameters.focus.point.lon` <br> `defaultParameters.focus.point.lat`|no | |default coordinates for focus point
|`targets.layers_by_source` <br> `targets.source_aliases` <br> `targets.layer_aliases`|no | |custom values for which `sources` and `layers` the API accepts ([more info](https://github.com/pelias/api/pull/1131)).
|`attributionURL`|no| (autodetedted)|The full URL to use for the attribution link returned in all Pelias responses. Pelias will attempt to autodetect this host, but it will often be correct if, for example, there is a proxy between Pelias and its users. This parameter allows setting a specific URL to avoid any such issues|

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

The `timeout` and `retry` values, as showin in the `pip` service section, are optional but configurable for all services (see [pelias/microservice-wrapper](https://github.com/pelias/microservice-wrapper) for more details).


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
