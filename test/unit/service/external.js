const proxyquire = require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    var service = proxyquire('../../../service/external', {
      'pelias-logger': {
        get: (section) => {
          t.equal(section, 'api');
        }
      }

    });

    t.equal(typeof service, 'object', 'service is a object');
    t.equal(typeof service.geotrans, 'function', 'geotrans is a function');
    t.end();
  });
};

module.exports.tests.functionality = (test, common) => {
    test('error thrown', (t) => {
      var service = proxyquire('../../../service/external', {
        'logger': {
          get: (section) => {
            t.equal(section, 'api');
          }
        },
        'axios': {
          get: (url, params) => {
            return Promise.resolve({data: 'ERROR: Invalid MGRS String'});
          }
        }
      });
      service.geotrans('4CFG').then(function(response){
        t.equal(response, 'ERROR: Invalid MGRS String', 'Geotrans conversion throws error when an invalid coordinate is given');
        t.end();
      });

    });
    test('response received', (t) => {
      var service = proxyquire('../../../service/external', {
        'logger': {
          get: (section) => {
            t.equal(section, 'api');
          }
        },
        'axios': {
          get: (url, params) => {
            return Promise.resolve({
              data: {
                'type': 'Feature',
                'geometry': {
                  'type': 'Point',
                  'coordinates': [
                    -72.57553258519015,
                    42.367593344066776
                  ]
                },
                'properties': {
                  'name': '18TXM9963493438'
                }
              }
            });
          }
        }
      });

      service.geotrans('18TXM9963493438').then(function(response){

        let res = {
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [ -72.57553258519015, 42.367593344066776 ]
          },
          'properties': {
            'name': '18TXM9963493438'
          }
        };
        t.equal(response.toString(), res.toString(), 'Geotrans conversion succeeds and properties are added');
        t.end();
      });

    });
  };

module.exports.all = (tape, common) => {

      function test(name, testFunction) {
        return tape('SERVICE /external ' + name, testFunction);
      }

      for( var testCase in module.exports.tests ){
        module.exports.tests[testCase](test, common);
      }
    };
