'use strict';

const jwtChecker = require('express-jwt'),
    peliasConfig = require( 'pelias-config' ).generate(require('../schema')),
    jwt = require('jsonwebtoken');
    
/**
 * Reads configuration's API 'auth' key and determines auth method if any
 *
 * @returns {function} authentication method or done() statement
 */

function determineAuth() {  
    if (peliasConfig.api.auth === 'jwt') {
      return jwtChecker({
        secret: process.env.JWT_SECRET
      });
    }
    else if(peliasConfig.api.auth === 'geoaxis_jwt') {
      return (req, res, done) => {
        if(req.header('Authorization')){
          let jwtPayload = jwt.decode(req.header('Authorization').split(' ')[1]);
          if (jwtPayload){
            if(process.env.GEOAXIS_DN.split(';').indexOf(jwtPayload.dn) !== -1 && checkTime(jwtPayload.exp)){
              done();
            }
            else if(!checkTime(jwtPayload.exp)){
              res.status(401).send({ error: 'Expired token' });
            }
          }
          else {
            res.status(401).send({ error: 'Invalid token' });
          }
        }
        else{
          res.status(401).send({ error: 'Missing token' });
        }
        
      };
    }
    else {
      return (req, res, done) => {
        done();
      };
    }
  }

function checkTime(timeStamp){
  return timeStamp > Date.now() / 1000 | 0;
}
    
module.exports = {
    determineAuth: determineAuth
};