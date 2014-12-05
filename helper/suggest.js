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

  var dedup = function(combined) {
    var unique_ids = [];
    return combined.filter(function(item, pos) {
      if (unique_ids.indexOf(item.text) === -1) {
        unique_ids.push(item.text);
        return true;
      }
      return false;
    });
  };

  var sort_by_score = function(combined) {
    return combined.sort(function(a,b) {
      return b.score - a.score;
    });
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
    dedup: dedup,
    sort_by_score: sort_by_score,
    reply: reply,
    respond: respond
  };

}

module.exports = setup;
