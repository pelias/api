
var pkg = require('../package');

function setup(){

  function controller( req, res, next ){

    // stats
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