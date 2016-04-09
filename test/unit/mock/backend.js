
var responses = {};
responses['client/suggest/ok/1'] = function( cmd, cb ){
  return cb( undefined, suggestEnvelope([ { score: 1, text: 'mocktype:mockid1' } ], [ { score: 2, text: 'mocktype:mockid2' } ]) );
};
responses['client/suggest/fail/1'] = function( cmd, cb ){
  return cb( 'a backend error occurred' );
};
responses['client/search/ok/1'] = function( cmd, cb ){
  return cb( undefined, searchEnvelope([{
    _id: 'myid1',
    _type: 'mytype1',
    _score: 10,
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
    _source: {
      value: 2,
      center_point: { lat: 100.2, lon: -51.5 },
      name: { default: 'test name2' },
      parent: { country: ['country2'], region: ['state2'], county: ['city2'] }
    }
  }]));
};
responses['client/search/fail/1'] = function( cmd, cb ){
  return cb( 'a backend error occurred' );
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
      client: {
        mget: function( cmd, cb ){
          if( 'function' === typeof cmdCb ){ cmdCb( cmd ); }
          return responses[key.indexOf('mget') === -1 ? 'client/mget/ok/1' : key].apply( this, arguments );
        },
        msearch: function( cmd, cb ){
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

responses['client/msearch/ok/1'] = function( cmd, cb ){
  var results = [
    [ // 1st set of results
      {
        _id: 'myid1',
        _type: 'mytype1',
        _score: 10,
        _source: {
          value: 1,
          center_point: { lat: 100.1, lon: -50.5 },
          name: { default: 'test name1' },
          admin0: 'country1', admin1: 'state1', admin2: 'city1'
        }
      }
    ],

    [ // 2nd set of results
      {
        _id: 'myid2',
        _type: 'mytype2',
        _score: 20,
        _source: {
          value: 2,
          center_point: { lat: 100.2, lon: -51.5 },
          name: { default: 'test name2' },
          admin0: 'country2', admin1: 'state2', admin2: 'city2'
        }
      },
      {
        _id: 'myid3',
        _type: 'mytype3',
        _score: 30,
        _source: {
          value: 3,
          center_point: { lat: 100.3, lon: -52.5 },
          name: { default: 'test name3' },
          admin0: 'country3', admin1: 'state3', admin2: 'city3'
        }
      },
    ]
  ];
  // msearch expects 2 array items per search, so return n/2 results.
  return cb( undefined, msearchEnvelope(results.slice(0, cmd.body.length/2)));
};

responses['client/msearch/ok/2'] = function( cmd, cb ){
  return cb( undefined, msearchEnvelope([
    [ // 1st set of results
      {
        _id: 'myid1',
        _type: 'mytype1',
        _score: 10,
        _source: {
          value: 1,
          center_point: { lat: 100.1, lon: -50.5 },
          name: { default: 'test name1' },
          admin0: 'country1', admin1: 'state1', admin2: 'city1'
        }
      }
    ]
  ]));
};

responses['client/msearch/fail/1'] = responses['client/search/fail/1'];
responses['client/msearch/queryerror/1'] = function( cmd, cb ){
  return cb( null, msearchEnvelope([
                    'Query error',
                    [ // 2nd set of results
                      {
                        _id: 'myid2',
                        _type: 'mytype2',
                        _score: 20,
                        _source: {
                          value: 2,
                          center_point: { lat: 100.2, lon: -51.5 },
                          name: { default: 'test name2' },
                          admin0: 'country2', admin1: 'state2', admin2: 'city2'
                        }
                      },
                      {
                        _id: 'myid3',
                        _type: 'mytype3',
                        _score: 30,
                        _source: {
                          value: 3,
                          center_point: { lat: 100.3, lon: -52.5 },
                          name: { default: 'test name3' },
                          admin0: 'country3', admin1: 'state3', admin2: 'city3'
                        }
                      },
                    ]
                  ]));
};

function mgetEnvelope( options ){
  return { docs: options };
}

function suggestEnvelope( options1, options2 ){
  return { 0: [{ options: options1 }], 1: [{ options: options2 }]};
}

function searchEnvelope( options ){
  return { hits: { total: options.length, hits: options } };
}

function msearchEnvelope( options ){
  return {
    responses: options.map(function(o) {
      if(typeof o === 'string') {
        return { error: o };
      }
      return { hits: { total: o.length || 1, hits: [].concat(o) } };
    })
  };
}

module.exports = setup;
