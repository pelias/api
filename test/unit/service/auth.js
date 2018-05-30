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
      t.equal(service.determineAuth()(req, undefined,(error)=>{return error;}, ()=>{}).name,'UnauthorizedError');
      t.end();

    });
    test('verify valid distinguished name if geoaxis_jwt set', (t) => {
      let jwtUser1 = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOj' +
      'E1MjcwOTE2NzAsImV4cCI6MTcxNjQ4MDQ3MCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlL' +
      'mNvbSIsImRuIjoidXNlcjEifQ.t5WUdD-TbWYj4O0RmfZ6cZBnKxWw2ea1GU-P9_x25FA';
      let jwtUser2 = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOj' +
      'E1MjcwOTE2NzAsImV4cCI6MTcxNjQ4MDQ3MCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlL' +
      'mNvbSIsImRuIjoidXNlcjIifQ.FRPMlXy355TLn93TSo5Ga9tie-yOH7FnIR3JgfakPHU';
      let req = { 
        'method':'OPTIONS',
        'header': (k) => 'Bearer ' + jwtUser2
      };
      let doneCalled = false;
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
      service.determineAuth()(req, { status: (code) => code},() => {doneCalled = true;});
      t.equal(doneCalled, true);
      t.end();
    });
    test('verify expired token if geoaxis_jwt set', (t) => {
      let jwtUser2 = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOj' +
      'E1MjcwOTE2NzAsImV4cCI6MTQ5NTU1NTY3MCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlL' +
      'mNvbSIsImRuIjoidXNlcjIifQ.1fsYDg-LvLGv92rcIx6EY_vDmudPg0_UcTInHxLAQl0';
      let req = { 
        'method':'OPTIONS',
        'header': (k) => 'Bearer ' + jwtUser2
      };
      let doneCalled = false;
      let errCalled;
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
      service.determineAuth()(req, 
        { status: () => { 
          return { send: (err) => { errCalled = err; } };
        }
         } );
      t.deepEqual(errCalled, {error: 'Expired token'});
      t.end();
    });
    test('verify invalid token if geoaxis_jwt set', (t) => {
      let jwtUser2 = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1Ni19.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOj' +
      'E1MjcwOTE2NzAsImV4cCI6MTQ5NTU1NTY3MCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlL' +
      'mNvbSIsImRuIjoidXNlcjIifQ.1fsYDg-LvLGv92rcIx6EY_vDmudPg0_UcTInHxLAQl0';
      let req = { 
        'method':'OPTIONS',
        'header': (k) => 'Bearer ' + jwtUser2
      };
      let errCalled;
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
      service.determineAuth()(req, 
        { status: () => { 
          return { send: (err) => { errCalled = err; } };
        }
         } );
      t.deepEqual(errCalled, {error: 'Invalid token'});
      t.end();
    });
    test('verify missing token if geoaxis_jwt set', (t) => {
      let req = { 
        'method':'OPTIONS',
        'header': (k) => null
      };
      let doneCalled = false;
      let errCalled;
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
      service.determineAuth()(req, 
        { status: () => { 
          return { send: (err) => { errCalled = err; } };
        }
         } );
      t.deepEqual(errCalled, {error: 'Missing token'});
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
    