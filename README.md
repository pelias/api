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

  * `accessLog`: (*optional*) The name of the format to use for access logs; may be any one of the
  [predefined values](https://github.com/expressjs/morgan#predefined-formats) in the `morgan` package. Defaults to
  `"common"`; if set to `false`, or an otherwise falsy value, disables access-logging entirely.

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
