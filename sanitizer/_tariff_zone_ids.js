const check = require('check-types');

function _sanitize(raw, clean) {
    // error & warning messages
    var messages = { errors: [], warnings: [] };

    // target input param
    var tariffZoneIds = raw.tariff_zone_ids;

    // param 'tariff_zone_ids' is optional and should not
    // error when simply not set by the user
    if (check.assigned(tariffZoneIds)){

        // must be valid string
        if (!check.nonEmptyString(tariffZoneIds)) {
            messages.errors.push('tariff_zone_ids is not a string');
        }
    }

    return messages;
}

function _expected(){
    return [{ name: 'tariff_zone_ids' }];
}

module.exports = () => ({
    sanitize: _sanitize,
    expected: _expected
});
