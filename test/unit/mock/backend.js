

var responses = {};
responses['client/suggest/ok/1'] = function( cmd, cb ){
  return cb( undefined, suggestEnvelope([ { score: 1, text: 'mocktype:mockid' }, { score: 2, text: 'mocktype:mockid' } ]) );
};
responses['client/suggest/fail/1'] = function( cmd, cb ){
  return cb( 'a backend error occurred' );
};
responses['client/search/ok/1'] = function( cmd, cb ){
  return cb( undefined, searchEnvelope([{
    _id: 'myid1',
    _type: 'mytype1',
    _source: {
      value: 1,
      center_point: { lat: 100.1, lon: -50.5 },
      name: { default: 'test name1' },
      admin0: 'country1', admin1: 'state1', admin2: 'city1'
    }
  }, {
    _id: 'myid2',
    _type: 'mytype2',
    _source: {
      value: 2,
      center_point: { lat: 100.2, lon: -51.5 },
      name: { default: 'test name2' },
      admin0: 'country2', admin1: 'state2', admin2: 'city2'
    }
  }]));
};
responses['client/mget/ok/1'] = function( cmd, cb ){
  return cb( undefined, mgetEnvelope([{
    _id: 'myid1',
    _type: 'mytype1',
    found: true,
    _source: {
      value: 1,
      center_point: { lat: 100.1, lon: -50.5 },
      name: { default: 'test name1' },
      admin0: 'country1', admin1: 'state1', admin2: 'city1'
    }
  }, {
    _id: 'myid2',
    _type: 'mytype2',
    found: true,
    _source: {
      value: 2,
      center_point: { lat: 100.2, lon: -51.5 },
      name: { default: 'test name2' },
      admin0: 'country2', admin1: 'state2', admin2: 'city2'
    }
  }]));
};
responses['client/search/fail/1'] = function( cmd, cb ){
  return cb( 'a backend error occurred' );
};

function setup( key, cmdCb ){
  function backend( a, b ){
    return {
      client: {
        suggest: function( cmd, cb ){
          if( 'function' === typeof cmdCb ){ cmdCb( cmd ); }
          return responses[key].apply( this, arguments );
        },
        search: function( cmd, cb ){
          if( 'function' === typeof cmdCb ){ cmdCb( cmd ); }
          return responses[key].apply( this, arguments );
        },
        mget: function( cmd, cb ){
          if( 'function' === typeof cmdCb ){ cmdCb( cmd ); }
          return responses['client/mget/ok/1'].apply( this, arguments );
        }
      }
    };
  }
  return backend;
}

function suggestEnvelope( options ){
  return { pelias: [{ options: options }]};
}

function searchEnvelope( options ){
  return { hits: { total: options.length, hits: options } };
}

function mgetEnvelope( options ){
  return { docs: options };
}

module.exports = setup;