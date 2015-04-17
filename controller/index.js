
var pkg = require('../package');
var markdown = require('markdown').markdown;
var fs = require('fs');

function setup(){

  function controller( req, res, next ){

    fs.readFile('./DOCS.md', 'utf8', function (err, content) {
      if (!err) {
        var header = '# Pelias API\n';
        var version = '### Version: ['+ pkg.version+ '](https://github.com/pelias/api/releases)\n';
        var style = '<style>html{font-family:monospace}</style>';
        
        res.send(style + markdown.toHTML(header + version + content));

      } else {
        // stats
        res.json({
          name: pkg.name,
          version: {
            number: pkg.version
          }
        });
      }
      
    });

  }

  return controller;

}

module.exports = setup;