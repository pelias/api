
var logger = require('../src/logger');

// Build pelias suggest query
function generate( params, precision ){

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
          'dataset': layers || this.params.layers,
          'location': {
            'value': [ this.params.lon, this.params.lat ],
            'precision': precision || this.get_precision()
          }
        },
        'fuzzy': {
          'fuzziness': fuzzy || 0
        }
      }
    };
  };

  var cmd = new CmdGenerator(params);
  cmd.add_suggester('pelias_1', 5);
  cmd.add_suggester('pelias_2', 3);
  cmd.add_suggester('pelias_3', 1);
  cmd.add_suggester('pelias_4', undefined, ['admin0', 'admin1', 'admin2']);
  cmd.add_suggester('pelias_5', 3, undefined, 'AUTO');
  
  // logger.log( 'cmd', JSON.stringify( cmd.cmd, null, 2 ) );
  return cmd.cmd;

}

module.exports = generate;