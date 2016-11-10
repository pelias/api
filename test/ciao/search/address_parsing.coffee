
#> address parsing
path: '/v1/search?text=30%20w%2026th%20st%2C%20ny'

#? 200 ok
response.statusCode.should.be.equal 200
response.should.have.header 'charset', 'utf8'
response.should.have.header 'content-type', 'application/json; charset=utf-8'

#? valid geocoding block
should.exist json.geocoding
should.exist json.geocoding.version
should.exist json.geocoding.attribution
should.exist json.geocoding.query
should.exist json.geocoding.engine
should.exist json.geocoding.engine.name
should.exist json.geocoding.engine.author
should.exist json.geocoding.engine.version
should.exist json.geocoding.timestamp

#? valid geojson
json.type.should.be.equal 'FeatureCollection'
json.features.should.be.instanceof Array

#? expected errors
should.not.exist json.geocoding.errors

#? expected warnings
should.not.exist json.geocoding.warnings

#? inputs
json.geocoding.query['text'].should.eql '30 w 26th st, ny'
json.geocoding.query['size'].should.eql 10

#? address parsing
json.geocoding.query.parsed_text['number'].should.eql '30'
json.geocoding.query.parsed_text['street'].should.eql 'w 26th st'
json.geocoding.query.parsed_text['state'].should.eql 'ny'

json.features[0].properties.confidence.should.eql 1
json.features[0].properties.match_type.should.eql "exact"
json.features[0].properties.accuracy.should.eql "point"
