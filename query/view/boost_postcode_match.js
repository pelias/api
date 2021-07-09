module.exports = function (subview) {
  return function (vs) {

    // query section reduces the number of records which
    // the decay function is applied to.
    // we simply re-use the another view for the function query.
    if (!subview) {
      return null;
    } // subview validation failed

    // validate required params
    if (!vs.isset('input:postcode') ||
        !vs.isset('address:postcode:analyzer') ||
        !vs.isset('address:postcode:field') ||
        !vs.isset('address:postcode:boost')) {
      return null;
    }

    return {
      constant_score: {
        filter: {
          match_phrase: {
            [ vs.var('address:postcode:field') ]: {
              query   : vs.var('input:postcode'),
                analyzer: vs.var('address:postcode:analyzer')
              }
            }
          },
        boost : vs.var('address:postcode:boost')
      }
    };
  };
};
