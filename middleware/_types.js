var types_helper = require( '../helper/types' );

/**
 * Validate the types specified to be searched.
 *
 * Elasticsearch interprets an empty array of types as "search anything" rather
 * than "search nothing", so in the case of an empty array, return an error
 * message instead of searching at all.
 */
function middleware(req, res, next) {
  req.clean = req.clean || {};

  if (req.clean.hasOwnProperty('types') === false) {
    return next();
  }

  try {
    var types = types_helper(req.clean.types);

    if ((types instanceof Array) && types.length === 0) {
      var err = 'You have specified both the `sources` and `layers` ' +
        'parameters in a combination that will return no results.';
      res.status(400); // 400 Bad Request
      return next(err);
    }

    req.clean.type = types;
  }
  catch (err) {
    // this means there were no types specified
    delete req.clean.types;
  }

  next();
}

module.exports = middleware;
