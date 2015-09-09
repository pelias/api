
var markdown = require('markdown').markdown;
var fs = require('fs');

function setup(peliasConfig, markdownFile){

  var styleString = '<style>html{font-family:monospace}</style>';
  var text = '# Pelias API\n';
  text += '### Version: [' + peliasConfig.version + '](https://github.com/pelias/api/releases)\n';
  text += fs.readFileSync( markdownFile, 'utf8');
  var html = styleString + markdown.toHTML(text);

  function controller( req, res ) {
    if (req.accepts('html')) {
      res.send(html);
      return;
    }
    // default behaviour
    res.json({
      markdown: text,
      html: html
    });
  }

  return controller;
}

module.exports = setup;
