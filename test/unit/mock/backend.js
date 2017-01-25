
var responses = {};
responses['client/search/ok/1'] = function( cmd, cb ){
  return cb( undefined, searchEnvelope([{
    _id: 'myid1',
    _type: 'mytype1',
    _score: 10,
    matched_queries: ['query 1', 'query 2'],
    _source: {
      value: 1,
      center_point: { lat: 100.1, lon: -50.5 },
      name: { default: 'test name1' },
      parent: { country: ['country1'], region: ['state1'], county: ['city1'] }
    }
  }, {
    _id: 'myid2',
    _type: 'mytype2',
    _score: 20,
    matched_queries: ['query 3'],
    _source: {
      value: 2,
      center_point: { lat: 100.2, lon: -51.5 },
      name: { default: 'test name2' },
      parent: { country: ['country2'], region: ['state2'], county: ['city2'] }
    }
  }]));
};
responses['client/search/fail/1'] = function( cmd, cb ){
  return cb( 'an elasticsearch error occurred' );
};

responses['client/mget/ok/1'] = function( cmd, cb ){
  return cb( undefined, mgetEnvelope([{
    _id: 'myid1',
    _type: 'mytype1',
    _score: 10,
    found: true,
    _source: {
      value: 1,
      center_point: { lat: 100.1, lon: -50.5 },
      name: { default: 'test name1' },
      parent: { country: ['country1'], region: ['state1'], county: ['city1'] }
    }
  }, {
    _id: 'myid2',
    _type: 'mytype2',
    _score: 20,
    found: true,
    _source: {
      value: 2,
      center_point: { lat: 100.2, lon: -51.5 },
      name: { default: 'test name2' },
      parent: { country: ['country2'], region: ['state2'], county: ['city2'] }
    }
  }]));
};
responses['client/mget/fail/1'] = responses['client/search/fail/1'];

function setup( key, cmdCb ){
  function backend( a, b ){
    return {
      mget: function( cmd, cb ){
        if( 'function' === typeof cmdCb ){ cmdCb( cmd ); }
        return responses[key.indexOf('mget') === -1 ? 'client/mget/ok/1' : key].apply( this, arguments );
      },
      suggest: function( cmd, cb ){
        if( 'function' === typeof cmdCb ){ cmdCb( cmd ); }
        return responses[key].apply( this, arguments );
      },
      search: function( cmd, cb ){
        if( 'function' === typeof cmdCb ){ cmdCb( cmd ); }
        return responses[key].apply( this, arguments );
      }
    };
  }
  return backend();
}

function mgetEnvelope( options ){
  return { docs: options };
}

function suggestEnvelope( options1, options2 ){
  return { 0: [{ options: options1 }], 1: [{ options: options2 }]};
}

function searchEnvelope( options ){
  return { hits: { total: options.length, hits: options } };
}

module.exports = setup;
