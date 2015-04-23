
var pkg = require('../package');
var markdown = require('markdown').markdown;
var fs = require('fs');

function setup(){

  var text = null;
  function getText( callback ) {
    if( text ) {
      process.nextTick( callback.bind( null, null, text ) );
      return;
    }

    fs.readFile( './DOCS.md', 'utf8', function ( err, content ) {
      if( err ) {
        callback( err );
        return;
      }
      text = '# Pelias API\n';
      text += '### Version: ['+ pkg.version+ '](https://github.com/pelias/api/releases)\n';
      text += content;

      callback( null, text );
    });
  }

  function controller( req, res, next ) {
    getText( function ( err, content ) {
      if( !err ) {
        if( req.accepts( 'html' ) ) {
          var style = '<style>html{font-family:monospace}</style>';
          res.send( style + markdown.toHTML( content ) );
        }
        else {
          // stats
          res.json({
            name: pkg.name,
            version: {
              number: pkg.version
            }
          });
        }
      }
    });
  }

  return controller;
}

module.exports = setup;