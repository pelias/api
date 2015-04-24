
var pkg = require('../package');
var markdown = require('markdown').markdown;
var fs = require('fs');

function setup(){

  var styleString = '<style>html{font-family:monospace}</style>';
  var text = '# Pelias API\n';
  text += '### Version: ['+ pkg.version+ '](https://github.com/pelias/api/releases)\n';
  text += fs.readFileSync( './DOCS.md', 'utf8');
  var indexHtml = styleString + markdown.toHTML(text);

  function controller( req, res, next ) {
    if (req.accepts('html')) {
      res.send(indexHtml);
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
