/**
* Entur:
* This view adds a must_not filter to the query.
* Note that pelias-query does not support rendering must_not predicates
* so post-processing must be applied to the rendered query 
*
* property: the property that the filter should apply to
* value: the value to match on the property
* single: if the filter should only apply if value is the only value
* in property list
*/
module.exports = function ( property, value, single ) {
  return function( vs ) {
    var query = {
      must_not: {
        terms: {
          [property]: value
        }
      }
    };

    if (single) {
      query.script = {
        script: {
          inline: `doc[\"${property}\"].values.size() == 1`,
          lang: 'groovy'
        }
      };
    }
    
    return query;
  };
};