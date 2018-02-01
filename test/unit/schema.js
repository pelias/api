'use strict';

const Joi = require('joi');
const schema = require('../../schema');
const _ = require('lodash');

module.exports.tests = {};

module.exports.tests.completely_valid = (test, common) => {
  test('all valid configuration elements should not throw error', (t) => {
    var config = {
      api: {
        version: 'version value',
        indexName: 'index name value',
        host: 'host value',
        accessLog: 'accessLog value',
        relativeScores: true,
        localization: {
          flipNumberAndStreetCountries: ['ABC', 'DEF']
        },
        requestRetries: 19,
        services: {
          pip: {
            url: 'http://localhost'
          },
          placeholder: {
            url: 'http://localhost'
          },
          interpolation: {
            url: 'http://localhost'
          },
          libpostal: {
            url: 'http://localhost'
          }
        },
        defaultParameters: {
          'focus.point.lat': 19,
          'focus.point.lon': 91
        }
      },
      esclient: {
        requestTimeout: 17
      }
    };

    const result = Joi.validate(config, schema);

    t.notOk(result.error);
    t.end();

  });

  test('basic valid configuration should not throw error and have defaults set', (t) => {
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

    const result = Joi.validate(config, schema);

    t.notOk(result.error);
    t.deepEquals(result.value.api.services, {}, 'missing api.services should default to empty object');
    t.end();

  });

};

module.exports.tests.api_validation = (test, common) => {
  test('config without api should throw error', (t) => {
    var config = {
      esclient: {}
    };

    const result = Joi.validate(config, schema);

    t.equals(result.error.details.length, 1);
    t.equals(result.error.details[0].message, '"api" is required');
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

    const result = Joi.validate(config, schema);

    t.notOk(result.error);
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

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"version" must be a string');

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

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"indexName" must be a string');

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

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"host" must be a string');

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

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"accessLog" must be a string');

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

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"relativeScores" must be a boolean');

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

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"localization" must be an object');

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

    const result = Joi.validate(config, schema);

    t.equals(result.error.details.length, 1);
    t.equals(result.error.details[0].message, '"unknown_property" is not allowed');

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

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"flipNumberAndStreetCountries" must be an array');

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

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"0" must be a string');

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

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, `"0" with value "${value}" fails to match the required pattern: /^[A-Z]{3}$/`);

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

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"requestRetries" must be a number');

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

    const result = Joi.validate(config, schema);

    t.equals(result.error.details.length, 1);
    t.equals(result.error.details[0].message, '"requestRetries" must be an integer');
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

    const result = Joi.validate(config, schema);

    t.equals(result.error.details.length, 1);
    t.equals(result.error.details[0].message, '"requestRetries" must be larger than or equal to 0');
    t.end();

  });

  // api.placeholderService has been moved to api.services.placeholder.url
  test('any api.placeholderService value should be disallowed', (t) => {
    [null, 17, {}, [], true, 'http://localhost'].forEach((value) => {
      var config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          placeholderService: value
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"placeholderService" is not allowed');

    });

    t.end();

  });

  // api.pipService has been moved to api.services.pip.url
  test('any api.pipService value should fail', (t) => {
    [null, 17, {}, [], true, 'http://localhost'].forEach((value) => {
      var config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          pipService: value
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.notOk(result.error);

    });

    t.end();

  });

  test('non-number defaultParameters.focus.point.lat should throw error', (t) => {
    [null, 'string', {}, [], false].forEach((value) => {
      const config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          defaultParameters: {
            'focus.point.lat': value
          }
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"focus.point.lat" must be a number');

    });

    t.end();

  });

  test('non-number defaultParameters.focus.point.lon should throw error', (t) => {
    [null, 'string', {}, [], false].forEach((value) => {
      const config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          defaultParameters: {
            'focus.point.lon': value
          }
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"focus.point.lon" must be a number');

    });

    t.end();

  });

  test('non-object api.defaultParameters should throw error', (t) => {
    [null, 17, false, [], 'string'].forEach((value) => {
      var config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          defaultParameters: value
        },
        esclient: {}
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"defaultParameters" must be an object');

    });

    t.end();

  });


};

