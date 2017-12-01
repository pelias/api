
#> bounding circle
path: '/v1/reverse?layers=coarse&point.lat=40.744243&point.lon=-73.990342&boundary.circle.radius=999.9'

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
json.geocoding.query['size'].should.eql 10
json.geocoding.query['point.lat'].should.eql 40.744243
json.geocoding.query['point.lon'].should.eql -73.990342
json.geocoding.query['boundary.circle.lat'].should.eql 40.744243
json.geocoding.query['boundary.circle.lon'].should.eql -73.990342
json.geocoding.query['boundary.circle.radius'].should.eql 999.9
json.geocoding.query['layers'].should.eql [ "continent",
  "empire",
  "country",
  "dependency",
  "macroregion",
  "region",
  "locality",
  "localadmin",
  "macrocounty",
  "county",
  "macrohood",
  "borough",
  "neighbourhood",
  "microhood",
  "disputed",
  "postalcode",
  "ocean",
  "marinearea"
]