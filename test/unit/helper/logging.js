var logging = require('../../../helper/logging');

module.exports.tests = {};

module.exports.tests.dnt = function(test) {
  test('DNT=1 triggers DNT detection', function(t) {
    var req = {
      headers: {
        DNT: '1'
      }
    };

    t.ok(logging.isDNT(req), 'DNT detected');
    t.end();
  });

  test('DNT=0 triggers DNT detection', function(t) {
    // because this is common apparently, although the spec says to do the opposite
    // see https://en.wikipedia.org/wiki/Do_Not_Track
    var req = {
      headers: {
        DNT: '0'
      }
    };

    t.ok(logging.isDNT(req), 'DNT detected');
    t.end();
  });

  test('do_not_track header triggers DNT detection', function(t) {
    // according to @riordan, some people use this too
    var req = {
      headers: {
        do_not_track: '1'
      }
    };

    t.ok(logging.isDNT(req), 'DNT detected');
    t.end();
  });

  test('no DNT or do_not_track header does not trigger DNT detection', function(t) {
    var req = {
      headers: {
        'Accept-Charset': 'utf-8'
      }
    };

    t.notOk(logging.isDNT(req), 'DNT detected');
    t.end();
  });
};

module.exports.tests.field_removal = function(test) {
  test('removes multiple fields that may have sensitive information', function(t) {
    var query = {
      text: 'possibly sensitive text',
      'point.lat': 'possibly sensitive location info'
    };

    var cleaned_query = logging.removeFields(query);

    var expected = {
      text: '[removed]',
      'point.lat': '[removed]'
    };

    t.deepEquals(cleaned_query, expected, 'multiple sensitive fields removed');
    t.end();
  });

  test('non-sensitive fields untouched', function(t) {
    var query = {
      sources: 'wof,gn'
    };

    var cleaned_query = logging.removeFields(query);

    var expected = {
      sources: 'wof,gn'
    };

    t.deepEquals(cleaned_query, expected, 'non-sensitive fields are not touched');
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('logging: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
