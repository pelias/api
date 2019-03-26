const proxyquire = require('proxyquire').noCallThru();
const realPeliasConfig = require('pelias-config');
const defaultPeliasConfig = {
  generate: function() {
    return realPeliasConfig.generateDefaults();
  }
};

var generate = proxyquire('../../../query/autocomplete', {
  'pelias-config': defaultPeliasConfig
});

const peliasQuery = require('pelias-query');
const defaults = new peliasQuery.Vars( require('../../../query/autocomplete_defaults') );

// additional views
const views = {
  ngrams_last_token_only:     require('../../../query/view/ngrams_last_token_only'),
  phrase_first_tokens_only: require('../../../query/view/phrase_first_tokens_only')(require('../../../query/view/fuzzy_match')),
  pop_subquery:               require('../../../query/view/pop_subquery'),
  boost_exact_matches:        require('../../../query/view/boost_exact_matches')
};

module.exports.tests = {};

// convenience function for vars since each test uses the same inputs
function vars( clean ){
  var vs = new peliasQuery.Vars( defaults.export() );
  vs.var('input:name', clean.text);
  vs.var('input:name:tokens', clean.tokens);
  vs.var('input:name:tokens_complete', clean.tokens_complete);
  vs.var('input:name:tokens_incomplete', clean.tokens_incomplete);
  return vs;
}

// convenience function for assertions to keep the tests tidy
function assert( t, actual, expected, debug ){
  var _actual = JSON.parse( JSON.stringify( actual ) );
  var _expected = JSON.parse( JSON.stringify( expected ) );

  if( debug ){
    console.error( JSON.stringify( _actual.body.query.bool, null, 2 ) );
    console.error( JSON.stringify( _expected, null, 2 ) );
  }

  t.deepEqual(_actual.type, 'autocomplete', 'query type set');
  t.deepEqual(_actual.body.query.bool, _expected);
  t.end();
}

module.exports.tests.single_token = function(test, common) {
  test('single token - single char - incomplete', function(t) {

    var clean = {
      text: 't',
      tokens: ['t'],
      tokens_complete: [],
      tokens_incomplete: ['t']
    };

    var vs = vars( clean );

    assert( t, generate( clean ), {
      must: [ views.ngrams_last_token_only( vs ) ],
      should: [
        peliasQuery.view.popularity( views.pop_subquery )( vs ),
        peliasQuery.view.population( views.pop_subquery )( vs )
      ]
    });
  });

  test('single token - single char - complete', function(t) {

    var clean = {
      text: 't',
      tokens: ['t'],
      tokens_complete: ['t'],
      tokens_incomplete: []
    };

    var vs = vars( clean );

    assert( t, generate( clean ), {
      must: [ views.phrase_first_tokens_only( vs ) ],
      should: [
        views.boost_exact_matches( vs ),
        peliasQuery.view.popularity( views.pop_subquery )( vs ),
        peliasQuery.view.population( views.pop_subquery )( vs )
      ]
    });
  });

  test('single token - multiple chars - incomplete', function(t) {

    var clean = {
      text: 'test',
      tokens: ['test'],
      tokens_complete: [],
      tokens_incomplete: ['test']
    };

    var vs = vars( clean );

    assert( t, generate( clean ), {
      must: [ views.ngrams_last_token_only( vs ) ],
      should: [
        peliasQuery.view.popularity( views.pop_subquery )( vs ),
        peliasQuery.view.population( views.pop_subquery )( vs )
      ]
    });
  });

  test('single token - multiple chars - complete', function(t) {

    var clean = {
      text: 'test',
      tokens: ['test'],
      tokens_complete: ['test'],
      tokens_incomplete: []
    };

    var vs = vars( clean );

    assert( t, generate( clean ), {
      must: [ views.phrase_first_tokens_only( vs ) ],
      should: [
        views.boost_exact_matches( vs ),
        peliasQuery.view.popularity( views.pop_subquery )( vs ),
        peliasQuery.view.population( views.pop_subquery )( vs )
      ]
    });
  });

  test('nsw incomplete', function(t) {

    var clean = {
      text: 'nsw',
      tokens: ['nsw'],
      tokens_complete: [],
      tokens_incomplete: ['nsw']
    };

    var vs = vars( clean );

    assert( t, generate( clean ), {
      must: [ views.ngrams_last_token_only( vs ) ],
      should: [
        peliasQuery.view.popularity( views.pop_subquery )( vs ),
        peliasQuery.view.population( views.pop_subquery )( vs )
      ]
    });
  });

  test('nsw complete', function(t) {

    var clean = {
      text: 'nsw',
      tokens: ['nsw'],
      tokens_complete: ['nsw'],
      tokens_incomplete: []
    };

    var vs = vars( clean );

    assert( t, generate( clean ), {
      must: [ views.phrase_first_tokens_only( vs ) ],
      should: [
        views.boost_exact_matches( vs ),
        peliasQuery.view.popularity( views.pop_subquery )( vs ),
        peliasQuery.view.population( views.pop_subquery )( vs )
      ]
    });
  });
};

module.exports.tests.multiple_tokens = function(test, common) {
  test('multiple tokens - last token is a single char and is incomplete', function(t) {

    var clean = {
      text: 'test t',
      tokens: ['test', 't'],
      tokens_complete: ['test'],
      tokens_incomplete: ['t']
    };

    var vs = vars( clean );

    assert( t, generate( clean ), {
      must: [
        views.phrase_first_tokens_only( vs ),
        views.ngrams_last_token_only( vs )
      ],
      should: [
        views.boost_exact_matches( vs ),
        peliasQuery.view.popularity( views.pop_subquery )( vs ),
        peliasQuery.view.population( views.pop_subquery )( vs )
      ]
    });
  });

  test('multiple tokens - last token is a single char and is complete', function(t) {

    var clean = {
      text: 'test t',
      tokens: ['test', 't'],
      tokens_complete: ['test', 't'],
      tokens_incomplete: []
    };

    var vs = vars( clean );

    assert( t, generate( clean ), {
      must: [
        views.phrase_first_tokens_only( vs )
      ],
      should: [
        views.boost_exact_matches( vs ),
        peliasQuery.view.popularity( views.pop_subquery )( vs ),
        peliasQuery.view.population( views.pop_subquery )( vs )
      ]
    });
  });

  test('multiple tokens - last token has multiple chars and is incomplete', function(t) {

    var clean = {
      text: 'test abc',
      tokens: ['test', 'abc'],
      tokens_complete: ['test'],
      tokens_incomplete: ['abc']
    };

    var vs = vars( clean );

    assert( t, generate( clean ), {
      must: [
        views.phrase_first_tokens_only( vs ),
        views.ngrams_last_token_only( vs )
      ],
      should: [
        views.boost_exact_matches( vs ),
        peliasQuery.view.popularity( views.pop_subquery )( vs ),
        peliasQuery.view.population( views.pop_subquery )( vs )
      ]
    });
  });

  test('multiple tokens - last token has multiple chars and is complete', function(t) {

    var clean = {
      text: 'test abc',
      tokens: ['test', 'abc'],
      tokens_complete: ['test', 'abc'],
      tokens_incomplete: []
    };

    var vs = vars( clean );

    assert( t, generate( clean ), {
      must: [
        views.phrase_first_tokens_only( vs )
      ],
      should: [
        views.boost_exact_matches( vs ),
        peliasQuery.view.popularity( views.pop_subquery )( vs ),
        peliasQuery.view.population( views.pop_subquery )( vs )
      ]
    });
  });
};


module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('autocomplete token matching permutations: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
