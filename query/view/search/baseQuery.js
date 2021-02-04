module.exports = {
    query: {
        function_score: {
            query: {
                bool: {
                    minimum_should_match: 1,
                    should: []
                }
            },
            // move to configuration
            max_boost: 20,
            functions: [],
            score_mode: 'avg',
            boost_mode: 'multiply'
        }
    },
    sort: [
        '_score'
    ]
};
