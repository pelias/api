
var get_layers = require('../helper/layers');

// Build pelias suggest query
function generate( params, query_mixer, fuzziness ){

  var CmdGenerator = function(params){
    this.params = params;
    this.cmd = {
      'text': params.input
    };
  };    

  CmdGenerator.prototype.get_precision = function() {
    var zoom = this.params.zoom;
    switch (true) {
      case (zoom > 15):
        return 5; // zoom: >= 16
      case (zoom > 9):
        return 4; // zoom: 10-15
      case (zoom > 5):
        return 3; // zoom: 6-9
      case (zoom > 3):
        return 2; // zoom: 4-5
      default:
        return 1; // zoom: 1-3 or when zoom: undefined
    } 
  };

  CmdGenerator.prototype.add_suggester = function(name, precision, layers, fuzzy) {
    this.cmd[name] = {
      'completion' : {
        'size' : this.params.size,
        'field' : 'suggest',
        'context': {
          'dataset': this.params.layers || layers,
          'location': {
            'value': null,
            'precision': precision || this.get_precision()
          }
        },
        'fuzzy': {
          'fuzziness': fuzzy || fuzziness || 0
        }
      }
    };
    if (!isNaN(this.params.lon) && !isNaN(this.params.lat)) {
      this.cmd[name].completion.context.location.value = [ this.params.lon, this.params.lat ];
    }
  };

  var cmd = new CmdGenerator(params);
  var suggester_index = 0;

  if (query_mixer && query_mixer.length) {
    query_mixer.forEach(function(item, index){
      var expanded_layers = get_layers(item.layers);
      if (item.precision && Array.isArray( item.precision ) && item.precision.length ) {
        item.precision.forEach(function(precision) {
          cmd.add_suggester(suggester_index++, precision, expanded_layers, item.fuzzy);
        });
      } else {
        cmd.add_suggester(suggester_index++, undefined, expanded_layers, item.fuzzy);
      }
    });  
  } else {
    cmd.add_suggester(suggester_index++);
  }
  
  
  return cmd.cmd;

}

module.exports = generate;
