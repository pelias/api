"use strict";

const axios = require('axios');
const geotransIP = process.env.GEOTRANS_IP;

function geotrans(coord) { 
    let result;
    return axios.get(`http://${geotransIP}:3150`, {
        params:{
            'datum':'WGE',
            'coord':coord
        }
    })
    .then(function (response){
        return response.data;
    }).catch(function (reason){
        return reason;
    });
}
  
module.exports = {
    geotrans: geotrans
};