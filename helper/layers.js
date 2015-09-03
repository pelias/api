module.exports = function(alias_layers) {
  // make a copy of the array so, you are not modifying original ref
  var layers = alias_layers.slice(0);

  // expand aliases
  var expand_aliases = function(alias, layers, layer_indeces) {
    var alias_index  = layers.indexOf(alias);
    if (alias_index !== -1 ) {
      layers.splice(alias_index, 1);
      layers = layers.concat(layer_indeces);
    }
    return layers;
  };

  layers = expand_aliases('poi',   layers, ['geoname','osmnode','osmway']);
  layers = expand_aliases('admin', layers, ['admin0','admin1','admin2','neighborhood','locality','local_admin']);
  layers = expand_aliases('address', layers, ['osmaddress','openaddresses']);

  // de-dupe
  layers = layers.filter(function(item, pos) {
    return layers.indexOf(item) === pos;
  });

  return layers;
};
