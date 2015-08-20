// validate inputs, convert types and apply defaults
function sanitize( req ){
  var params = req.query;
  req.clean = req.clean || {};

  if (params === undefined || params.alpha3 === undefined) {
    return {
      'error': false
    };
  }

  if (typeof params.alpha3 === 'string' && params.alpha3.length === 3) {
    req.clean.alpha3 = params.alpha3;
    return {
      'error': false
    };
  } else {
    return {
      'error': true,
      msg: 'invalid alpha3 parameter: must be a 3 character string'
    };
  }
}

module.exports = sanitize;
