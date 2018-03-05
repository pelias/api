const check = require('check-types');

function _sanitize(raw, clean) {
    // error & warning messages
    var messages = { errors: [], warnings: [] };

    // target input param
    var countyIds = raw['boundary.county_ids'];

    // param 'boundary.county_ids' is optional and should not
    // error when simply not set by the user
    if (check.assigned(countyIds)){

        // must be valid string
        if (!check.nonEmptyString(countyIds)) {
            messages.errors.push('boundary.county_ids is not a string');
        }
    }

    return messages;
}

function _expected(){
    return [{ name: 'boundary.county_ids' }];
}

module.exports = () => ({
    sanitize: _sanitize,
    expected: _expected
});
