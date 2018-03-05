const check = require('check-types');

function _sanitize(raw, clean) {
    // error & warning messages
    var messages = { errors: [], warnings: [] };

    // target input param
    var locality_ids = raw['boundary.locality_ids'];

    // param 'boundary.locality_ids' is optional and should not
    // error when simply not set by the user
    if (check.assigned(locality_ids)){

        // must be valid string
        if (!check.nonEmptyString(locality_ids)) {
            messages.errors.push('boundary.locality_ids is not a string');
        }
    }

    return messages;
}

function _expected(){
    return [{ name: 'boundary.locality_ids' }];
}

module.exports = () => ({
    sanitize: _sanitize,
    expected: _expected
});
