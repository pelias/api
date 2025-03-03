
#> basic autocomplete
path: '/v1/autocomplete?text=golfe%20du%20morbihan'

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
#should.not.exist json.geocoding.warnings

#? inputs
json.geocoding.query['text'].should.eql 'golfe du morbihan'
json.geocoding.query['size'].should.eql 10
json.features[0].properties.country.should.eql 'France'
json.features[0].properties.region.should.eql 'Morbihan'
json.features[0].properties.macrocounty.should.eql 'Vannes'
