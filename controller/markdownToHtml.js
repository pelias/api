var markdown = require('markdown').markdown;
var fs = require('fs');

function setup(peliasConfig, markdownFile){

  const text = `
  # Pelias API
  ### Version: [${peliasConfig.version}](https://github.com/pelias/api/releases)
  ${fs.readFileSync( markdownFile, 'utf8')}`
  
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Pelias Geocoder</title>
    <style>html { font-family:monospace; }</style>
  </head>
  <body>
    ${markdown.toHTML(text)}
  </body>
  </html>`


  function controller( req, res ) {
    res.send(html);
  }

  return controller;
}

module.exports = setup;
