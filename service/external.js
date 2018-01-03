const request = require('request');
const logger = require('pelias-logger').get('api');

"use strict";

async function geotrans(coord) { 
    let result;
    request(`http://10.0.2.62:3150?datum=WGE&coord=${coord}`, function (error, response, body) {
        logger.info(response.body);
        result = response.body;
    });
    return result;
    
}

module.exports = {
    geotrans: geotrans
};