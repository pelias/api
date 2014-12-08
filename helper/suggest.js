var service = {
  suggest: require('../service/suggest'),
  mget: require('../service/mget')
};
var geojsonify = require('../helper/geojsonify').search;

function setup(backend, res, next) {
  var query_backend = function(cmd, callback) {
    // query backend

    service.suggest( backend, cmd, function( err, docs ){
      
      // error handler
      if( err ){ return next( err ); }

      callback(null, docs);
    });
  };

  var sort_by_score = function(combined) {
    return combined.map(function(doc) {
      return doc.sort(function(a,b) {
        return b.score - a.score;
      });
    }).reduce(function(a,b) { //flatten
      return a.concat(b);
    });
  };

  var mix_results = function(results, results_keys, size) {
    var i = 0;
    var j = 0;
    var l = results_keys.length;
    var combined = [];
    var unique_ids = [];

    while (i<size && l > 0) {
      if (results[results_keys[j]].length) {
        combined[j] = combined[j] || [];

        var res = results[results_keys[j]][0];
        if (unique_ids.indexOf(res.text) === -1) {
          combined[j].push(res);
          unique_ids.push(res.text);
          i++;
        } 
        results[results_keys[j]].splice(0,1);
      } else {
        results_keys.splice(j,1);
        l = results_keys.length;
        j--;
      }
      j++;
      if (j%l === 0) {
        j=0;
      }
    }
    
    return sort_by_score(combined);
  };
  
  var reply = function(res, docs) {
    
    // convert docs to geojson
    var geojson = geojsonify( docs );

    // response envelope
    geojson.date = new Date().getTime();

    // respond
    return res.status(200).json( geojson );
  };

  var respond = function(data) {

    // no documents suggested, return empty array to avoid ActionRequestValidationException
    if( !Array.isArray( data ) || !data.length ){
      return reply(res, []);
    }

    // map suggester output to mget query
    var query = data.map( function( doc ) {
      var idParts = doc.text.split(':');
      return {
        _index: 'pelias',
        _type: idParts[0],
        _id: idParts.slice(1).join(':')
      };
    });
    
    service.mget( backend, query, function( err, docs ){
    
      // error handler
      if( err ){ return next( err ); }

      // reply
      return reply( res, docs );

    });

  };

  return {
    query_backend: query_backend,
    mix_results: mix_results,
    respond: respond
  };

}

module.exports = setup;
