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

  if (req.clean.hasOwnProperty('types')) {

    try {
      var types = types_helper(req.clean.types);

      if ((types instanceof Array) && types.length === 0) {
        var err = 'You have specified both the `sources` and `layers` ' +
          'parameters in a combination that will return no results.';
        req.errors.push( err );
      }

      else {
        req.clean.type = types;
      }

    }

    // @todo: refactor this flow, it is confusing as `types_helper()` can throw
    // with an error "clean_types should not be null or undefined" which is
    // not returned to the user yet the return value CAN trigger a user error.
    // I would have liked to throw for BOTH cases and then handle the users errors
    // inside the 'catch' but this is not possible.
    // also: why are we deleting things from $clean?
    catch (err) {
      // this means there were no types specified
      delete req.clean.types;
    }

  }

  next();
}

module.exports = middleware;
