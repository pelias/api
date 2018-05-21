const proxyquire = require('proxyquire').noCallThru();

let testConfig = {
    'secret': 'Pelias JWT test',
    'audience': 'nodejs-jwt-auth',
    'issuer': 'https://gxisaccess.io',
    'sub':'test',
    'dn':'dn'
};
module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    
    var service = proxyquire('../../../service/auth', {
      'pelias-logger': {
        get: (section) => {
          t.equal(section, 'api');
        }
      },
      '../config/jwt': testConfig

    });

    t.equal(typeof service, 'object', 'service is a object');
    t.equal(typeof service.determineAuth, 'function', 'determineAuth is a function');
    t.end();
  });
};

module.exports.tests.functionality = (test, common) => {
    test('use JWT when auth set as such', (t) => {
      let req = { 
          'method':'OPTIONS',
          'headers': {
          }
        };
      process.env.JWT_SECRET = 'a';
      process.env.JWT_AUDIENCE = 'a';
      process.env.JWT_ISSUER = 'a';
      let service = proxyquire('../../../service/auth', {
        'logger': {
          get: (section) => {
            t.equal(section, 'api');
          }
        },
        'pelias-config': {
          generate: () => {
              return {
                  'api': {
                      'auth':'jwt'
                  }
              };
          }
        }
      });
      t.equal(service.determineAuth()(req, undefined,(error)=>{return error;}, null).name,'UnauthorizedError');
      t.end();
    });
    test('verify distinguished name if geoaxis_jwt set', (t) => {
      let jwtUser1 = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkbiI6InVzZXIxIiwianRpIjoiYzJjZjJiODQtMTU3Ny00ODVjLTkxNGMtMTZhMzI5Y2RhZTU4IiwiaWF0IjoxNTI2OTI5Mjc0LCJleHAiOjE1MjY5MzI4NzR9.otW671EC_0HmPIw_JvIhyEOBJ5JrA9I-brtMCM4K0FA';
      let jwtUser2 = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkbiI6InVzZXIyIiwianRpIjoiMGUyYzM0ZGYtNzA3ZS00NDdjLWI5ZjUtNTNjNTdmNmEwOTdmIiwiaWF0IjoxNTI2OTI5Mjk4LCJleHAiOjE1MjY5MzI4OTh9.bhW2Ql4Y9W9LJTf9XMa5Vx3V65Rnus7SA5teD14f5Us';
      let req = { 
        'method':'OPTIONS',
        'header': (k) => {
          return 'Bearer ' + jwtUser1;
        }
      };
      process.env.GEOAXIS_DN = 'user1;user2';
      var service = proxyquire('../../../service/auth', {
        'pelias-logger': {
          get: (section) => {
            t.equal(section, 'api');
          }
        },
        'pelias-config': {
          generate: () => {
              return {
                  'api': {
                      'auth':'geoaxis_jwt'
                  }
              };
          }
        }
      });                                           
      t.equal(service.determineAuth()(req, undefined,(error)=>{return error;}, null).name,'UnauthorizedError');
      t.end();
    });
  };
  
module.exports.all = (tape, common) => {
    
      function test(name, testFunction) {
        return tape('SERVICE /auth ' + name, testFunction);
      }
    
      for( var testCase in module.exports.tests ){
        module.exports.tests[testCase](test, common);
      }
    };
    