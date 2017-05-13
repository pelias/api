'use strict';

const Joi = require('joi');
const schema = require('../../schema');

module.exports.tests = {};

module.exports.tests.completely_valid = (test, common) => {
  test('all valid configuration elements should not throw error', (t) => {
    const config = {
      api: {
        version: 'version value',
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

    const result = Joi.validate(config, schema);

    t.notOk(result.error);
    t.end();

  });

  test('basic valid configuration should not throw error', (t) => {
    const config = {
      api: {
        version: 'version value',
        host: 'host value'
      },
      esclient: {
        requestTimeout: 17
      }
    };

    const result = Joi.validate(config, schema);

    t.notOk(result.error);
    t.end();

  });

};

module.exports.tests.api_validation = (test, common) => {
  test('config without api should throw error', (t) => {
    const config = {
      esclient: {}
    };

    const result = Joi.validate(config, schema);

    t.equals(result.error.details.length, 1);
    t.equals(result.error.details[0].message, '"api" is required');
    t.end();

  });

  test('config without unknown field in api should not throw error', (t) => {
    const config = {
      api: {
        version: 'version value',
        host: 'host value',
        unknown: 'unknown value'
      },
      esclient: {}
    };

    const result = Joi.validate(config, schema);

    t.notOk(result.error);
    t.end();

  });

  test('non-string api.version should throw error', (t) => {
    [null, 17, {}, [], true].forEach((value) => {
      const config = {
        api: {
          version: value,
          host: 'host value'
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"version" must be a string');

    });

    t.end();

  });

  test('non-string api.indexName should throw error', (t) => {
    [null, 17, {}, [], true].forEach((value) => {
      const config = {
        api: {
          version: 'version value',
          indexName: value,
          host: 'host value'
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"indexName" must be a string');

    });

    t.end();

  });

  test('non-string api.host should throw error', (t) => {
    [null, 17, {}, [], true].forEach((value) => {
      const config = {
        api: {
          version: 'version value',
          host: value
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"host" must be a string');

    });

    t.end();

  });

  test('non-string api.legacyUrl should throw error', (t) => {
    [null, 17, {}, [], true].forEach((value) => {
      const config = {
        api: {
          version: 'version value',
          host: 'host value',
          legacyUrl: value
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"legacyUrl" must be a string');

    });

    t.end();

  });

  test('non-string api.accessLog should throw error', (t) => {
    [null, 17, {}, [], true].forEach((value) => {
      const config = {
        api: {
          version: 'version value',
          host: 'host value',
          accessLog: value
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"accessLog" must be a string');

    });

    t.end();

  });

  test('non-boolean api.relativeScores should throw error', (t) => {
    [null, 17, {}, [], 'string'].forEach((value) => {
      const config = {
        api: {
          version: 'version value',
          host: 'host value',
          relativeScores: value
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"relativeScores" must be a boolean');

    });

    t.end();

  });

  test('non-object api.localization should throw error', (t) => {
    [null, 17, false, [], 'string'].forEach((value) => {
      const config = {
        api: {
          version: 'version value',
          host: 'host value',
          localization: value
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"localization" must be an object');

    });

    t.end();

  });

  test('unknown properties in api.localization should throw error', (t) => {
    const config = {
      api: {
        version: 'version value',
        host: 'host value',
        localization: {
          unknown_property: 'value'
        }
      },
      esclient: {}
    };

    const result = Joi.validate(config, schema);

    t.equals(result.error.details.length, 1);
    t.equals(result.error.details[0].message, '"unknown_property" is not allowed');
    t.end();

  });

  test('non-array api.localization.flipNumberAndStreetCountries should throw error', (t) => {
    [null, 17, {}, false, 'string'].forEach((value) => {
      const config = {
        api: {
          version: 'version value',
          host: 'host value',
          localization: {
            flipNumberAndStreetCountries: value
          }
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"flipNumberAndStreetCountries" must be an array');

    });

    t.end();

  });

  test('non-string api.localization.flipNumberAndStreetCountries elements should throw error', (t) => {
    [null, 17, {}, false, []].forEach((value) => {
      const config = {
        api: {
          version: 'version value',
          host: 'host value',
          localization: {
            flipNumberAndStreetCountries: [value]
          }
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"0" must be a string');

    });

    t.end();

  });

  test('non-3-char api.localization.flipNumberAndStreetCountries elements should throw error', (t) => {
    ['AB', 'ABCD'].forEach((value) => {
      const config = {
        api: {
          version: 'version value',
          host: 'host value',
          localization: {
            flipNumberAndStreetCountries: [value]
          }
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.ok(result.error.details[0].message.match(/fails to match the required pattern/));

    });

    t.end();

  });

  test('config with non-number api.requestRetries should throw error', (t) => {
    [null, 'string', {}, [], false].forEach((value) => {
      const config = {
        api: {
          version: 'version value',
          host: 'host value',
          requestRetries: value
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"requestRetries" must be a number');

    });

    t.end();

  });

  test('config with non-integer api.requestRetries should throw error', (t) => {
    const config = {
      api: {
        version: 'version value',
        host: 'host value',
        requestRetries: 17.3
      },
      esclient: {}
    };

    const result = Joi.validate(config, schema);

    t.equals(result.error.details.length, 1);
    t.equals(result.error.details[0].message, '"requestRetries" must be an integer');
    t.end();

  });

  test('config with negative api.requestRetries should throw error', (t) => {
    const config = {
      api: {
        version: 'version value',
        host: 'host value',
        requestRetries: -1
      },
      esclient: {}
    };

    const result = Joi.validate(config, schema);

    t.equals(result.error.details.length, 1);
    t.equals(result.error.details[0].message, '"requestRetries" must be larger than or equal to 0');
    t.end();

  });

  test('non-string api.pipService should throw error', (t) => {
    [null, 17, {}, [], true].forEach((value) => {
      const config = {
        api: {
          version: 'version value',
          host: 'host value',
          pipService: value
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"pipService" must be a string');

    });

    t.end();

  });

  test('non-URI-formatted api.pipService should throw error', (t) => {
    ['this is not a URI'].forEach((value) => {
      const config = {
        api: {
          version: 'version value',
          host: 'host value',
          pipService: value
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.ok(result.error.details[0].message.match(/"pipService" must be a valid uri/));

    });

    t.end();

  });

  test('non-http/https api.pipService should throw error', (t) => {
    ['ftp', 'git', 'unknown'].forEach((scheme) => {
      const config = {
        api: {
          version: 'version value',
          host: 'host value',
          pipService: `${scheme}://localhost`
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.ok(result.error.details[0].message.match(/"pipService" must be a valid uri/));

    });

    t.end();

  });

  test('http/https api.pipService should not throw error', (t) => {
    ['http', 'https'].forEach((scheme) => {
      const config = {
        api: {
          version: 'version value',
          host: 'host value',
          pipService: `${scheme}://localhost`
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.notOk(result.error);

    });

    t.end();

  });

};

module.exports.tests.schema_validation = (test, common) => {
  test('non-string schema.indexName should throw error', (t) => {
    [null, 17, {}, [], true].forEach((value) => {
      const config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value'
        },
        esclient: {},
        schema: {
          indexName: value
        }
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"indexName" must be a string');

    });

    t.end();

  });

  test('unspecified schema.indexName should default to \'pelias\'', (t) => {
    const config = {
      api: {
        version: 'version value',
        indexName: 'index name value',
        host: 'host value'
      },
      esclient: {}
    };

    const result = Joi.validate(config, schema);

    t.notOk(result.error);
    t.equals(result.value.schema.indexName, 'pelias');
    t.end();

  });

};


module.exports.tests.esclient_validation = (test, common) => {
  test('config without esclient should throw error', (t) => {
    const config = {
      api: {
        version: 'version value',
        host: 'host value'
      }
    };

    const result = Joi.validate(config, schema);

    t.equals(result.error.details.length, 1);
    t.equals(result.error.details[0].message, '"esclient" is required');
    t.end();

  });

  test('config with non-object esclient should throw error', (t) => {
    [null, 17, [], 'string', true].forEach((value) => {
      const config = {
        api: {
          version: 'version value',
          host: 'host value'
        },
        esclient: value
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"esclient" must be an object');

    });

    t.end();

  });

  test('config with non-number esclient.requestTimeout should throw error', (t) => {
    [null, 'string', {}, [], false].forEach((value) => {
      const config = {
        api: {
          version: 'version value',
          host: 'host value'
        },
        esclient: {
          requestTimeout: value
        }
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"requestTimeout" must be a number');

    });

    t.end();

  });

  test('config with non-integer esclient.requestTimeout should throw error', (t) => {
    const config = {
      api: {
        version: 'version value',
        host: 'host value'
      },
      esclient: {
        requestTimeout: 17.3
      }
    };

    const result = Joi.validate(config, schema);

    t.equals(result.error.details.length, 1);
    t.equals(result.error.details[0].message, '"requestTimeout" must be an integer');
    t.end();

  });

  test('config with negative esclient.requestTimeout should throw error', (t) => {
    const config = {
      api: {
        version: 'version value',
        host: 'host value'
      },
      esclient: {
        requestTimeout: -1
      }
    };

    const result = Joi.validate(config, schema);

    t.equals(result.error.details.length, 1);
    t.equals(result.error.details[0].message, '"requestTimeout" must be larger than or equal to 0',
      'esclient.requestTimeout must be positive');
    t.end();

  });

};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape(`schema: ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
