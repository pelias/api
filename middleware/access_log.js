/**
 * Print out access logs.
 */

'use strict';

var peliasConfig = require( 'pelias-config' ).generate().api;
var morgan = require( 'morgan' );

module.exports = peliasConfig.accessLog ?
  morgan( peliasConfig.accessLog ) :
  function noop(req, res, next){
    next();
  };
