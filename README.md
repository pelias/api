[![Build Status](https://travis-ci.org/pelias/api.png?branch=master)](https://travis-ci.org/pelias/api)

# API
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/pelias/api?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Documentation

See our [API Documentation](https://github.com/pelias/api/blob/master/public/apiDoc.md).

## Install Dependencies

The API uses [elasticsearch scripts](https://github.com/pelias/scripts) for additional scoring/sorting logic. You
**must** install them, as documented [here](https://github.com/pelias/scripts#pelias-scripts). Failure to do so will
result in the following error:

```
ElasticsearchIllegalArgumentException[Unable to find on disk script admin_boost]
```

Once you are done with installing the scripts, Run the following

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

## pelias-config
The API recognizes the following properties under the top-level `api` key in your `pelias.json` config file:

  * `accessLog`: (*optional*) The name of the format to use for access logs; may be any one of the
  [predefined values](https://github.com/expressjs/morgan#predefined-formats) in the `morgan` package. Defaults to
  `"common"`; if set to `false`, or an otherwise falsy value, disables access-logging entirely.

## Contributing

Please fork and pull request against upstream master on a feature branch. Pretty please; provide unit tests and script
fixtures in the `test` directory.
