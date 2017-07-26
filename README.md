>This repository is part of the [Pelias](https://github.com/pelias/pelias)
>project. Pelias is an open-source, open-data geocoder built by
>[Mapzen](https://www.mapzen.com/) that also powers [Mapzen Search](https://mapzen.com/projects/search). Our
>official user documentation is [here](https://mapzen.com/documentation/search/).

# Pelias API Server

This is the API server for the Pelias project. It's the service that runs to process user HTTP requests and return results as GeoJSON by querying Elasticsearch.

[![NPM](https://nodei.co/npm/pelias-api.png?downloads=true&stars=true)](https://nodei.co/npm/pelias-api)

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/pelias/api?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Documentation

See the [Mapzen Search documentation](https://mapzen.com/documentation/search/).

## Install Dependencies

Note: Pelias requires Node.js v4 or newer

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
|`textAnalyzer`|*no*|*addressit*|can be either `libpostal` or `addressit` however will soon be **deprecated** and only `libpostal` will be supported going forward|
|`indexName`|*no*|*pelias*|name of the Elasticsearch index to be used when building queries|
|`relativeScores`|*no*|true|if set to true, confidence scores will be normalized, realistically at this point setting this to false is not tested or desirable
|`accessLog`|*no*||name of the format to use for access logs; may be any one of the [predefined values](https://github.com/expressjs/morgan#predefined-formats) in the `morgan` package. Defaults to `"common"`; if set to `false`, or an otherwise falsy value, disables access-logging entirely.|
|`services`|*no*||service definitions for [point-in-polygon](https://github.com/pelias/pip-service) and [placholder](https://github.com/pelias/placeholder) services.  If missing (which is not recommended), the point-in-polygon and placeholder services will not be called.|
|`defaultParameters.focus.point.lon` <br> `defaultParameters.focus.point.lat`|no | |default coordinates for focus point

Example configuration file would look something like this:

```
{
  "esclient": {
    "keepAlive": true,
    "requestTimeout": "1200000",
    "hosts": [
      {
        "protocol": "http",
        "host": "somesemachine.elb.amazonaws.com",
        "port": 9200
      }
    ]
  },
  "api": {
    "host": "localhost:3100/v1/",
    "indexName": "foobar",  
    "relativeScores": true,
    "textAnalyzer": "libpostal",
    "services": {
      "pip": {
        "url": "http://mypipservice.com:3000"
      },
      "placeholder": {
        "url": "http://myplaceholderservice.com:5000"
      }
    }
    "defaultParameters": {
      "focus.point.lat": 12.121212,
      "focus.point.lon": 21.212121
    }
  },
  "interpolation": {
    "client": {
      "adapter": "http",
      "host": "internal-pelias-interpolation-dev-130430937.us-east-1.elb.amazonaws.com"
    }
  },
  "logger": {
    "level": "debug"
  }
}
```


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

Travis tests every release against Node.js versions `4` and `6`.

[![Build Status](https://travis-ci.org/pelias/api.png?branch=master)](https://travis-ci.org/pelias/api)


### Versioning

We rely on semantic-release and Greenkeeper to maintain our module and dependency versions.

[![Greenkeeper badge](https://badges.greenkeeper.io/pelias/api.svg)](https://greenkeeper.io/)
