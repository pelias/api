/**
  This view allows users to specify a custom boost for sources and layers.

  The view is implemented using a 'function_score' query, which enumerates multiple 'functions', each
  function will assign a 'score' to each document when matched.

  A document can match more than one function, in this case the 'score_mode' is used to decide how these
  scores are combined, the default is 'sum'.

  Likewise, a document can also match zero functions, in this case it is assigned a score of 'min_score'.

  The computed score is then multiplied by the 'boost' value in order to come up with the final boost value
  which will be assigned to that document. The 'boost' value is essentially a hard-coded multiplier for the score.

  The 'max_boost' property is simply a ceiling for this computed boost, if the computed boosted is higher than
  max_boost it will be assigned the value of max_boost instead.

  Note: This is a simple use of the 'function_score' query, as such we don't use the 'boost_mode' property
  (because there is no query section) and the 'weight' values we assign are simply returned verbatim
  (because we use filter queries for the function scoring).

  ref: https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-function-score-query.html

  example config section:
  {
    "source": {
      "openstreetmap": 5
    },
    "layer": {
      "street": 3,
      "country": 5
    }
  }

  example query:
  {
    "function_score": {
      "query": {
        "match_all": {}
      },
      "functions": [{
        "filter": {
          "match": {
            "layer": "intersections"
          }
        },
        "weight": 1.6
      },{
        "filter": {
          "match": {
            "layer": "stops"
          }
        },
        "weight": 2.4
      }],
      "boost": 5,
      "max_boost": 40,
      "score_mode": "sum",
      "boost_mode": "multiply",
      "min_score": 1
    }
  }
**/

// supported top-level config items
const TARGETS = ['source', 'layer'];

module.exports = function( config ) {

  // no valid config to use, fail now, don't render this view.
  if( !config ) { return function(){ return null; }; }

  return function( vs ) {

    // validate required params
    if( !vs.isset('custom:boosting:min_score') ||
        !vs.isset('custom:boosting:boost') ||
        !vs.isset('custom:boosting:max_boost') ||
        !vs.isset('custom:boosting:score_mode') ||
        !vs.isset('custom:boosting:boost_mode') ){
      return null;
    }

    // base 'function_score' view
    var view = {
      'function_score': {
        'query': { 'match_all': {} },   // apply to all documents
        'functions': [],                // a list of functions which contribute to a 'score' for each document
        'min_score':                    vs.var('custom:boosting:min_score'),
        'boost':                        vs.var('custom:boosting:boost'),
        'max_boost':                    vs.var('custom:boosting:max_boost'),
        'score_mode':                   vs.var('custom:boosting:score_mode'),
        'boost_mode':                   vs.var('custom:boosting:boost_mode')
      },
    };

    // iterate over supported targets and their values
    TARGETS.forEach( function( target ) {
      if( 'object' === typeof config[target] ) {
        Object.keys(config[target]).forEach(function(value) {

          // add a scoring function for this target, assigning a weight
          let weight = config[target][value];
          view.function_score.functions.push({
            'weight': isNaN(weight) ? 1 : weight,
            'filter': {
              'match': {
                [target]: value
              }
            }
          });
        });
      }
    });

    // no functions were generated, fail now, don't render this view.
    if( view.function_score.functions.length === 0 ) { return null; }

    return view;
  };
};
