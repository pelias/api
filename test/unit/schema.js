'use strict';

const Joi = require('joi');
const schema = require('../../schema');

function validate(config) {
  Joi.validate(config, schema, (err, value) => {
    if (err) {
      throw new Error(err.details[0].message);
    }
  });
}

module.exports.tests = {};

module.exports.tests.completely_valid = (test, common) => {
  test('all valid configuration elements should not throw error', (t) => {
    var config = {
      api: {
        version: 'version value',
        indexName: 'index name value',
        host: 'host value',
        legacyUrl: 'legacyUrl value',
        accessLog: 'accessLog value',
        relativeScores: true,
        localization: {
          flipNumberAndStreetCountries: ['ABC', 'DEF']
        },
        requestRetries: 19
      },
      esclient: {
        requestTimeout: 17
      }
    };

    t.doesNotThrow(validate.bind(config));
    t.end();

  });

  test('basic valid configuration should not throw error', (t) => {
    var config = {
      api: {
        version: 'version value',
        indexName: 'index name value',
        host: 'host value'
      },
      esclient: {
        requestTimeout: 17
      }
    };

    t.doesNotThrow(validate.bind(config));
    t.end();

  });

};

module.exports.tests.api_validation = (test, common) => {
  test('config without api should throw error', (t) => {
    var config = {
      esclient: {}
    };

    t.throws(validate.bind(null, config), /"api" is required/, 'api should exist');
    t.end();

  });

  test('config without unknown field in api should not throw error', (t) => {
    var config = {
      api: {
        version: 'version value',
        indexName: 'index name value',
        host: 'host value',
        unknown: 'unknown value'
      },
      esclient: {}
    };

    t.doesNotThrow(validate.bind(null, config), 'unknown properties should be allowed');
    t.end();

  });

  test('non-string api.version should throw error', (t) => {
    [null, 17, {}, [], true].forEach((value) => {
      var config = {
        api: {
          version: value,
          indexName: 'index name value',
          host: 'host value'
        },
        esclient: {}
      };

      t.throws(validate.bind(null, config), /"version" must be a string/);

    });

    t.end();

  });

  test('non-string api.indexName should throw error', (t) => {
    [null, 17, {}, [], true].forEach((value) => {
      var config = {
        api: {
          version: 'version value',
          indexName: value,
          host: 'host value'
        },
        esclient: {}
      };

      t.throws(validate.bind(null, config), /"indexName" must be a string/);

    });

    t.end();

  });

  test('non-string api.host should throw error', (t) => {
    [null, 17, {}, [], true].forEach((value) => {
      var config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: value
        },
        esclient: {}
      };

      t.throws(validate.bind(null, config), /"host" must be a string/);

    });

    t.end();

  });

  test('non-string api.legacyUrl should throw error', (t) => {
    [null, 17, {}, [], true].forEach((value) => {
      var config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          legacyUrl: value
        },
        esclient: {}
      };

      t.throws(validate.bind(null, config), /"legacyUrl" must be a string/);

    });

    t.end();

  });

  test('non-string api.accessLog should throw error', (t) => {
    [null, 17, {}, [], true].forEach((value) => {
      var config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          accessLog: value
        },
        esclient: {}
      };

      t.throws(validate.bind(null, config), /"accessLog" must be a string/);

    });

    t.end();

  });

  test('non-boolean api.relativeScores should throw error', (t) => {
    [null, 17, {}, [], 'string'].forEach((value) => {
      var config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          relativeScores: value
        },
        esclient: {}
      };

      t.throws(validate.bind(null, config), /"relativeScores" must be a boolean/);

    });

    t.end();

  });

  test('non-object api.localization should throw error', (t) => {
    [null, 17, false, [], 'string'].forEach((value) => {
      var config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          localization: value
        },
        esclient: {}
      };

      t.throws(validate.bind(null, config), /"localization" must be an object/);

    });

    t.end();

  });

  test('unknown properties in api.localization should throw error', (t) => {
    var config = {
      api: {
        version: 'version value',
        indexName: 'index name value',
        host: 'host value',
        localization: {
          unknown_property: 'value'
        }
      },
      esclient: {}
    };

    t.throws(validate.bind(null, config), /"unknown_property" is not allowed/);

    t.end();

  });

  test('non-array api.localization.flipNumberAndStreetCountries should throw error', (t) => {
    [null, 17, {}, false, 'string'].forEach((value) => {
      var config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          localization: {
            flipNumberAndStreetCountries: value
          }
        },
        esclient: {}
      };

      t.throws(
        validate.bind(null, config),
        /"flipNumberAndStreetCountries" must be an array/);

    });

    t.end();

  });

  test('non-string api.localization.flipNumberAndStreetCountries elements should throw error', (t) => {
    [null, 17, {}, false, []].forEach((value) => {
      var config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          localization: {
            flipNumberAndStreetCountries: [value]
          }
        },
        esclient: {}
      };

      t.throws(validate.bind(null, config), /"0" must be a string/);

    });

    t.end();

  });

  test('non-3-char api.localization.flipNumberAndStreetCountries elements should throw error', (t) => {
    ['AB', 'ABCD'].forEach((value) => {
      var config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          localization: {
            flipNumberAndStreetCountries: [value]
          }
        },
        esclient: {}
      };

      t.throws(validate.bind(null, config), /fails to match the required pattern/);
    });

    t.end();

  });

  test('config with non-number api.requestRetries should throw error', (t) => {
    [null, 'string', {}, [], false].forEach((value) => {
      var config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          requestRetries: value
        },
        esclient: {}
      };

      t.throws(
        validate.bind(null, config),
        /"requestRetries" must be a number/, 'api.requestRetries should be a number');

    });

    t.end();

  });

  test('config with non-integer api.requestRetries should throw error', (t) => {
    var config = {
      api: {
        version: 'version value',
        indexName: 'index name value',
        host: 'host value',
        requestRetries: 17.3
      },
      esclient: {}
    };

    t.throws(
      validate.bind(null, config),
      /"requestRetries" must be an integer/, 'api.requestRetries should be an integer');

    t.end();

  });

  test('config with negative api.requestRetries should throw error', (t) => {
    var config = {
      api: {
        version: 'version value',
        indexName: 'index name value',
        host: 'host value',
        requestRetries: -1
      },
      esclient: {}
    };

    t.throws(
      validate.bind(null, config),
      /"requestRetries" must be larger than or equal to 0/, 'api.requestRetries must be positive');

    t.end();

  });

  test('non-string api.pipService should throw error', (t) => {
    [null, 17, {}, [], true].forEach((value) => {
      var config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          pipService: value
        },
        esclient: {}
      };

      t.throws(validate.bind(null, config), /"pipService" must be a string/);

    });

    t.end();

  });

  test('non-URI-formatted api.pipService should throw error', (t) => {
    ['this is not a URI'].forEach((value) => {
      var config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          pipService: value
        },
        esclient: {}
      };

      t.throws(validate.bind(null, config), /"pipService" must be a valid uri/);

    });

    t.end();

  });

  test('non-http/https api.pipService should throw error', (t) => {
    ['ftp', 'git', 'unknown'].forEach((scheme) => {
      var config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          pipService: `${scheme}://localhost`
        },
        esclient: {}
      };

      t.throws(validate.bind(null, config), /"pipService" must be a valid uri/);

    });

    t.end();

  });

  test('http/https api.pipService should not throw error', (t) => {
    ['http', 'https'].forEach((scheme) => {
      var config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          pipService: `${scheme}://localhost`
        },
        esclient: {}
      };

      t.doesNotThrow(validate.bind(null, config), `${scheme} should be allowed`);

    });

    t.end();

  });

};

