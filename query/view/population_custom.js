module.exports = function (vs) {
  if (
    !vs.isset('population:field') ||
    !vs.isset('population:modifier') ||
    !vs.isset('population:max_boost') ||
    !vs.isset('population:factor') ||
    !vs.isset('population:weight')
  ) {
    return null;
  }

  var view = {
    function_score: {
      max_boost: vs.var('population:max_boost'),
      functions: [
        {
          field_value_factor: {
            modifier: vs.var('population:modifier'),
            field: vs.var('population:field'),
            missing: 1,
            factor: vs.var('population:factor'),
          },
          weight: vs.var('population:weight'),
        },
      ],
      score_mode: 'first',
      boost_mode: 'replace',
    },
  };

  return view;
};
