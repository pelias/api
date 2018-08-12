const check = require('check-types');

function _sanitize(raw, clean) {
    // error & warning messages
    var messages = { errors: [], warnings: [] };

    // target input param
    var tariffZoneAuthorities = raw.tariff_zone_authorities;

    // param 'tariff_zone_authorities' is optional and should not
    // error when simply not set by the user
    if (check.assigned(tariffZoneAuthorities)){

        // must be valid string
        if (!check.nonEmptyString(tariffZoneAuthorities)) {
            messages.errors.push('tariff_zone_authorities is not a string');
        }
    }

    return messages;
}

function _expected(){
    return [{ name: 'tariff_zone_authorities' }];
}

module.exports = () => ({
    sanitize: _sanitize,
    expected: _expected
});
