
var pkg = require('../package');
var markdown = require('markdown').markdown;
var fs = require('fs');

function setup(){

  var text = '# Pelias API\n';
  text += '### Version: ['+ pkg.version+ '](https://github.com/pelias/api/releases)\n';
  text += fs.readFileSync( './DOCS.md', 'utf8');

  function controller( req, res, next ) {
    if (req.accepts('html')) {
      if( text ) {
        var style = '<style>html{font-family:monospace}</style>';
        res.send(style + markdown.toHTML(text));
      }
      return;
    }
    // default behaviour
    res.json({
      name: pkg.name,
      version: {
        number: pkg.version
      }
    });
  }

  return controller;
}

module.exports = setup;