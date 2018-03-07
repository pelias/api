const _ = require('lodash');

const serviceWrapper = require('pelias-microservice-wrapper').service;
const PlaceHolder = require('./configurations/PlaceHolder');
const PointInPolygon = require('./configurations/PointInPolygon');
const Language = require('./configurations/Language');
const Interpolation = require('./configurations/Interpolation');

module.exports.create = (peliasConfig) => {
  const pipConfiguration = new PointInPolygon(_.defaultTo(peliasConfig.api.services.pip, {}));
  const placeholderConfiguration = new PlaceHolder(_.defaultTo(peliasConfig.api.services.placeholder, {}));
  const changeLanguageConfiguration = new Language(_.defaultTo(peliasConfig.api.services.placeholder, {}));
  const interpolationConfiguration = new Interpolation(_.defaultTo(peliasConfig.api.services.interpolation, {}));

  return {
    pip: {
      service: serviceWrapper(pipConfiguration),
      isEnabled: _.constant(pipConfiguration.isEnabled())
    },
    placeholder: {
      service: serviceWrapper(placeholderConfiguration),
      isEnabled: _.constant(placeholderConfiguration.isEnabled())
    },
    language: {
      service: serviceWrapper(changeLanguageConfiguration),
      isEnabled: _.constant(changeLanguageConfiguration.isEnabled())
    },
    interpolation: {
      service: serviceWrapper(interpolationConfiguration),
      isEnabled: _.constant(interpolationConfiguration.isEnabled())
    }
  };
};
