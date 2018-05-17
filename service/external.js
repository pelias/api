'use strict';

const logger = require( 'pelias-logger' ).get( 'api' );
const axios = require('axios');
const geotransURL = process.env.GEOTRANS_URL;

function geotrans(query) { 
    let url = geotransURL;
    logger.info(`GET ${url}`);
    return axios.get(url, {
        params:query
    });
}
  
module.exports = {
    geotrans: geotrans
};
