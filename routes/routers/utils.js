const Router = require('express').Router;

const all = require('predicates').all;
const not = require('predicates').not;

const predicates = require('../../controller/predicates');

module.exports = {
  base: '/v1/',

  /**
   * Helper function for creating routers
   *
   * @param {[{function}]} functions
   * @returns {express.Router}
   */
  createRouter: (functions) => {
    const router = Router(); // jshint ignore:line
    functions.forEach(function (f) {
      router.use(f);
    });
    return router;
  },

  // interpolate if:
  // - there's a number and street
  // - there are street-layer results (these are results that need to be interpolated)
  interpolationShouldExecute: (services) => {
    return all(
      not(predicates.hasRequestErrors),
      services.interpolation.isEnabled,
      predicates.hasParsedTextProperties.all('number', 'street'),
      predicates.hasResultsAtLayers.any('street')
    );
  },

  // get language adjustments if:
  // - there's a response
  // - theres's a lang parameter in req.clean
  changeLanguageShouldExecute: (services) => {
    return all(
      predicates.hasResponseData,
      not(predicates.hasRequestErrors),
      services.language.isEnabled,
      predicates.hasRequestParameter('lang')
    );
  }
};