module.exports.tests.esclient_validation = (test, common) => {
  test('config without esclient should throw error', (t) => {
    var config = {
      api: {
        version: 'version value',
        indexName: 'index name value',
        host: 'host value'
      }
    };

    t.throws(
      validate.bind(null, config),
      /"esclient" is required/, 'esclient should exist');
    t.end();

  });

  test('config with non-object esclient should throw error', (t) => {
    [null, 17, [], 'string', true].forEach((value) => {
      var config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value'
        },
        esclient: value
      };

      t.throws(
        validate.bind(null, config),
        /"esclient" must be an object/, 'esclient should be an object');

    });

    t.end();

  });

  test('config with non-number esclient.requestTimeout should throw error', (t) => {
    [null, 'string', {}, [], false].forEach((value) => {
      var config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value'
        },
        esclient: {
          requestTimeout: value
        }
      };

      t.throws(
        validate.bind(null, config),
        /"requestTimeout" must be a number/, 'esclient.requestTimeout should be a number');

    });

    t.end();

  });

  test('config with non-integer esclient.requestTimeout should throw error', (t) => {
    var config = {
      api: {
        version: 'version value',
        indexName: 'index name value',
        host: 'host value'
      },
      esclient: {
        requestTimeout: 17.3
      }
    };

    t.throws(
      validate.bind(null, config),
    /"requestTimeout" must be an integer/, 'esclient.requestTimeout should be an integer');

    t.end();

  });

  test('config with negative esclient.requestTimeout should throw error', (t) => {
    var config = {
      api: {
        version: 'version value',
        indexName: 'index name value',
        host: 'host value'
      },
      esclient: {
        requestTimeout: -1
      }
    };

    t.throws(
      validate.bind(null, config),
      /"requestTimeout" must be larger than or equal to 0/, 'esclient.requestTimeout must be positive');

    t.end();

  });

};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape('configValidation: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
