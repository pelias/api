
#> sources and layers specified (invalid combo)
path: '/v1/reverse?point.lat=1&point.lon=2&sources=whosonfirst&layers=address'

#? 200 ok
response.statusCode.should.be.equal 400
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
should.exist json.geocoding.errors
json.geocoding.errors.should.eql [ 'You have specified both the `sources` and `layers` parameters in a combination that will return no results: the whosonfirst source has nothing in the address layer' ]

#? expected warnings
json.geocoding.warnings.should.eql [ 'You are using Quattroshapes as a data source in this query. Quattroshapes will be disabled as a data source for Mapzen Search in the next several weeks, and is being replaced by Who\'s on First, an actively maintained data project based on Quattroshapes. Your existing queries WILL CONTINUE TO WORK for the foreseeable future, but results will be coming from Who\'s on First and `sources=quattroshapes` will be deprecated. If you have any questions, please email search@mapzen.com.' ]

#? inputs
json.geocoding.query['size'].should.eql 10
json.geocoding.query.layers.should.eql ["address"]
json.geocoding.query.sources.should.eql ["whosonfirst"]
