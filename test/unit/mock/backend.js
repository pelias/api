
var mockPayload = {
  id: 'mocktype/mockid',
  geo: '101,-10.1'
};

var responses = {};
responses['client/suggest/ok/1'] = function( cmd, cb ){
  return cb( undefined, suggestEnvelope([ { value: 1, payload: mockPayload }, { value: 2, payload: mockPayload } ]) );
};
responses['client/suggest/fail/1'] = function( cmd, cb ){
  return cb( 'a backend error occurred' );
};
responses['client/search/ok/1'] = function( cmd, cb ){
  return cb( undefined, searchEnvelope([{
    _source: {
      value: 1,
      center_point: { lat: 100.1, lon: -50.5 },
      name: { default: 'test name1' },
      admin0: 'country1', admin1: 'state1', admin2: 'city1'
    }
  }, {
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

responses['client/doc/ok/1'] = function( cmd, cb ){
  return cb( undefined, docEnvelope([{
    _source: {
      value: 1,
      center_point: { lat: 100.1, lon: -50.5 },
      name: { default: 'test name1' },
      admin0: 'country1', admin1: 'state1', admin2: 'city1'
    }
  }, {
    _source: {
      value: 2,
      center_point: { lat: 100.2, lon: -51.5 },
      name: { default: 'test name2' },
      admin0: 'country2', admin1: 'state2', admin2: 'city2'
    }
  }]));
};
responses['client/doc/fail/1'] = responses['client/search/fail/1'];

function setup( key, cmdCb ){
  function backend( a, b ){
    return {
      client: {
        mget: function( cmd, cb ){
          if( 'function' === typeof cmdCb ){ cmdCb( cmd ); }
          return responses[key].apply( this, arguments );
        },
        suggest: function( cmd, cb ){
          if( 'function' === typeof cmdCb ){ cmdCb( cmd ); }
          return responses[key].apply( this, arguments );
        },
        search: function( cmd, cb ){
          if( 'function' === typeof cmdCb ){ cmdCb( cmd ); }
          return responses[key].apply( this, arguments );
        }
      }
    };
  }
  return backend;
}

function docEnvelope( options ){
  return { docs: options };
}

function suggestEnvelope( options ){
  return { pelias: [{ options: options }]};
}

function searchEnvelope( options ){
  return { hits: { total: options.length, hits: options } };
}

module.exports = setup;