
var check = require('check-types');
var iterate = require('../helper/iterate');

function sanitize( req, sanitizers, cb ){

  // init an object to store clean
  // (sanitized) input parameters
  req.clean = [];

  // init errors and warnings objects
  req.errors = {};
  req.warnings = {};

  // source of input parameters
  // (in this case from the GET querystring params or POST body)
  var params = ((req.method === 'POST') ? req.body : req.query) || {};

  // Record if the input was a singleton. This is used in the output stage
  // to ensure that the output is also a singleton.
  req.singleton = !Array.isArray(params);

  iterate(params, function(p, index) {
    var clean = {};
    for (var s in sanitizers) {
      var sanity = sanitizers[s]( p, clean );

      // if errors occurred then set them
      // on the req object.
      if( sanity.errors.length ){
        req.errors[index] = (req.errors[index] || []).concat( sanity.errors );
      }

      // if warnings occurred then set them
      // on the req object.
      if( sanity.warnings.length ){
        req.warnings[index] = (req.warnings[index] || []).concat( sanity.warnings );
      }
    }

    req.clean.push(clean);
  });

  // @todo remove these args, they do not need to be passed out
  return cb( undefined, req.clean );
}

// export function
module.exports = sanitize;
