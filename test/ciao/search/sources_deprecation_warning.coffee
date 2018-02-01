
#> quattroshapes is being phased out and so should emit a warning message
path: '/v1/search?sources=qs&text=a'

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
should.exist json.geocoding.warnings
json.geocoding.warnings.should.eql ['You are using Quattroshapes as a data source in this query. Quattroshapes has been disabled as a data source for Mapzen Search, and has beenreplaced by Who\'s on First, an actively maintained data project based on QuattroshapesYour existing queries WILL CONTINUE TO WORK for the foreseeable future, but results will be coming from Who\'s on First and `sources=quattroshapes` will be interpreted as `sources=whosonfirst`. If you have any questions, please email pelias.team@gmail.com.' ]

#? inputs
json.geocoding.query['size'].should.eql 10
json.geocoding.query['text'].should.eql 'a'
json.geocoding.query.sources.should.eql ['whosonfirst'] # should use 'whosonfirst' instead of 'quattroshapes'
