module.exports = {
  query: {
    bool: {
      must: [
        {
          multi_match: {
            type: 'phrase',
            query: 'three four',
            fields: ['phrase.default', 'phrase.en'],
            analyzer: 'peliasQuery',
            boost: 1,
            slop: 3,
          },
        },
        {
          constant_score: {
            filter: {
              multi_match: {
                type: 'cross_fields',
                query: 'five',
                fields: [
                  'parent.country.ngram^1',
                  'parent.dependency.ngram^1',
                  'parent.macroregion.ngram^1',
                  'parent.region.ngram^1',
                  'parent.county.ngram^1',
                  'parent.localadmin.ngram^1',
                  'parent.locality.ngram^1',
                  'parent.borough.ngram^1',
                  'parent.neighbourhood.ngram^1',
                  'parent.locality_a.ngram^1',
                  'parent.region_a.ngram^1',
                  'parent.country_a.ngram^1',
                  'name.default^1.5',
                ],
                analyzer: 'peliasQuery',
              },
            },
          },
        },
      ],
      should: [
        {
          function_score: {
            query: { match_all: {} },
            max_boost: 20,
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
            score_mode: 'first',
            boost_mode: 'replace',
          },
        },
        {
          function_score: {
            query: { match_all: {} },
            max_boost: 20,
            functions: [
              {
                field_value_factor: {
                  modifier: 'log1p',
                  field: 'population',
                  missing: 1,
                },
                weight: 3,
              },
            ],
            score_mode: 'first',
            boost_mode: 'replace',
          },
        },
        {
          match: {
            'phrase.default': {
              query: 'one two three four',
              analyzer: 'peliasQuery',
              minimum_should_match: '1<-1 3<-70%',
            },
          },
        },
      ],
    },
  },
  size: 20,
  track_scores: true,
  sort: ['_score'],
};
