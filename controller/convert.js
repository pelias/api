"use strict";


const _ = require('lodash');
const DATUM = 'WGE';
const external = require('../service/external');
const logger = require( 'pelias-logger' ).get( 'api' );

"use strict";



function converter( req, res, next) {
  let result;
  try{
    if(_.find(req.query, (val, key) => val === 'mgrs')){
      //If mgrs is specified as a conversion parameter
      //let mgrsConverter = new MGRS_converter(DATUM);
      if(req.query.from === 'mgrs' && req.query.to === 'decdeg'){
        logger.info("testing");
        result = external.geotrans(req.query.q);
        logger.info(result);
      }
    }
    if(typeof result === 'string' && result.indexOf('ERROR') > -1){
      //Relay error
      throw result;
    }
    result.properties.from = req.query.from;
    result.properties.to = req.query.to;
    if(result.properties.name.toLowerCase() !== req.query.q.toLowerCase()){
      result.properties.name = req.query.q.toUpperCase();
    }
  }
  catch(error){
    result = {"error": error};
  }
  finally{
    res.send(result);
  }
}

module.exports = converter;
