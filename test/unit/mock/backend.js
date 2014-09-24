
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
  return cb( undefined, searchEnvelope([ { value: 1 }, { value: 2 } ]) );
};
responses['client/search/fail/1'] = function( cmd, cb ){
  return cb( 'a backend error occurred' );
};

function setup( key, cmdCb ){
  function backend(){
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
  return { pelias: [{ options: options }]};
}

module.exports = setup;