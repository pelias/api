# API

Pelias RESTful API

## Documentation

[API Documentation](https://github.com/pelias/api/tree/master/docs)

## Install Dependencies

```bash
$ npm install
```

## Contributing

Please fork and pull request against upstream master on a feature branch.

Pretty please; provide unit tests and script fixtures in the `test` directory.

### Start Server

```bash
$ npm start
```

### Running Unit Tests

```bash
$ npm run unit
```

### Running Functional Tests
(this requires the server to be running)

```bash
$ npm run ciao
```

### Running All Tests

```bash
$ npm test
```

### Generate API Documentation

```bash
$ npm run docs
```

### Continuous Integration

Travis tests every release against node version `0.10`

[![Build Status](https://travis-ci.org/pelias/api.png?branch=master)](https://travis-ci.org/pelias/api)