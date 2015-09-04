var types_helper = require( '../helper/types' );

/**
 * Validate the types specified to be searched.
 *
 * Elasticsearch interprets an empty array of types as "search anything" rather
 * than "search nothing", so in the case of an empty array, return an error
 * message instead of searching at all.
 */
function middleware(req, res, next) {
  var types = types_helper(req.clean.types);

  if (types !== undefined && types.length !== undefined) {
   if (types.length === 0) {
    var err = 'You have specified both the `source` and `layers` ' +
    'parameters in a combination that will return no results.';
    res.status(400); // 400 Bad Request
    return next(err);
   } else {
     req.clean.type = types;
   }
  }

  next();
}

module.exports = middleware;
