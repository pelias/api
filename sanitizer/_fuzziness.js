function _sanitize( raw, clean ){
    return {errors: [], warnings: []};
}

function _expected() {
    return [
        { name: 'fuzziness' },
        { name: 'max_expansions' }];
}

module.exports = () => ({
    sanitize: _sanitize,
    expected: _expected
});
