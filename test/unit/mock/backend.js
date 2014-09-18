
var responses = {};
responses['client/suggest/ok/1'] = function( cmd, cb ){
  return cb( undefined, suggestEnvelope([ { value: 1 }, { value: 2 } ]) );
};
responses['client/suggest/fail/1'] = function( cmd, cb ){
  return cb( 'a backend error occurred' );
};

function setup( key, cmdCb ){
  function backend( a, b ){
    return {
      client: {
        suggest: function( cmd, cb ){
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

module.exports = setup;