module.exports.tests.api_services_validation = (test, common) => {
  test('unsupported children of api.services should be disallowed', (t) => {
    var config = {
      api: {
        version: 'version value',
        indexName: 'index name value',
        host: 'host value',
        services: {
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

};

module.exports.tests.service_validation = (test, common) => {
  // these tests apply for all the individual service definitions
  const services = ['pip', 'placeholder', 'interpolation', 'libpostal'];

  test('timeout and retries not specified should default to 250 and 3', (t) => {
    services.forEach(service => {
      const config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          services: {}
        },
        esclient: {}
      };

      config.api.services[service] = {
        url: 'http://localhost'
      };

      const result = Joi.validate(config, schema);

      t.equals(result.value.api.services[service].timeout, 250);
      t.equals(result.value.api.services[service].retries, 3);

    });

    t.end();

  });

  test('when api.services.<service> is defined, url is required', (t) => {
    services.forEach(service => {
      const config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          services: {}
        },
        esclient: {}
      };

      config.api.services[service] = {};

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"url" is required');
    });

    t.end();

  });

  test('non-string api.services.<service>.url should throw error', (t) => {
    services.forEach(service => {
      [null, 17, {}, [], true].forEach(value => {
        const config = {
          api: {
            version: 'version value',
            indexName: 'index name value',
            host: 'host value',
            services: {}
          },
          esclient: {}
        };

        config.api.services[service] = {
          url: value
        };

        const result = Joi.validate(config, schema);

        t.equals(result.error.details.length, 1);
        t.equals(result.error.details[0].message, '"url" must be a string');

      });

    });

    t.end();

  });

  test('non-http/https api.services.<service>.url should throw error', (t) => {
    services.forEach(service => {
      ['ftp', 'git', 'unknown'].forEach((scheme) => {
        const config = {
          api: {
            version: 'version value',
            indexName: 'index name value',
            host: 'host value',
            services: {}
          },
          esclient: {}
        };

        config.api.services[service] = {
          url: `${scheme}://localhost`
        };

        const result = Joi.validate(config, schema);

        t.equals(result.error.details.length, 1);
        t.equals(result.error.details[0].message, '"url" must be a valid uri with a scheme matching the https\? pattern');

      });

    });

    t.end();

  });

  test('non-url/timeout/retries children of api.services.<service> should be disallowed', (t) => {
    services.forEach(service => {
      const config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          services: {}
        },
        esclient: {}
      };

      config.api.services[service] = {
        url: 'http://localhost',
        unknown_property: 'value'
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"unknown_property" is not allowed');

    });

    t.end();

  });

  test('non-number timeout should throw error', (t) => {
    services.forEach(service => {
      [null, 'string', {}, [], false].forEach((value) => {
        const config = {
          api: {
            version: 'version value',
            indexName: 'index name value',
            host: 'host value',
            services: {}
          },
          esclient: {}
        };

        config.api.services[service] = {
          url: 'http://localhost',
          timeout: value
        };

        const result = Joi.validate(config, schema);

        t.equals(result.error.details.length, 1);
        t.equals(result.error.details[0].message, '"timeout" must be a number');

      });

    });

    t.end();

  });

  test('non-integer timeout should throw error', (t) => {
    services.forEach(service => {
      const config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          services: {}
        },
        esclient: {}
      };

      config.api.services[service] = {
        url: 'http://localhost',
        timeout: 17.3
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"timeout" must be an integer');

    });

    t.end();

  });

  test('negative timeout should throw error', (t) => {
    services.forEach(service => {
      const config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          services: {}
        },
        esclient: {}
      };

      config.api.services[service] = {
        url: 'http://localhost',
        timeout: -1
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"timeout" must be larger than or equal to 0');

    });

    t.end();

  });

  test('non-number retries should throw error', (t) => {
    services.forEach(service => {
      [null, 'string', {}, [], false].forEach((value) => {
        const config = {
          api: {
            version: 'version value',
            indexName: 'index name value',
            host: 'host value',
            services: {}
          },
          esclient: {}
        };

        config.api.services[service] = {
          url: 'http://localhost',
          retries: value
        };

        const result = Joi.validate(config, schema);

        t.equals(result.error.details.length, 1);
        t.equals(result.error.details[0].message, '"retries" must be a number');

      });

    });

    t.end();

  });

  test('non-integer retries should throw error', (t) => {
    services.forEach(service => {
      const config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          services: {}
        },
        esclient: {}
      };

      config.api.services[service] = {
        url: 'http://localhost',
        retries: 17.3
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"retries" must be an integer');

    });

    t.end();

  });

  test('negative retries should throw error', (t) => {
    services.forEach(service => {
      const config = {
        api: {
          version: 'version value',
          indexName: 'index name value',
          host: 'host value',
          services: {}
        },
        esclient: {}
      };

      config.api.services[service] = {
        url: 'http://localhost',
        retries: -1
      };

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"retries" must be larger than or equal to 0');

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

    const result = Joi.validate(config, schema);

    t.equals(result.error.details.length, 1);
    t.equals(result.error.details[0].message, '"esclient" is required');
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

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"esclient" must be an object');

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

      const result = Joi.validate(config, schema);

      t.equals(result.error.details.length, 1);
      t.equals(result.error.details[0].message, '"requestTimeout" must be a number');

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

    const result = Joi.validate(config, schema);

    t.equals(result.error.details.length, 1);
    t.equals(result.error.details[0].message, '"requestTimeout" must be an integer');
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

    const result = Joi.validate(config, schema);

    t.equals(result.error.details.length, 1);
    t.equals(result.error.details[0].message, '"requestTimeout" must be larger than or equal to 0');
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
