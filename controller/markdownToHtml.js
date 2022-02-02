const markdown = require('markdown').markdown;
const fs = require('fs');

function setup(peliasConfig, markdownFile) {

  // read markdown
  const md = fs.readFileSync(markdownFile, 'utf8').trim();

  // convert to HTML
  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Pelias Geocoder</title>
    <style>html { font-family:monospace; }</style>
  </head>
  <body>
    ${markdown.toHTML(md)}
  </body>
</html>`.trim();

  // send HTML
  return function controller(req, res) {
    res.send(html);
  };
}

module.exports = setup;
