var _ = require('lodash');

// layers in increasing order of granularity
var layers = [
  ['venue'],
  ['address'],
  ['neighbourhood'],
  ['locality', 'localadmin'],
  ['county', 'macrocounty'],
  ['region', 'macroregion'],
  ['country']
];

function hasRecordsAtLayers(results, layers) {
  return _.some(results, function(result) {
    return layers.indexOf(result.layer) !== -1;
  });
}

function retainRecordsAtLayers(results, layers) {
  return _.filter(results, function(result) {
    return layers.indexOf(result.layer) !== -1;
  });
}

function setup() {
 return function trim(req, res, next) {
   if (_.isUndefined(req.clean)) {
     return next();
   }

   layers.forEach(function(layer) {
     if (hasRecordsAtLayers(res.data, layer )) {
       res.data = retainRecordsAtLayers(res.data, layer);
     }
   });

   next();
 };
}

module.exports = setup;
