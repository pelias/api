module.exports = {
  query: {
    bool: {
      must: [
        {
          match: {
            'name.default': {
              query: 'test',
              cutoff_frequency: 0.01,
              boost: 1,
              minimum_should_match: '1<-1 3<-25%',
              analyzer: 'peliasQuery',
            },
          },
        },
      ],
      should: [
        {
          match_phrase: {
            'phrase.default': {
              query: 'test',
              analyzer: 'peliasPhrase',
              boost: 1,
              slop: 2,
            },
          },
        },
        {
          function_score: {
            query: {
              match_all: {},
            },
            max_boost: 20,
            score_mode: 'first',
            boost_mode: 'replace',
            functions: [
              {
                field_value_factor: {
                  modifier: 'log1p',
                  field: 'popularity',
                  missing: 1,
                },
                weight: 1,
              },
            ],
          },
        },
        {
          function_score: {
            query: {
              match_all: {},
            },
            max_boost: 20,
            score_mode: 'first',
            boost_mode: 'replace',
            functions: [
              {
                field_value_factor: {
                  modifier: 'log1p',
                  field: 'population',
                  missing: 1,
                },
                weight: 2,
              },
            ],
          },
        },
      ],
      filter: [
        {
          terms: {
            layer: ['test'],
          },
        },
      ],
    },
  },
  sort: ['_score'],
  size: 10,
  track_scores: true,
};
