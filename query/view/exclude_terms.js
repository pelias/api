/**
 * Entur:
 * This view adds a must_not filter to the query.
 * Note that pelias-query does not support rendering must_not predicates
 * so post-processing must be applied to the rendered query 
 */
module.exports = function ( property, value ) {
    return function( vs ) {
        var query = {
            must_not: {
                terms: {
                    [property]: value
                }
            }
        };
        
        return query;
    };
};