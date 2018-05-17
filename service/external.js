'use strict';

const logger = require( 'pelias-logger' ).get( 'api' );
const axios = require('axios');
const geotransURL = process.env.GEOTRANS_URL;

function geotrans(query) { 
    let url = geotransURL;
    logger.info(`GET ${url}`);
    return axios.get(url, {
        params:query
    })
    .then(function (response){
        logger.info('200');
        logger.info(response.data);
        return response.data;
    }).catch(function (reason){
        logger.info('ERROR');
        logger.info(reason);
        return reason;
    });
}
  
module.exports = {
    geotrans: geotrans
};
