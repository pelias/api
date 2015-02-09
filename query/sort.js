var population = 'population';
var weights = require('pelias-suggester-pipeline').weights;

module.exports = [
  {
    '_script': {
      'script': 'if (doc.containsKey(\''+ population + '\'))' +
                ' { return doc[\'' + population + '\'].value }' +
                ' else { return 0 }',
      'type': 'number',
      'order': 'desc'
    }
  },
  {
    '_script': {
      'params': {
        'weights': weights
      },
      'script': 'if (doc.containsKey(\'_type\')) { '+
                'type=doc[\'_type\'].value; '+
                'return ( type in weights ) ? weights[ type ] : 0 }' +
                'else { return 0 }',
      'type': 'number',
      'order': 'desc'
    }
  }
];