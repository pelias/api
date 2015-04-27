# API
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/pelias/api?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Pelias RESTful API

## Documentation

[API Documentation](https://github.com/pelias/api/tree/master/docs)

## Install Dependencies

The API uses [scripts](https://github.com/pelias/scripts) for scoring/sorting that needs to be installed.

You **must** install the `pelias scripts` from: https://github.com/pelias/scripts.

Failing to do so will result in the following error: ```ElasticsearchIllegalArgumentException[Unable to find on disk script admin_boost]```

Once you are done with installing the scripts, Run the following

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