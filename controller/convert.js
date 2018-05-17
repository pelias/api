'use strict';

const _ = require('lodash');
const DATUM = 'WGE';
const external = require('../service/external');


function converter( req, res, next) {
    try{
        external.geotrans(req.query).then(function(gtResult){
            if(typeof gtResult === 'string' && gtResult.indexOf('ERROR') > -1){
                res.send(gtResult);
                throw gtResult;
            }
            else{
                res.send(addQueryProperties(gtResult, req.query));
            }
        }).catch(function(error){
            res.send({'error':error});
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
