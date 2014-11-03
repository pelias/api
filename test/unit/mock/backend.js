
var mockPayload = function(id){
  return { 
    id: 'mocktype/mockid'+id,
    geo: '101,-10.1'
  }
};

var responses = {};
responses['client/suggest/ok/1'] = function( cmd, cb ){
  return cb( undefined, suggestEnvelope([ { value: 1, payload: mockPayload(1) }, { value: 2, payload: mockPayload(2) } ]) );
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

module.exports = setup;