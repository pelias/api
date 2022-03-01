const Debug = require('../../../helper/debug');

module.exports.tests = {};

module.exports.tests.debug = function(test, common) {
  test('initialize the debugger with a name', (t) => {
    const debugLog = new Debug('debugger');
    t.deepEquals(debugLog.name, 'debugger');
    t.end();
  });

  test('don\'t push debug message if enableDebug is false', (t) => {
    const debugLog = new Debug('debugger');
    const req = {
      clean: {
        enableDebug: false
      }
    };
    debugLog.push(req, 'This should not be pushed');
    t.deepEquals(req.debug, undefined);
    t.end();
  });

  test('don\'t start timer if enableDebug is false', (t) => {
    const debugLog = new Debug('debugger');
    const req = {
      clean: {
        enableDebug: false
      }
    };
    debugLog.beginTimer(req, 'This should not be pushed');
    t.deepEquals(req.debug, undefined);
    t.end();
  });

  test('don\'t push debug message if req.clean is empty', (t) => {
    const debugLog = new Debug('debugger');
    const req = {
      clean: {}
    };
    debugLog.push('This should not be pushed');
    t.deepEquals(req.debug, undefined);
    t.end();
  });

  test('Push messages if enableDebug is true', (t) => {
    const debugLog = new Debug('debugger');
    const req = {
      clean: {
        enableDebug: true
      }
    };
    const expected_req = [
      {
        debugger: 'This should be pushed'
      },
      {
        debugger: 'Timer Began. Timer 1'
      }
    ];
    debugLog.push(req, 'This should be pushed');
    debugLog.beginTimer(req, 'Timer 1');
    t.deepEquals(req.debug, expected_req);
    t.end();
  });

  test('Push messages can take output of function', (t) => {
    const debugLog = new Debug('debugger');
    const req = {
      clean: {
        enableDebug: true
      }
    };
    const expected_req = [
      {
        debugger: 'This should be pushed'
      }
    ];
    debugLog.push(req, () => ('This should be pushed'));
    t.deepEquals(req.debug, expected_req);
    t.end();
  });

  test('Timer should return number of milliseconds', (t) => {
    const debugLog = new Debug('debugger');
    const req = {
      clean: {
        enableDebug: true
      }
    };
    const timer = debugLog.beginTimer(req);
    debugLog.stopTimer(req, timer);
    // Checks that there is a debug message
    // that matches the pattern "Timer Stopped. [number] ms"
    t.deepEquals(req.debug[1].debugger.match(/Timer Stopped\. \d+ ms/i).length, 1);
    t.end();
  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[helper] debug: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
