'use strict';

const _ = require('lodash');
const DATUM = 'WGE';
const external = require('../service/external');


function converter( req, res, next) {
    try{
        external.geotrans(req.query).then(function(gtResult){
            res.send(addQueryProperties(gtResult, req.query));
        }).catch(function(error){
            if(error.response){
                res.send(error.response.data);
            }
        });
    }
    catch(error){
        res.send({'error': error});
    }
}

function addQueryProperties (geojson, query){
    geojson.properties.from = query.from;
    geojson.properties.to = query.to;
    return geojson;
}

module.exports = converter;
